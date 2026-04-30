-- ==============================================================================
-- CLEAN MARKETPLACE (SAFE DEV REFACTOR)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 1. PROFILES (DO NOT MODIFY / DO NOT DROP)
-- ==============================================================================

-- KEEP YOUR EXISTING profiles TABLE AS-IS
-- (DO NOT re-run CREATE TABLE for it)

-- Optional reminder: role drives buyer/seller logic
-- buyer | seller | admin

-- ==============================================================================
-- 2. SELLER PROFILES (NEW LAYER - SAFE ADDITION)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS seller_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  store_name TEXT NOT NULL,
  store_slug TEXT UNIQUE,
  description TEXT,

  store_logo TEXT,
  store_banner TEXT,

  rating NUMERIC DEFAULT 0,
  total_sales INTEGER DEFAULT 0,

  is_verified_store BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. CATEGORIES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 4. PRODUCTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),

  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),

  brand TEXT,
  short_description TEXT,
  full_description TEXT,

  keywords TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '[]',

  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT DEFAULT 'USD',

  sale_price_cents INTEGER,
  sale_starts_at TIMESTAMPTZ,
  sale_ends_at TIMESTAMPTZ,

  CHECK (sale_price_cents IS NULL OR sale_price_cents < price_cents),

  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  rating_stars NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  embedding vector(1536),
  ai_summary TEXT,
  ai_tags TEXT[] DEFAULT '{}',

  image TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 5. PRODUCT VARIANTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  sku TEXT UNIQUE,
  color TEXT,
  size TEXT,

  price_cents INTEGER,
  sale_price_cents INTEGER,

  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_variant_combo UNIQUE (product_id, color, size)
);

-- ==============================================================================
-- 6. PRODUCT IMAGES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID REFERENCES products(id) ON DELETE CASCADE,

  image_url TEXT NOT NULL,
  label TEXT DEFAULT 'View',
  sort_order INTEGER DEFAULT 0
);

-- ==============================================================================
-- 7. REVIEWS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),

  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,

  is_verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 8. CARTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'active',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),

  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),

  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_cart_variant UNIQUE (cart_id, variant_id)
);

-- ==============================================================================
-- 9. ORDERS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cart_id UUID REFERENCES carts(id),

  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',

  currency TEXT DEFAULT 'USD',

  subtotal_cents INTEGER DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  shipping_cents INTEGER DEFAULT 0,
  total_cents INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),

  product_name TEXT NOT NULL,
  variant_label TEXT,

  price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_cents INTEGER NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 10. INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- ==============================================================================
-- 11. OPTIONAL VIEW (VERY USEFUL)
-- ==============================================================================

CREATE OR REPLACE VIEW seller_public AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  s.store_name,
  s.store_slug,
  s.rating,
  s.is_verified_store
FROM profiles p
JOIN seller_profiles s ON s.user_id = p.id;



-- ==============================================================================
-- ==============================================================================


-- ==============================================================================
-- ENABLE RLS
-- ==============================================================================

alter table profiles enable row level security;
alter table seller_profiles enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- ==============================================================================
-- PROFILES POLICIES
-- ==============================================================================

create policy "Users can view own profile"
on profiles
for select
using (id = auth.uid());

create policy "Users can update own profile"
on profiles
for update
using (id = auth.uid());

-- ==============================================================================
-- SELLER PROFILES POLICIES
-- ==============================================================================

create policy "Sellers can view own seller profile"
on seller_profiles
for select
using (user_id = auth.uid());

create policy "Sellers can create seller profile"
on seller_profiles
for insert
with check (user_id = auth.uid());

create policy "Sellers can update own seller profile"
on seller_profiles
for update
using (user_id = auth.uid());

-- ==============================================================================
-- PRODUCTS POLICIES (CORE MARKETPLACE LOGIC)
-- ==============================================================================

-- Public can view active products
create policy "Public can view active products"
on products
for select
using (is_active = true);

-- Sellers can view their own products
create policy "Sellers can view own products"
on products
for select
using (seller_id = auth.uid());

-- Sellers can insert their own products
create policy "Sellers can create products"
on products
for insert
with check (seller_id = auth.uid());

-- Sellers can update their own products
create policy "Sellers can update own products"
on products
for update
using (seller_id = auth.uid());

-- Sellers can delete their own products
create policy "Sellers can delete own products"
on products
for delete
using (seller_id = auth.uid());

-- ==============================================================================
-- VARIANTS POLICIES
-- ==============================================================================

create policy "Public can view variants"
on product_variants
for select
using (true);

create policy "Seller can manage variants via product ownership"
on product_variants
for all
using (
  exists (
    select 1 from products
    where products.id = product_variants.product_id
    and products.seller_id = auth.uid()
  )
);

-- ==============================================================================
-- IMAGES POLICIES
-- ==============================================================================

create policy "Public can view product images"
on product_images
for select
using (true);

create policy "Seller can manage product images"
on product_images
for all
using (
  exists (
    select 1 from products
    where products.id = product_images.product_id
    and products.seller_id = auth.uid()
  )
);

-- ==============================================================================
-- CART POLICIES
-- ==============================================================================

create policy "Users manage their cart"
on carts
for all
using (user_id = auth.uid());

create policy "Users manage their cart items"
on cart_items
for all
using (
  exists (
    select 1 from carts
    where carts.id = cart_items.cart_id
    and carts.user_id = auth.uid()
  )
);

-- ==============================================================================
-- ORDERS POLICIES
-- ==============================================================================

create policy "Users can view their orders"
on orders
for select
using (user_id = auth.uid());

create policy "Users can create orders"
on orders
for insert
with check (user_id = auth.uid());

create policy "Users can view order items"
on order_items
for select
using (
  exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

-- ==============================================================================
-- AUTO SELLER ONBOARDING (RPC)
-- ==============================================================================

create or replace function become_seller(p_store_name text)
returns void
language plpgsql
as $$
begin

  -- create seller profile
  insert into seller_profiles (user_id, store_name)
  values (auth.uid(), p_store_name)
  on conflict (user_id) do nothing;

  -- upgrade role
  update profiles
  set role = 'seller'
  where id = auth.uid();

end;
$$;

-- ==============================================================================
-- ==============================================================================
-- ==============================================================================
-- SELLER DASHBOARD ANALYTICS VIEW
-- ==============================================================================

create or replace view seller_dashboard_stats as
select
  p.seller_id,

  count(distinct p.id) as total_products,
  count(distinct oi.order_id) as total_orders,
  coalesce(sum(oi.total_cents), 0) as total_revenue

from products p
left join order_items oi on oi.product_id = p.id
group by p.seller_id;

-- ==============================================================================
-- OPTIONAL: LIVE PRODUCT METRICS VIEW
-- ==============================================================================

create or replace view seller_live_stats as
select
  p.seller_id,

  count(distinct p.id) as total_products,
  coalesce(sum(pm.view_count), 0) as total_views,
  coalesce(sum(pm.purchase_count), 0) as total_purchases

from products p
left join product_metrics pm on pm.product_id = p.id
group by p.seller_id;