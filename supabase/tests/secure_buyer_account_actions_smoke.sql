begin;

do $$
declare
  buyer_id uuid;
  staged_action jsonb;
  approved_action jsonb;
  address_count_before integer;
  address_count_after integer;
  payment_count_before integer;
  payment_count_after integer;
  smoke_order_id uuid;
  smoke_transaction_id uuid;
  smoke_coupon_id uuid;
  smoke_redemption_id uuid;
  bypass_route text;
begin
  if has_table_privilege('authenticated', 'public.addresses', 'insert')
    or has_table_privilege('authenticated', 'public.addresses', 'update')
    or has_table_privilege('authenticated', 'public.addresses', 'delete') then
    raise exception 'Authenticated users can still mutate addresses directly.';
  end if;

  if has_table_privilege('authenticated', 'public.payment_methods', 'insert')
    or has_table_privilege('authenticated', 'public.payment_methods', 'update')
    or has_table_privilege('authenticated', 'public.payment_methods', 'delete') then
    raise exception 'Authenticated users can still mutate payment methods directly.';
  end if;

  for bypass_route in
    select route.signature
    from (
      values
        ('public.add_buyer_address(text,text,text,text,text,text,text,text,text,boolean)'),
        ('public.set_buyer_default_address(uuid)'),
        ('public.delete_buyer_address(uuid)'),
        ('public.set_buyer_default_phone_number(uuid)'),
        ('public.add_buyer_payment_method(text,text,text,text,text,boolean)'),
        ('public.set_buyer_default_payment_method(uuid)'),
        ('public.delete_buyer_payment_method(uuid)'),
        ('public.delete_buyer_account(text)')
    ) route(signature)
    where has_function_privilege('authenticated', route.signature, 'execute')
  loop
    raise exception 'Authenticated users can still bypass secured route: %', bypass_route;
  end loop;

  select profile.id
  into buyer_id
  from public.profiles profile
  where profile.role = 'buyer'
    and not exists (
      select 1
      from public.admin_users admin_user
      where admin_user.id = profile.id
        and admin_user.is_active = true
    )
  order by profile.created_at, profile.id
  limit 1;

  if buyer_id is null then
    raise exception 'A buyer profile is required for the secured-action smoke test.';
  end if;

  select count(*)
  into address_count_before
  from public.addresses address
  where address.user_id = buyer_id;

  staged_action := public.begin_buyer_sensitive_action(
    buyer_id,
    'address',
    'add',
    null,
    jsonb_build_object(
      'label', 'Rollback smoke test',
      'fullName', 'Rollback Buyer',
      'line1', '1 Rollback Lane',
      'line2', null,
      'city', 'Lagos',
      'state', 'Lagos',
      'postalCode', '100001',
      'country', 'NG',
      'makeDefault', false
    )
  );

  perform set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', buyer_id, 'role', 'authenticated')::text,
    true
  );

  approved_action := public.approve_buyer_sensitive_action(
    (staged_action->>'requestId')::uuid,
    staged_action->>'confirmationCode'
  );

  if not coalesce((approved_action->>'success')::boolean, false) then
    raise exception 'Secured address approval failed: %', approved_action;
  end if;

  select count(*)
  into address_count_after
  from public.addresses address
  where address.user_id = buyer_id;

  if address_count_after <> address_count_before + 1 then
    raise exception 'Secured address approval did not create exactly one address.';
  end if;

  select count(*)
  into payment_count_before
  from public.payment_methods method
  where method.user_id = buyer_id;

  if payment_count_before < 2 then
    staged_action := public.begin_buyer_sensitive_action(
      buyer_id,
      'payment',
      'add',
      null,
      jsonb_build_object(
        'cardholderName', 'Rollback Buyer',
        'brand', 'Visa',
        'last4', '4242',
        'expiry', '12/30',
        'makeDefault', false
      )
    );

    approved_action := public.approve_buyer_sensitive_action(
      (staged_action->>'requestId')::uuid,
      staged_action->>'confirmationCode'
    );

    if not coalesce((approved_action->>'success')::boolean, false) then
      raise exception 'Secured payment-method approval failed: %', approved_action;
    end if;

    select count(*)
    into payment_count_after
    from public.payment_methods method
    where method.user_id = buyer_id;

    if payment_count_after <> payment_count_before + 1 then
      raise exception 'Secured payment approval did not create exactly one method.';
    end if;
  end if;

  insert into public.orders (
    order_number,
    user_id,
    status,
    payment_status
  )
  values (
    'ROLLBACK-' || extensions.gen_random_uuid()::text,
    buyer_id,
    'pending',
    'unpaid'
  )
  returning id into smoke_order_id;

  insert into public.transactions (
    user_id,
    order_id,
    type,
    amount_minor
  )
  values (
    buyer_id,
    smoke_order_id,
    'rollback-smoke-test',
    0
  )
  returning id into smoke_transaction_id;

  insert into public.coupons (
    code,
    discount_type,
    discount_value
  )
  values (
    'ROLLBACK-' || extensions.gen_random_uuid()::text,
    'fixed',
    0
  )
  returning id into smoke_coupon_id;

  insert into public.coupon_redemptions (
    coupon_id,
    user_id,
    order_id,
    discount_minor
  )
  values (
    smoke_coupon_id,
    buyer_id,
    smoke_order_id,
    0
  )
  returning id into smoke_redemption_id;

  staged_action := public.begin_buyer_sensitive_action(
    buyer_id,
    'account',
    'delete',
    null,
    jsonb_build_object('confirmation', 'DELETE')
  );

  approved_action := public.approve_buyer_sensitive_action(
    (staged_action->>'requestId')::uuid,
    staged_action->>'confirmationCode'
  );

  if not coalesce((approved_action->>'success')::boolean, false) then
    raise exception 'Secured account-deletion approval failed: %', approved_action;
  end if;

  if exists (select 1 from auth.users auth_user where auth_user.id = buyer_id) then
    raise exception 'Secured account-deletion approval did not remove the auth user.';
  end if;

  if not exists (
    select 1
    from public.transactions transaction_record
    where transaction_record.id = smoke_transaction_id
      and transaction_record.user_id is null
      and transaction_record.order_id is null
  ) then
    raise exception 'Account deletion did not anonymize and preserve transaction history.';
  end if;

  if not exists (
    select 1
    from public.coupon_redemptions redemption
    where redemption.id = smoke_redemption_id
      and redemption.user_id is null
      and redemption.order_id is null
  ) then
    raise exception 'Account deletion did not anonymize and preserve coupon-redemption history.';
  end if;
end;
$$;

rollback;
