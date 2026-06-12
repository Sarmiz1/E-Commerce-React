-- ============================================================
-- Fix: price_minor → price_minor + create get_ranked_similar_products
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop existing functions first to allow return type changes
DROP FUNCTION IF EXISTS get_ai_recommendations(uuid, text, vector, int);
DROP FUNCTION IF EXISTS get_ranked_similar_products(uuid, int);
DROP FUNCTION IF EXISTS get_ranked_similar_products(uuid, integer);

-- 1. Fix get_ai_recommendations: replace price_minor → price_minor
CREATE OR REPLACE FUNCTION get_ai_recommendations(
  user_id uuid,
  session_id text,
  target_embedding vector(1536),
  limit_count int
)
RETURNS TABLE (
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
LANGUAGE sql
AS $$
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
      -- VECTOR SIMILARITY (AI CORE)
      (1 - (p.embedding <=> target_embedding)) * 60

      -- GLOBAL POPULARITY
      + LOG(COALESCE(p.click_score, 0) + 1) * 3

      -- USER HISTORY BOOST
      + (
          SELECT COUNT(*)
          FROM user_product_events e
          JOIN products p2 ON p2.id = e.product_id
          WHERE e.user_id = get_ai_recommendations.user_id
            AND p2.category_id = p.category_id
        ) * 6

      -- SESSION INTENT BOOST
      + (
          SELECT COUNT(*)
          FROM user_session_events s
          JOIN products p3 ON p3.id = s.product_id
          WHERE s.session_id = get_ai_recommendations.session_id
            AND p3.category_id = p.category_id
        ) * 8

    ) AS score
  FROM products p
  WHERE p.is_active = true
    AND p.embedding IS NOT NULL
  ORDER BY score DESC
  LIMIT limit_count;
$$;


-- 2. Create the missing get_ranked_similar_products function
--    Called by ProductDetail recommendations and cart similar products
CREATE OR REPLACE FUNCTION get_ranked_similar_products(
  target_id uuid,
  limit_count int DEFAULT 8
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  price_minor integer,
  category_id uuid,
  rating_stars numeric,
  rating_count integer,
  image text,
  keywords text[],
  score numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.name,
    p.slug,
    p.price_minor,
    p.category_id,
    p.rating_stars,
    p.rating_count::integer,
    p.image,
    p.keywords,
    (
      -- Same category boost
      CASE WHEN p.category_id = target.category_id THEN 40 ELSE 0 END

      -- Keyword overlap score (count shared keywords)
      + (
          SELECT COUNT(*)
          FROM unnest(p.keywords) kw
          WHERE kw = ANY(target.keywords)
        ) * 8

      -- Popularity
      + LOG(COALESCE(p.click_score, 0) + 1) * 2

      -- Recency (newer products get a mild boost)
      + CASE
          WHEN p.created_at > NOW() - INTERVAL '30 days' THEN 5
          WHEN p.created_at > NOW() - INTERVAL '90 days' THEN 2
          ELSE 0
        END

      -- Rating quality
      + COALESCE(p.rating_stars, 0) * 2

      -- Embedding similarity (if both have embeddings)
      + CASE
          WHEN p.embedding IS NOT NULL AND target.embedding IS NOT NULL
          THEN (1 - (p.embedding <=> target.embedding)) * 30
          ELSE 0
        END

    ) AS score
  FROM products p
  -- Cross join to the target product for comparison
  JOIN (
    SELECT
      id,
      category_id,
      keywords,
      price_minor,
      embedding
    FROM products
    WHERE id = target_id
  ) target ON true
  WHERE p.is_active = true
    AND p.id != target_id
  ORDER BY score DESC
  LIMIT limit_count;
$$;

-- Grant access to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_ranked_similar_products(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ranked_similar_products(uuid, int) TO anon;
GRANT EXECUTE ON FUNCTION get_ai_recommendations(uuid, text, vector, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_recommendations(uuid, text, vector, int) TO anon;
