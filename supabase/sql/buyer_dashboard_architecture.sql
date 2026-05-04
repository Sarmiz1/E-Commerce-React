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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

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


-- ==============================================================================
-- 2. CREATE THE AGGREGATION RPC ENDPOINT (BFF PATTERN)
-- ==============================================================================
-- This queries all relational tables simultaneously and builds a massive, 
-- optimized JSON payload representing the entire dashboard state.

CREATE OR REPLACE FUNCTION get_buyer_dashboard(buyer_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  dashboard_data JSON;
BEGIN
  SELECT json_build_object(
    
    -- Profile
    'profile', (
      SELECT row_to_json(p) FROM buyer_profiles p WHERE p.user_id = buyer_id
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
    
    -- Wishlist & nested products
    'wishlist', (
      SELECT COALESCE(json_agg(
        json_build_object('id', w.id, 'products', p)
      ), '[]'::json)
      FROM wishlist w
      JOIN products p ON p.id = w.product_id
      WHERE w.user_id = buyer_id
    ),
    
    -- Reviews
    'reviews', (
      SELECT COALESCE(json_agg(json_build_object('id', r.id, 'rating', r.rating, 'comment', r.comment, 'products', p)), '[]'::json)
      FROM reviews r
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
      FROM buyer_addresses a WHERE a.user_id = buyer_id
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
