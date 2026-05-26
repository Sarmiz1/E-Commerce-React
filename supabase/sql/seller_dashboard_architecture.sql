-- ==============================================================================
-- 1. CREATE CORE SELLER DASHBOARD TABLES
-- ==============================================================================

-- Core Profile Extension for Sellers
CREATE TABLE IF NOT EXISTS seller_profiles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  store_name TEXT,
  store_description TEXT,
  business_email TEXT,
  business_phone TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  notif_new_orders BOOLEAN DEFAULT true,
  notif_low_stock BOOLEAN DEFAULT true,
  notif_payouts BOOLEAN DEFAULT true,
  notif_reviews BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seller Wallet
CREATE TABLE IF NOT EXISTS seller_wallet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payout', 'sale', 'refund', 'fee')),
  amount_cents INTEGER NOT NULL, -- Positive for sale/refund (income), negative for payout/fee
  fee_cents INTEGER DEFAULT 0,
  net_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  description TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seller Notifications
CREATE TABLE IF NOT EXISTS seller_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  text TEXT,
  type TEXT CHECK (type IN ('order', 'stock', 'payout', 'review', 'system')),
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. PERMISSIONS & RLS
-- ==============================================================================

GRANT ALL ON TABLE seller_profiles TO authenticated;
GRANT ALL ON TABLE seller_wallet TO authenticated;
GRANT ALL ON TABLE seller_notifications TO authenticated;

ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Sellers can view own profile" ON seller_profiles;
CREATE POLICY "Sellers can view own profile" ON seller_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sellers can update own profile" ON seller_profiles;
CREATE POLICY "Sellers can update own profile" ON seller_profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sellers can insert own profile" ON seller_profiles;
CREATE POLICY "Sellers can insert own profile" ON seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wallet
DROP POLICY IF EXISTS "Sellers can view own wallet" ON seller_wallet;
CREATE POLICY "Sellers can view own wallet" ON seller_wallet FOR SELECT USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can insert payout requests" ON seller_wallet;
CREATE POLICY "Sellers can insert payout requests" ON seller_wallet FOR INSERT WITH CHECK (auth.uid() = seller_id AND type = 'payout');

-- Notifications
DROP POLICY IF EXISTS "Sellers can view own notifs" ON seller_notifications;
CREATE POLICY "Sellers can view own notifs" ON seller_notifications FOR SELECT USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can update own notifs" ON seller_notifications;
CREATE POLICY "Sellers can update own notifs" ON seller_notifications FOR UPDATE USING (auth.uid() = seller_id);


-- ==============================================================================
-- 3. AGGREGATION RPC ENDPOINT (BFF PATTERN)
-- ==============================================================================

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
        'revenue', (SELECT COALESCE(SUM(oi.total_cents), 0) FROM order_items oi JOIN products prod ON prod.id = oi.product_id JOIN orders o ON o.id = oi.order_id WHERE prod.seller_id = p_seller_id AND o.status != 'cancelled'),
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
        'balance', COALESCE(SUM(amount_cents) FILTER (WHERE status = 'completed'), 0),
        'pendingPayout', ABS(COALESCE(SUM(amount_cents) FILTER (WHERE status = 'pending' AND type = 'payout'), 0)),
        'totalEarned', COALESCE(SUM(amount_cents) FILTER (WHERE type = 'sale' AND status = 'completed'), 0),
        'totalWithdrawn', ABS(COALESCE(SUM(amount_cents) FILTER (WHERE type = 'payout' AND status = 'completed'), 0)),
        'transactions', (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', t.id,
              'type', t.type,
              'amount', t.amount_cents,
              'fee', COALESCE((t.metadata->>'fee_cents')::int, 0),
              'net', t.amount_cents - COALESCE((t.metadata->>'fee_cents')::int, 0),
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
          SUM(oi.total_cents) AS order_total,
          json_agg(json_build_object(
            'id', oi.id,
            'name', oi.product_name,
            'qty', oi.quantity,
            'price', oi.price_cents
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
          'price', p.price_cents,
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
            SELECT c.name AS label, SUM(oi.total_cents) AS value,
                   ROUND(SUM(oi.total_cents) * 100.0 / NULLIF(SUM(SUM(oi.total_cents)) OVER (), 0)) AS pct
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
            json_build_object('label', 'Avg. Order Value', 'value', '₦' || COALESCE((SELECT ROUND(AVG(oi.total_cents)) FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.seller_id = p_seller_id), 0)::text, 'change', '+₦1.2K', 'icon', 'trending-up'),
            json_build_object('label', 'Customer Return Rate', 'value', '24%', 'change', '+2%', 'icon', 'refresh'),
            json_build_object('label', 'Cart Abandonment', 'value', '68%', 'change', '-3%', 'icon', 'alert-circle')
          )
        ),
        'performance', (
          SELECT json_build_object(
            'bestSeller', (
              SELECT json_build_object('name', p.name, 'sales', COALESCE(SUM(oi.quantity), 0), 'revenue', COALESCE(SUM(oi.total_cents), 0))
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
