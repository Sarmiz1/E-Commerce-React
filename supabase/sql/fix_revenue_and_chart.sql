-- ============================================================
-- Fix: Revenue = delivered orders only + real revenue chart
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION get_seller_dashboard(p_seller_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dashboard_data JSON;
BEGIN
  SELECT json_build_object(

    -- 1. Profile
    'profile', (
      SELECT json_build_object(
        'storeName',        COALESCE(sp.store_name, p.full_name || '''s Store'),
        'storeDescription', COALESCE(sp.store_description, 'Premium seller.'),
        'businessEmail',    COALESCE(sp.business_email, u.email),
        'businessPhone',    COALESCE(sp.business_phone, ''),
        'bankName',         COALESCE(sp.bank_name, ''),
        'accountNumber',    COALESCE(sp.account_number, ''),
        'accountName',      COALESCE(sp.account_name, ''),
        'notifs', json_build_object(
          'newOrders', COALESCE(sp.notif_new_orders, true),
          'lowStock',  COALESCE(sp.notif_low_stock, true),
          'payouts',   COALESCE(sp.notif_payouts, true),
          'reviews',   COALESCE(sp.notif_reviews, false)
        )
      )
      FROM profiles p
      LEFT JOIN seller_profiles sp ON sp.user_id = p.id
      JOIN auth.users u ON u.id = p.id
      WHERE p.id = p_seller_id
    ),

    -- 2. Stats
    -- revenue  = only delivered orders (money actually received)
    -- totalOrders / ordersToday = ALL non-cancelled orders (for logistics tracking)
    'stats', (
      SELECT json_build_object(
        'revenue', (
          SELECT COALESCE(SUM(oi.total_minor), 0)
          FROM order_items oi
          JOIN products prod ON prod.id = oi.product_id
          JOIN orders o      ON o.id    = oi.order_id
          WHERE prod.seller_id = p_seller_id
            AND o.status = 'delivered'
        ),
        'totalOrders', (
          SELECT COUNT(DISTINCT o.id)
          FROM order_items oi
          JOIN products prod ON prod.id = oi.product_id
          JOIN orders o      ON o.id    = oi.order_id
          WHERE prod.seller_id = p_seller_id
            AND o.status != 'cancelled'
        ),
        'ordersToday', (
          SELECT COUNT(DISTINCT o.id)
          FROM order_items oi
          JOIN products prod ON prod.id = oi.product_id
          JOIN orders o      ON o.id    = oi.order_id
          WHERE prod.seller_id = p_seller_id
            AND o.created_at >= current_date
            AND o.status != 'cancelled'
        ),
        'activeProducts', (
          SELECT COUNT(*) FROM products
          WHERE seller_id = p_seller_id AND is_active = true
        ),
        'totalProducts', (
          SELECT COUNT(*) FROM products
          WHERE seller_id = p_seller_id
        ),
        'customers', (
          SELECT COUNT(DISTINCT o.user_id)
          FROM order_items oi
          JOIN products prod ON prod.id = oi.product_id
          JOIN orders o      ON o.id    = oi.order_id
          WHERE prod.seller_id = p_seller_id
            AND o.status != 'cancelled'
        ),
        'productsSold', (
          SELECT COALESCE(SUM(oi.quantity), 0)
          FROM order_items oi
          JOIN products prod ON prod.id = oi.product_id
          JOIN orders o      ON o.id    = oi.order_id
          WHERE prod.seller_id = p_seller_id
            AND o.status != 'cancelled'
        )
      )
    ),

    -- 3. Revenue Chart
    -- Only delivered orders, grouped by day for 7d / 30d / 90d
    'revenueChart', (
      SELECT json_build_object(
        '7d',  (
          SELECT COALESCE(json_agg(row ORDER BY row.day ASC), '[]'::json)
          FROM (
            SELECT
              to_char(day_series.day, 'Mon DD') AS label,
              COALESCE(SUM(oi.total_minor), 0)  AS value
            FROM generate_series(
              current_date - interval '6 days',
              current_date,
              interval '1 day'
            ) AS day_series(day)
            LEFT JOIN orders o
              ON o.created_at::date = day_series.day
             AND o.status = 'delivered'
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products prod  ON prod.id = oi.product_id
              AND prod.seller_id = p_seller_id
            GROUP BY day_series.day
          ) row
        ),
        '30d', (
          SELECT COALESCE(json_agg(row ORDER BY row.day ASC), '[]'::json)
          FROM (
            SELECT
              to_char(day_series.day, 'Mon DD') AS label,
              COALESCE(SUM(oi.total_minor), 0)  AS value
            FROM generate_series(
              current_date - interval '29 days',
              current_date,
              interval '1 day'
            ) AS day_series(day)
            LEFT JOIN orders o
              ON o.created_at::date = day_series.day
             AND o.status = 'delivered'
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products prod  ON prod.id = oi.product_id
              AND prod.seller_id = p_seller_id
            GROUP BY day_series.day
          ) row
        ),
        '90d', (
          SELECT COALESCE(json_agg(row ORDER BY row.day ASC), '[]'::json)
          FROM (
            SELECT
              to_char(day_series.day, 'Mon DD') AS label,
              COALESCE(SUM(oi.total_minor), 0)  AS value
            FROM generate_series(
              current_date - interval '89 days',
              current_date,
              interval '1 day'
            ) AS day_series(day)
            LEFT JOIN orders o
              ON o.created_at::date = day_series.day
             AND o.status = 'delivered'
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products prod  ON prod.id = oi.product_id
              AND prod.seller_id = p_seller_id
            GROUP BY day_series.day
          ) row
        )
      )
    ),

    -- 4. Wallet
    'wallet', (
      SELECT json_build_object(
        'balance',        COALESCE(SUM(amount_minor) FILTER (WHERE status = 'completed'), 0),
        'pendingPayout',  ABS(COALESCE(SUM(amount_minor) FILTER (WHERE status = 'pending' AND type = 'payout'), 0)),
        'totalEarned',    COALESCE(SUM(amount_minor) FILTER (WHERE type = 'sale'   AND status = 'completed'), 0),
        'totalWithdrawn', ABS(COALESCE(SUM(amount_minor) FILTER (WHERE type = 'payout' AND status = 'completed'), 0)),
        'transactions', (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id',        t.id,
              'type',      t.type,
              'amount',    t.amount_minor,
              'fee',       COALESCE((t.metadata->>'fee_minor')::int, 0),
              'net',       t.amount_minor - COALESCE((t.metadata->>'fee_minor')::int, 0),
              'status',    t.status,
              'date',      t.created_at,
              'reference', t.provider_reference,
              'metadata',  t.metadata
            ) ORDER BY t.created_at DESC
          ), '[]'::json)
          FROM transactions t
          WHERE t.user_id = p_seller_id
        )
      )
      FROM transactions
      WHERE user_id = p_seller_id
    ),

    -- 5. Recent Orders (last 50, all non-cancelled for logistics)
    'orders', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id',           sub.order_id,
          'customerName', sub.customer_name,
          'status',       sub.status,
          'date',         sub.created_at,
          'total',        sub.order_total,
          'items',        sub.items
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
            'id',    oi.id,
            'name',  oi.product_name,
            'qty',   oi.quantity,
            'price', oi.price_minor
          )) AS items
        FROM orders o
        JOIN profiles prof     ON prof.id    = o.user_id
        JOIN order_items oi    ON oi.order_id = o.id
        JOIN products p        ON p.id        = oi.product_id
        WHERE p.seller_id = p_seller_id
        GROUP BY o.id, prof.full_name, o.status, o.created_at
        ORDER BY o.created_at DESC
        LIMIT 50
      ) sub
    ),

    -- 6. Products
    'products', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id',     p.id,
          'name',   p.name,
          'image',  p.image,
          'price',  p.price_minor,
          'stock',  COALESCE((SELECT SUM(stock_quantity) FROM product_variants pv WHERE pv.product_id = p.id), 0),
          'sales',  COALESCE((SELECT SUM(quantity) FROM order_items oi WHERE oi.product_id = p.id), 0),
          'rating', p.rating_stars,
          'status', CASE WHEN p.is_active THEN 'active' ELSE 'inactive' END
        ) ORDER BY p.created_at DESC
      ), '[]'::json)
      FROM products p WHERE p.seller_id = p_seller_id
    ),

    -- 7. Reviews
    'reviews', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id',           r.id,
          'rating',       r.rating,
          'text',         r.review_text,
          'date',         r.created_at,
          'productName',  p.name,
          'productImage', p.image,
          'customerName', prof.full_name,
          'isVerified',   r.is_verified
        ) ORDER BY r.created_at DESC
      ), '[]'::json)
      FROM product_reviews r
      JOIN products p ON p.id = r.product_id
      LEFT JOIN profiles prof ON prof.id = r.user_id
      WHERE p.seller_id = p_seller_id
    ),

    -- 8. Notifications
    'notifications', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id',    n.id,
          'type',  n.type,
          'text',  COALESCE(n.text, n.title),
          'time',  n.created_at,
          'unread', n.unread
        ) ORDER BY n.created_at DESC
      ), '[]'::json)
      FROM (SELECT * FROM seller_notifications WHERE seller_id = p_seller_id LIMIT 30) n
    ),

    -- 9. Analytics
    'analytics', (
      SELECT json_build_object(
        'peakHours', (
          SELECT COALESCE(json_agg(json_build_object('hour', h.hour, 'value', COALESCE(ph.value, 0))), '[]'::json)
          FROM generate_series(0, 23) AS h(hour)
          LEFT JOIN (
            SELECT EXTRACT(HOUR FROM o.created_at) AS hour, COUNT(oi.id) AS value
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            JOIN products p     ON p.id = oi.product_id
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
            json_build_object('label', 'Direct',         'pct', 45),
            json_build_object('label', 'Organic Search', 'pct', 30),
            json_build_object('label', 'Social Media',   'pct', 15),
            json_build_object('label', 'Referral',       'pct', 10)
          )
        ),
        'metrics', (
          SELECT json_build_array(
            json_build_object('label', 'Conversion Rate',      'value', '3.2%',  'change', '+0.4%',  'icon', 'percent'),
            json_build_object('label', 'Avg. Order Value',     'value',
              '₦' || COALESCE((SELECT ROUND(AVG(oi.total_minor)/100, 2) FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.seller_id = p_seller_id), 0)::text,
              'change', '+₦1.2K', 'icon', 'trending-up'),
            json_build_object('label', 'Customer Return Rate', 'value', '24%',   'change', '+2%',    'icon', 'refresh'),
            json_build_object('label', 'Cart Abandonment',     'value', '68%',   'change', '-3%',    'icon', 'alert-circle')
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
