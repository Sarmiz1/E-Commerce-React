-- Variants without a seller-entered override inherit the product base price.
-- Older seller writes persisted that inherited value explicitly. Normalize the
-- unambiguous rows so later product price edits continue to flow through.
update public.product_variants variant
set price_minor = null
from public.products product
where product.id = variant.product_id
  and variant.price_minor = product.price_minor;

-- Keep the server-authoritative checkout snapshot aligned with storefront
-- pricing: active product sale, explicit variant override, then base price.
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
    declare
      v_price integer := item.effective_price_minor;
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

revoke all on function public.checkout_cart_customer_unchecked(uuid, text, text)
  from public, anon, authenticated;

-- Some deployments already use the optional cart-total RPC. Update it when
-- present without making that optional script a migration dependency.
do $migration$
begin
  if to_regprocedure('public.get_cart_totals(uuid,text)') is not null then
    execute $function$
      create or replace function public.get_cart_totals(
        p_cart_id uuid,
        p_promo_code text default null
      )
      returns jsonb
      language plpgsql
      security invoker
      set search_path = ''
      as $body$
      declare
        v_subtotal integer := 0;
        v_discount integer := 0;
        v_shipping integer := 499;
        v_total integer := 0;
        v_free_ship_threshold integer := 5000;
        v_promo public.promo_codes%rowtype;
        v_promo_found boolean := false;
      begin
        select coalesce(sum(
          cart_item.quantity * private.get_sellable_price_minor(
            product.price_minor,
            product.sale_price_minor,
            product.sale_starts_at,
            product.sale_ends_at,
            variant.price_minor
          )
        ), 0)
        into v_subtotal
        from public.cart_items cart_item
        join public.products product on product.id = cart_item.product_id
        left join public.product_variants variant on variant.id = cart_item.variant_id
        where cart_item.cart_id = p_cart_id;

        if p_promo_code is not null then
          select *
          into v_promo
          from public.promo_codes
          where code = upper(p_promo_code)
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
          end if;
        end if;

        if not v_promo_found or v_promo.type <> 'shipping' then
          if (v_subtotal - v_discount) >= v_free_ship_threshold then
            v_shipping := 0;
          end if;
        end if;

        if v_discount > v_subtotal then
          v_discount := v_subtotal;
        end if;

        v_total := v_subtotal - v_discount + v_shipping;

        return jsonb_build_object(
          'subtotal', v_subtotal,
          'discount', v_discount,
          'shipping', v_shipping,
          'total', v_total,
          'applied_promo', case
            when v_promo_found then jsonb_build_object(
              'code', v_promo.code,
              'label', v_promo.label,
              'type', v_promo.type
            )
            else null
          end
        );
      end;
      $body$;
    $function$;
  end if;
end;
$migration$;

