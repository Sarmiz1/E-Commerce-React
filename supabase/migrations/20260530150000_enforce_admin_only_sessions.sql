-- Active admins use privileged admin RPCs, not public marketplace self-service flows.

begin;

create or replace function private.is_customer_session()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and not (select private.is_active_admin());
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
end;
$$;

revoke all on function private.assert_customer_session() from public;
grant execute on function private.assert_customer_session() to authenticated;

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (
    (select private.is_customer_session())
    and (select auth.uid()) = id
  );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (
    (select private.is_customer_session())
    and (select auth.uid()) = id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = id
  );

drop policy if exists "Sellers can manage own profile" on public.seller_profiles;
drop policy if exists "Sellers can insert own profile" on public.seller_profiles;
drop policy if exists "Sellers can update own profile" on public.seller_profiles;
drop policy if exists "Sellers can delete own profile" on public.seller_profiles;
create policy "Sellers can insert own profile" on public.seller_profiles
  for insert with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

create policy "Sellers can update own profile" on public.seller_profiles
  for update using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

create policy "Sellers can delete own profile" on public.seller_profiles
  for delete using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Buyers can manage own profile" on public.buyer_profiles;
create policy "Buyers can manage own profile" on public.buyer_profiles
  for all using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Sellers can manage own products" on public.products;
drop policy if exists "Sellers can insert own products" on public.products;
drop policy if exists "Sellers can update own products" on public.products;
drop policy if exists "Sellers can delete own products" on public.products;
create policy "Sellers can insert own products" on public.products
  for insert with check (
    (select private.is_customer_session())
    and (select auth.uid()) = seller_id
  );

create policy "Sellers can update own products" on public.products
  for update using (
    (select private.is_customer_session())
    and (select auth.uid()) = seller_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = seller_id
  );

create policy "Sellers can delete own products" on public.products
  for delete using (
    (select private.is_customer_session())
    and (select auth.uid()) = seller_id
  );

drop policy if exists "Sellers can manage own product variants" on public.product_variants;
drop policy if exists "Sellers can insert own product variants" on public.product_variants;
drop policy if exists "Sellers can update own product variants" on public.product_variants;
drop policy if exists "Sellers can delete own product variants" on public.product_variants;
create policy "Sellers can insert own product variants" on public.product_variants
  for insert with check (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.products product
      where product.id = product_id
        and product.seller_id = (select auth.uid())
    )
  );

create policy "Sellers can update own product variants" on public.product_variants
  for update using (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.products product
      where product.id = product_id
        and product.seller_id = (select auth.uid())
    )
  )
  with check (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.products product
      where product.id = product_id
        and product.seller_id = (select auth.uid())
    )
  );

create policy "Sellers can delete own product variants" on public.product_variants
  for delete using (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.products product
      where product.id = product_id
        and product.seller_id = (select auth.uid())
    )
  );

drop policy if exists "Sellers can manage own product images" on public.product_images;
drop policy if exists "Sellers can insert own product images" on public.product_images;
drop policy if exists "Sellers can update own product images" on public.product_images;
drop policy if exists "Sellers can delete own product images" on public.product_images;
create policy "Sellers can insert own product images" on public.product_images
  for insert with check (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.products product
      where product.id = product_id
        and product.seller_id = (select auth.uid())
    )
  );

create policy "Sellers can update own product images" on public.product_images
  for update using (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.products product
      where product.id = product_id
        and product.seller_id = (select auth.uid())
    )
  )
  with check (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.products product
      where product.id = product_id
        and product.seller_id = (select auth.uid())
    )
  );

create policy "Sellers can delete own product images" on public.product_images
  for delete using (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.products product
      where product.id = product_id
        and product.seller_id = (select auth.uid())
    )
  );

drop policy if exists "Users can insert own reviews" on public.product_reviews;
create policy "Users can insert own reviews" on public.product_reviews
  for insert with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can update own reviews" on public.product_reviews;
create policy "Users can update own reviews" on public.product_reviews
  for update using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can delete own reviews" on public.product_reviews;
create policy "Users can delete own reviews" on public.product_reviews
  for delete using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can manage own carts" on public.carts;
create policy "Users can manage own carts" on public.carts
  for all using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can manage own cart items" on public.cart_items;
create policy "Users can manage own cart items" on public.cart_items
  for all using (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.carts cart
      where cart.id = cart_id
        and cart.user_id = (select auth.uid())
    )
  )
  with check (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.carts cart
      where cart.id = cart_id
        and cart.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can view own reservations" on public.inventory_reservations;
create policy "Users can view own reservations" on public.inventory_reservations
  for select using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can insert own reservations" on public.inventory_reservations;
create policy "Users can insert own reservations" on public.inventory_reservations
  for insert with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can manage own addresses" on public.addresses;
create policy "Users can manage own addresses" on public.addresses
  for all using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders
  for select using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders" on public.orders
  for insert with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items
  for select using (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.orders customer_order
      where customer_order.id = order_id
        and customer_order.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments" on public.payments
  for select using (
    (select private.is_customer_session())
    and exists (
      select 1
      from public.orders customer_order
      where customer_order.id = order_id
        and customer_order.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can manage own payment methods" on public.payment_methods;
create policy "Users can manage own payment methods" on public.payment_methods
  for all using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can manage own wishlists" on public.wishlists;
create policy "Users can manage own wishlists" on public.wishlists
  for all using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

drop policy if exists "Users can manage own notifications" on public.notifications;
create policy "Users can manage own notifications" on public.notifications
  for all using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

alter function public.checkout_cart(uuid, text, text)
  rename to checkout_cart_customer_unchecked;

revoke all on function public.checkout_cart_customer_unchecked(uuid, text, text)
  from public, anon, authenticated;

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
begin
  perform private.assert_customer_session();
  return public.checkout_cart_customer_unchecked(
    p_cart_id,
    p_coupon_code,
    p_shipping_tier
  );
end;
$$;

revoke all on function public.checkout_cart(uuid, text, text) from public;
grant execute on function public.checkout_cart(uuid, text, text) to authenticated;

alter function public.get_buyer_dashboard()
  rename to get_buyer_dashboard_customer_unchecked;

revoke all on function public.get_buyer_dashboard_customer_unchecked()
  from public, anon, authenticated;

create function public.get_buyer_dashboard()
returns json
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_customer_session();
  return public.get_buyer_dashboard_customer_unchecked();
end;
$$;

revoke all on function public.get_buyer_dashboard() from public;
grant execute on function public.get_buyer_dashboard() to authenticated;

commit;
