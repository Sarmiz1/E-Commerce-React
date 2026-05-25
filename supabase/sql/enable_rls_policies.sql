-- ==============================================================================
-- ENTERPRISE ROW LEVEL SECURITY (RLS) & POLICIES MIGRATION
-- ==============================================================================
-- This script enables Row Level Security (RLS) on all tables and creates secure,
-- fine-grained access policies for public, authenticated, and administrative roles.
-- ==============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 0. PREREQUISITES (Admin Users Table)
-- ──────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE public.admin_role AS ENUM ('super_admin', 'support_lead', 'finance_manager', 'content_mod');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.admin_users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT,
    role        public.admin_role NOT NULL,
    is_active   BOOLEAN DEFAULT true NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_users TO anon, authenticated, service_role;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin users are viewable by everyone" ON public.admin_users FOR SELECT USING (true);


-- ──────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES & IDENTITIES
-- ──────────────────────────────────────────────────────────────────────────────

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;
CREATE POLICY "Profiles are publicly viewable" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Seller Profiles
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Seller profiles are publicly viewable" ON public.seller_profiles;
CREATE POLICY "Seller profiles are publicly viewable" ON public.seller_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can manage own profile" ON public.seller_profiles;
CREATE POLICY "Sellers can manage own profile" ON public.seller_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Buyer Profiles
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can manage own profile" ON public.buyer_profiles;
CREATE POLICY "Buyers can manage own profile" ON public.buyer_profiles
    FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. CATALOG & PRODUCTS
-- ──────────────────────────────────────────────────────────────────────────────

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are publicly viewable" ON public.categories;
CREATE POLICY "Categories are publicly viewable" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true
        )
    );

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are publicly viewable" ON public.products;
CREATE POLICY "Products are publicly viewable" ON public.products
    FOR SELECT USING (is_active = true OR seller_id = auth.uid());

DROP POLICY IF EXISTS "Sellers can manage own products" ON public.products;
CREATE POLICY "Sellers can manage own products" ON public.products
    FOR ALL USING (seller_id = auth.uid());

-- Product Variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product variants are publicly viewable" ON public.product_variants;
CREATE POLICY "Product variants are publicly viewable" ON public.product_variants
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can manage own product variants" ON public.product_variants;
CREATE POLICY "Sellers can manage own product variants" ON public.product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id AND p.seller_id = auth.uid()
        )
    );

-- Product Images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product images are publicly viewable" ON public.product_images;
CREATE POLICY "Product images are publicly viewable" ON public.product_images
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can manage own product images" ON public.product_images;
CREATE POLICY "Sellers can manage own product images" ON public.product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id AND p.seller_id = auth.uid()
        )
    );

-- Product Metrics
ALTER TABLE public.product_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product metrics are publicly viewable" ON public.product_metrics;
CREATE POLICY "Product metrics are publicly viewable" ON public.product_metrics
    FOR SELECT USING (true);

-- Product Reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.product_reviews;
CREATE POLICY "Reviews are publicly viewable" ON public.product_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.product_reviews;
CREATE POLICY "Users can insert own reviews" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.product_reviews;
CREATE POLICY "Users can update own reviews" ON public.product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.product_reviews;
CREATE POLICY "Users can delete own reviews" ON public.product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Curations
ALTER TABLE public.curations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active curations" ON public.curations;
CREATE POLICY "Public can read active curations" ON public.curations
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage curations" ON public.curations;
CREATE POLICY "Admins can manage curations" ON public.curations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true
        )
    );

-- Curation Products
ALTER TABLE public.curation_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active curation products" ON public.curation_products;
CREATE POLICY "Public can read active curation products" ON public.curation_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.curations c
            WHERE c.id = curation_id AND c.is_active = true
        )
    );

DROP POLICY IF EXISTS "Admins can manage curation products" ON public.curation_products;
CREATE POLICY "Admins can manage curation products" ON public.curation_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true
        )
    );

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. CART & CHECKOUT
-- ──────────────────────────────────────────────────────────────────────────────

-- Carts
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own carts" ON public.carts;
CREATE POLICY "Users can manage own carts" ON public.carts
    FOR ALL USING (auth.uid() = user_id);

-- Cart Items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
CREATE POLICY "Users can manage own cart items" ON public.cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.carts c
            WHERE c.id = cart_id AND c.user_id = auth.uid()
        )
    );

-- Inventory Reservations
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reservations" ON public.inventory_reservations;
CREATE POLICY "Users can view own reservations" ON public.inventory_reservations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reservations" ON public.inventory_reservations;
CREATE POLICY "Users can insert own reservations" ON public.inventory_reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. ORDERS & FINANCES
-- ──────────────────────────────────────────────────────────────────────────────

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

-- Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. SHIPMENTS & TRACKING
-- ──────────────────────────────────────────────────────────────────────────────

-- Shipments
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own shipments" ON public.shipments;
CREATE POLICY "Users can view own shipments" ON public.shipments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

-- Order Tracking Events
ALTER TABLE public.order_tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tracking events" ON public.order_tracking_events;
CREATE POLICY "Users can view own tracking events" ON public.order_tracking_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. PROMOTIONS & MARKETING
-- ──────────────────────────────────────────────────────────────────────────────

-- Coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coupons are readable by authenticated users" ON public.coupons;
CREATE POLICY "Coupons are readable by authenticated users" ON public.coupons
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true
        )
    );

-- Promo Codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Promo codes are readable by authenticated users" ON public.promo_codes;
CREATE POLICY "Promo codes are readable by authenticated users" ON public.promo_codes
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true
        )
    );

-- Coupon Redemptions
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own coupon redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users can view own coupon redemptions" ON public.coupon_redemptions
    FOR SELECT USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. BUYER LEDGERS & PERSONAL DATA
-- ──────────────────────────────────────────────────────────────────────────────

-- Wallet Ledger
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wallet ledger" ON public.wallet_ledger;
CREATE POLICY "Users can view own wallet ledger" ON public.wallet_ledger
    FOR SELECT USING (auth.uid() = user_id);

-- AI Credits Ledger
ALTER TABLE public.ai_credits_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own AI credit ledger" ON public.ai_credits_ledger;
CREATE POLICY "Users can view own AI credit ledger" ON public.ai_credits_ledger
    FOR SELECT USING (auth.uid() = user_id);

-- Buyer Insights
ALTER TABLE public.buyer_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own insights" ON public.buyer_insights;
CREATE POLICY "Users can view own insights" ON public.buyer_insights
    FOR SELECT USING (auth.uid() = user_id);

-- Buyer Recommendations
ALTER TABLE public.buyer_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recommendations" ON public.buyer_recommendations;
CREATE POLICY "Users can view own recommendations" ON public.buyer_recommendations
    FOR SELECT USING (auth.uid() = user_id);

-- Payment Methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own payment methods" ON public.payment_methods;
CREATE POLICY "Users can manage own payment methods" ON public.payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- Wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own wishlists" ON public.wishlists;
CREATE POLICY "Users can manage own wishlists" ON public.wishlists
    FOR ALL USING (auth.uid() = user_id);

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 8. ANALYTICS & EVENTS
-- ──────────────────────────────────────────────────────────────────────────────

-- User Product Events
ALTER TABLE public.user_product_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own events" ON public.user_product_events;
CREATE POLICY "Users can insert own events" ON public.user_product_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own events" ON public.user_product_events;
CREATE POLICY "Users can view own events" ON public.user_product_events
    FOR SELECT USING (auth.uid() = user_id);

-- User Session Events
ALTER TABLE public.user_session_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can track session events" ON public.user_session_events;
CREATE POLICY "Anyone can track session events" ON public.user_session_events
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view matching session events" ON public.user_session_events;
CREATE POLICY "Users can view matching session events" ON public.user_session_events
    FOR SELECT USING (true); -- Usually public or tracked by analytics engines
