
-- =========================================================
-- EXTENSIONS
-- =========================================================
create extension if not exists vector;
create extension if not exists pgcrypto;
create extension if not exists pg_net;


-- =========================================================
-- EVENT TRACKING TABLES (FIXED MISSING PIECE)
-- =========================================================
create table if not exists user_product_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamp default now()
);

create index if not exists idx_user_product_events_user
on user_product_events(user_id);

create index if not exists idx_user_product_events_product
on user_product_events(product_id);


create table if not exists user_session_events (
  id uuid default gen_random_uuid() primary key,
  session_id text,
  product_id uuid references products(id) on delete cascade,
  created_at timestamp default now()
);

create index if not exists idx_user_session_events_session
on user_session_events(session_id);


-- =========================================================
-- CLICK TRACKING FUNCTION
-- =========================================================
create or replace function track_product_click(product_id uuid)
returns void
language sql
as $$
  update products
  set click_score = coalesce(click_score, 0) + 1
  where id = product_id;
$$;


-- =========================================================
-- EMBEDDING TRIGGER FUNCTION
-- =========================================================
create or replace function auto_generate_embedding()
returns trigger
language plpgsql
as $$
begin

  perform net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/generate-embedding',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'keywords', NEW.keywords
    )
  );

  return NEW;

end;
$$;

drop trigger if exists product_embedding_trigger on products;

create trigger product_embedding_trigger
after insert or update of name, keywords
on products
for each row
execute function auto_generate_embedding();


-- =========================================================
-- 🚀 MAIN RECOMMENDATION ENGINE
-- =========================================================
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
  price_cents integer,
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
  p.price_cents,
  p.category_id,
  p.rating_stars,
  p.rating_count,

  -- ✅ MAIN IMAGE ONLY
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


-- =========================================================
-- PERFORMANCE INDEXES
-- =========================================================
create index if not exists idx_products_embedding
on products using ivfflat (embedding vector_cosine_ops);

create index if not exists idx_products_click
on products (click_score);

create index if not exists idx_products_active
on products (is_active);