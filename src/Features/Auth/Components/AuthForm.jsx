import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Store,
  Phone,
  Check,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Building,
  Flag,
  Hash,
  AlignLeft,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, loginSchema, forgotSchema } from "../Schema/userSchema";
import FloatingInput from "./FloatingInput";
import FloatingSelect from "./FloatingSelect";
import EyeBtn from "./EyeBtn";
import GoogleIcon from "./GoogleIcon";

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

function getPasswordStrength(pass) {
  if (!pass) return 0;
  let score = 0;
  if (pass.length > 7) score++;
  if (pass.length > 10) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return Math.min(4, score);
}

function PasswordStrengthMeter({ password }) {
  const score = getPasswordStrength(password);
  const colors = ["#e5e7eb", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const width = password ? (score === 0 ? 20 : (score / 4) * 100) : 0;
  const color = password ? colors[Math.max(1, score)] : colors[0];

  return (
    <div style={{ marginTop: -5, marginBottom: 15 }}>
      <div
        style={{
          display: "flex",
          gap: 4,
          height: 4,
          borderRadius: 2,
          overflow: "hidden",
          background: "rgba(150,150,150,0.2)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%`, backgroundColor: color }}
          transition={{ duration: 0.3 }}
          style={{ height: "100%" }}
        />
      </div>
      <div
        style={{
          fontSize: 10,
          color: "rgba(150,150,150,0.8)",
          marginTop: 4,
          textAlign: "right",
          fontWeight: 600,
        }}
      >
        {password && score < 2 && "Weak"}
        {password && score === 2 && "Fair"}
        {password && score === 3 && "Good"}
        {password && score === 4 && "Strong"}
      </div>
    </div>
  );
}

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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: mode === "register" ? zodResolver(userSchema) : mode === "login" ? zodResolver(loginSchema) : zodResolver(forgotSchema),
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
      same_as_home: false,
      same_as_store: false,
      home_address: { street: "", city: "", state: "", zip_code: "", country: "Nigeria" },
      store_address: { street: "", city: "", state: "", zip_code: "", country: "Nigeria" },
    },
    mode: "onTouched",
  });

  const role = watch("role");
  const sameAsStore = watch("same_as_store");
  const watchPassword = watch("password");

  // Reset steps and form when mode changes
  useEffect(() => {
    setBuyerStep(1);
    setSellerStep(1);
    setShowPass(false);
    setShowConfirm(false);
    reset({
      role: role,
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
      same_as_home: false,
      same_as_store: false,
      home_address: { street: "", city: "", state: "", zip_code: "", country: "Nigeria" },
      store_address: { street: "", city: "", state: "", zip_code: "", country: "Nigeria" }
    });
  }, [mode, role, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    console.log("Form data:", data);
    await new Promise((r) => setTimeout(r, 1700));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2800);
  };

  const handleNextStep = async () => {
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
      } else if (role === "seller") {
        if (sellerStep === 1)
          fieldsToValidate = [
            "full_name",
            "username",
            "email",
            "password",
            "confirm_password",
          ];
        if (sellerStep === 2)
          fieldsToValidate = [
            "store_name",
            "store_type",
            "phone",
            "business_description",
          ];
        if (sellerStep === 3)
          fieldsToValidate = [
            "home_address.street",
            "home_address.city",
            "home_address.state",
            "home_address.country",
            "home_address.zip_code",
          ];
      }

      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;

      if (role === "buyer" && buyerStep === 1) setBuyerStep(2);
      else if (role === "seller" && sellerStep < 4) setSellerStep((s) => s + 1);
      else handleSubmit(onSubmit)();
    } else {
      // Login mode
      handleSubmit(onSubmit)();
    }
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
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 13,
                background: cta,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 6px 20px ${cta}44`,
              }}
            >
              <Sparkles size={20} color={ctaText} fill={ctaText} />
            </div>
            <span
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 24,
                fontWeight: 400,
                color: colors.text.primary,
                letterSpacing: "-0.035em",
              }}
            >
              Woosho
            </span>
          </div>
        )}

        <div style={{ marginBottom: 26, textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: isMobile ? 25 : 29,
              fontWeight: 400,
              lineHeight: 1.15,
              color: colors.text.primary,
              letterSpacing: "-0.035em",
              marginBottom: 7,
            }}
          >
            {mode === "login" ? "Welcome back." : mode === "register" ? "Create your account." : "Reset password."}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: colors.text.tertiary,
              fontWeight: 400,
              lineHeight: 1.55,
            }}
          >
            {mode === "login"
              ? "Sign in to continue to Woosho."
              : mode === "register"
                ? "Join millions of buyers and sellers."
                : "Enter your email to receive a reset link."}
          </p>
        </div>

        <AnimatePresence initial={false}>
          {mode !== "forgot" && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 22 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  display: "flex",
                  background: colors.surface.secondary,
                  borderRadius: 14,
                  padding: 5,
                  border: `1px solid ${colors.border.default}`,
                }}
              >
                {[
                  ["login", "Sign In"],
                  ["register", "Register"],
                ].map(([m, label]) => (
                  <button
                    key={m}
                    className="auth-tab"
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      border: "none",
                      borderRadius: 10,
                      background: mode === m ? cta : "transparent",
                      color: mode === m ? ctaText : colors.text.tertiary,
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.01em",
                      boxShadow: mode === m ? `0 4px 14px ${cta}44` : "none",
                      transition: "all 0.22s ease",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {mode !== "forgot" &&
            !(mode === "register" && role === "seller" && sellerStep > 1) &&
            !(mode === "register" && role === "buyer" && buyerStep > 1) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <button
                  className="google-btn"
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 14,
                    border: `1.5px solid ${colors.border.default}`,
                    background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    cursor: "pointer",
                    marginBottom: 18,
                    color: colors.text.primary,
                    fontSize: 14,
                    fontWeight: 600,
                    boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <GoogleIcon /> Continue with Google
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: colors.border.default,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: colors.text.tertiary,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    or
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: colors.border.default,
                    }}
                  />
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${role}-${mode === "register" ? (role === "buyer" ? buyerStep : sellerStep) : "login"}`}
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
                  : mode === "forgot" ? 20 : 0,
              y:
                mode === "register" &&
                (role === "buyer" ? buyerStep > 1 : sellerStep > 1)
                  ? 0
                  : -10,
            }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          >
            {mode === "register" &&
              ((role === "seller" && sellerStep === 1) ||
                (role === "buyer" && buyerStep === 1)) && (
                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: colors.text.tertiary,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    I want to
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      { val: "buyer", label: "Shop & Buy", Icon: ShoppingBag },
                      { val: "seller", label: "Sell Products", Icon: Store },
                    ].map(({ val, label, Icon }) => (
                      <div
                        key={val}
                        className="role-card"
                        onClick={() => setValue("role", val)}
                        style={{
                          flex: 1,
                          padding: "13px 12px",
                          borderRadius: 14,
                          border: `1.5px solid ${role === val ? cta : colors.border.default}`,
                          background:
                            role === val
                              ? isDark
                                ? `${cta}1a`
                                : `${cta}0e`
                              : isDark
                                ? "rgba(255,255,255,0.03)"
                                : colors.surface.secondary,
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          boxShadow:
                            role === val ? `0 0 0 3px ${cta}1e` : "none",
                          cursor: "pointer",
                        }}
                      >
                        <Icon
                          size={17}
                          color={role === val ? cta : colors.text.tertiary}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: role === val ? cta : colors.text.secondary,
                          }}
                        >
                          {label}
                        </span>
                        {role === val && (
                          <Check
                            size={12}
                            color={cta}
                            style={{ marginLeft: "auto" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {mode === "register" && role === "buyer" && buyerStep === 1 && (
              <>
                <Controller
                  name="full_name"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Full Name"
                      icon={User}
                      autoComplete="name"
                      colors={colors}
                      isDark={isDark}
                      error={errors.full_name?.message}
                    />
                  )}
                />
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Username"
                      icon={User}
                      autoComplete="username"
                      colors={colors}
                      isDark={isDark}
                      error={errors.username?.message}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Email Address"
                      icon={Mail}
                      autoComplete="email"
                      colors={colors}
                      isDark={isDark}
                      error={errors.email?.message}
                    />
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Password"
                      type={showPass ? "text" : "password"}
                      icon={Lock}
                      autoComplete="new-password"
                      colors={colors}
                      isDark={isDark}
                      error={errors.password?.message}
                      suffix={
                        <EyeBtn
                          show={showPass}
                          toggle={() => setShowPass((s) => !s)}
                          colors={colors}
                        />
                      }
                    />
                  )}
                />
                <Controller
                  name="confirm_password"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Confirm Password"
                      type={showConfirm ? "text" : "password"}
                      icon={Lock}
                      autoComplete="new-password"
                      colors={colors}
                      isDark={isDark}
                      error={errors.confirm_password?.message}
                      suffix={
                        <EyeBtn
                          show={showConfirm}
                          toggle={() => setShowConfirm((s) => !s)}
                          colors={colors}
                        />
                      }
                    />
                  )}
                />
                <PasswordStrengthMeter password={watchPassword} />
              </>
            )}

            {mode === "register" && role === "buyer" && buyerStep === 2 && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <button
                    onClick={() => setBuyerStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: colors.text.tertiary,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 12,
                      fontWeight: 700,
                      color: cta,
                    }}
                  >
                    Step 2 of 2
                  </span>
                </div>
                <Controller
                  name="home_address.street"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Street Address"
                      icon={MapPin}
                      autoComplete="street-address"
                      colors={colors}
                      isDark={isDark}
                      error={errors.home_address?.street?.message}
                    />
                  )}
                />
                <Controller
                  name="home_address.city"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="City"
                      icon={Building}
                      autoComplete="address-level2"
                      colors={colors}
                      isDark={isDark}
                      error={errors.home_address?.city?.message}
                    />
                  )}
                />
                <Controller
                  name="home_address.state"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="State / Province"
                      icon={MapPin}
                      autoComplete="address-level1"
                      colors={colors}
                      isDark={isDark}
                      error={errors.home_address?.state?.message}
                    />
                  )}
                />
                <Controller
                  name="home_address.country"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Country"
                      icon={Flag}
                      autoComplete="country-name"
                      colors={colors}
                      isDark={isDark}
                      error={errors.home_address?.country?.message}
                    />
                  )}
                />
                <Controller
                  name="home_address.zip_code"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Zip / Postal Code"
                      icon={Hash}
                      autoComplete="postal-code"
                      colors={colors}
                      isDark={isDark}
                      error={errors.home_address?.zip_code?.message}
                    />
                  )}
                />
              </>
            )}

            {mode === "register" && role === "seller" && sellerStep === 1 && (
              <>
                <Controller
                  name="full_name"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Your Full Name"
                      icon={User}
                      autoComplete="name"
                      colors={colors}
                      isDark={isDark}
                      error={errors.full_name?.message}
                    />
                  )}
                />
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Username"
                      icon={User}
                      autoComplete="username"
                      colors={colors}
                      isDark={isDark}
                      error={errors.username?.message}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Business Email"
                      icon={Mail}
                      autoComplete="email"
                      colors={colors}
                      isDark={isDark}
                      error={errors.email?.message}
                    />
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Password"
                      type={showPass ? "text" : "password"}
                      icon={Lock}
                      autoComplete="new-password"
                      colors={colors}
                      isDark={isDark}
                      error={errors.password?.message}
                      suffix={
                        <EyeBtn
                          show={showPass}
                          toggle={() => setShowPass((s) => !s)}
                          colors={colors}
                        />
                      }
                    />
                  )}
                />
                <Controller
                  name="confirm_password"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Confirm Password"
                      type={showConfirm ? "text" : "password"}
                      icon={Lock}
                      autoComplete="new-password"
                      colors={colors}
                      isDark={isDark}
                      error={errors.confirm_password?.message}
                      suffix={
                        <EyeBtn
                          show={showConfirm}
                          toggle={() => setShowConfirm((s) => !s)}
                          colors={colors}
                        />
                      }
                    />
                  )}
                />
                <PasswordStrengthMeter password={watchPassword} />
              </>
            )}

            {mode === "register" && role === "seller" && sellerStep === 2 && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <button
                    onClick={() => setSellerStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: colors.text.tertiary,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 12,
                      fontWeight: 700,
                      color: cta,
                    }}
                  >
                    Step 2 of 4
                  </span>
                </div>
                <Controller
                  name="store_name"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Store / Business Name"
                      icon={Store}
                      autoComplete="organization"
                      colors={colors}
                      isDark={isDark}
                      error={errors.store_name?.message}
                    />
                  )}
                />
                <Controller
                  name="store_type"
                  control={control}
                  render={({ field }) => (
                    <FloatingSelect
                      {...field}
                      label="Business Category"
                      options={CATEGORIES}
                      colors={colors}
                      isDark={isDark}
                      error={errors.store_type?.message}
                    />
                  )}
                />
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Phone Number (WhatsApp)"
                      icon={Phone}
                      type="tel"
                      autoComplete="tel"
                      colors={colors}
                      isDark={isDark}
                      error={errors.phone?.message}
                    />
                  )}
                />
                <Controller
                  name="business_description"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Business Description"
                      icon={AlignLeft}
                      colors={colors}
                      isDark={isDark}
                      error={errors.business_description?.message}
                    />
                  )}
                />
              </>
            )}

            {mode === "register" && role === "seller" && sellerStep === 3 && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <button
                    onClick={() => setSellerStep(2)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: colors.text.tertiary,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 12,
                      fontWeight: 700,
                      color: cta,
                    }}
                  >
                    Step 3 of 4
                  </span>
                </div>
                <Controller
                  name="home_address.street"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Home Street Address"
                      icon={MapPin}
                      autoComplete="street-address"
                      colors={colors}
                      isDark={isDark}
                      error={errors.home_address?.street?.message}
                    />
                  )}
                />
                <Controller
                  name="home_address.city"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="City"
                      icon={Building}
                      autoComplete="address-level2"
                      colors={colors}
                      isDark={isDark}
                      error={errors.home_address?.city?.message}
                    />
                  )}
                />
                <Controller
                  name="home_address.state"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="State / Province"
                      icon={MapPin}
                      autoComplete="address-level1"
                      colors={colors}
                      isDark={isDark}
                      error={errors.home_address?.state?.message}
                    />
                  )}
                />
                <Controller
                  name="home_address.country"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Country"
                      icon={Flag}
                      autoComplete="country-name"
                      colors={colors}
                      isDark={isDark}
                      error={errors.home_address?.country?.message}
                    />
                  )}
                />
                <Controller
                  name="home_address.zip_code"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Zip / Postal Code"
                      icon={Hash}
                      autoComplete="postal-code"
                      colors={colors}
                      isDark={isDark}
                      error={errors.home_address?.zip_code?.message}
                    />
                  )}
                />
              </>
            )}

            {mode === "register" && role === "seller" && sellerStep === 4 && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <button
                    onClick={() => setSellerStep(3)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: colors.text.tertiary,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 12,
                      fontWeight: 700,
                      color: cta,
                    }}
                  >
                    Step 4 of 4
                  </span>
                </div>

                <button
                  onClick={() =>
                    setValue("same_as_store", !sameAsStore, {
                      shouldValidate: true,
                    })
                  }
                  style={{
                    width: "100%",
                    marginBottom: 16,
                    padding: "12px",
                    borderRadius: 14,
                    background: sameAsStore
                      ? isDark
                        ? `${cta}1a`
                        : `${cta}0e`
                      : "transparent",
                    border: `1.5px solid ${sameAsStore ? cta : colors.border.default}`,
                    color: sameAsStore ? cta : colors.text.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `1.5px solid ${sameAsStore ? cta : colors.border.default}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: sameAsStore ? cta : "transparent",
                    }}
                  >
                    {sameAsStore && <Check size={12} color="#fff" />}
                  </div>
                  Use my Home Address for Store Address
                </button>

                {!sameAsStore && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Controller
                      name="store_address.street"
                      control={control}
                      render={({ field }) => (
                        <FloatingInput
                          {...field}
                          label="Store Street Address"
                          icon={MapPin}
                          autoComplete="street-address"
                          colors={colors}
                          isDark={isDark}
                          error={errors.store_address?.street?.message}
                        />
                      )}
                    />
                    <Controller
                      name="store_address.city"
                      control={control}
                      render={({ field }) => (
                        <FloatingInput
                          {...field}
                          label="City"
                          icon={Building}
                          autoComplete="address-level2"
                          colors={colors}
                          isDark={isDark}
                          error={errors.store_address?.city?.message}
                        />
                      )}
                    />
                    <Controller
                      name="store_address.state"
                      control={control}
                      render={({ field }) => (
                        <FloatingInput
                          {...field}
                          label="State / Province"
                          icon={MapPin}
                          autoComplete="address-level1"
                          colors={colors}
                          isDark={isDark}
                          error={errors.store_address?.state?.message}
                        />
                      )}
                    />
                    <Controller
                      name="store_address.country"
                      control={control}
                      render={({ field }) => (
                        <FloatingInput
                          {...field}
                          label="Country"
                          icon={Flag}
                          autoComplete="country-name"
                          colors={colors}
                          isDark={isDark}
                          error={errors.store_address?.country?.message}
                        />
                      )}
                    />
                    <Controller
                      name="store_address.zip_code"
                      control={control}
                      render={({ field }) => (
                        <FloatingInput
                          {...field}
                          label="Zip / Postal Code"
                          icon={Hash}
                          autoComplete="postal-code"
                          colors={colors}
                          isDark={isDark}
                          error={errors.store_address?.zip_code?.message}
                        />
                      )}
                    />
                  </motion.div>
                )}
              </>
            )}

            {mode === "login" && (
              <>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Email Address"
                      icon={Mail}
                      autoComplete="email"
                      colors={colors}
                      isDark={isDark}
                      error={errors.email?.message}
                    />
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Password"
                      type={showPass ? "text" : "password"}
                      icon={Lock}
                      autoComplete="current-password"
                      colors={colors}
                      isDark={isDark}
                      error={errors.password?.message}
                      suffix={
                        <EyeBtn
                          show={showPass}
                          toggle={() => setShowPass((s) => !s)}
                          colors={colors}
                        />
                      }
                    />
                  )}
                />
                <div
                  style={{
                    textAlign: "right",
                    marginTop: -2,
                    marginBottom: 18,
                  }}
                >
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => setMode("forgot")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      color: cta,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}
            {mode === "forgot" && (
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <FloatingInput
                    {...field}
                    label="Email Address"
                    icon={Mail}
                    autoComplete="email"
                    colors={colors}
                    isDark={isDark}
                    error={errors.email?.message}
                  />
                )}
              />
            )}

            <motion.button
              type="button"
              className="auth-cta"
              onClick={handleNextStep}
              disabled={loading}
              whileTap={{ scale: 0.975 }}
              style={{
                width: "100%",
                height: 54,
                borderRadius: 14,
                border: "none",
                background: success ? "#16a34a" : cta,
                color: success ? "#fff" : ctaText,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "-0.01em",
                cursor: loading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: success
                  ? "0 8px 24px rgba(22,163,74,0.38)"
                  : `0 8px 24px ${cta}44`,
                marginTop: mode === "login" ? 0 : 8,
                marginBottom: 18,
                transition: "background 0.28s ease, box-shadow 0.28s ease",
              }}
            >
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.span
                    key="ok"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Check size={18} />{" "}
                    {mode === "login" ? "Signed In!" : mode === "forgot" ? "Link Sent!" : "Account Created!"}
                  </motion.span>
                ) : loading ? (
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
                    {mode === "login" ? "Signing In…" : mode === "forgot" ? "Sending Link…" : "Creating Account…"}
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
                        {mode === "login" ? "Sign In" : mode === "forgot" ? "Send Reset Link" : "Create Account"}{" "}
                        <ArrowRight size={17} />
                      </>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

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
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: cta,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  <ChevronLeft size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Back to Sign In
                </button>
              ) : (
                <>
                  {mode === "login"
                    ? "Don't have an account? "
                    : "Already have one? "}
                  <button
                    type="button"
                    className="mode-link"
                    onClick={() =>
                      setMode((m) => (m === "login" ? "register" : "login"))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: cta,
                      fontWeight: 800,
                      fontSize: 13,
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
