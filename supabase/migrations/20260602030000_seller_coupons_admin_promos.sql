-- Admin promo codes are cart-wide.
-- Seller coupons are seller-owned and apply only to selected seller products.

create table if not exists public.promo_codes (
  code text primary key,
  type text not null check (type in ('percent', 'fixed', 'shipping')),
  value integer not null default 0,
  label text not null,
  min_order_cents integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text,
  discount_value integer,
  min_order_cents integer default 0,
  max_uses integer,
  used_count integer default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references public.coupons(id) on delete cascade,
  user_id uuid references public.profiles(id),
  order_id uuid references public.orders(id),
  discount_cents integer,
  created_at timestamptz default now()
);

alter table public.promo_codes
  add column if not exists max_uses integer,
  add column if not exists used_count integer not null default 0,
  add column if not exists starts_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

alter table public.carts
  add column if not exists applied_coupon_code text;

alter table public.coupons
  add column if not exists seller_id uuid references public.profiles(id) on delete cascade,
  add column if not exists label text,
  add column if not exists currency text not null default 'NGN',
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.coupon_products (
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (coupon_id, product_id)
);

create index if not exists coupon_products_seller_idx
  on public.coupon_products(seller_id);

create index if not exists coupons_seller_created_idx
  on public.coupons(seller_id, created_at desc);

alter table public.coupon_products enable row level security;

drop policy if exists "Sellers can view own coupon products" on public.coupon_products;
create policy "Sellers can view own coupon products"
  on public.coupon_products
  for select
  using ((select auth.uid()) = seller_id);

drop policy if exists "Sellers can manage own coupon products" on public.coupon_products;
create policy "Sellers can manage own coupon products"
  on public.coupon_products
  for all
  using ((select auth.uid()) = seller_id)
  with check ((select auth.uid()) = seller_id);

grant select, insert, update, delete on public.coupon_products to authenticated;

create or replace function private.assert_seller_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    left join public.seller_profiles seller on seller.user_id = profile.id
    where profile.id = auth.uid()
      and (profile.role = 'seller' or seller.user_id is not null)
  ) then
    raise exception 'Seller account required.';
  end if;
end;
$$;

revoke all on function private.assert_seller_account() from public;
grant execute on function private.assert_seller_account() to authenticated;

create or replace function public.get_seller_coupons()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_seller_account();

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', coupon.id,
        'code', coupon.code,
        'label', coalesce(coupon.label, coupon.code),
        'discount_type', coupon.discount_type,
        'discount_value', coupon.discount_value,
        'min_order_cents', coupon.min_order_cents,
        'max_uses', coupon.max_uses,
        'used_count', coupon.used_count,
        'starts_at', coupon.starts_at,
        'expires_at', coupon.expires_at,
        'is_active', coupon.is_active,
        'products', coalesce(products.items, '[]'::jsonb),
        'product_ids', coalesce(products.ids, '[]'::jsonb),
        'created_at', coupon.created_at,
        'updated_at', coupon.updated_at
      )
      order by coupon.created_at desc
    )
    from public.coupons coupon
    left join lateral (
      select
        jsonb_agg(jsonb_build_object(
          'id', product.id,
          'name', product.name,
          'image', product.image,
          'price_minor', product.price_minor
        ) order by product.name) items,
        jsonb_agg(product.id) ids
      from public.coupon_products coupon_product
      join public.products product on product.id = coupon_product.product_id
      where coupon_product.coupon_id = coupon.id
        and coupon_product.seller_id = auth.uid()
    ) products on true
    where coupon.seller_id = auth.uid()
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_seller_coupons() from public, anon;
grant execute on function public.get_seller_coupons() to authenticated;

create or replace function public.seller_upsert_coupon(
  p_coupon_id uuid default null,
  p_code text default null,
  p_label text default null,
  p_discount_type text default 'percentage',
  p_discount_value integer default 0,
  p_min_order_cents integer default 0,
  p_max_uses integer default null,
  p_starts_at timestamptz default null,
  p_expires_at timestamptz default null,
  p_is_active boolean default true,
  p_product_ids uuid[] default array[]::uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_coupon_id uuid;
  v_code text := upper(trim(coalesce(p_code, '')));
  v_discount_type text := lower(trim(coalesce(p_discount_type, 'percentage')));
  v_product_ids uuid[];
  v_owned_count integer := 0;
begin
  perform private.assert_seller_account();

  select array_agg(distinct product_id)
  into v_product_ids
  from unnest(coalesce(p_product_ids, array[]::uuid[])) as selected_product(product_id)
  where product_id is not null;

  if v_code = '' then
    raise exception 'Coupon code is required.';
  end if;

  if v_discount_type not in ('percentage', 'fixed') then
    raise exception 'Seller coupons must be percentage or fixed discounts.';
  end if;

  if coalesce(p_discount_value, 0) <= 0 then
    raise exception 'Discount value must be greater than zero.';
  end if;

  if v_discount_type = 'percentage' and p_discount_value > 90 then
    raise exception 'Percentage coupons cannot exceed 90%%.';
  end if;

  if cardinality(coalesce(v_product_ids, array[]::uuid[])) = 0 then
    raise exception 'Select at least one product for this coupon.';
  end if;

  select count(*)
  into v_owned_count
  from public.products product
  where product.seller_id = auth.uid()
    and product.id = any(v_product_ids);

  if v_owned_count <> cardinality(v_product_ids) then
    raise exception 'Coupons can only be attached to your own products.';
  end if;

  if p_coupon_id is null then
    insert into public.coupons (
      code,
      label,
      discount_type,
      discount_value,
      min_order_cents,
      max_uses,
      starts_at,
      expires_at,
      is_active,
      seller_id,
      currency
    )
    values (
      v_code,
      nullif(trim(coalesce(p_label, '')), ''),
      v_discount_type,
      p_discount_value,
      greatest(coalesce(p_min_order_cents, 0), 0),
      p_max_uses,
      p_starts_at,
      p_expires_at,
      coalesce(p_is_active, true),
      auth.uid(),
      'NGN'
    )
    returning id into v_coupon_id;
  else
    update public.coupons
    set code = v_code,
        label = nullif(trim(coalesce(p_label, '')), ''),
        discount_type = v_discount_type,
        discount_value = p_discount_value,
        min_order_cents = greatest(coalesce(p_min_order_cents, 0), 0),
        max_uses = p_max_uses,
        starts_at = p_starts_at,
        expires_at = p_expires_at,
        is_active = coalesce(p_is_active, true),
        updated_at = now()
    where id = p_coupon_id
      and seller_id = auth.uid()
    returning id into v_coupon_id;

    if v_coupon_id is null then
      raise exception 'Coupon was not found.';
    end if;
  end if;

  delete from public.coupon_products where coupon_id = v_coupon_id;

  insert into public.coupon_products(coupon_id, product_id, seller_id)
  select v_coupon_id, product_id, auth.uid()
  from unnest(v_product_ids) as selected_product(product_id);

  return v_coupon_id;
end;
$$;

revoke all on function public.seller_upsert_coupon(uuid, text, text, text, integer, integer, integer, timestamptz, timestamptz, boolean, uuid[]) from public, anon;
grant execute on function public.seller_upsert_coupon(uuid, text, text, text, integer, integer, integer, timestamptz, timestamptz, boolean, uuid[]) to authenticated;

create or replace function public.seller_delete_coupon(p_coupon_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_seller_account();

  delete from public.coupons
  where id = p_coupon_id
    and seller_id = auth.uid();

  if not found then
    raise exception 'Coupon was not found.';
  end if;
end;
$$;

revoke all on function public.seller_delete_coupon(uuid) from public, anon;
grant execute on function public.seller_delete_coupon(uuid) to authenticated;

create or replace function public.get_admin_promo_codes()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin']);

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'code', promo.code,
        'label', promo.label,
        'type', promo.type,
        'value', promo.value,
        'min_order_cents', promo.min_order_cents,
        'max_uses', promo.max_uses,
        'used_count', promo.used_count,
        'starts_at', promo.starts_at,
        'expires_at', promo.expires_at,
        'is_active', promo.is_active,
        'created_at', promo.created_at,
        'updated_at', promo.updated_at
      )
      order by promo.created_at desc
    )
    from public.promo_codes promo
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_admin_promo_codes() from public, anon;
grant execute on function public.get_admin_promo_codes() to authenticated;

create or replace function public.admin_upsert_promo_code(
  p_code text,
  p_label text,
  p_type text,
  p_value integer,
  p_min_order_cents integer default 0,
  p_max_uses integer default null,
  p_starts_at timestamptz default null,
  p_expires_at timestamptz default null,
  p_is_active boolean default true
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_type text := lower(trim(coalesce(p_type, '')));
begin
  perform private.assert_admin_role(array['super_admin']);

  if v_code = '' then
    raise exception 'Promo code is required.';
  end if;

  if v_type not in ('percent', 'fixed', 'shipping') then
    raise exception 'Invalid promo type.';
  end if;

  if v_type <> 'shipping' and coalesce(p_value, 0) <= 0 then
    raise exception 'Promo value must be greater than zero.';
  end if;

  if v_type = 'percent' and p_value > 90 then
    raise exception 'Percent promos cannot exceed 90%%.';
  end if;

  insert into public.promo_codes (
    code,
    label,
    type,
    value,
    min_order_cents,
    max_uses,
    starts_at,
    expires_at,
    is_active,
    created_by,
    updated_at
  )
  values (
    v_code,
    trim(coalesce(p_label, v_code)),
    v_type,
    coalesce(p_value, 0),
    greatest(coalesce(p_min_order_cents, 0), 0),
    p_max_uses,
    p_starts_at,
    p_expires_at,
    coalesce(p_is_active, true),
    auth.uid(),
    now()
  )
  on conflict (code)
  do update set
    label = excluded.label,
    type = excluded.type,
    value = excluded.value,
    min_order_cents = excluded.min_order_cents,
    max_uses = excluded.max_uses,
    starts_at = excluded.starts_at,
    expires_at = excluded.expires_at,
    is_active = excluded.is_active,
    updated_at = now()
  returning code into v_code;

  return v_code;
end;
$$;

revoke all on function public.admin_upsert_promo_code(text, text, text, integer, integer, integer, timestamptz, timestamptz, boolean) from public, anon;
grant execute on function public.admin_upsert_promo_code(text, text, text, integer, integer, integer, timestamptz, timestamptz, boolean) to authenticated;

create or replace function public.admin_delete_promo_code(p_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin']);

  delete from public.promo_codes
  where code = upper(trim(coalesce(p_code, '')));

  if not found then
    raise exception 'Promo code was not found.';
  end if;
end;
$$;

revoke all on function public.admin_delete_promo_code(text) from public, anon;
grant execute on function public.admin_delete_promo_code(text) to authenticated;

create or replace function public.get_cart_summary(
  p_cart_id uuid,
  p_update_promo boolean default false,
  p_promo_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cart public.carts%rowtype;
  v_requested_code text;
  v_subtotal bigint := 0;
  v_discount bigint := 0;
  v_shipping bigint := 499;
  v_total bigint := 0;
  v_savings bigint := 0;
  v_free_ship_threshold bigint := 5000;
  v_effective_subtotal bigint := 0;
  v_remaining bigint := 0;
  v_percent integer := 0;
  v_line_items jsonb := '{}'::jsonb;
  v_promo public.promo_codes%rowtype;
  v_coupon public.coupons%rowtype;
  v_promo_found boolean := false;
  v_coupon_found boolean := false;
  v_coupon_subtotal bigint := 0;
begin
  perform private.assert_customer_session();

  select *
  into v_cart
  from public.carts
  where id = p_cart_id
    and user_id = auth.uid()
    and status = 'active';

  if not found then
    raise exception 'Active cart was not found.';
  end if;

  select
    coalesce(sum(priced_item.line_total_minor), 0),
    coalesce(
      jsonb_object_agg(
        priced_item.id::text,
        jsonb_build_object(
          'unit_price_minor', priced_item.unit_price_minor,
          'line_total_minor', priced_item.line_total_minor
        )
      ),
      '{}'::jsonb
    )
  into v_subtotal, v_line_items
  from (
    select
      cart_item.id,
      private.get_sellable_price_minor(
        product.price_minor,
        product.sale_price_minor,
        product.sale_starts_at,
        product.sale_ends_at,
        variant.price_minor
      ) unit_price_minor,
      cart_item.quantity * private.get_sellable_price_minor(
        product.price_minor,
        product.sale_price_minor,
        product.sale_starts_at,
        product.sale_ends_at,
        variant.price_minor
      ) line_total_minor
    from public.cart_items cart_item
    join public.products product on product.id = cart_item.product_id
    left join public.product_variants variant on variant.id = cart_item.variant_id
    where cart_item.cart_id = p_cart_id
  ) priced_item;

  if p_update_promo then
    v_requested_code := nullif(upper(trim(coalesce(p_promo_code, ''))), '');
  else
    v_requested_code := v_cart.applied_promo_code;
  end if;

  if v_requested_code is not null then
    select *
    into v_promo
    from public.promo_codes
    where code = v_requested_code
      and is_active = true
      and v_subtotal >= min_order_cents
      and (max_uses is null or used_count < max_uses)
      and (starts_at is null or starts_at <= now())
      and (expires_at is null or expires_at >= now());

    if found then
      v_promo_found := true;
    end if;
  end if;

  if not v_promo_found then
    if p_update_promo then
      v_requested_code := nullif(upper(trim(coalesce(p_promo_code, ''))), '');
    else
      v_requested_code := v_cart.applied_coupon_code;
    end if;

    if v_requested_code is not null then
      select *
      into v_coupon
      from public.coupons coupon
      where coupon.code = v_requested_code
        and coupon.seller_id is not null
        and coupon.is_active = true
        and (coupon.max_uses is null or coupon.used_count < coupon.max_uses)
        and (coupon.starts_at is null or coupon.starts_at <= now())
        and (coupon.expires_at is null or coupon.expires_at >= now())
      limit 1;

      if found then
        select coalesce(sum(cart_item.quantity * private.get_sellable_price_minor(
          product.price_minor,
          product.sale_price_minor,
          product.sale_starts_at,
          product.sale_ends_at,
          variant.price_minor
        )), 0)
        into v_coupon_subtotal
        from public.cart_items cart_item
        join public.products product on product.id = cart_item.product_id
        left join public.product_variants variant on variant.id = cart_item.variant_id
        join public.coupon_products coupon_product
          on coupon_product.coupon_id = v_coupon.id
         and coupon_product.product_id = product.id
        where cart_item.cart_id = p_cart_id
          and product.seller_id = v_coupon.seller_id;

        if v_coupon_subtotal >= coalesce(v_coupon.min_order_cents, 0)
          and v_coupon_subtotal > 0 then
          v_coupon_found := true;
        end if;
      end if;
    end if;
  end if;

  if p_update_promo then
    if v_requested_code is null then
      update public.carts
      set applied_promo_code = null,
          applied_coupon_code = null,
          updated_at = now()
      where id = p_cart_id
      returning * into v_cart;
    elsif v_promo_found then
      update public.carts
      set applied_promo_code = v_promo.code,
          applied_coupon_code = null,
          updated_at = now()
      where id = p_cart_id
      returning * into v_cart;
    elsif v_coupon_found then
      update public.carts
      set applied_promo_code = null,
          applied_coupon_code = v_coupon.code,
          updated_at = now()
      where id = p_cart_id
      returning * into v_cart;
    else
      raise exception 'Invalid or expired discount code, or order minimum not met.';
    end if;
  elsif not v_promo_found and not v_coupon_found
    and (v_cart.applied_promo_code is not null or v_cart.applied_coupon_code is not null) then
    update public.carts
    set applied_promo_code = null,
        applied_coupon_code = null,
        updated_at = now()
    where id = p_cart_id;
  end if;

  if v_promo_found then
    if v_promo.type = 'percent' then
      v_discount := round(v_subtotal * v_promo.value / 100.0);
    elsif v_promo.type = 'fixed' then
      v_discount := v_promo.value;
    elsif v_promo.type = 'shipping' then
      v_shipping := 0;
    end if;
  elsif v_coupon_found then
    if v_coupon.discount_type = 'percentage' then
      v_discount := round(v_coupon_subtotal * v_coupon.discount_value / 100.0);
    else
      v_discount := v_coupon.discount_value;
    end if;
    v_discount := least(v_discount, v_coupon_subtotal);
  end if;

  v_discount := least(v_discount, v_subtotal);
  v_effective_subtotal := greatest(v_subtotal - v_discount, 0);

  if (not v_promo_found or v_promo.type <> 'shipping')
    and v_effective_subtotal >= v_free_ship_threshold then
    v_shipping := 0;
  end if;

  v_total := v_effective_subtotal + v_shipping;
  v_remaining := greatest(v_free_ship_threshold - v_effective_subtotal, 0);
  v_percent := least(100, round(v_effective_subtotal * 100.0 / v_free_ship_threshold));
  v_savings := v_discount + case
    when v_shipping = 0
      and (not v_promo_found or v_promo.type <> 'shipping')
      and v_effective_subtotal >= v_free_ship_threshold
    then 499
    else 0
  end;

  return jsonb_build_object(
    'subtotal', v_subtotal,
    'discount', v_discount,
    'shipping', v_shipping,
    'total', v_total,
    'savings', v_savings,
    'savings_ticker_message', case
      when v_savings > 0 then 'You''re saving ' || chr(8358) || format(
        '%s.%s on this order',
        v_savings / 100,
        lpad((v_savings % 100)::text, 2, '0')
      )
      else null
    end,
    'shipping_progress', jsonb_build_object(
      'effective_subtotal', v_effective_subtotal,
      'threshold', v_free_ship_threshold,
      'remaining', v_remaining,
      'percent', v_percent,
      'unlocked', v_remaining = 0
    ),
    'applied_promo', case
      when v_promo_found then jsonb_build_object(
        'code', v_promo.code,
        'label', v_promo.label,
        'type', v_promo.type,
        'scope', 'cart'
      )
      else null
    end,
    'applied_coupon', case
      when v_coupon_found then jsonb_build_object(
        'code', v_coupon.code,
        'label', coalesce(v_coupon.label, v_coupon.code),
        'type', v_coupon.discount_type,
        'scope', 'products',
        'seller_id', v_coupon.seller_id
      )
      else null
    end,
    'order_note', coalesce(v_cart.order_note, ''),
    'line_items', v_line_items
  );
end;
$$;

revoke all on function public.get_cart_summary(uuid, boolean, text) from public, anon;
grant execute on function public.get_cart_summary(uuid, boolean, text) to authenticated;

create or replace function public.checkout_cart_customer_unchecked(
  p_cart_id uuid,
  p_coupon_code text default null,
  p_shipping_tier text default 'standard'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart public.carts%rowtype;
  v_order_id uuid;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_shipping_minor integer;
  v_tax integer := 0;
  v_tax_rate numeric := 0.085;
  v_effective_subtotal integer := 0;
  v_promo public.promo_codes%rowtype;
  v_coupon public.coupons%rowtype;
  v_promo_found boolean := false;
  v_coupon_found boolean := false;
  v_coupon_subtotal integer := 0;
  item record;
begin
  perform private.assert_customer_session();

  v_shipping_minor := case p_shipping_tier
    when 'standard' then 499
    when 'express' then 999
    when 'overnight' then 1999
    else null
  end;

  if v_shipping_minor is null then
    raise exception 'Invalid shipping tier';
  end if;

  select *
  into v_cart
  from public.carts
  where id = p_cart_id
    and user_id = v_user_id
    and status = 'active'
  for update;

  if not found then
    raise exception 'Invalid cart';
  end if;

  for item in
    select
      cart_item.*,
      product.name,
      product.seller_id,
      private.get_sellable_price_minor(
        product.price_minor,
        product.sale_price_minor,
        product.sale_starts_at,
        product.sale_ends_at,
        variant.price_minor
      ) effective_price_minor
    from public.cart_items cart_item
    join public.products product on product.id = cart_item.product_id
    left join public.product_variants variant on variant.id = cart_item.variant_id
    where cart_item.cart_id = p_cart_id
  loop
    v_subtotal := v_subtotal + (item.effective_price_minor * item.quantity);
  end loop;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  if v_cart.applied_promo_code is not null then
    select *
    into v_promo
    from public.promo_codes
    where code = v_cart.applied_promo_code
      and is_active = true
      and v_subtotal >= min_order_cents
      and (max_uses is null or used_count < max_uses)
      and (starts_at is null or starts_at <= now())
      and (expires_at is null or expires_at >= now());
    v_promo_found := found;
  end if;

  if not v_promo_found and v_cart.applied_coupon_code is not null then
    select *
    into v_coupon
    from public.coupons coupon
    where coupon.code = v_cart.applied_coupon_code
      and coupon.seller_id is not null
      and coupon.is_active = true
      and (coupon.max_uses is null or coupon.used_count < coupon.max_uses)
      and (coupon.starts_at is null or coupon.starts_at <= now())
      and (coupon.expires_at is null or coupon.expires_at >= now())
    limit 1;

    if found then
      select coalesce(sum(cart_item.quantity * private.get_sellable_price_minor(
        product.price_minor,
        product.sale_price_minor,
        product.sale_starts_at,
        product.sale_ends_at,
        variant.price_minor
      )), 0)
      into v_coupon_subtotal
      from public.cart_items cart_item
      join public.products product on product.id = cart_item.product_id
      left join public.product_variants variant on variant.id = cart_item.variant_id
      join public.coupon_products coupon_product
        on coupon_product.coupon_id = v_coupon.id
       and coupon_product.product_id = product.id
      where cart_item.cart_id = p_cart_id
        and product.seller_id = v_coupon.seller_id;

      v_coupon_found := v_coupon_subtotal >= coalesce(v_coupon.min_order_cents, 0)
        and v_coupon_subtotal > 0;
    end if;
  end if;

  if v_promo_found then
    if v_promo.type = 'percent' then
      v_discount := round(v_subtotal * v_promo.value / 100.0);
    elsif v_promo.type = 'fixed' then
      v_discount := v_promo.value;
    elsif v_promo.type = 'shipping' then
      v_shipping_minor := 0;
    end if;
  elsif v_coupon_found then
    if v_coupon.discount_type = 'percentage' then
      v_discount := round(v_coupon_subtotal * v_coupon.discount_value / 100.0);
    else
      v_discount := v_coupon.discount_value;
    end if;
    v_discount := least(v_discount, v_coupon_subtotal);
  end if;

  v_discount := least(v_discount, v_subtotal);
  v_effective_subtotal := greatest(v_subtotal - v_discount, 0);

  if (not v_promo_found or v_promo.type <> 'shipping')
    and p_shipping_tier = 'standard'
    and v_effective_subtotal >= 5000 then
    v_shipping_minor := 0;
  end if;

  v_tax := round(v_effective_subtotal * v_tax_rate)::integer;

  insert into public.orders (user_id, cart_id, status, payment_status)
  values (v_user_id, p_cart_id, 'pending', 'unpaid')
  returning id into v_order_id;

  for item in
    select
      cart_item.*,
      product.name,
      private.get_sellable_price_minor(
        product.price_minor,
        product.sale_price_minor,
        product.sale_starts_at,
        product.sale_ends_at,
        variant.price_minor
      ) effective_price_minor
    from public.cart_items cart_item
    join public.products product on product.id = cart_item.product_id
    left join public.product_variants variant on variant.id = cart_item.variant_id
    where cart_item.cart_id = p_cart_id
  loop
    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      price_minor,
      quantity,
      total_minor
    )
    values (
      v_order_id,
      item.product_id,
      item.variant_id,
      item.name,
      item.effective_price_minor,
      item.quantity,
      item.effective_price_minor * item.quantity
    );

    insert into public.inventory_reservations (
      variant_id,
      order_id,
      user_id,
      quantity
    )
    values (
      item.variant_id,
      v_order_id,
      v_user_id,
      item.quantity
    );
  end loop;

  update public.orders
  set subtotal_minor = v_subtotal,
      discount_minor = v_discount,
      shipping_minor = v_shipping_minor,
      tax_minor = v_tax,
      total_minor = (v_effective_subtotal + v_shipping_minor + v_tax)
  where id = v_order_id;

  if v_promo_found and v_promo.max_uses is not null then
    update public.promo_codes
    set used_count = used_count + 1,
        updated_at = now()
    where code = v_promo.code;
  end if;

  if v_coupon_found then
    update public.coupons
    set used_count = used_count + 1,
        updated_at = now()
    where id = v_coupon.id;

    insert into public.coupon_redemptions(coupon_id, user_id, order_id, discount_cents)
    values (v_coupon.id, v_user_id, v_order_id, v_discount);
  end if;

  update public.carts
  set status = 'checked_out'
  where id = p_cart_id;

  return v_order_id;
end;
$$;

revoke all on function public.checkout_cart_customer_unchecked(uuid, text, text)
  from public, anon, authenticated;

create or replace function public.checkout_cart(
  p_cart_id uuid,
  p_coupon_code text default null,
  p_shipping_tier text default 'standard'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_customer_session();

  if nullif(trim(coalesce(p_coupon_code, '')), '') is not null then
    perform public.get_cart_summary(p_cart_id, true, p_coupon_code);
  end if;

  return public.checkout_cart_customer_unchecked(
    p_cart_id,
    null,
    p_shipping_tier
  );
end;
$$;

revoke all on function public.checkout_cart(uuid, text, text) from public, anon;
grant execute on function public.checkout_cart(uuid, text, text) to authenticated;
