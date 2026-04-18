/**
 * ==============================================================================
 * ENTERPRISE CHECKOUT AND INVENTORY ENGINE (DOCUMENTED)
 * ==============================================================================
 * This script handles the most critical part of an e-commerce platform: moving 
 * products from a user's cart into an unpaid order, reserving the inventory 
 * safely against race conditions, and explicitly committing or releasing that 
 * inventory based on external Stripe webhook events.
 */

-- ==============================================================================
-- 1. ORDER ORIGIN TRACKING
-- ==============================================================================
-- We add cart_id to the orders table. Why?
-- If a user abandons checkout, or their payment fails, we shouldn't just guess
-- which cart they were using via `user_id` (they might have one on their phone 
-- and one on their laptop). Storing cart_id guarantees we reopen the EXACT cart.
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS cart_id UUID REFERENCES carts(id);


-- ==============================================================================
-- 2. INVENTORY RESERVATIONS (THE SOURCE OF TRUTH)
-- ==============================================================================
-- This table acts as a temporary "holding pen" for stock while a user is entering
-- their credit card details. This guarantees that if there is 1 shirt left, and
-- Alice clicks "Checkout," Bob cannot steal it in the 2 minutes it takes Alice to pay.
CREATE TABLE IF NOT EXISTS inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links to the specific variation of the product being bought (e.g. Red, Medium)
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  
  -- Links to the transaction. If the order deletes, the reservation deletes natively.
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Strict ownership bound: Ensures we know exactly WHO holds this reservation
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- How many units are being held
  quantity INTEGER NOT NULL CHECK (quantity > 0),

  -- State-machine for the reservation:
  -- 'reserved'  -> Currently holding stock while waiting for Stripe
  -- 'committed' -> Stripe confirmed payment, stock is permanently gone
  -- 'released'  -> Payment failed / Cart abandoned, stock is freed back up
  status TEXT DEFAULT 'reserved',

  -- Determines when a "ghost" cart should automatically be freed
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '15 minutes'),

  created_at TIMESTAMPTZ DEFAULT now()
);

-- We explicitly index active reservations because the Trigger needs to constantly
-- SUM() them. This index makes that SUM() operation lightning fast.
CREATE INDEX idx_active_reservations
ON inventory_reservations(variant_id)
WHERE status = 'reserved';


-- ==============================================================================
-- 3. 🔥 SINGLE SOURCE OF TRUTH TRIGGER (ANTI-OVERSELL PROTECTION)
-- ==============================================================================
-- Application-level logic (NodeJS/React/RPCs) is vulnerable to race conditions 
-- if two people check out at the exact same millisecond. 
-- By using a BEFORE INSERT trigger, PostgreSQL handles the concurrency natively 
-- BEFORE the reservation is allowed to hit the database.
CREATE OR REPLACE FUNCTION trg_safe_reservation_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_stock INTEGER;
  v_reserved INTEGER;
BEGIN

  -- A. THE ROW LOCK (FOR UPDATE)
  -- This is the magic. It pauses any other checkout attempting to buy this EXACT 
  -- variant until this transaction is completely finished. It forces sequential execution.
  SELECT stock_quantity
  INTO v_stock
  FROM product_variants
  WHERE id = NEW.variant_id
  FOR UPDATE;

  -- B. READ-PATH CLEANUP
  -- Before calculating stock, we instantly sweep away any "ghost" reservations 
  -- that expired. We do this here instead of waiting for a cron-job to ensure
  -- stock is available the very millisecond it expires.
  UPDATE inventory_reservations
  SET status = 'released'
  WHERE variant_id = NEW.variant_id
    AND status = 'reserved'
    AND expires_at <= now();

  -- C. SUM ACTIVE RESERVATIONS
  -- Because of the ROW LOCK, this sum is guaranteed to be 100% accurate.
  SELECT COALESCE(SUM(quantity), 0)
  INTO v_reserved
  FROM inventory_reservations
  WHERE variant_id = NEW.variant_id
    AND status = 'reserved';

  -- D. HARD GUARANTEE (THE MATH)
  -- Total DB Stock - Units Held By Others - Units This User Wants To Hold
  IF (v_stock - v_reserved - NEW.quantity) < 0 THEN
    -- If it drops below zero, we violently crash the transaction. 
    -- The user throws an error, the checkout stops, and nobody is oversold.
    RAISE EXCEPTION 'Insufficient stock for variant %', NEW.variant_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind the trigger so it fires automatically on every insert.
DROP TRIGGER IF EXISTS ensure_stock_availability ON inventory_reservations;
CREATE TRIGGER ensure_stock_availability
BEFORE INSERT ON inventory_reservations
FOR EACH ROW
EXECUTE FUNCTION trg_safe_reservation_insert();


-- ==============================================================================
-- 4. CHECKOUT CART RPC (THE APPLICATION FACING FUNCTION)
-- ==============================================================================
-- This takes a Cart, turns it into an Order Snapshot, applies Coupons, and 
-- delegates the inventory checks to the Trigger above.
CREATE OR REPLACE FUNCTION checkout_cart(
  p_cart_id UUID,
  p_user_id UUID,
  p_coupon_code TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id UUID;
  v_total INTEGER := 0;
  v_discount INTEGER := 0;
  v_shipping INTEGER := 0;

  v_coupon RECORD;
  item RECORD;
BEGIN

  -- 1. Verify Cart Ownership
  -- Ensures hackers cannot pass someone else's cart ID.
  IF NOT EXISTS (
    SELECT 1 FROM carts
    WHERE id = p_cart_id
      AND user_id = p_user_id
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Invalid cart';
  END IF;

  -- 2. Create the Draft Order 
  INSERT INTO orders (user_id, cart_id, status, payment_status)
  VALUES (p_user_id, p_cart_id, 'pending', 'unpaid')
  RETURNING id INTO v_order_id;

  -- 3. Validate Coupons
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

  -- 4. Process Cart Items (Loop)
  FOR item IN
    SELECT ci.*, p.name, p.price_cents, pv.price_cents AS variant_price
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    LEFT JOIN product_variants pv ON pv.id = ci.variant_id
    WHERE ci.cart_id = p_cart_id
  LOOP

    DECLARE
      -- Variant prices override base product prices if they exist
      v_price INTEGER := COALESCE(item.variant_price, item.price_cents);
      v_line INTEGER := v_price * item.quantity;
    BEGIN

      v_total := v_total + v_line;

      -- A. Create Immutable Snapshot in "order_items".
      -- If the seller changes the product name or price tomorrow, this order 
      -- retains exactly what it was named/priced at the time of purchase.
      INSERT INTO order_items (
        order_id, product_id, variant_id,
        product_name, price_cents, quantity, total_cents
      )
      VALUES (
        v_order_id, item.product_id, item.variant_id,
        item.name, v_price, item.quantity, v_line
      );

      -- B. Attempt Reservation
      -- Motes: The application logic does NOT calculate stock here. It just blind-inserts.
      -- The Postgres Trigger (trg_safe_reservation_insert) catches this insert, locks
      -- the DB, runs the math, and will RAISE EXCEPTION (crashing this loop) if it fails.
      INSERT INTO inventory_reservations (
        variant_id, order_id, user_id, quantity
      )
      VALUES (
        item.variant_id, v_order_id, p_user_id, item.quantity
      );

    END;

  END LOOP;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- 5. Calculate Final Math Limits
  IF v_coupon IS NOT NULL THEN
    IF v_coupon.discount_type = 'percentage' THEN
      v_discount := v_total * v_coupon.discount_value / 100;
    ELSE
      v_discount := v_coupon.discount_value;
    END IF;

    -- Prevents giving a $20 discount on a $15 cart (which creates negative totals)
    IF v_discount > v_total THEN
      v_discount := v_total;
    END IF;
  END IF;

  -- 6. Finalize Order Totals
  UPDATE orders
  SET subtotal_cents = v_total,
      discount_cents = v_discount,
      shipping_cents = v_shipping,
      total_cents = (v_total - v_discount + v_shipping)
  WHERE id = v_order_id;

  -- Lock the Cart so the user can't keep adding items to it while on the Stripe page.
  UPDATE carts SET status = 'checked_out' WHERE id = p_cart_id;

  -- Send the new Order ID back to React so we can pass it to Stripe.
  RETURN v_order_id;

END;
$$;


-- ==============================================================================
-- 5. PAYMENT SUCCESS (STRIPE WEBHOOK HANDLER)
-- ==============================================================================
-- Fired when Stripe successfully charges the credit card.
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

  -- A. IDEMPOTENCY GUARD
  -- Stripe guarantees "at least once" delivery, meaning sometimes they send the 
  -- success webhook 3 times in a row. If we don't catch it, we deduct the user's
  -- stock 3 times. This immediately exits if the order is already paid.
  IF (SELECT payment_status FROM orders WHERE id = p_order_id) = 'paid' THEN
    RETURN;
  END IF;

  -- B. Update Order Status
  UPDATE orders
  SET payment_status = 'paid',
      status = 'processing'
  WHERE id = p_order_id;

  -- C. Log Financial Record
  INSERT INTO payments (
    order_id, provider, provider_reference,
    status, amount_cents, paid_at
  )
  SELECT p_order_id, 'stripe', p_reference,
         'success', total_cents, now()
  FROM orders WHERE id = p_order_id;

  -- D. COMMIT INVENTORY (PERMANENT DEDUCTION)
  -- Loop through all reservations tied to this specific order...
  FOR item IN
    SELECT variant_id, quantity
    FROM inventory_reservations
    WHERE order_id = p_order_id
      AND status = 'reserved'
  LOOP

    -- Permanently strip the units from the master product_variants table
    UPDATE product_variants
    SET stock_quantity = stock_quantity - item.quantity
    WHERE id = item.variant_id;

    -- Mark the reservation as fulfilled so it doesn't get cleaned up by edge-cases.
    UPDATE inventory_reservations
    SET status = 'committed'
    WHERE order_id = p_order_id
      AND variant_id = item.variant_id;

  END LOOP;

END;
$$;


-- ==============================================================================
-- 6. PAYMENT FAILURE (SAFE ROLLBACK)
-- ==============================================================================
-- Fired when Stripe declines a card (insufficient funds, wrong CVC).
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

  -- Retrieve explicit Cart ID so we know EXACTLY what cart to re-open for the user.
  SELECT cart_id INTO v_cart FROM orders WHERE id = p_order_id;

  -- Update Order to Cancelled
  UPDATE orders
  SET payment_status = 'failed',
      status = 'cancelled'
  WHERE id = p_order_id;

  -- Log the failure for auditing
  INSERT INTO payments (
    order_id, provider, provider_reference,
    status, amount_cents
  )
  SELECT p_order_id, 'stripe', p_reference,
         'failed', total_cents
  FROM orders WHERE id = p_order_id;

  -- INSTANTLY RELEASE INVENTORY
  -- We don't wait 15 minutes! The user might want to try again immediately 
  -- with a different credit card. We free the stock right now.
  UPDATE inventory_reservations
  SET status = 'released'
  WHERE order_id = p_order_id
    AND status = 'reserved';

  -- RE-OPEN THE EXACT CART
  -- The user is unblocked and can cleanly try checking out again.
  IF v_cart IS NOT NULL THEN
    UPDATE carts
    SET status = 'active'
    WHERE id = v_cart;
  END IF;

END;
$$;
