-- ==============================================================================
-- 1. CREATE CORE DASHBOARD TABLES (NORMALIZED SOURCE OF TRUTH)
-- ==============================================================================

-- Core Profile Extension
CREATE TABLE IF NOT EXISTS buyer_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  reward_points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'Silver',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE buyer_profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Silver';

-- Wallet Ledger (Append-only for strict financial integrity)
CREATE TABLE IF NOT EXISTS wallet_ledger (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('fund', 'withdraw', 'purchase', 'credit', 'refund')),
  amount INTEGER NOT NULL, -- Positive for funding, negative for spending/withdrawals
  fee INTEGER DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- AI Credits Ledger (Append-only)
CREATE TABLE IF NOT EXISTS ai_credits_ledger (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('grant', 'purchase', 'usage')),
  amount INTEGER NOT NULL, -- Positive for bought/granted, negative for usage
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- AI Generated Insights
CREATE TABLE IF NOT EXISTS buyer_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  icon TEXT,
  text TEXT,
  sub TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- AI Generated Recommendations
CREATE TABLE IF NOT EXISTS buyer_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  reason TEXT,
  budget_fit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Saved Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'card',
  brand TEXT,
  last4 TEXT,
  expiry TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, product_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sub TEXT,
  type TEXT CHECK (type IN ('shipping', 'deal', 'stock', 'delivered', 'system')),
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. PERMISSIONS & RLS
-- ==============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON TABLE buyer_profiles TO authenticated;
GRANT ALL ON TABLE wallet_ledger TO authenticated;
GRANT ALL ON TABLE ai_credits_ledger TO authenticated;
GRANT ALL ON TABLE buyer_insights TO authenticated;
GRANT ALL ON TABLE buyer_recommendations TO authenticated;
GRANT ALL ON TABLE payment_methods TO authenticated;
GRANT ALL ON TABLE wishlists TO authenticated;
GRANT ALL ON TABLE notifications TO authenticated;

-- Ensure service role has access too
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Enable RLS on core dashboard tables
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credits_ledger ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Owner only)
DROP POLICY IF EXISTS "Users can view own profile" ON buyer_profiles;
CREATE POLICY "Users can view own profile" ON buyer_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON buyer_profiles;
CREATE POLICY "Users can update own profile" ON buyer_profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own wallet" ON wallet_ledger;
CREATE POLICY "Users can view own wallet" ON wallet_ledger FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own credits" ON ai_credits_ledger;
CREATE POLICY "Users can view own credits" ON ai_credits_ledger FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlists;
CREATE POLICY "Users can view own wishlist" ON wishlists FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own notifs" ON notifications;
CREATE POLICY "Users can view own notifs" ON notifications FOR SELECT USING (auth.uid() = user_id);


-- ==============================================================================
-- 3. CREATE THE AGGREGATION RPC ENDPOINT (BFF PATTERN)
-- ==============================================================================
-- This queries all relational tables simultaneously and builds a massive, 
-- optimized JSON payload representing the entire dashboard state.

CREATE OR REPLACE FUNCTION get_buyer_dashboard(buyer_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with creator permissions to simplify cross-table aggregation
AS $$
DECLARE
  dashboard_data JSON;
BEGIN
  SELECT json_build_object(
    
    -- Profile (Merged with master profiles table)
    'profile', (
      SELECT json_build_object(
        'full_name', COALESCE(bp.full_name, p.full_name),
        'reward_points', COALESCE(bp.reward_points, 0),
        'tier', COALESCE(bp.tier, 'Silver'),
        'member_since', COALESCE(bp.created_at, p.created_at),
        'email', u.email,
        'phone', COALESCE(bp.phone, u.phone)
      )
      FROM profiles p
      LEFT JOIN buyer_profiles bp ON bp.user_id = p.id
      JOIN auth.users u ON u.id = p.id
      WHERE p.id = buyer_id
    ),
    
    -- Wallet computed on the fly
    'wallet', (
      SELECT json_build_object(
        'balance', COALESCE(SUM(amount), 0),
        'totalFunded', COALESCE(SUM(amount) FILTER (WHERE amount > 0 AND type = 'fund'), 0),
        'totalWithdrawn', COALESCE(ABS(SUM(amount) FILTER (WHERE amount < 0 AND type = 'withdraw')), 0),
        'totalSpent', COALESCE(ABS(SUM(amount) FILTER (WHERE amount < 0 AND type IN ('purchase', 'credit'))), 0),
        'transactions', (
          SELECT COALESCE(json_agg(t ORDER BY created_at DESC), '[]'::json)
          FROM wallet_ledger t WHERE t.user_id = buyer_id
        )
      )
      FROM wallet_ledger WHERE user_id = buyer_id
    ),
    
    -- AI Credits computed on the fly
    'ai_credits', (
      SELECT json_build_object(
        'balance', COALESCE(SUM(amount), 0),
        'totalPurchased', COALESCE(SUM(amount) FILTER (WHERE amount > 0 AND type = 'purchase'), 0),
        'totalUsed', COALESCE(ABS(SUM(amount) FILTER (WHERE amount < 0 AND type = 'usage')), 0),
        'history', (
          SELECT COALESCE(json_agg(json_build_object('date', created_at::date, 'used', ABS(amount), 'desc', description) ORDER BY created_at DESC), '[]'::json)
          FROM ai_credits_ledger c WHERE c.user_id = buyer_id AND type = 'usage'
        )
      )
      FROM ai_credits_ledger WHERE user_id = buyer_id
    ),
    
    -- Orders & nested products
    'orders', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', o.id,
          'status', o.status,
          'total_cents', o.total_cents,
          'created_at', o.created_at,
          'address', COALESCE(
            o.shipping_address::text,
            (SELECT a.line1 || ', ' || a.city FROM addresses a WHERE a.id = o.shipping_address_id),
            'No address provided'
          ),
          'order_items', (
            SELECT json_agg(json_build_object('id', oi.id, 'quantity', oi.quantity, 'products', p))
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = o.id
          )
        ) ORDER BY o.created_at DESC
      ), '[]'::json)
      FROM orders o WHERE o.user_id = buyer_id
    ),
    
    -- Reviews
    'reviews', (
      SELECT COALESCE(json_agg(json_build_object('id', r.id, 'rating', r.rating, 'review_text', r.review_text, 'products', p)), '[]'::json)
      FROM product_reviews r
      JOIN products p ON p.id = r.product_id
      WHERE r.user_id = buyer_id
    ),
    
    -- Notifications
    'notifications', (
      SELECT COALESCE(json_agg(n ORDER BY created_at DESC), '[]'::json)
      FROM (SELECT * FROM notifications WHERE user_id = buyer_id LIMIT 30) n
    ),
    
    -- Static lists
    'addresses', (
      SELECT COALESCE(json_agg(a), '[]'::json)
      FROM addresses a WHERE a.user_id = buyer_id
    ),
    'payment_methods', (
      SELECT COALESCE(json_agg(pm), '[]'::json)
      FROM payment_methods pm WHERE pm.user_id = buyer_id
    ),
    
    -- AI Generated lists
    'insights', (
      SELECT COALESCE(json_agg(i), '[]'::json)
      FROM buyer_insights i WHERE i.user_id = buyer_id
    ),
    'recommendations', (
      SELECT COALESCE(json_agg(json_build_object('id', br.id, 'reason', br.reason, 'budget_fit', br.budget_fit, 'products', p)), '[]'::json)
      FROM buyer_recommendations br
      JOIN products p ON p.id = br.product_id
      WHERE br.user_id = buyer_id
    )
    
  ) INTO dashboard_data;

  RETURN dashboard_data;
END;
$$;
