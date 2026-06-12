-- 1. DROP old checkout_cart with the old signature
DROP FUNCTION IF EXISTS checkout_cart(uuid, uuid, text, integer);

-- 2. RECREATE checkout_cart using price_minor and total_minor
CREATE OR REPLACE FUNCTION checkout_cart(
  p_cart_id UUID,
  p_user_id UUID,
  p_coupon_code TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id UUID;
  v_total INTEGER := 0;
  v_discount INTEGER := 0;
  v_shipping INTEGER := 0;
  v_coupon RECORD;
  item RECORD;
BEGIN
  -- Validate cart
  IF NOT EXISTS (SELECT 1 FROM carts WHERE id = p_cart_id AND user_id = p_user_id AND status = 'active') THEN
    RAISE EXCEPTION 'Invalid cart access';
  END IF;

  -- Create order (currency will default to NGN)
  INSERT INTO orders (user_id, cart_id, status, payment_status) VALUES (p_user_id, p_cart_id, 'pending', 'unpaid')
  RETURNING id INTO v_order_id;

  -- Coupon
  IF p_coupon_code IS NOT NULL THEN
    SELECT * INTO v_coupon FROM coupons WHERE code = p_coupon_code AND is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (expires_at IS NULL OR expires_at >= now()) LIMIT 1;
    IF v_coupon IS NULL THEN RAISE EXCEPTION 'Invalid coupon'; END IF;
  END IF;

  -- Process cart
  FOR item IN
    SELECT ci.*, p.name, p.price_minor, pv.price_minor AS variant_price FROM cart_items ci JOIN products p ON p.id = ci.product_id LEFT JOIN product_variants pv ON pv.id = ci.variant_id WHERE ci.cart_id = p_cart_id
  LOOP
    DECLARE
      v_price INTEGER := COALESCE(item.variant_price, item.price_minor);
      v_line INTEGER := v_price * item.quantity;
    BEGIN
      v_total := v_total + v_line;

      -- snapshot item
      INSERT INTO order_items (order_id, product_id, variant_id, product_name, price_minor, quantity, total_minor)
      VALUES (v_order_id, item.product_id, item.variant_id, item.name, v_price, item.quantity, v_line);

      -- reservation (trigger exclusively handles safety)
      INSERT INTO inventory_reservations (variant_id, order_id, user_id, quantity)
      VALUES (item.variant_id, v_order_id, p_user_id, item.quantity);
    END;
  END LOOP;

  IF v_total = 0 THEN RAISE EXCEPTION 'Cart is empty'; END IF;

  -- coupon calc
  IF v_coupon IS NOT NULL THEN
    IF v_coupon.discount_type = 'percentage' THEN v_discount := v_total * v_coupon.discount_value / 100;
    ELSE v_discount := v_coupon.discount_value; END IF;
  END IF;

  UPDATE orders SET subtotal_minor = v_total, discount_minor = v_discount, shipping_minor = v_shipping, total_minor = (v_total - v_discount + v_shipping) WHERE id = v_order_id;
  UPDATE carts SET status = 'checked_out' WHERE id = p_cart_id;

  RETURN v_order_id;
END;
$$;


-- 3. RECREATE get_ai_recommendations using price_minor
DROP FUNCTION IF EXISTS get_ai_recommendations(uuid, text, vector, int);

create or replace function get_ai_recommendations(
  user_id uuid,
  session_id text,
  target_embedding vector(1536),
  limit_count int
)
returns table (
  id uuid,
  name text,
  slug text,
  price_minor integer,
  category_id uuid,
  rating_stars numeric,
  rating_count int,
  image text,
  score numeric
)
language sql
as $$
SELECT
  p.id,
  p.name,
  p.slug,
  p.price_minor,
  p.category_id,
  p.rating_stars,
  p.rating_count,
  p.image,
  (
    (1 - (p.embedding <=> target_embedding)) * 60
    + LOG(COALESCE(p.click_score, 0) + 1) * 3
    + (
        SELECT COUNT(*) FROM user_product_events e JOIN products p2 ON p2.id = e.product_id WHERE e.user_id = get_ai_recommendations.user_id AND p2.category_id = p.category_id
      ) * 6
    + (
        SELECT COUNT(*) FROM user_session_events s JOIN products p3 ON p3.id = s.product_id WHERE s.session_id = get_ai_recommendations.session_id AND p3.category_id = p.category_id
      ) * 8
  ) AS score
FROM products p
WHERE p.is_active = true AND p.embedding IS NOT NULL
ORDER BY score DESC
LIMIT limit_count;
$$;


-- 4. RECREATE refresh_product_curations using price_minor
create or replace function public.refresh_product_curations(target_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_product_id is null then
    return;
  end if;

  delete from public.curation_products
  where product_id = target_product_id
    and source = 'auto';

  with base as (
    select
      p.id as product_id,
      p.created_at,
      p.price_minor,
      coalesce(p.rating_stars, 0) as rating_stars,
      coalesce(p.rating_count, 0) as rating_count,
      coalesce(p.is_featured, false) as is_featured,
      coalesce(p.keywords, array[]::text[]) as keywords,
      coalesce(pm.view_count, 0) as view_count,
      coalesce(pm.purchase_count, 0) as purchase_count,
      coalesce(pm.search_count, 0) as search_count,
      coalesce(pm.wishlisted_count, 0) as metric_wishlist_count,
      (
        select count(*)
        from public.events e
        where e.product_id = p.id
          and e.event_type in (
            'product_click',
            'view_product',
            'product_detail_viewed',
            'quick_view_opened',
            'add_to_cart',
            'add_to_wishlist'
          )
      ) as event_count,
      (
        select count(*)
        from public.wishlists w
        where w.product_id = p.id
      ) as wishlist_count
    from public.products p
    left join public.product_metrics pm on pm.product_id = p.id
    where p.id = target_product_id
      and p.is_active = true
  ),
  scored as (
    select
      *,
      (
        view_count * 1.0 +
        search_count * 2.0 +
        purchase_count * 14.0 +
        metric_wishlist_count * 7.0 +
        wishlist_count * 9.0 +
        event_count * 3.0 +
        rating_count * 0.4 +
        rating_stars * 4.0 +
        case when is_featured then 35 else 0 end
      )::numeric(12, 4) as engagement_score
    from base
  ),
  candidates as (
    select 'hero-featured' as slug, product_id, engagement_score + 80 as score, 1 as sort_order, 'featured' as rule
    from scored
    where is_featured

    union all
    select 'trending-products', product_id, engagement_score, 100, 'engagement'
    from scored
    where engagement_score > 0

    union all
    select 'best-sellers', product_id, purchase_count * 20 + rating_count + rating_stars * 5, 100, 'purchase_rating'
    from scored
    where purchase_count > 0 or rating_count >= 10

    union all
    select 'new-arrivals', product_id, 1000 - extract(epoch from (now() - created_at)) / 86400, 100, 'recent'
    from scored
    where created_at >= now() - interval '45 days'

    union all
    select 'flash-deals', product_id, engagement_score + 20, 100, 'deal_keyword'
    from scored
    where keywords && array['sale', 'deal', 'flash', 'discount', 'promo']::text[]

    union all
    select 'recommended-for-user', product_id, engagement_score + rating_stars * 4, 100, 'default_recommendation_pool'
    from scored
    where engagement_score > 0 or rating_count > 0

    union all
    select 'continue-shopping', product_id, engagement_score, 100, 'default_continue_pool'
    from scored
    where event_count > 0 or view_count > 0

    union all
    select 'editorial-collections', product_id, engagement_score + case when is_featured then 40 else 0 end, 100, 'editorial_pool'
    from scored
    where is_featured or rating_stars >= 4

    union all
    select 'hot-right-now', product_id, engagement_score + case when created_at >= now() - interval '14 days' then 25 else 0 end, 100, 'recent_engagement'
    from scored
    where engagement_score > 0

    union all
    select 'most-loved', product_id, wishlist_count * 15 + metric_wishlist_count * 10 + rating_count + rating_stars * 6, 100, 'wishlist_rating'
    from scored
    where wishlist_count > 0 or metric_wishlist_count > 0 or rating_count >= 5

    union all
    select 'editors-picks', product_id, engagement_score + 35, 100, 'featured_or_quality'
    from scored
    where is_featured or rating_stars >= 4.5

    union all
    select 'deal-of-the-day', product_id, engagement_score + case when keywords && array['deal', 'flash', 'sale']::text[] then 50 else 0 end, 1, 'daily_deal_candidate'
    from scored
    where is_featured or keywords && array['deal', 'flash', 'sale']::text[]

    union all
    select 'product-scroll-strip', product_id, engagement_score, 100, 'general_discovery'
    from scored

    union all
    select 'bento-products', product_id, engagement_score + case when is_featured then 20 else 0 end, 100, 'showcase'
    from scored

    union all
    select 'filter-grid', product_id, engagement_score, 100, 'browsable_grid'
    from scored

    union all
    select 'lookbook-products', product_id, engagement_score + case when is_featured then 25 else 0 end, 100, 'lookbook'
    from scored
    where is_featured or rating_stars >= 4

    union all
    select 'based-on-browsing', product_id, engagement_score, 100, 'default_browsing_pool'
    from scored
    where engagement_score > 0 or rating_count > 0
  )
  insert into public.curation_products (
    curation_id,
    product_id,
    sort_order,
    score,
    source,
    metadata
  )
  select
    c.id,
    candidates.product_id,
    candidates.sort_order,
    candidates.score,
    'auto',
    jsonb_build_object('rule', candidates.rule)
  from candidates
  join public.curations c on c.slug = candidates.slug and c.is_active = true
  on conflict (curation_id, product_id) do update
  set
    score = greatest(public.curation_products.score, excluded.score),
    sort_order = least(public.curation_products.sort_order, excluded.sort_order),
    source = excluded.source,
    metadata = public.curation_products.metadata || excluded.metadata,
    updated_at = now();
end;
$$;
