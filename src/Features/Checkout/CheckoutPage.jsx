import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";

import { OrderAPI } from "../../api/orderApi";
import { useAuth } from "../../store/useAuthStore";
import { useCartActions, useCartState } from "../../Context/cart/CartContext";
import useShowErrorBoundary from "../../Hooks/useShowErrorBoundary";
import { CartReviewStep } from "./Components/CartReviewStep";
import { CheckoutHero } from "./Components/CheckoutHero";
import { CheckoutLoading } from "./Components/CheckoutLoading";
import { DetailsStep } from "./Components/DetailsStep";
import { StepBar } from "./Components/StepBar";
import { SubmitErrorAlert } from "./Components/SubmitErrorAlert";
import { SuccessScreen } from "./Components/SuccessScreen";
import { TrustBar } from "./Components/TrustBar";
import { CO_STYLES, EMPTY_ERRORS, EMPTY_FORM } from "./Utils/checkoutConstants";
import {
  calculateCheckoutTotals,
  getCartItemQuantity,
  hasFormErrors,
  validateCheckoutForm,
} from "./Utils/checkoutUtils";

const DEMO_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart: cartData, error: cartError, loading: cartLoading, cartId } = useCartState();
  const {
    removeItem,
    updateQuantity,
    removingItemId,
    updatingQuantityItemId,
  } = useCartActions();

  useShowErrorBoundary(cartError);

  const cart = useMemo(() => (Array.isArray(cartData) ? cartData : []), [cartData]);
  const [step, setStep] = useState(0);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [coupon, setCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM());
  const [errors, setErrors] = useState(EMPTY_ERRORS());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);

  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;

    gsap.fromTo(
      heroRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", clearProps: "all" },
    );
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleUpdateQty = useCallback(
    (item, delta) => {
      const nextQuantity = getCartItemQuantity(item) + delta;
      if (nextQuantity < 1 || nextQuantity > 10) return;

      updateQuantity(item, nextQuantity);
    },
    [updateQuantity],
  );

  const handleRemove = useCallback(
    (item) => {
      removeItem(item);
    },
    [removeItem],
  );

  const handleCoupon = useCallback((couponData, code) => {
    setCoupon(couponData ? { ...couponData, code } : null);
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors = validateCheckoutForm(form);
    setErrors(nextErrors);
    return !hasFormErrors(nextErrors);
  }, [form]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!validate()) {
        document.querySelector(".co-input.error")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (!cart.length) {
        setStep(0);
        return;
      }

      setSubmitting(true);
      setSubmitError("");

      try {
        const totals = calculateCheckoutTotals(cart, selectedShipping, coupon);
        const result = await OrderAPI.createOrder({
          cartId,
          userId: user?.id || DEMO_USER_ID,
          couponCode: coupon?.code || null,
        });

        setOrderNumber(result?.orderNumber || result?.id || `SE-${Date.now().toString(36).toUpperCase()}`);
        setOrderTotal(totals.total);
        setStep(2);
      } catch (error) {
        setSubmitError(error?.message || "Failed to place order. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [cart, cartId, coupon, selectedShipping, user?.id, validate],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <style>{CO_STYLES}</style>

      <CheckoutHero heroRef={heroRef} step={step} itemCount={cart.length} />

      <div className="mx-auto max-w-6xl px-3 py-8 pb-28 sm:px-6 lg:pb-10">
        <StepBar step={step} />

        {cartLoading && step < 2 && <CheckoutLoading />}

        <AnimatePresence>
          <SubmitErrorAlert message={submitError} />
        </AnimatePresence>

        {!cartLoading && (
          <AnimatePresence mode="wait">
            {step === 0 && (
              <CartReviewStep
                cart={cart}
                coupon={coupon}
                onCoupon={handleCoupon}
                onNext={() => setStep(1)}
                onRemove={handleRemove}
                onUpdateQty={handleUpdateQty}
                removingItemId={removingItemId}
                updatingQuantityItemId={updatingQuantityItemId}
                selectedShipping={selectedShipping}
                onShippingChange={setSelectedShipping}
              />
            )}

            {step === 1 && (
              <DetailsStep
                cart={cart}
                coupon={coupon}
                form={form}
                errors={errors}
                submitting={submitting}
                onBack={() => setStep(0)}
                onChange={handleFieldChange}
                onSubmit={handleSubmit}
                selectedShipping={selectedShipping}
                onShippingChange={setSelectedShipping}
              />
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <SuccessScreen orderNumber={orderNumber} cart={cart} total={orderTotal} />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <TrustBar visible={step < 2} />
      </div>
    </div>
  );
}
