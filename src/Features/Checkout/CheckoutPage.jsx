import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { useSearchParams } from "react-router-dom";

import { OrderAPI } from "../../api/orderApi";
import { buyerApi } from "../BuyerDashboard/api/buyerApi";
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
import { CO_STYLES, COUNTRY_OPTIONS, EMPTY_ERRORS, EMPTY_FORM, SHIPPING_TIERS } from "./utils/checkoutConstants";
import { calculateCheckoutTotals } from "./utils/checkoutUtils";
import { hasFormErrors, validateCheckoutForm } from "./Schema/checkoutSchema";

const COUNTRY_CODE_NAMES = {
  NG: "Nigeria",
  US: "United States",
  GB: "United Kingdom",
  UK: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  FR: "France",
  AU: "Australia",
  GH: "Ghana",
  ZA: "South Africa",
  KE: "Kenya",
  IN: "India",
  AE: "UAE",
};

const normalizeCheckoutCountry = (country) => {
  const value = String(country || "").trim();
  if (!value) return "Nigeria";
  const normalized = COUNTRY_CODE_NAMES[value.toUpperCase()] || value;
  return COUNTRY_OPTIONS.includes(normalized) ? normalized : "Nigeria";
};

const pickAddressLine = (address) =>
  address?.line1 || address?.addressLine1 || address?.address_line1 || address?.address || "";

const pickPostalCode = (address) =>
  address?.postalCode || address?.postal_code || address?.zip || "";

const pickState = (address) =>
  address?.state || address?.region || address?.province || "";

export default function CheckoutPage() {
  const { user } = useAuth();
  const userMetadataPhone = user?.user_metadata?.phone || "";
  const {
    cart: cartData,
    error: cartError,
    loading: cartLoading,
    cartId,
  } = useCartState();
  const { clearCart } = useCartActions();
  const [searchParams, setSearchParams] = useSearchParams();


  useShowErrorBoundary(cartError);

  const cart = useMemo(
    () => (Array.isArray(cartData) ? cartData : []),
    [cartData],
  );
  const [step, setStep] = useState(0);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [shippingOptions, setShippingOptions] = useState(SHIPPING_TIERS);
  const [taxRules, setTaxRules] = useState([]);
  const [coupon] = useState(null);

  const [form, setForm] = useState(() => {
    const baseForm = EMPTY_FORM();
    if (user) {
      return {
        ...baseForm,
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email || "",
        phone: "",
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
  const [paymentMethods, setPaymentMethods] = useState([]);

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
    if (!user?.id) return;

    let cancelled = false;
    Promise.allSettled([
      buyerApi.getAccountSettings(),
      buyerApi.getAddresses(),
      buyerApi.getPaymentMethods(),
    ])
      .then(([settingsResult, addressesResult, paymentMethodsResult]) => {
        const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
        const addresses = addressesResult.status === "fulfilled" ? addressesResult.value || [] : [];
        const methods = paymentMethodsResult.status === "fulfilled" ? paymentMethodsResult.value || [] : [];
        const defaultPhone = settings?.profile?.phone || userMetadataPhone;
        const defaultAddress = addresses.find((address) => address.isDefault || address.is_default) || addresses[0];
        const billingAddress = addresses.find((address) =>
          address.isDefaultBilling || address.is_default_billing || address.type === "billing",
        );

        if (!cancelled) {
          setPaymentMethods(methods);
          setForm((previous) => ({
            ...previous,
            phone: previous.phone || defaultPhone || "",
            name: previous.name || defaultAddress?.name || defaultAddress?.full_name || previous.name,
            address: previous.address || pickAddressLine(defaultAddress),
            city: previous.city || defaultAddress?.city || "",
            state: previous.state || pickState(defaultAddress),
            zip: previous.zip || pickPostalCode(defaultAddress),
            country: previous.country || normalizeCheckoutCountry(defaultAddress?.country),
            billingSameAsShipping: previous.billingSameAsShipping && !billingAddress,
            billingAddress: previous.billingAddress || pickAddressLine(billingAddress),
            billingCity: previous.billingCity || billingAddress?.city || "",
            billingState: previous.billingState || pickState(billingAddress),
            billingZip: previous.billingZip || pickPostalCode(billingAddress),
            billingCountry: previous.billingCountry || normalizeCheckoutCountry(billingAddress?.country),
            paymentMethodId: methods.find((method) => method.isDefault || method.is_default)?.id || methods[0]?.id || previous.paymentMethodId || "new",
          }));
        }
      })
      .catch(() => {
        const fallbackPhone = userMetadataPhone;
        if (!cancelled && fallbackPhone) {
          setForm((previous) => previous.phone
            ? previous
            : { ...previous, phone: fallbackPhone });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, userMetadataPhone]);

  useEffect(() => {
    if (form.country !== "Nigeria" || !form.state || !form.city) {
      setShippingOptions(SHIPPING_TIERS);
      return;
    }

    let cancelled = false;
    OrderAPI.getDeliveryFeeOptions({
      country: form.country,
      state: form.state,
      city: form.city,
    })
      .then((result) => {
        if (cancelled) return;
        const options = Array.isArray(result?.options) && result.options.length
          ? result.options
          : SHIPPING_TIERS;
        setShippingOptions(options);
        if (!options.some((option) => option.id === selectedShipping)) {
          setSelectedShipping(options[0]?.id || "standard");
        }
      })
      .catch(() => {
        if (!cancelled) setShippingOptions(SHIPPING_TIERS);
      });

    return () => {
      cancelled = true;
    };
  }, [form.city, form.country, form.state, selectedShipping]);

  useEffect(() => {
    let cancelled = false;
    OrderAPI.getTaxOptions({ country: form.country || "Nigeria" })
      .then((rules) => {
        if (!cancelled) setTaxRules(Array.isArray(rules) ? rules : []);
      })
      .catch(() => {
        if (!cancelled) setTaxRules([]);
      });

    return () => {
      cancelled = true;
    };
  }, [form.country]);

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference || !user?.id) return;

    let cancelled = false;
    setSubmitting(true);
    setSubmitError("");

    OrderAPI.verifyPaystackPayment(reference)
      .then((result) => {
        if (cancelled) return;
        setOrderNumber(result?.orderNumber || result?.orderId || reference);
        setOrderTotal(calculateCheckoutTotals(cart, selectedShipping, coupon, shippingOptions, taxRules).total);
        setOrderedCartSnapshot([...cart]);
        setStep(1);
        clearCart();
        toast("Payment confirmed. Order placed successfully!", "success");
        setSearchParams({}, { replace: true });
      })
      .catch((error) => {
        if (!cancelled) {
          setSubmitError(error?.message || "Payment verification failed. Please contact support.");
        }
      })
      .finally(() => {
        if (!cancelled) setSubmitting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cart, clearCart, coupon, searchParams, selectedShipping, setSearchParams, shippingOptions, taxRules, user?.id]);

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

        const result = await OrderAPI.initializePaystackCheckout({
          cartId,
          couponCode: coupon?.code || null,
          shippingTier: selectedShipping,
          checkout: {
            delivery: {
              name: form.name,
              email: form.email,
              phone: form.phone,
              address: form.address,
              city: form.city,
              state: form.state,
              zip: form.zip,
              country: form.country,
            },
            billingSameAsShipping: form.billingSameAsShipping,
            billing: form.billingSameAsShipping ? null : {
              address: form.billingAddress,
              city: form.billingCity,
              state: form.billingState,
              zip: form.billingZip,
              country: form.billingCountry,
            },
            paymentMethodId: form.paymentMethodId,
            savePaymentMethod: Boolean(form.savePaymentMethod),
          },
        });

        if (!result?.authorizationUrl) {
          throw new Error("Paystack did not return an authorization URL.");
        }

        window.location.assign(result.authorizationUrl);
      } catch (error) {
        setSubmitError(
          error?.message || "Failed to place order. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [cart, cartId, coupon, form, selectedShipping, user?.id, validate],
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
                paymentMethods={paymentMethods}
                shippingOptions={shippingOptions}
                taxRules={taxRules}
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
