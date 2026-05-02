import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, loginSchema, forgotSchema } from "../Schema/userSchema";

// Components
import RoleSelector from "./RoleSelector";
import AuthTabs from "./AuthTabs";
import SocialAuth from "./SocialAuth";
import FormHeader from "./FormHeader";
import LoginForm from "./LoginForm";
import ForgotForm from "./ForgotForm";
import BuyerWizard from "./BuyerWizard";
import SellerWizard from "./SellerWizard";
import glassLogo from "../../../assets/logos/glass_logo.png";
import logoDark from "../../../assets/logos/logo-darkmode.png";

const CATEGORIES = [
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "fashion", label: "Fashion & Clothing" },
  { value: "home", label: "Home & Living" },
  { value: "beauty", label: "Beauty & Health" },
  { value: "food", label: "Food & Beverages" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "auto", label: "Auto Parts & Accessories" },
  { value: "books", label: "Books & Stationery" },
  { value: "other", label: "Other" },
];

// ✅ Friendly error messages for common Supabase errors
const getFriendlyError = (message) => {
  if (!message) return "Something went wrong. Please try again.";

  if (
    message.includes("Email already registered") ||
    message.includes("User already registered")
  )
    return "An account with this email already exists. Please sign in instead.";

  if (message.includes("Invalid login credentials"))
    return "Incorrect email or password. Please try again.";

  if (message.includes("Email not confirmed"))
    return "Please verify your email before signing in.";

  if (message.includes("Password should be at least"))
    return "Password must be at least 6 characters long.";

  if (message.includes("Unable to validate email address"))
    return "Please enter a valid email address.";

  if (
    message.includes(
      "For security purposes, you can only request this after",
    )
  )
    return "Please wait a moment before requesting another reset link.";

  if (message.includes("User not found"))
    return "No account found with this email address.";

  return message;
};

export default function AuthForm({
  colors,
  isDark,
  cta,
  ctaText,
  isMobile,
  showBrand,
}) {
  const [mode, setMode] = useState("login");
  const [buyerStep, setBuyerStep] = useState(1);
  const [sellerStep, setSellerStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      mode === "register"
        ? userSchema
        : mode === "login"
          ? loginSchema
          : forgotSchema,
    ),
    defaultValues: {
      role: "buyer",
      email: "",
      password: "",
      confirm_password: "",
      full_name: "",
      username: "",
      store_name: "",
      store_type: "electronics",
      phone: "",
      business_description: "",
      agree_to_terms: true,
      same_as_home: true,
      same_as_store: false,
      home_address: {
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "Nigeria",
      },
      store_address: {
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "Nigeria",
      },
    },
    mode: "onTouched",
  });

  const role = watch("role");
  const watchPassword = watch("password");
  const sameAsStore = watch("same_as_store");

  const authMutation = useMutation({
    mutationFn: async (formData) => {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw new Error(getFriendlyError(error.message));

        return { message: "Signed in successfully." };
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          formData.email,
        );

        if (error) throw new Error(getFriendlyError(error.message));

        return { message: "Password reset link sent. Please check your email." };
      }

      // ✅ Build addresses BEFORE signUp so they can be passed to the trigger
      const homeAddress = {
        address_type: "home",
        full_name: formData.full_name,
        phone: formData.phone || null,
        line1: formData.home_address.street,
        line2: null,
        city: formData.home_address.city,
        state: formData.home_address.state,
        postal_code: formData.home_address.zip_code,
        country: formData.home_address.country || "NG",
        is_default_shipping: true,
        is_default_billing: true,
      };

      const addressesToInsert = [homeAddress];

      if (formData.role === "seller") {
        addressesToInsert.push({
          address_type: "store",
          full_name: formData.full_name,
          phone: formData.phone || null,
          line1: formData.same_as_store
            ? formData.home_address.street
            : formData.store_address.street,
          line2: null,
          city: formData.same_as_store
            ? formData.home_address.city
            : formData.store_address.city,
          state: formData.same_as_store
            ? formData.home_address.state
            : formData.store_address.state,
          postal_code: formData.same_as_store
            ? formData.home_address.zip_code
            : formData.store_address.zip_code,
          country: formData.same_as_store
            ? formData.home_address.country || "NG"
            : formData.store_address.country || "NG",
          is_default_shipping: false,
          is_default_billing: false,
        });
      }

      // ✅ Single signUp call — addresses passed via options.data for the trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            username: formData.username,
            role: formData.role,
            store_type:
              formData.role === "seller"
                ? formData.store_type
                : "independent",
            addresses: addressesToInsert,
          },
        },
      });

      if (authError) throw new Error(getFriendlyError(authError.message));

      // ✅ Supabase fakes success when email already exists — catch it here
      if (authData?.user?.identities?.length === 0) {
        throw new Error(
          "An account with this email already exists. Please sign in instead.",
        );
      }

      const userId = authData?.user?.id;

      if (!userId) {
        throw new Error("Account created, but user ID was not returned.");
      }

      // ✅ seller_profiles inserted directly — no FK timing issue here
      if (formData.role === "seller") {
        const { error: sellerError } = await supabase
          .from("seller_profiles")
          .insert({
            user_id: userId,
            store_name: formData.store_name,
            description: formData.business_description,
          });

        if (sellerError) {
          throw new Error(getFriendlyError(sellerError.message));
        }
      }

      return {
        message:
          "Account created successfully. Please check your email to verify your account.",
      };
    },

    onMutate: () => {
      setFormError("");
    },

    onError: (error) => {
      setFormError(error.message || "Something went wrong.");
    },
  });

  const isBusy = authMutation.isPending;
  const isSuccess = authMutation.isSuccess;

  const roleRef = useRef(role);
  roleRef.current = role;

  useEffect(() => {
    setBuyerStep(1);
    setSellerStep(1);
    setShowPass(false);
    setShowConfirm(false);
    setFormError("");
    authMutation.reset();

    reset({
      role: roleRef.current,
      email: "",
      password: "",
      confirm_password: "",
      full_name: "",
      username: "",
      store_name: "",
      store_type: "electronics",
      phone: "",
      business_description: "",
      agree_to_terms: true,
      same_as_home: true,
      same_as_store: false,
      home_address: {
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "Nigeria",
      },
      store_address: {
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "Nigeria",
      },
    });
  }, [mode, reset]);

  useEffect(() => {
    setBuyerStep(1);
    setSellerStep(1);
    setFormError("");
  }, [role]);

  // ✅ After success, redirect to login after 2s — mode change triggers reset above
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      setMode("login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSuccess]);

  const submitForm = handleSubmit(
    async (formData) => {
      try {
        setFormError("");
        await authMutation.mutateAsync(formData);
      } catch {
        // TanStack onError already handles the message.
      }
    },
    (validationErrors) => {
      console.warn("[AuthForm] Validation failed:", validationErrors);

      const firstError = Object.values(validationErrors)[0];

      const message =
        firstError?.message ||
        firstError?.root?.message ||
        Object.values(firstError || {})[0]?.message ||
        "Please fix the highlighted fields.";

      setFormError(message);
    },
  );

  const handleNextStep = async () => {
    if (isBusy) return;

    if (mode === "register") {
      let fieldsToValidate = [];

      if (role === "buyer" && buyerStep === 1) {
        fieldsToValidate = [
          "full_name",
          "username",
          "email",
          "password",
          "confirm_password",
        ];
      }

      // ✅ Fixed: buyer step 2 address validation was missing
      if (role === "buyer" && buyerStep === 2) {
        fieldsToValidate = [
          "home_address.street",
          "home_address.city",
          "home_address.state",
          "home_address.zip_code",
          "home_address.country",
        ];
      }

      if (role === "seller") {
        if (sellerStep === 1) {
          fieldsToValidate = [
            "full_name",
            "username",
            "email",
            "password",
            "confirm_password",
          ];
        }

        if (sellerStep === 2) {
          fieldsToValidate = [
            "store_name",
            "store_type",
            "phone",
            "business_description",
          ];
        }

        if (sellerStep === 3) {
          fieldsToValidate = [
            "home_address.street",
            "home_address.city",
            "home_address.state",
            "home_address.country",
            "home_address.zip_code",
          ];
        }

        if (sellerStep === 4 && !sameAsStore) {
          fieldsToValidate = [
            "store_address.street",
            "store_address.city",
            "store_address.state",
            "store_address.country",
            "store_address.zip_code",
          ];
        }
      }

      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;

      if (role === "buyer" && buyerStep === 1) {
        setBuyerStep(2);
        return;
      }

      if (role === "seller" && sellerStep < 4) {
        setSellerStep((step) => step + 1);
        return;
      }

      await submitForm();
      return;
    }

    await submitForm();
  };

  return (
    <motion.div
      className="woo-form-scroll"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile
          ? "24px 18px 40px"
          : showBrand
            ? "40px 36px"
            : "48px 28px",
        overflowY: "auto",
        minHeight: "100vh",
      }}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: isMobile ? "100%" : 420 }}
      >
        {!showBrand && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <img
              src={!isDark ? logoDark : glassLogo}
              alt="Woosho Logo"
              style={{ height: 85, objectFit: "contain" }}
            />
          </div>
        )}

        <FormHeader mode={mode} colors={colors} isMobile={isMobile} />

        <AuthTabs
          mode={mode}
          setMode={setMode}
          colors={colors}
          cta={cta}
          ctaText={ctaText}
        />

        <SocialAuth
          mode={mode}
          role={role}
          buyerStep={buyerStep}
          sellerStep={sellerStep}
          colors={colors}
          isDark={isDark}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${role}-${
              mode === "register"
                ? role === "buyer"
                  ? buyerStep
                  : sellerStep
                : "login"
            }`}
            initial={{
              opacity: 0,
              x:
                mode === "register" &&
                (role === "buyer" ? buyerStep > 1 : sellerStep > 1)
                  ? 20
                  : 0,
              y:
                mode === "register" &&
                (role === "buyer" ? buyerStep > 1 : sellerStep > 1)
                  ? 0
                  : 14,
            }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{
              opacity: 0,
              x:
                mode === "register" &&
                (role === "buyer" ? buyerStep === 1 : sellerStep === 1)
                  ? -20
                  : mode === "forgot"
                    ? 20
                    : 0,
              y:
                mode === "register" &&
                (role === "buyer" ? buyerStep > 1 : sellerStep > 1)
                  ? 0
                  : -10,
            }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          >
            {mode === "register" && (
              <>
                {((role === "seller" && sellerStep === 1) ||
                  (role === "buyer" && buyerStep === 1)) && (
                  <RoleSelector
                    role={role}
                    setValue={setValue}
                    colors={colors}
                    isDark={isDark}
                    cta={cta}
                  />
                )}

                {role === "buyer" ? (
                  <BuyerWizard
                    buyerStep={buyerStep}
                    setBuyerStep={setBuyerStep}
                    control={control}
                    errors={errors}
                    showPass={showPass}
                    setShowPass={setShowPass}
                    showConfirm={showConfirm}
                    setShowConfirm={setShowConfirm}
                    watchPassword={watchPassword}
                    colors={colors}
                    isDark={isDark}
                    cta={cta}
                  />
                ) : (
                  <SellerWizard
                    sellerStep={sellerStep}
                    setSellerStep={setSellerStep}
                    control={control}
                    errors={errors}
                    showPass={showPass}
                    setShowPass={setShowPass}
                    showConfirm={showConfirm}
                    setShowConfirm={setShowConfirm}
                    watchPassword={watchPassword}
                    colors={colors}
                    isDark={isDark}
                    cta={cta}
                    CATEGORIES={CATEGORIES}
                  />
                )}
              </>
            )}

            {mode === "login" && (
              <LoginForm
                control={control}
                errors={errors}
                showPass={showPass}
                setShowPass={setShowPass}
                colors={colors}
                isDark={isDark}
                setMode={setMode}
                cta={cta}
              />
            )}

            {mode === "forgot" && (
              <ForgotForm
                control={control}
                errors={errors}
                colors={colors}
                isDark={isDark}
              />
            )}

            <motion.button
              type="button"
              className="auth-cta"
              onClick={handleNextStep}
              disabled={isBusy}
              whileTap={{ scale: isBusy ? 1 : 0.975 }}
              style={{
                width: "100%",
                height: 54,
                borderRadius: 14,
                border: "none",
                background: isSuccess ? "#16a34a" : cta,
                color: isSuccess ? "#fff" : ctaText,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "-0.01em",
                cursor: isBusy ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: isSuccess
                  ? "0 8px 24px rgba(22,163,74,0.38)"
                  : `0 8px 24px ${cta}44`,
                marginTop: mode === "login" ? 0 : 8,
                marginBottom: 18,
                transition: "background 0.28s ease, box-shadow 0.28s ease",
              }}
            >
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.span
                    key="ok"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Check size={18} />{" "}
                    {mode === "login"
                      ? "Signed In!"
                      : mode === "forgot"
                        ? "Link Sent!"
                        : "Account Created!"}
                  </motion.span>
                ) : isBusy ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: "flex", alignItems: "center", gap: 9 }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `2.5px solid ${ctaText}40`,
                        borderTopColor: ctaText,
                        animation: "auth-spin 0.72s linear infinite",
                      }}
                    />
                    {mode === "login"
                      ? "Signing In…"
                      : mode === "forgot"
                        ? "Sending Link…"
                        : "Creating Account…"}
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {mode === "register" &&
                    role === "buyer" &&
                    buyerStep === 1 ? (
                      <>
                        Continue to Address <ChevronRight size={17} />
                      </>
                    ) : mode === "register" &&
                      role === "seller" &&
                      sellerStep === 1 ? (
                      <>
                        Continue to Store Details <ChevronRight size={17} />
                      </>
                    ) : mode === "register" &&
                      role === "seller" &&
                      sellerStep === 2 ? (
                      <>
                        Continue to Home Address <ChevronRight size={17} />
                      </>
                    ) : mode === "register" &&
                      role === "seller" &&
                      sellerStep === 3 ? (
                      <>
                        Continue to Store Address <ChevronRight size={17} />
                      </>
                    ) : (
                      <>
                        {mode === "login"
                          ? "Sign In"
                          : mode === "forgot"
                            ? "Send Reset Link"
                            : "Create Account"}{" "}
                        <ArrowRight size={17} />
                      </>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {formError && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: 12,
                  textAlign: "center",
                  lineHeight: 1.5,
                  marginTop: -8,
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                {formError}
              </p>
            )}

            {authMutation.data?.message && isSuccess && (
              <p
                style={{
                  color: "#16a34a",
                  fontSize: 12,
                  textAlign: "center",
                  lineHeight: 1.5,
                  marginTop: -8,
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                {authMutation.data.message}
              </p>
            )}

            {mode === "register" && (
              <p
                style={{
                  fontSize: 11,
                  color: colors.text.tertiary,
                  textAlign: "center",
                  lineHeight: 1.68,
                  fontWeight: 400,
                  marginBottom: 10,
                }}
              >
                By registering you agree to Woosho's{" "}
                <span
                  style={{ color: cta, fontWeight: 700, cursor: "pointer" }}
                >
                  Terms of Service
                </span>{" "}
                and{" "}
                <span
                  style={{ color: cta, fontWeight: 700, cursor: "pointer" }}
                >
                  Privacy Policy
                </span>
                .
              </p>
            )}

            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: colors.text.tertiary,
                fontWeight: 400,
              }}
            >
              {mode === "forgot" ? (
                <button
                  type="button"
                  className="mode-link"
                  onClick={() => setMode("login")}
                  disabled={isBusy}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: isBusy ? "not-allowed" : "pointer",
                    color: cta,
                    fontWeight: 800,
                    fontSize: 13,
                    opacity: isBusy ? 0.6 : 1,
                  }}
                >
                  <ChevronLeft
                    size={14}
                    style={{ display: "inline", verticalAlign: "-2px" }}
                  />{" "}
                  Back to Sign In
                </button>
              ) : (
                <>
                  {mode === "login"
                    ? "Don't have an account? "
                    : "Already have one? "}
                  <button
                    type="button"
                    className="mode-link"
                    disabled={isBusy}
                    onClick={() =>
                      setMode((currentMode) =>
                        currentMode === "login" ? "register" : "login",
                      )
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: isBusy ? "not-allowed" : "pointer",
                      color: cta,
                      fontWeight: 800,
                      fontSize: 13,
                      opacity: isBusy ? 0.6 : 1,
                    }}
                  >
                    {mode === "login" ? "Sign Up" : "Sign In"}
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}