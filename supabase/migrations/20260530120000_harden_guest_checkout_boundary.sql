-- Guests keep cart intent locally. Server cart totals and checkout remain authenticated,
-- and shipping prices must be selected from server-owned tiers.

drop function if exists public.checkout_cart(uuid, text, integer);
drop function if exists public.checkout_cart(uuid, text, text);

create function public.checkout_cart(
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
  v_order_id uuid;
  v_total integer := 0;
  v_discount integer := 0;
  v_shipping_minor integer;
  v_tax integer := 0;
  v_tax_rate numeric := 0.085;
  v_coupon record;
  item record;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  v_shipping_minor := case p_shipping_tier
    when 'standard' then 499
    when 'express' then 999
    when 'overnight' then 1999
    else null
  end;

  if v_shipping_minor is null then
    raise exception 'Invalid shipping tier';
  end if;

  if not exists (
    select 1
    from public.carts
    where id = p_cart_id
      and user_id = v_user_id
      and status = 'active'
  ) then
    raise exception 'Invalid cart';
  end if;

  insert into public.orders (user_id, cart_id, status, payment_status)
  values (v_user_id, p_cart_id, 'pending', 'unpaid')
  returning id into v_order_id;

  if p_coupon_code is not null then
    select *
    into v_coupon
    from public.coupons
    where code = p_coupon_code
      and is_active = true
      and (starts_at is null or starts_at <= now())
      and (expires_at is null or expires_at >= now())
    limit 1;

    if v_coupon is null then
      raise exception 'Invalid coupon';
    end if;
  end if;

  for item in
    select ci.*, p.name, p.price_minor, pv.price_minor as variant_price
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    left join public.product_variants pv on pv.id = ci.variant_id
    where ci.cart_id = p_cart_id
  loop
    declare
      v_price integer := coalesce(item.variant_price, item.price_minor);
      v_line integer := v_price * item.quantity;
    begin
      v_total := v_total + v_line;

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
        v_price,
        item.quantity,
        v_line
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
    end;
  end loop;

  if v_total = 0 then
    raise exception 'Cart is empty';
  end if;

  if v_coupon is not null then
    if v_coupon.discount_type = 'percentage' then
      v_discount := v_total * v_coupon.discount_value / 100;
    else
      v_discount := v_coupon.discount_value;
    end if;

    if v_discount > v_total then
      v_discount := v_total;
    end if;
  end if;

  v_tax := round((v_total - v_discount) * v_tax_rate)::integer;

  update public.orders
  set subtotal_minor = v_total,
      discount_minor = v_discount,
      shipping_minor = v_shipping_minor,
      tax_minor = v_tax,
      total_minor = (v_total - v_discount + v_shipping_minor + v_tax)
  where id = v_order_id;

  update public.carts
  set status = 'checked_out'
  where id = p_cart_id;

  return v_order_id;
end;
$$;

revoke all on function public.checkout_cart(uuid, text, text) from public;
grant execute on function public.checkout_cart(uuid, text, text) to authenticated;

do $$
begin
  if to_regprocedure('public.get_cart_totals(uuid,text)') is not null then
    alter function public.get_cart_totals(uuid, text) security invoker;
    revoke all on function public.get_cart_totals(uuid, text) from public, anon;
    grant execute on function public.get_cart_totals(uuid, text) to authenticated;
  end if;

  if to_regprocedure('public.add_cart_items_bulk(uuid,jsonb)') is not null then
    alter function public.add_cart_items_bulk(uuid, jsonb) security invoker;
    revoke all on function public.add_cart_items_bulk(uuid, jsonb) from public, anon;
    grant execute on function public.add_cart_items_bulk(uuid, jsonb) to authenticated;
  end if;
end;
$$;
