-- ==============================================================================
-- MASTER SUPABASE E-COMMERCE SCHEMA (ENTERPRISE CHECKOUT)
-- ==============================================================================
-- SEQUENCE:
-- 1. Profiles & Core Identities
-- 2. Catalog (Products, Variants, Categories, Reviews)
-- 3. Shopping Carts
-- 4. Orders & Addresses
-- 5. Transactions & Payments
-- 6. Coupons & Redemptions
-- 7. Deliveries
-- 8. Async Inventory Reservations
-- 9. Indexes & Triggers (The Stock Safety Engine)
-- 10. RPCs (Checkout, Confirm, Fail Webhooks)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 1. PROFILES (AUTH CORE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'buyer',
  is_verified BOOLEAN DEFAULT false,
  is_official_store BOOLEAN DEFAULT false,
  store_type TEXT DEFAULT 'independent',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 2. CATEGORIES & CATALOG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'NG',
  is_default_shipping BOOLEAN DEFAULT false,
  is_default_billing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  seller_id UUID REFERENCES profiles(id),
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
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  rating_stars NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  embedding vector(1536),
  ai_summary TEXT,
  ai_tags TEXT[] DEFAULT '{}',
  image TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  color TEXT,
  size TEXT,
  price_cents INTEGER,
  sale_price_cents INTEGER,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_variant_combo UNIQUE (product_id, color, size)
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  label TEXT DEFAULT 'View',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_metrics (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  search_count INTEGER DEFAULT 0,
  wishlisted_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. CARTS
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
-- 4. ORDERS & FINANCES
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
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER DEFAULT 0,
  shipping_address_id UUID REFERENCES addresses(id),
  billing_address_id UUID REFERENCES addresses(id),
  shipping_address JSONB,
  billing_address JSONB,
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

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT,
  provider_reference TEXT,
  status TEXT DEFAULT 'pending',
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  type TEXT,
  status TEXT DEFAULT 'pending',
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  provider TEXT,
  provider_reference TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 5. PROMOTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT,
  discount_value INTEGER,
  min_order_cents INTEGER DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  discount_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 6. SHIPPING
-- ==============================================================================
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  courier TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT,
  message TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 7. INVENTORY RESERVATIONS (THE SOURCE OF TRUTH)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status TEXT DEFAULT 'reserved',
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '15 minutes'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 8. INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_keywords ON products USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_tracking_order ON order_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_active_reservations ON inventory_reservations(variant_id) WHERE status = 'reserved';

-- ==============================================================================
-- 9. BURN-PROOF TRIGGERS (SINGLE SOURCE OF TRUTH)
-- ==============================================================================
CREATE OR REPLACE FUNCTION trg_safe_reservation_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_stock INTEGER;
  v_reserved INTEGER;
BEGIN
  -- lock row
  SELECT stock_quantity
  INTO v_stock
  FROM product_variants
  WHERE id = NEW.variant_id
  FOR UPDATE;

  -- cleanup expired
  UPDATE inventory_reservations
  SET status = 'released'
  WHERE variant_id = NEW.variant_id
    AND status = 'reserved'
    AND expires_at <= now();

  -- calculate active reservations
  SELECT COALESCE(SUM(quantity), 0)
  INTO v_reserved
  FROM inventory_reservations
  WHERE variant_id = NEW.variant_id
    AND status = 'reserved';

  -- HARD GUARANTEE
  IF (v_stock - v_reserved - NEW.quantity) < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', NEW.variant_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_stock_availability ON inventory_reservations;
CREATE TRIGGER ensure_stock_availability
BEFORE INSERT ON inventory_reservations
FOR EACH ROW
EXECUTE FUNCTION trg_safe_reservation_insert();

-- Rating Trigger
CREATE OR REPLACE FUNCTION recompute_product_rating()
RETURNS TRIGGER AS $$
DECLARE target_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN target_id := OLD.product_id; ELSE target_id := NEW.product_id; END IF;
  UPDATE products SET
    rating_stars = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM product_reviews WHERE product_id = target_id), 0),
    rating_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = target_id)
  WHERE id = target_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recompute_rating ON product_reviews;
CREATE TRIGGER trg_recompute_rating
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW EXECUTE FUNCTION recompute_product_rating();

-- ==============================================================================
-- 10. ENTERPRISE CHECKOUT RPCs
-- ==============================================================================
CREATE OR REPLACE FUNCTION checkout_cart(
  p_cart_id UUID,
  p_user_id UUID,
  p_coupon_code TEXT DEFAULT NULL,
  p_shipping_cents INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_total INTEGER := 0;
  v_discount INTEGER := 0;
  v_tax INTEGER := 0;
  v_tax_rate NUMERIC := 0.085;

  v_coupon RECORD;
  item RECORD;
BEGIN

  -- validate cart ownership
  IF NOT EXISTS (
    SELECT 1 FROM carts
    WHERE id = p_cart_id
      AND user_id = p_user_id
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Invalid cart';
  END IF;

  -- create order
  INSERT INTO orders (user_id, cart_id, status, payment_status)
  VALUES (p_user_id, p_cart_id, 'pending', 'unpaid')
  RETURNING id INTO v_order_id;

  -- coupon
  IF p_coupon_code IS NOT NULL THEN
    SELECT * INTO v_coupon
    FROM coupons
    WHERE code = p_coupon_code
      AND is_active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (expires_at IS NULL OR expires_at >= now())
    LIMIT 1;

    IF v_coupon IS NULL THEN
      RAISE EXCEPTION 'Invalid coupon';
    END IF;
  END IF;

  -- process items
  FOR item IN
    SELECT ci.*, p.name, p.price_cents, pv.price_cents AS variant_price
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    LEFT JOIN product_variants pv ON pv.id = ci.variant_id
    WHERE ci.cart_id = p_cart_id
  LOOP

    DECLARE
      v_price INTEGER := COALESCE(item.variant_price, item.price_cents);
      v_line INTEGER := v_price * item.quantity;
    BEGIN

      v_total := v_total + v_line;

      -- snapshot
      INSERT INTO order_items (
        order_id, product_id, variant_id,
        product_name, price_cents, quantity, total_cents
      )
      VALUES (
        v_order_id,
        item.product_id,
        item.variant_id,
        item.name,
        v_price,
        item.quantity,
        v_line
      );

      -- ONLY responsibility: attempt reservation
      INSERT INTO inventory_reservations (
        variant_id, order_id, user_id, quantity
      )
      VALUES (
        item.variant_id,
        v_order_id,
        p_user_id,
        item.quantity
      );

    END;

  END LOOP;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- coupon math
  IF v_coupon IS NOT NULL THEN
    IF v_coupon.discount_type = 'percentage' THEN
      v_discount := v_total * v_coupon.discount_value / 100;
    ELSE
      v_discount := v_coupon.discount_value;
    END IF;

    IF v_discount > v_total THEN
      v_discount := v_total;
    END IF;
  END IF;

  -- 6. Calculate Tax
  v_tax := ((v_total - v_discount + p_shipping_cents) * v_tax_rate)::INTEGER;

  UPDATE orders
  SET subtotal_cents = v_total,
      discount_cents = v_discount,
      shipping_cents = p_shipping_cents,
      tax_cents = v_tax,
      total_cents = (v_total - v_discount + p_shipping_cents + v_tax)
  WHERE id = v_order_id;

  UPDATE carts SET status = 'checked_out' WHERE id = p_cart_id;

  RETURN v_order_id;

END;
$$;


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

  -- idempotency guard
  IF (SELECT payment_status FROM orders WHERE id = p_order_id) = 'paid' THEN
    RETURN;
  END IF;

  UPDATE orders
  SET payment_status = 'paid',
      status = 'processing'
  WHERE id = p_order_id;

  INSERT INTO payments (
    order_id, provider, provider_reference,
    status, amount_cents, paid_at
  )
  SELECT p_order_id, 'stripe', p_reference,
         'success', total_cents, now()
  FROM orders WHERE id = p_order_id;

  -- commit inventory
  FOR item IN
    SELECT variant_id, quantity
    FROM inventory_reservations
    WHERE order_id = p_order_id
      AND status = 'reserved'
  LOOP

    UPDATE product_variants
    SET stock_quantity = stock_quantity - item.quantity
    WHERE id = item.variant_id;

    UPDATE inventory_reservations
    SET status = 'committed'
    WHERE order_id = p_order_id
      AND variant_id = item.variant_id;

  END LOOP;

END;
$$;


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

  UPDATE orders
  SET payment_status = 'failed',
      status = 'cancelled'
  WHERE id = p_order_id;

  INSERT INTO payments (
    order_id, provider, provider_reference,
    status, amount_cents
  )
  SELECT p_order_id, 'stripe', p_reference,
         'failed', total_cents
  FROM orders WHERE id = p_order_id;

  UPDATE inventory_reservations
  SET status = 'released'
  WHERE order_id = p_order_id
    AND status = 'reserved';

  IF v_cart IS NOT NULL THEN
    UPDATE carts
    SET status = 'active'
    WHERE id = v_cart;
  END IF;

END;
$$;
