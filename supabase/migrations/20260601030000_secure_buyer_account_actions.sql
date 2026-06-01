-- Sensitive buyer account changes use one password-then-email approval flow.
-- Browser sessions can request an action, but only the approval RPC applies it.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists account_status text not null default 'active'
    check (account_status in ('active', 'inactive'));
alter table public.profiles
  add column if not exists deactivated_at timestamptz;

create table if not exists public.buyer_account_deactivations (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  reason_code text not null
    check (reason_code in (
      'taking_a_break',
      'not_using_account',
      'privacy_concerns',
      'shopping_experience',
      'other'
    )),
  reason_detail text,
  deactivated_at timestamptz not null default now(),
  reactivation_status text not null default 'not_requested'
    check (reactivation_status in ('not_requested', 'pending', 'approved', 'rejected')),
  reactivation_requested_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_note text,
  updated_at timestamptz not null default now()
);

create index if not exists buyer_account_deactivations_status_idx
  on public.buyer_account_deactivations(reactivation_status, deactivated_at desc);

alter table public.buyer_account_deactivations enable row level security;
revoke all on table public.buyer_account_deactivations from anon, authenticated;
grant all on table public.buyer_account_deactivations to service_role;

create or replace function private.is_customer_session()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and not (select private.is_active_admin())
    and not exists (
      select 1
      from public.profiles profile
      where profile.id = (select auth.uid())
        and profile.account_status = 'inactive'
    );
$$;

revoke all on function private.is_customer_session() from public;
grant execute on function private.is_customer_session() to authenticated;

create or replace function private.assert_customer_session()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if (select private.is_active_admin()) then
    raise exception 'Active admin accounts cannot use public marketplace self-service flows'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.account_status = 'inactive'
  ) then
    raise exception 'This account is inactive. Submit a reactivation request for admin review.'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function private.assert_customer_session() from public;
grant execute on function private.assert_customer_session() to authenticated;

alter table public.product_reviews
  drop constraint if exists product_reviews_user_id_fkey;
alter table public.product_reviews
  add constraint product_reviews_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.transactions
  drop constraint if exists transactions_user_id_fkey;
alter table public.transactions
  add constraint transactions_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete set null;

alter table public.transactions
  drop constraint if exists transactions_order_id_fkey;
alter table public.transactions
  add constraint transactions_order_id_fkey
    foreign key (order_id) references public.orders(id) on delete set null;

alter table public.coupon_redemptions
  drop constraint if exists coupon_redemptions_user_id_fkey;
alter table public.coupon_redemptions
  add constraint coupon_redemptions_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete set null;

alter table public.coupon_redemptions
  drop constraint if exists coupon_redemptions_order_id_fkey;
alter table public.coupon_redemptions
  add constraint coupon_redemptions_order_id_fkey
    foreign key (order_id) references public.orders(id) on delete set null;

revoke insert, update, delete on table public.addresses
  from anon, authenticated;
drop policy if exists "Users can manage own addresses"
  on public.addresses;
drop policy if exists "Users can view own addresses"
  on public.addresses;
create policy "Users can view own addresses"
  on public.addresses
  for select
  to authenticated
  using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

revoke insert, update, delete on table public.payment_methods
  from anon, authenticated;
drop policy if exists "Users can manage own payment methods"
  on public.payment_methods;
drop policy if exists "Users can view own payment methods"
  on public.payment_methods;
create policy "Users can view own payment methods"
  on public.payment_methods
  for select
  to authenticated
  using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

create table if not exists public.buyer_sensitive_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null
    check (resource_type in ('phone', 'address', 'payment', 'account')),
  action_type text not null
    check (action_type in ('add', 'update', 'delete', 'set_default', 'update_email', 'update_password', 'deactivate')),
  resource_id uuid,
  payload jsonb not null default '{}'::jsonb,
  confirmation_code_hash text not null,
  failed_attempts integer not null default 0
    check (failed_attempts between 0 and 5),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes')
);

alter table public.buyer_sensitive_actions
  drop constraint if exists buyer_sensitive_actions_action_type_check;
alter table public.buyer_sensitive_actions
  add constraint buyer_sensitive_actions_action_type_check
    check (action_type in ('add', 'update', 'delete', 'set_default', 'update_email', 'update_password', 'deactivate'));

create index if not exists buyer_sensitive_actions_user_expires_at_idx
  on public.buyer_sensitive_actions(user_id, expires_at desc);

alter table public.buyer_sensitive_actions enable row level security;
revoke all on table public.buyer_sensitive_actions from anon, authenticated;
grant all on table public.buyer_sensitive_actions to service_role;

create or replace function private.prevent_last_buyer_phone_number_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('woosho.allow_buyer_phone_cleanup', true) = old.user_id::text then
    return old;
  end if;

  if (
    select count(*)
    from public.buyer_phone_numbers phone
    where phone.user_id = old.user_id
  ) <= 1 then
    raise exception 'Keep at least one phone number on your account. Add another number before removing this one.';
  end if;

  return old;
end;
$$;

revoke all on function private.prevent_last_buyer_phone_number_delete()
  from public;

create or replace function public.begin_buyer_sensitive_action(
  p_user_id uuid,
  p_resource_type text,
  p_action_type text,
  p_resource_id uuid default null,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  confirmation_code text;
  requested_action public.buyer_sensitive_actions%rowtype;
  normalized_country_code text;
  normalized_phone_number text;
  normalized_country text;
  normalized_email text;
  deactivation_reason text;
  deactivation_detail text;
  existing_method_id uuid;
begin
  if not exists (
    select 1
    from public.profiles profile
    where profile.id = p_user_id
      and profile.role = 'buyer'
  ) then
    raise exception 'Buyer account not found.';
  end if;

  if p_resource_type = 'phone' then
    if p_action_type <> 'set_default' then
      raise exception 'Unsupported phone-number action.';
    end if;

    if not exists (
      select 1
      from public.buyer_phone_numbers phone
      where phone.id = p_resource_id
        and phone.user_id = p_user_id
    ) then
      raise exception 'Phone number not found.';
    end if;
  elsif p_resource_type = 'address' then
    if p_action_type not in ('add', 'update', 'delete', 'set_default') then
      raise exception 'Unsupported address action.';
    end if;

    if p_action_type in ('update', 'delete', 'set_default') and not exists (
      select 1
      from public.addresses address
      where address.id = p_resource_id
        and address.user_id = p_user_id
    ) then
      raise exception 'Address not found.';
    end if;

    if p_action_type in ('add', 'update') then
      normalized_country := upper(trim(coalesce(normalized_payload->>'country', 'NG')));

      if nullif(trim(normalized_payload->>'fullName'), '') is null
        or nullif(trim(normalized_payload->>'line1'), '') is null
        or nullif(trim(normalized_payload->>'city'), '') is null then
        raise exception 'Full name, street address, and city are required.';
      end if;
      if normalized_country !~ '^[A-Z]{2}$' then
        raise exception 'Choose a valid country.';
      end if;

      normalized_payload := jsonb_build_object(
        'label', coalesce(nullif(trim(normalized_payload->>'label'), ''), 'Address'),
        'fullName', trim(normalized_payload->>'fullName'),
        'line1', trim(normalized_payload->>'line1'),
        'line2', nullif(trim(normalized_payload->>'line2'), ''),
        'city', trim(normalized_payload->>'city'),
        'state', nullif(trim(normalized_payload->>'state'), ''),
        'postalCode', nullif(trim(normalized_payload->>'postalCode'), ''),
        'country', normalized_country,
        'makeDefault', coalesce((normalized_payload->>'makeDefault')::boolean, false)
      );
    end if;
  elsif p_resource_type = 'payment' then
    if p_action_type not in ('add', 'delete', 'set_default') then
      raise exception 'Unsupported payment-method action.';
    end if;

    if p_action_type in ('delete', 'set_default') and not exists (
      select 1
      from public.payment_methods method
      where method.id = p_resource_id
        and method.user_id = p_user_id
    ) then
      raise exception 'Payment method not found.';
    end if;

    if p_action_type = 'add' then
      if nullif(trim(normalized_payload->>'cardholderName'), '') is null
        or length(trim(normalized_payload->>'cardholderName')) > 120 then
        raise exception 'Cardholder name is required.';
      end if;
      if nullif(trim(normalized_payload->>'brand'), '') is null then
        raise exception 'Card brand is required.';
      end if;
      if trim(normalized_payload->>'last4') !~ '^[0-9]{4}$' then
        raise exception 'Enter the final four card digits.';
      end if;
      if trim(normalized_payload->>'expiry') !~ '^(0[1-9]|1[0-2])/[0-9]{2}$' then
        raise exception 'Expiry must use MM/YY.';
      end if;

      select method.id
      into existing_method_id
      from public.payment_methods method
      where method.user_id = p_user_id
        and lower(method.brand) = lower(trim(normalized_payload->>'brand'))
        and method.last4 = trim(normalized_payload->>'last4')
        and method.expiry = trim(normalized_payload->>'expiry')
      limit 1;

      if existing_method_id is null and (
        select count(*)
        from public.payment_methods method
        where method.user_id = p_user_id
      ) >= 2 then
        raise exception 'You can save at most two payment methods.';
      end if;

      normalized_payload := jsonb_build_object(
        'cardholderName', trim(normalized_payload->>'cardholderName'),
        'brand', trim(normalized_payload->>'brand'),
        'last4', trim(normalized_payload->>'last4'),
        'expiry', trim(normalized_payload->>'expiry'),
        'makeDefault', coalesce((normalized_payload->>'makeDefault')::boolean, false)
      );
    end if;
  elsif p_resource_type = 'account' then
    if p_action_type = 'deactivate' then
      if normalized_payload->>'confirmation' <> 'DEACTIVATE' then
        raise exception 'Type DEACTIVATE to confirm account deactivation.';
      end if;
      deactivation_reason := trim(coalesce(normalized_payload->>'reason', ''));
      deactivation_detail := nullif(trim(normalized_payload->>'otherReason'), '');

      if deactivation_reason not in (
        'taking_a_break',
        'not_using_account',
        'privacy_concerns',
        'shopping_experience',
        'other'
      ) then
        raise exception 'Choose a reason for deactivating your account.';
      end if;
      if deactivation_reason = 'other' and length(coalesce(deactivation_detail, '')) < 3 then
        raise exception 'Tell us why you are deactivating your account.';
      end if;
      if length(coalesce(deactivation_detail, '')) > 500 then
        raise exception 'Reason must be under 500 characters.';
      end if;

      normalized_payload := jsonb_build_object(
        'confirmation', 'DEACTIVATE',
        'reason', deactivation_reason,
        'otherReason', deactivation_detail
      );
    elsif p_action_type = 'update_email' then
      normalized_email := lower(trim(coalesce(normalized_payload->>'email', '')));

      if length(normalized_email) > 254
        or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
        raise exception 'Enter a valid email address.';
      end if;
      if exists (
        select 1
        from auth.users auth_user
        where auth_user.id = p_user_id
          and lower(auth_user.email) = normalized_email
      ) then
        raise exception 'Enter a different email address.';
      end if;
      if exists (
        select 1
        from auth.users auth_user
        where auth_user.id <> p_user_id
          and lower(auth_user.email) = normalized_email
      ) then
        raise exception 'That email address is already in use.';
      end if;

      normalized_payload := jsonb_build_object('email', normalized_email);
    elsif p_action_type = 'update_password' then
      normalized_payload := '{}'::jsonb;
    else
      raise exception 'Unsupported account action.';
    end if;
  else
    raise exception 'Unsupported secured account action.';
  end if;

  delete from public.buyer_sensitive_actions action
  where action.user_id = p_user_id;

  confirmation_code := lpad(
    (
      (
        ('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint
        % 1000000
      )::text
    ),
    6,
    '0'
  );

  insert into public.buyer_sensitive_actions (
    user_id,
    resource_type,
    action_type,
    resource_id,
    payload,
    confirmation_code_hash
  )
  values (
    p_user_id,
    p_resource_type,
    p_action_type,
    p_resource_id,
    normalized_payload,
    extensions.crypt(confirmation_code, extensions.gen_salt('bf', 8))
  )
  returning * into requested_action;

  return jsonb_build_object(
    'requestId', requested_action.id,
    'resourceType', requested_action.resource_type,
    'actionType', requested_action.action_type,
    'expiresAt', requested_action.expires_at,
    'confirmationCode', confirmation_code
  );
end;
$$;

revoke all on function public.begin_buyer_sensitive_action(
  uuid, text, text, uuid, jsonb
) from public, anon, authenticated;
grant execute on function public.begin_buyer_sensitive_action(
  uuid, text, text, uuid, jsonb
) to service_role;

create or replace function public.approve_buyer_sensitive_action(
  p_request_id uuid,
  p_confirmation_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  requested_action public.buyer_sensitive_actions%rowtype;
  make_default boolean;
  deleted_default boolean;
  existing_method_id uuid;
  result jsonb;
begin
  perform private.assert_customer_session();

  select action.*
  into requested_action
  from public.buyer_sensitive_actions action
  where action.id = p_request_id
    and action.user_id = buyer_id
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error', 'This secured approval request was not found. Start again.'
    );
  end if;

  if requested_action.expires_at <= now() then
    delete from public.buyer_sensitive_actions action
    where action.id = requested_action.id;

    return jsonb_build_object(
      'success', false,
      'error', 'This confirmation code expired. Start the change again.'
    );
  end if;

  if requested_action.failed_attempts >= 5 then
    delete from public.buyer_sensitive_actions action
    where action.id = requested_action.id;

    return jsonb_build_object(
      'success', false,
      'error', 'Too many incorrect codes. Start the change again.'
    );
  end if;

  if coalesce(p_confirmation_code, '') !~ '^[0-9]{6}$'
    or extensions.crypt(p_confirmation_code, requested_action.confirmation_code_hash)
      <> requested_action.confirmation_code_hash then
    update public.buyer_sensitive_actions action
    set failed_attempts = least(action.failed_attempts + 1, 5)
    where action.id = requested_action.id;

    return jsonb_build_object(
      'success', false,
      'error', 'That confirmation code is incorrect.',
      'attemptsRemaining', greatest(4 - requested_action.failed_attempts, 0)
    );
  end if;

  delete from public.buyer_sensitive_actions action
  where action.id = requested_action.id;

  if requested_action.resource_type = 'phone' then
    update public.buyer_phone_numbers
    set is_default = (id = requested_action.resource_id),
      updated_at = now()
    where user_id = buyer_id;

    if not found then
      raise exception 'Phone number not found.';
    end if;

    perform private.sync_buyer_primary_phone_number(buyer_id);
    result := public.get_buyer_phone_numbers();
  elsif requested_action.resource_type = 'address' then
    if requested_action.action_type = 'add' then
      make_default := coalesce((requested_action.payload->>'makeDefault')::boolean, false)
        or not exists (
          select 1 from public.addresses address where address.user_id = buyer_id
        );

      if make_default then
        update public.addresses
        set is_default_shipping = false, updated_at = now()
        where user_id = buyer_id
          and is_default_shipping = true;
      end if;

      insert into public.addresses (
        user_id, address_type, full_name, line1, line2, city, state,
        postal_code, country, is_default_shipping
      )
      values (
        buyer_id,
        requested_action.payload->>'label',
        requested_action.payload->>'fullName',
        requested_action.payload->>'line1',
        requested_action.payload->>'line2',
        requested_action.payload->>'city',
        requested_action.payload->>'state',
        requested_action.payload->>'postalCode',
        requested_action.payload->>'country',
        make_default
      );
    elsif requested_action.action_type = 'update' then
      update public.addresses
      set address_type = requested_action.payload->>'label',
        full_name = requested_action.payload->>'fullName',
        line1 = requested_action.payload->>'line1',
        line2 = requested_action.payload->>'line2',
        city = requested_action.payload->>'city',
        state = requested_action.payload->>'state',
        postal_code = requested_action.payload->>'postalCode',
        country = requested_action.payload->>'country',
        updated_at = now()
      where id = requested_action.resource_id
        and user_id = buyer_id;

      if not found then
        raise exception 'Address not found.';
      end if;
    elsif requested_action.action_type = 'set_default' then
      update public.addresses
      set is_default_shipping = (id = requested_action.resource_id),
        updated_at = now()
      where user_id = buyer_id;

      if not found then
        raise exception 'Address not found.';
      end if;
    else
      delete from public.addresses address
      where address.id = requested_action.resource_id
        and address.user_id = buyer_id
      returning address.is_default_shipping into deleted_default;

      if not found then
        raise exception 'Address not found.';
      end if;

      if coalesce(deleted_default, false) then
        update public.addresses
        set is_default_shipping = true, updated_at = now()
        where id = (
          select address.id
          from public.addresses address
          where address.user_id = buyer_id
          order by address.created_at desc, address.id
          limit 1
        );
      end if;
    end if;

    result := public.get_buyer_addresses();
  elsif requested_action.resource_type = 'payment' then
    if requested_action.action_type = 'add' then
      make_default := coalesce((requested_action.payload->>'makeDefault')::boolean, false)
        or not exists (
          select 1 from public.payment_methods method where method.user_id = buyer_id
        );

      if make_default then
        update public.payment_methods
        set is_default = false
        where user_id = buyer_id
          and is_default = true;
      end if;

      select method.id
      into existing_method_id
      from public.payment_methods method
      where method.user_id = buyer_id
        and lower(method.brand) = lower(requested_action.payload->>'brand')
        and method.last4 = requested_action.payload->>'last4'
        and method.expiry = requested_action.payload->>'expiry'
      limit 1;

      if existing_method_id is not null then
        update public.payment_methods
        set cardholder_name = requested_action.payload->>'cardholderName',
          is_default = make_default or is_default
        where id = existing_method_id;
      else
        insert into public.payment_methods (
          user_id, type, cardholder_name, brand, last4, expiry, is_default
        )
        values (
          buyer_id,
          'card',
          requested_action.payload->>'cardholderName',
          requested_action.payload->>'brand',
          requested_action.payload->>'last4',
          requested_action.payload->>'expiry',
          make_default
        );
      end if;
    elsif requested_action.action_type = 'set_default' then
      update public.payment_methods
      set is_default = (id = requested_action.resource_id)
      where user_id = buyer_id;

      if not found then
        raise exception 'Payment method not found.';
      end if;
    else
      delete from public.payment_methods method
      where method.id = requested_action.resource_id
        and method.user_id = buyer_id
      returning method.is_default into deleted_default;

      if not found then
        raise exception 'Payment method not found.';
      end if;

      if coalesce(deleted_default, false) then
        update public.payment_methods
        set is_default = true
        where id = (
          select method.id
          from public.payment_methods method
          where method.user_id = buyer_id
          order by method.created_at desc, method.id
          limit 1
        );
      end if;
    end if;

    result := public.get_buyer_payment_methods();
  elsif requested_action.resource_type = 'account'
    and requested_action.action_type = 'update_email' then
    return jsonb_build_object(
      'success', true,
      'resourceType', requested_action.resource_type,
      'actionType', requested_action.action_type,
      'data', jsonb_build_object('email', requested_action.payload->>'email')
    );
  elsif requested_action.resource_type = 'account'
    and requested_action.action_type = 'update_password' then
    return jsonb_build_object(
      'success', true,
      'resourceType', requested_action.resource_type,
      'actionType', requested_action.action_type,
      'data', jsonb_build_object('authorized', true)
    );
  elsif requested_action.resource_type = 'account'
    and requested_action.action_type = 'deactivate' then
    update public.profiles
    set account_status = 'inactive',
      deactivated_at = now(),
      updated_at = now()
    where id = buyer_id;

    if not found then
      raise exception 'Account not found.';
    end if;

    insert into public.buyer_account_deactivations (
      user_id,
      reason_code,
      reason_detail,
      deactivated_at,
      reactivation_status,
      reactivation_requested_at,
      reviewed_at,
      reviewed_by,
      review_note,
      updated_at
    )
    values (
      buyer_id,
      requested_action.payload->>'reason',
      requested_action.payload->>'otherReason',
      now(),
      'not_requested',
      null,
      null,
      null,
      null,
      now()
    )
    on conflict (user_id) do update
    set reason_code = excluded.reason_code,
      reason_detail = excluded.reason_detail,
      deactivated_at = excluded.deactivated_at,
      reactivation_status = 'not_requested',
      reactivation_requested_at = null,
      reviewed_at = null,
      reviewed_by = null,
      review_note = null,
      updated_at = now();

    return jsonb_build_object(
      'success', true,
      'resourceType', requested_action.resource_type,
      'actionType', requested_action.action_type,
      'data', jsonb_build_object('deactivated', true)
    );
  else
    raise exception 'Unsupported secured account action.';
  end if;

  return jsonb_build_object(
    'success', true,
    'resourceType', requested_action.resource_type,
    'actionType', requested_action.action_type,
    'data', result
  );
end;
$$;

revoke all on function public.approve_buyer_sensitive_action(uuid, text)
  from public;
grant execute on function public.approve_buyer_sensitive_action(uuid, text)
  to authenticated;

-- Remove direct browser routes so the confirmation flow cannot be skipped.
revoke execute on function public.add_buyer_address(
  text, text, text, text, text, text, text, text, text, boolean
) from authenticated;
revoke execute on function public.set_buyer_default_address(uuid)
  from authenticated;
revoke execute on function public.delete_buyer_address(uuid)
  from authenticated;
revoke execute on function public.set_buyer_default_phone_number(uuid)
  from authenticated;
revoke execute on function public.add_buyer_payment_method(
  text, text, text, text, text, boolean
) from authenticated;
revoke execute on function public.set_buyer_default_payment_method(uuid)
  from authenticated;
revoke execute on function public.delete_buyer_payment_method(uuid)
  from authenticated;
revoke execute on function public.delete_buyer_account(text)
  from authenticated;

create or replace function public.save_buyer_account_preference(
  p_preference text,
  p_enabled boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
begin
  perform private.assert_customer_session();

  if p_preference not in (
    'aiSuggestions',
    'priceDropAlerts',
    'orderStatusUpdates',
    'promotionsDeals'
  ) then
    raise exception 'Unsupported account preference.';
  end if;

  insert into public.buyer_account_preferences (user_id, updated_at)
  values (buyer_id, now())
  on conflict (user_id) do nothing;

  update public.buyer_account_preferences
  set ai_suggestions = case when p_preference = 'aiSuggestions' then p_enabled else ai_suggestions end,
    price_drop_alerts = case when p_preference = 'priceDropAlerts' then p_enabled else price_drop_alerts end,
    order_status_updates = case when p_preference = 'orderStatusUpdates' then p_enabled else order_status_updates end,
    promotions_deals = case when p_preference = 'promotionsDeals' then p_enabled else promotions_deals end,
    updated_at = now()
  where user_id = buyer_id;

  return jsonb_build_object(
    'preference', p_preference,
    'enabled', p_enabled
  );
end;
$$;

revoke all on function public.save_buyer_account_preference(text, boolean)
  from public;
grant execute on function public.save_buyer_account_preference(text, boolean)
  to authenticated;

create or replace function public.get_customer_account_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  customer_id uuid := auth.uid();
begin
  if customer_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  return (
    select jsonb_build_object(
      'role', profile.role,
      'accountStatus', profile.account_status,
      'canAccess', profile.account_status = 'active',
      'isAdmin', exists (
        select 1
        from public.admin_users admin_user
        where admin_user.id = customer_id
          and admin_user.is_active = true
      ),
      'reactivationStatus', deactivation.reactivation_status
    )
    from public.profiles profile
    left join public.buyer_account_deactivations deactivation
      on deactivation.user_id = profile.id
    where profile.id = customer_id
  );
end;
$$;

revoke all on function public.get_customer_account_status() from public;
grant execute on function public.get_customer_account_status() to authenticated;

create or replace function public.request_buyer_account_reactivation()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  request_status text;
begin
  if buyer_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = buyer_id
      and profile.role = 'buyer'
      and profile.account_status = 'inactive'
  ) then
    raise exception 'Only inactive buyer accounts can request reactivation.';
  end if;

  update public.buyer_account_deactivations
  set reactivation_status = 'pending',
    reactivation_requested_at = coalesce(reactivation_requested_at, now()),
    reviewed_at = null,
    reviewed_by = null,
    review_note = null,
    updated_at = now()
  where user_id = buyer_id
  returning reactivation_status into request_status;

  if not found then
    raise exception 'Account deactivation record not found.';
  end if;

  return jsonb_build_object(
    'success', true,
    'reactivationStatus', request_status
  );
end;
$$;

revoke all on function public.request_buyer_account_reactivation() from public;
grant execute on function public.request_buyer_account_reactivation()
  to authenticated;

create or replace function public.get_admin_deactivated_buyer_accounts()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'support_lead']);

  return coalesce((
    select jsonb_agg(to_jsonb(account_record) order by account_record.deactivated_at desc)
    from (
      select profile.id,
        coalesce(profile.full_name, auth_user.email, 'Unknown buyer') name,
        auth_user.email,
        deactivation.reason_code,
        deactivation.reason_detail,
        deactivation.deactivated_at,
        deactivation.reactivation_status,
        deactivation.reactivation_requested_at,
        deactivation.reviewed_at,
        deactivation.review_note
      from public.buyer_account_deactivations deactivation
      join public.profiles profile on profile.id = deactivation.user_id
      left join auth.users auth_user on auth_user.id = profile.id
      where profile.role = 'buyer'
        and profile.account_status = 'inactive'
    ) account_record
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_admin_deactivated_buyer_accounts() from public;
grant execute on function public.get_admin_deactivated_buyer_accounts()
  to authenticated;

drop function if exists public.admin_review_buyer_reactivation(uuid, boolean, text);

create function public.admin_review_buyer_reactivation(
  target_user_id uuid,
  approve boolean,
  p_review_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin']);

  if length(coalesce(trim(p_review_note), '')) > 500 then
    raise exception 'Review note must be under 500 characters.';
  end if;

  if approve then
    update public.profiles
    set account_status = 'active',
      deactivated_at = null,
      updated_at = now()
    where id = target_user_id
      and role = 'buyer'
      and account_status = 'inactive';

    if not found then
      raise exception 'Inactive buyer account not found.';
    end if;
  elsif not exists (
    select 1
    from public.profiles profile
    where profile.id = target_user_id
      and profile.role = 'buyer'
      and profile.account_status = 'inactive'
  ) then
    raise exception 'Inactive buyer account not found.';
  end if;

  update public.buyer_account_deactivations
  set reactivation_status = case when approve then 'approved' else 'rejected' end,
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    review_note = nullif(trim(p_review_note), ''),
    updated_at = now()
  where user_id = target_user_id;

  if not found then
    raise exception 'Account deactivation record not found.';
  end if;

  return jsonb_build_object(
    'success', true,
    'approved', approve
  );
end;
$$;

revoke all on function public.admin_review_buyer_reactivation(uuid, boolean, text)
  from public;
grant execute on function public.admin_review_buyer_reactivation(uuid, boolean, text)
  to authenticated;

create or replace function public.admin_permanently_delete_buyer_account(
  target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin']);

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = target_user_id
      and profile.role = 'buyer'
      and profile.account_status = 'inactive'
  ) then
    raise exception 'Only inactive buyer accounts can be permanently deleted.';
  end if;

  perform set_config('woosho.allow_buyer_phone_cleanup', target_user_id::text, true);

  delete from auth.users
  where id = target_user_id;

  if not found then
    raise exception 'Buyer Auth account not found.';
  end if;

  return jsonb_build_object(
    'success', true,
    'deleted', true
  );
end;
$$;

revoke all on function public.admin_permanently_delete_buyer_account(uuid)
  from public;
grant execute on function public.admin_permanently_delete_buyer_account(uuid)
  to authenticated;

create or replace function public.get_admin_buyers()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'support_lead']);

  return (
    select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at desc), '[]'::jsonb)
    from (
      select profile.id,
        coalesce(profile.full_name, auth_user.email, 'Unknown buyer') name,
        auth_user.email,
        profile.created_at,
        count(distinct customer_order.id) filter (
          where customer_order.payment_status = 'paid'
            and customer_order.status <> 'cancelled'
        ) orders,
        coalesce(sum(customer_order.total_minor) filter (
          where customer_order.payment_status = 'paid'
            and customer_order.status <> 'cancelled'
        ), 0) lifetime_value_minor
      from public.profiles profile
      left join auth.users auth_user on auth_user.id = profile.id
      left join public.orders customer_order on customer_order.user_id = profile.id
      where profile.role = 'buyer'
        and profile.account_status = 'active'
        and not exists (
          select 1
          from public.admin_users admin_user
          where admin_user.id = profile.id
        )
      group by profile.id, profile.full_name, auth_user.email, profile.created_at
    ) row_data
  );
end;
$$;

revoke all on function public.get_admin_buyers() from public;
grant execute on function public.get_admin_buyers() to authenticated;
