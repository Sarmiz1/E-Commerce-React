-- 1. Alter Tables
ALTER TABLE products RENAME COLUMN price_cents TO price_minor;
ALTER TABLE products RENAME COLUMN sale_price_cents TO sale_price_minor;
ALTER TABLE products ALTER COLUMN currency SET DEFAULT 'NGN';

ALTER TABLE product_variants RENAME COLUMN price_cents TO price_minor;
ALTER TABLE product_variants RENAME COLUMN sale_price_cents TO sale_price_minor;

ALTER TABLE orders RENAME COLUMN subtotal_cents TO subtotal_minor;
ALTER TABLE orders RENAME COLUMN discount_cents TO discount_minor;
ALTER TABLE orders RENAME COLUMN shipping_cents TO shipping_minor;
ALTER TABLE orders RENAME COLUMN total_cents TO total_minor;
ALTER TABLE orders ALTER COLUMN currency SET DEFAULT 'NGN';

ALTER TABLE order_items RENAME COLUMN price_cents TO price_minor;
ALTER TABLE order_items RENAME COLUMN total_cents TO total_minor;

ALTER TABLE payments RENAME COLUMN amount_cents TO amount_minor;
ALTER TABLE payments ALTER COLUMN currency SET DEFAULT 'NGN';

ALTER TABLE transactions RENAME COLUMN amount_cents TO amount_minor;
ALTER TABLE transactions ALTER COLUMN currency SET DEFAULT 'NGN';

ALTER TABLE coupons RENAME COLUMN min_order_cents TO min_order_minor;

ALTER TABLE coupon_redemptions RENAME COLUMN discount_cents TO discount_minor;


-- 2. Update Functions & Views (from supabase_db_schema.sql & seller_dashboard_architecture.sql)

-- Re-create seller_dashboard_stats view
DROP VIEW IF EXISTS seller_dashboard_stats;
CREATE OR REPLACE VIEW seller_dashboard_stats AS
SELECT
  p.seller_id,
  count(distinct p.id) as total_products,
  count(distinct oi.order_id) as total_orders,
  coalesce(sum(oi.total_minor), 0) as total_revenue
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.seller_id;


-- Re-create checkout_cart RPC
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


-- Re-create confirm_payment RPC
CREATE OR REPLACE FUNCTION confirm_payment(
  p_order_id UUID,
  p_reference TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  item RECORD;
BEGIN
  -- prevent double execution via idempotency
  IF (SELECT payment_status FROM orders WHERE id = p_order_id) = 'paid' THEN RETURN; END IF;

  UPDATE orders SET payment_status = 'paid', status = 'processing' WHERE id = p_order_id;

  INSERT INTO payments (order_id, provider, provider_reference, status, amount_minor, paid_at)
  SELECT p_order_id, 'stripe', p_reference, 'success', total_minor, now() FROM orders WHERE id = p_order_id;

  -- commit inventory
  FOR item IN SELECT variant_id, quantity FROM inventory_reservations WHERE order_id = p_order_id AND status = 'reserved'
  LOOP
    UPDATE product_variants SET stock_quantity = stock_quantity - item.quantity WHERE id = item.variant_id;
    UPDATE inventory_reservations SET status = 'committed' WHERE order_id = p_order_id AND variant_id = item.variant_id;
  END LOOP;
END;
$$;


-- Re-create handle_payment_failure RPC
CREATE OR REPLACE FUNCTION handle_payment_failure(
  p_order_id UUID,
  p_reference TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_cart UUID;
BEGIN
  SELECT cart_id INTO v_cart FROM orders WHERE id = p_order_id;

  UPDATE orders SET payment_status = 'failed', status = 'cancelled' WHERE id = p_order_id;

  INSERT INTO payments (order_id, provider, provider_reference, status, amount_minor)
  SELECT p_order_id, 'stripe', p_reference, 'failed', total_minor FROM orders WHERE id = p_order_id;

  UPDATE inventory_reservations SET status = 'released' WHERE order_id = p_order_id AND status = 'reserved';

  IF v_cart IS NOT NULL THEN
    UPDATE carts SET status = 'active' WHERE id = v_cart;
  END IF;
END;
$$;

-- Re-create get_seller_dashboard RPC with minor instead of cents
CREATE OR REPLACE FUNCTION get_seller_dashboard(p_seller_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dashboard_data JSON;
BEGIN
  SELECT json_build_object(
    
    -- 1. Profile (Merged)
    'profile', (
      SELECT json_build_object(
        'storeName', COALESCE(sp.store_name, p.full_name || '''s Store'),
        'storeDescription', COALESCE(sp.store_description, 'Premium seller.'),
        'businessEmail', COALESCE(sp.business_email, u.email),
        'businessPhone', COALESCE(sp.business_phone, ''),
        'bankName', COALESCE(sp.bank_name, ''),
        'accountNumber', COALESCE(sp.account_number, ''),
        'accountName', COALESCE(sp.account_name, ''),
        'notifs', json_build_object(
          'newOrders', COALESCE(sp.notif_new_orders, true),
          'lowStock', COALESCE(sp.notif_low_stock, true),
          'payouts', COALESCE(sp.notif_payouts, true),
          'reviews', COALESCE(sp.notif_reviews, false)
        )
      )
      FROM profiles p
      LEFT JOIN seller_profiles sp ON sp.user_id = p.id
      JOIN auth.users u ON u.id = p.id
      WHERE p.id = p_seller_id
    ),

    -- 2. Stats
    'stats', (
      SELECT json_build_object(
        'revenue', (SELECT COALESCE(SUM(oi.total_minor), 0) FROM order_items oi JOIN products prod ON prod.id = oi.product_id JOIN orders o ON o.id = oi.order_id WHERE prod.seller_id = p_seller_id AND o.status != 'cancelled'),
        'totalOrders', (SELECT COUNT(DISTINCT o.id) FROM order_items oi JOIN products prod ON prod.id = oi.product_id JOIN orders o ON o.id = oi.order_id WHERE prod.seller_id = p_seller_id),
        'ordersToday', (SELECT COUNT(DISTINCT o.id) FROM order_items oi JOIN products prod ON prod.id = oi.product_id JOIN orders o ON o.id = oi.order_id WHERE prod.seller_id = p_seller_id AND o.created_at >= current_date),
        'activeProducts', (SELECT COUNT(*) FROM products WHERE seller_id = p_seller_id AND is_active = true),
        'totalProducts', (SELECT COUNT(*) FROM products WHERE seller_id = p_seller_id),
        'customers', (SELECT COUNT(DISTINCT o.user_id) FROM order_items oi JOIN products prod ON prod.id = oi.product_id JOIN orders o ON o.id = oi.order_id WHERE prod.seller_id = p_seller_id)
      )
    ),

    -- 3. Wallet
    'wallet', (
      SELECT json_build_object(
        'balance', COALESCE(SUM(amount_minor) FILTER (WHERE status = 'completed'), 0),
        'pendingPayout', ABS(COALESCE(SUM(amount_minor) FILTER (WHERE status = 'pending' AND type = 'payout'), 0)),
        'totalEarned', COALESCE(SUM(amount_minor) FILTER (WHERE type = 'sale' AND status = 'completed'), 0),
        'totalWithdrawn', ABS(COALESCE(SUM(amount_minor) FILTER (WHERE type = 'payout' AND status = 'completed'), 0)),
        'transactions', (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', t.id,
              'type', t.type,
              'amount', t.amount_minor,
              'fee', COALESCE((t.metadata->>'fee_minor')::int, 0),
              'net', t.amount_minor - COALESCE((t.metadata->>'fee_minor')::int, 0),
              'status', t.status,
              'date', t.created_at,
              'reference', t.provider_reference,
              'metadata', t.metadata
            ) ORDER BY t.created_at DESC
          ), '[]'::json)
          FROM transactions t
          WHERE t.user_id = p_seller_id
        )
      )
      FROM transactions
      WHERE user_id = p_seller_id
    ),

    -- 4. Recent Orders (last 50)
    'orders', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', sub.order_id,
          'customerName', sub.customer_name,
          'status', sub.status,
          'date', sub.created_at,
          'total', sub.order_total,
          'items', sub.items
        ) ORDER BY sub.created_at DESC
      ), '[]'::json)
      FROM (
        SELECT 
          o.id AS order_id, 
          prof.full_name AS customer_name,
          o.status, 
          o.created_at,
          SUM(oi.total_minor) AS order_total,
          json_agg(json_build_object(
            'id', oi.id,
            'name', oi.product_name,
            'qty', oi.quantity,
            'price', oi.price_minor
          )) AS items
        FROM orders o
        JOIN profiles prof ON prof.id = o.user_id
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        WHERE p.seller_id = p_seller_id
        GROUP BY o.id, prof.full_name, o.status, o.created_at
        ORDER BY o.created_at DESC
        LIMIT 50
      ) sub
    ),

    -- 5. Products
    'products', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'image', p.image,
          'price', p.price_minor,
          'stock', COALESCE((SELECT SUM(stock_quantity) FROM product_variants pv WHERE pv.product_id = p.id), 0),
          'sales', COALESCE((SELECT SUM(quantity) FROM order_items oi WHERE oi.product_id = p.id), 0),
          'rating', p.rating_stars,
          'status', CASE WHEN p.is_active THEN 'active' ELSE 'inactive' END
        ) ORDER BY p.created_at DESC
      ), '[]'::json)
      FROM products p WHERE p.seller_id = p_seller_id
    ),

    -- 6. Reviews
    'reviews', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', r.id,
          'rating', r.rating,
          'text', r.review_text,
          'date', r.created_at,
          'productName', p.name,
          'productImage', p.image,
          'customerName', prof.full_name,
          'isVerified', r.is_verified
        ) ORDER BY r.created_at DESC
      ), '[]'::json)
      FROM product_reviews r
      JOIN products p ON p.id = r.product_id
      LEFT JOIN profiles prof ON prof.id = r.user_id
      WHERE p.seller_id = p_seller_id
    ),

    -- 7. Notifications
    'notifications', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', n.id,
          'type', n.type,
          'text', COALESCE(n.text, n.title),
          'time', n.created_at,
          'unread', n.unread
        ) ORDER BY n.created_at DESC
      ), '[]'::json)
      FROM (SELECT * FROM seller_notifications WHERE seller_id = p_seller_id LIMIT 30) n
    ),

    -- 8. Analytics
    'analytics', (
      SELECT json_build_object(
        'peakHours', (
          SELECT COALESCE(json_agg(json_build_object('hour', h.hour, 'value', COALESCE(ph.value, 0))), '[]'::json)
          FROM generate_series(0, 23) AS h(hour)
          LEFT JOIN (
            SELECT EXTRACT(HOUR FROM o.created_at) AS hour, COUNT(oi.id) AS value
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            JOIN products p ON p.id = oi.product_id
            WHERE p.seller_id = p_seller_id
            GROUP BY EXTRACT(HOUR FROM o.created_at)
          ) ph ON ph.hour = h.hour
        ),
        'categoryRevenue', (
          SELECT COALESCE(json_agg(json_build_object('label', cr.label, 'value', cr.value, 'pct', cr.pct)), '[]'::json)
          FROM (
            SELECT c.name AS label, SUM(oi.total_minor) AS value,
                   ROUND(SUM(oi.total_minor) * 100.0 / NULLIF(SUM(SUM(oi.total_minor)) OVER (), 0)) AS pct
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.seller_id = p_seller_id
            GROUP BY c.name
            ORDER BY value DESC
          ) cr
        ),
        'trafficSources', (
          SELECT json_build_array(
            json_build_object('label', 'Direct', 'pct', 45),
            json_build_object('label', 'Organic Search', 'pct', 30),
            json_build_object('label', 'Social Media', 'pct', 15),
            json_build_object('label', 'Referral', 'pct', 10)
          )
        ),
        'metrics', (
          SELECT json_build_array(
            json_build_object('label', 'Conversion Rate', 'value', '3.2%', 'change', '+0.4%', 'icon', 'percent'),
            json_build_object('label', 'Avg. Order Value', 'value', '₦' || COALESCE((SELECT ROUND(AVG(oi.total_minor)/100, 2) FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.seller_id = p_seller_id), 0)::text, 'change', '+₦1.2K', 'icon', 'trending-up'),
            json_build_object('label', 'Customer Return Rate', 'value', '24%', 'change', '+2%', 'icon', 'refresh'),
            json_build_object('label', 'Cart Abandonment', 'value', '68%', 'change', '-3%', 'icon', 'alert-circle')
          )
        ),
        'performance', (
          SELECT json_build_object(
            'bestSeller', (
              SELECT json_build_object('name', p.name, 'sales', COALESCE(SUM(oi.quantity), 0), 'revenue', COALESCE(SUM(oi.total_minor), 0))
              FROM products p
              LEFT JOIN order_items oi ON oi.product_id = p.id
              WHERE p.seller_id = p_seller_id
              GROUP BY p.id
              ORDER BY COALESCE(SUM(oi.quantity), 0) DESC NULLS LAST
              LIMIT 1
            ),
            'needsAttention', (
              SELECT json_build_object('name', p.name, 'sales', COALESCE(SUM(oi.quantity), 0), 'status', CASE WHEN p.is_active THEN 'active' ELSE 'inactive' END)
              FROM products p
              LEFT JOIN order_items oi ON oi.product_id = p.id
              WHERE p.seller_id = p_seller_id
              GROUP BY p.id
              ORDER BY COALESCE(SUM(oi.quantity), 0) ASC NULLS FIRST
              LIMIT 1
            )
          )
        )
      )
    )

  ) INTO dashboard_data;

  RETURN dashboard_data;
END;
$$;
