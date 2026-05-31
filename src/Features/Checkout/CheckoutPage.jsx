import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";

import { OrderAPI } from "../../api/orderApi";
import { useAuth } from "../../Store/useAuthStore";
import { useCartState, useCartActions } from "../../Store/cartContext";
import { useToastStore } from "../../Store/useToastStore";

const toast = (msg, type = "success") =>
  useToastStore.getState().addToast(msg, type);
import useShowErrorBoundary from "../../hooks/useShowErrorBoundary";

import { CheckoutHero } from "./Components/CheckoutHero";
import { CheckoutLoading } from "./Components/CheckoutLoading";
import { DetailsStep } from "./Components/DetailsStep";
import { EmptyCart } from "./Components/EmptyCart";
import { StepBar } from "./Components/StepBar";
import { SubmitErrorAlert } from "./Components/SubmitErrorAlert";
import { SuccessScreen } from "./Components/SuccessScreen";
import { TrustBar } from "./Components/TrustBar";
import { CO_STYLES, EMPTY_ERRORS, EMPTY_FORM } from "./utils/checkoutConstants";
import { calculateCheckoutTotals } from "./utils/checkoutUtils";
import { hasFormErrors, validateCheckoutForm } from "./Schema/checkoutSchema";

export default function CheckoutPage() {
  const { user } = useAuth();
  const {
    cart: cartData,
    error: cartError,
    loading: cartLoading,
    cartId,
  } = useCartState();
  const { clearCart } = useCartActions();


  useShowErrorBoundary(cartError);

  const cart = useMemo(
    () => (Array.isArray(cartData) ? cartData : []),
    [cartData],
  );
  const [step, setStep] = useState(0);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [coupon] = useState(null);

  const [form, setForm] = useState(() => {
    const baseForm = EMPTY_FORM();
    if (user) {
      return {
        ...baseForm,
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
      };
    }
    return baseForm;
  });
  const [errors, setErrors] = useState(EMPTY_ERRORS());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderedCartSnapshot, setOrderedCartSnapshot] = useState([]);

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
        document
          .querySelector(".co-input.error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (!cart.length) {
        setStep(0);
        return;
      }

      setSubmitting(true);
      setSubmitError("");

      try {
        if (!user?.id) {
          throw new Error("Please sign in before placing your order.");
        }

        const totals = calculateCheckoutTotals(cart, selectedShipping, coupon);
        const result = await OrderAPI.createOrder({
          cartId,
          couponCode: coupon?.code || null,
          shippingTier: selectedShipping,
        });

        setOrderNumber(
          result?.order_number ||
            result?.id ||
            `SE-${Date.now().toString(36).toUpperCase()}`,
        );
        setOrderTotal(totals.total);
        setOrderedCartSnapshot([...cart]);
        setStep(1);
        clearCart();
        toast("Order placed successfully!", "success");
      } catch (error) {
        setSubmitError(
          error?.message || "Failed to place order. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [cart, cartId, clearCart, coupon, selectedShipping, user?.id, validate],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <style>{CO_STYLES}</style>

      <CheckoutHero heroRef={heroRef} step={step} itemCount={cart.length} />

      <div className="mx-auto max-w-6xl px-3 py-8 pb-28 sm:px-6 lg:pb-10">
        {cart.length > 0 && step < 1 && <StepBar step={step} />}

        {cartLoading && step < 1 && <CheckoutLoading />}

        <AnimatePresence>
          <SubmitErrorAlert message={submitError} />
        </AnimatePresence>

        {!cartLoading && cart.length === 0 && step === 0 && <EmptyCart />}

        {!cartLoading && (cart.length > 0 || step === 1) && (
          <AnimatePresence mode="wait">
            {step === 0 && (
              <DetailsStep
                cart={cart}
                coupon={coupon}
                form={form}
                errors={errors}
                submitting={submitting}
                onBack={() => window.history.back()}
                onChange={handleFieldChange}
                onSubmit={handleSubmit}
                selectedShipping={selectedShipping}
                onShippingChange={setSelectedShipping}
              />
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <SuccessScreen
                  orderNumber={orderNumber}
                  cart={orderedCartSnapshot}
                  total={orderTotal}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {cart.length > 0 && <TrustBar visible={step < 1} />}
      </div>
    </div>
  );
}
