-- SQL Script to upgrade Cart Backend Logic
-- Run this in your Supabase SQL Editor

-- 1. Create a Promo Codes Table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('percent', 'fixed', 'shipping')),
    value INTEGER NOT NULL, -- e.g., 10 for 10%, 500 for $5.00
    label TEXT NOT NULL,
    min_order_cents INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default promos
INSERT INTO public.promo_codes (code, type, value, label)
VALUES 
    ('SAVE10', 'percent', 10, '10% off everything'),
    ('WELCOME20', 'percent', 20, '20% off — welcome gift'),
    ('FREESHIP', 'shipping', 0, 'Free shipping'),
    ('FLAT5', 'fixed', 500, '$5 off')
ON CONFLICT (code) DO NOTHING;

-- 2. Create an RPC to calculate totals dynamically
CREATE OR REPLACE FUNCTION public.get_cart_totals(p_cart_id UUID, p_promo_code TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_subtotal INTEGER := 0;
    v_discount INTEGER := 0;
    v_shipping INTEGER := 499; -- Default shipping $4.99
    v_total INTEGER := 0;
    v_free_ship_threshold INTEGER := 5000; -- $50
    v_promo RECORD;
    v_promo_found BOOLEAN := false;
BEGIN
    -- Calculate subtotal by joining cart_items with product_variants
    SELECT COALESCE(SUM(ci.quantity * pv.price_cents), 0)
    INTO v_subtotal
    FROM public.cart_items ci
    JOIN public.product_variants pv ON ci.variant_id = pv.id
    WHERE ci.cart_id = p_cart_id;

    -- Apply promo code if provided and active
    IF p_promo_code IS NOT NULL THEN
        SELECT * INTO v_promo
        FROM public.promo_codes
        WHERE code = upper(p_promo_code) AND is_active = true AND v_subtotal >= min_order_cents;

        IF FOUND THEN
            v_promo_found := true;
            IF v_promo.type = 'percent' THEN
                v_discount := ROUND(v_subtotal * v_promo.value / 100.0);
            ELSIF v_promo.type = 'fixed' THEN
                v_discount := v_promo.value;
            ELSIF v_promo.type = 'shipping' THEN
                v_shipping := 0;
            END IF;
        END IF;
    END IF;

    -- Calculate shipping based on threshold
    IF NOT v_promo_found OR v_promo.type != 'shipping' THEN
        IF (v_subtotal - v_discount) >= v_free_ship_threshold THEN
            v_shipping := 0;
        END IF;
    END IF;

    -- Ensure discount doesn't exceed subtotal
    IF v_discount > v_subtotal THEN
        v_discount := v_subtotal;
    END IF;

    -- Calculate final total
    v_total := v_subtotal - v_discount + v_shipping;

    -- Return JSON object
    RETURN jsonb_build_object(
        'subtotal', v_subtotal,
        'discount', v_discount,
        'shipping', v_shipping,
        'total', v_total,
        'applied_promo', CASE WHEN v_promo_found THEN 
                            jsonb_build_object('code', v_promo.code, 'label', v_promo.label, 'type', v_promo.type)
                         ELSE NULL END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
