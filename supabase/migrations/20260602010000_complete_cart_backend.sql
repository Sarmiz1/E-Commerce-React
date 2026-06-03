-- Complete authenticated cart backend.
-- Guests intentionally keep a local cart until they authenticate.

alter table public.carts
  add column if not exists order_note text,
  add column if not exists applied_promo_code text;

alter table public.orders
  add column if not exists order_note text;

create table if not exists public.saved_cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null default 1 check (quantity between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_cart_items_user_variant_key unique (user_id, variant_id)
);

create index if not exists saved_cart_items_user_created_idx
  on public.saved_cart_items(user_id, created_at desc);

alter table public.saved_cart_items enable row level security;

drop policy if exists "Customers can view own saved cart items" on public.saved_cart_items;
create policy "Customers can view own saved cart items"
  on public.saved_cart_items
  for select
  using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Customers can insert own saved cart items" on public.saved_cart_items;
create policy "Customers can insert own saved cart items"
  on public.saved_cart_items
  for insert
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Customers can update own saved cart items" on public.saved_cart_items;
create policy "Customers can update own saved cart items"
  on public.saved_cart_items
  for update
  using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Customers can delete own saved cart items" on public.saved_cart_items;
create policy "Customers can delete own saved cart items"
  on public.saved_cart_items
  for delete
  using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

grant select, insert, update, delete on public.saved_cart_items to authenticated;

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
  v_requested_promo text;
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
  v_promo_found boolean := false;
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

  if p_update_promo then
    v_requested_promo := nullif(upper(trim(coalesce(p_promo_code, ''))), '');
    update public.carts
    set applied_promo_code = v_requested_promo,
        updated_at = now()
    where id = p_cart_id
    returning * into v_cart;
  else
    v_requested_promo := v_cart.applied_promo_code;
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

  if v_requested_promo is not null then
    select *
    into v_promo
    from public.promo_codes
    where code = v_requested_promo
      and is_active = true
      and v_subtotal >= min_order_cents;

    if found then
      v_promo_found := true;
      if v_promo.type = 'percent' then
        v_discount := round(v_subtotal * v_promo.value / 100.0);
      elsif v_promo.type = 'fixed' then
        v_discount := v_promo.value;
      elsif v_promo.type = 'shipping' then
        v_shipping := 0;
      end if;
    elsif p_update_promo then
      raise exception 'Invalid or expired promo code, or order minimum not met.';
    end if;
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

  if not v_promo_found and v_cart.applied_promo_code is not null then
    update public.carts
    set applied_promo_code = null,
        updated_at = now()
    where id = p_cart_id;
  end if;

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
        'type', v_promo.type
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

create or replace function public.update_cart_order_note(
  p_cart_id uuid,
  p_order_note text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_note text := trim(coalesce(p_order_note, ''));
begin
  perform private.assert_customer_session();

  if length(v_note) > 500 then
    raise exception 'Order note must be 500 characters or fewer.';
  end if;

  update public.carts
  set order_note = nullif(v_note, ''),
      updated_at = now()
  where id = p_cart_id
    and user_id = auth.uid()
    and status = 'active';

  if not found then
    raise exception 'Active cart was not found.';
  end if;

  return v_note;
end;
$$;

revoke all on function public.update_cart_order_note(uuid, text) from public, anon;
grant execute on function public.update_cart_order_note(uuid, text) to authenticated;

create or replace function public.update_cart_item_quantity(
  p_cart_item_id uuid,
  p_quantity integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_stock integer;
begin
  perform private.assert_customer_session();

  if p_quantity not between 1 and 10 then
    raise exception 'Cart quantity must be between 1 and 10.';
  end if;

  select variant.stock_quantity
  into v_stock
  from public.cart_items cart_item
  join public.carts cart on cart.id = cart_item.cart_id
  join public.product_variants variant on variant.id = cart_item.variant_id
  join public.products product on product.id = cart_item.product_id
  where cart_item.id = p_cart_item_id
    and cart.user_id = auth.uid()
    and cart.status = 'active'
    and variant.is_active = true
    and product.is_active = true
  for update of cart_item, variant;

  if not found then
    raise exception 'Cart item was not found.';
  end if;

  if p_quantity > v_stock then
    raise exception 'Requested quantity exceeds available stock.';
  end if;

  update public.cart_items
  set quantity = p_quantity
  where id = p_cart_item_id;
end;
$$;

revoke all on function public.update_cart_item_quantity(uuid, integer) from public, anon;
grant execute on function public.update_cart_item_quantity(uuid, integer) to authenticated;

create or replace function public.get_saved_cart_items()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_customer_session();

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', saved_item.id,
        'quantity', saved_item.quantity,
        'product_id', saved_item.product_id,
        'variant_id', saved_item.variant_id,
        'unit_price_minor', private.get_sellable_price_minor(
          product.price_minor,
          product.sale_price_minor,
          product.sale_starts_at,
          product.sale_ends_at,
          variant.price_minor
        ),
        'line_total_minor', saved_item.quantity * private.get_sellable_price_minor(
          product.price_minor,
          product.sale_price_minor,
          product.sale_starts_at,
          product.sale_ends_at,
          variant.price_minor
        ),
        'products', jsonb_build_object(
          'id', product.id,
          'name', product.name,
          'slug', product.slug,
          'image', product.image,
          'price_minor', private.get_sellable_price_minor(
            product.price_minor,
            product.sale_price_minor,
            product.sale_starts_at,
            product.sale_ends_at,
            variant.price_minor
          ),
          'base_price_minor', product.price_minor,
          'sale_price_minor', product.sale_price_minor,
          'sale_starts_at', product.sale_starts_at,
          'sale_ends_at', product.sale_ends_at
        ),
        'variant', jsonb_build_object(
          'id', variant.id,
          'color', variant.color,
          'size', variant.size,
          'price_minor', variant.price_minor,
          'stock_quantity', variant.stock_quantity
        )
      )
      order by saved_item.created_at desc
    )
    from public.saved_cart_items saved_item
    join public.products product on product.id = saved_item.product_id
    join public.product_variants variant on variant.id = saved_item.variant_id
    where saved_item.user_id = auth.uid()
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_saved_cart_items() from public, anon;
grant execute on function public.get_saved_cart_items() to authenticated;

create or replace function public.save_cart_item_for_later(p_cart_item_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.cart_items%rowtype;
  v_saved_id uuid;
begin
  perform private.assert_customer_session();

  select cart_item.*
  into v_item
  from public.cart_items cart_item
  join public.carts cart on cart.id = cart_item.cart_id
  where cart_item.id = p_cart_item_id
    and cart.user_id = auth.uid()
    and cart.status = 'active'
  for update of cart_item;

  if not found then
    raise exception 'Cart item was not found.';
  end if;

  insert into public.saved_cart_items(user_id, product_id, variant_id, quantity)
  values (auth.uid(), v_item.product_id, v_item.variant_id, least(v_item.quantity, 10))
  on conflict on constraint saved_cart_items_user_variant_key
  do update set
    quantity = least(public.saved_cart_items.quantity + excluded.quantity, 10),
    updated_at = now()
  returning id into v_saved_id;

  delete from public.cart_items where id = v_item.id;

  return v_saved_id;
end;
$$;

revoke all on function public.save_cart_item_for_later(uuid) from public, anon;
grant execute on function public.save_cart_item_for_later(uuid) to authenticated;

create or replace function public.move_saved_cart_item_to_cart(
  p_saved_item_id uuid,
  p_cart_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_saved public.saved_cart_items%rowtype;
  v_stock integer;
  v_cart_item_id uuid;
begin
  perform private.assert_customer_session();

  if not exists (
    select 1
    from public.carts cart
    where cart.id = p_cart_id
      and cart.user_id = auth.uid()
      and cart.status = 'active'
  ) then
    raise exception 'Active cart was not found.';
  end if;

  select saved_item.*
  into v_saved
  from public.saved_cart_items saved_item
  where saved_item.id = p_saved_item_id
    and saved_item.user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Saved item was not found.';
  end if;

  select variant.stock_quantity
  into v_stock
  from public.product_variants variant
  join public.products product on product.id = variant.product_id
  where variant.id = v_saved.variant_id
    and variant.product_id = v_saved.product_id
    and variant.is_active = true
    and product.is_active = true
  for update of variant;

  if coalesce(v_stock, 0) < 1 then
    raise exception 'This product is unavailable or out of stock.';
  end if;

  insert into public.cart_items(cart_id, product_id, variant_id, quantity)
  values (p_cart_id, v_saved.product_id, v_saved.variant_id, least(v_saved.quantity, v_stock, 10))
  on conflict on constraint unique_cart_variant
  do update set quantity = least(public.cart_items.quantity + excluded.quantity, v_stock, 10)
  returning id into v_cart_item_id;

  delete from public.saved_cart_items where id = v_saved.id;

  return v_cart_item_id;
end;
$$;

revoke all on function public.move_saved_cart_item_to_cart(uuid, uuid) from public, anon;
grant execute on function public.move_saved_cart_item_to_cart(uuid, uuid) to authenticated;

create or replace function private.copy_cart_order_note_to_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.cart_id is not null and new.order_note is null then
    select cart.order_note
    into new.order_note
    from public.carts cart
    where cart.id = new.cart_id;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_copy_cart_order_note on public.orders;
create trigger orders_copy_cart_order_note
before insert on public.orders
for each row execute function private.copy_cart_order_note_to_order();

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
declare
  v_cart_promo text;
begin
  perform private.assert_customer_session();

  select cart.applied_promo_code
  into v_cart_promo
  from public.carts cart
  where cart.id = p_cart_id
    and cart.user_id = auth.uid()
    and cart.status = 'active';

  if not found then
    raise exception 'Active cart was not found.';
  end if;

  return public.checkout_cart_customer_unchecked(
    p_cart_id,
    coalesce(nullif(upper(trim(coalesce(p_coupon_code, ''))), ''), v_cart_promo),
    p_shipping_tier
  );
end;
$$;

revoke all on function public.checkout_cart(uuid, text, text) from public, anon;
grant execute on function public.checkout_cart(uuid, text, text) to authenticated;
