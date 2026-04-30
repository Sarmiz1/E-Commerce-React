import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Store, Phone, Check, ShoppingBag, ArrowRight, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import FloatingInput from './FloatingInput';
import FloatingSelect from './FloatingSelect';
import EyeBtn from './EyeBtn';
import GoogleIcon from './GoogleIcon';

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
      <div style={{ display: "flex", gap: 4, height: 4, borderRadius: 2, overflow: "hidden", background: "rgba(150,150,150,0.2)" }}>
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${width}%`, backgroundColor: color }} 
          transition={{ duration: 0.3 }}
          style={{ height: "100%" }}
        />
      </div>
      <div style={{ fontSize: 10, color: "rgba(150,150,150,0.8)", marginTop: 4, textAlign: "right", fontWeight: 600 }}>
        {password && score < 2 && "Weak"}
        {password && score === 2 && "Fair"}
        {password && score === 3 && "Good"}
        {password && score === 4 && "Strong"}
      </div>
    </div>
  );
}

export default function AuthForm({ colors, isDark, cta, ctaText, isMobile, showBrand }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("buyer");
  const [sellerStep, setSellerStep] = useState(1); // 1 or 2
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Buyer fields
  const [name, setName] = useState("");

  // Seller fields
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");

  // Reset form when switching mode or role
  useEffect(() => {
    setEmail("");
    setPassword("");
    setConfirm("");
    setName("");
    setStoreName("");
    setOwnerName("");
    setPhone("");
    setCategory("");
    setShowPass(false);
    setShowConfirm(false);
    setSellerStep(1);
  }, [mode, role]);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1700));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2800);
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
        padding: isMobile ? "24px 18px 40px" : showBrand ? "40px 36px" : "48px 28px",
        overflowY: "auto",
        minHeight: "100vh",
      }}
    >
      <motion.div
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

        {/* Heading */}
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
            {mode === "login" ? "Welcome back." : "Create your account."}
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
              : "Join millions of buyers and sellers."}
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            background: colors.surface.secondary,
            borderRadius: 14,
            padding: 5,
            border: `1px solid ${colors.border.default}`,
            marginBottom: 22,
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

        {/* Google OAuth - Only show on login or step 1 */}
        {!(mode === "register" && role === "seller" && sellerStep === 2) && (
          <>
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
              <div style={{ flex: 1, height: 1, background: colors.border.default }} />
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
              <div style={{ flex: 1, height: 1, background: colors.border.default }} />
            </div>
          </>
        )}

        {/* ── DYNAMIC FORM FIELDS ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${role}-${sellerStep}`}
            initial={{ opacity: 0, x: mode === "register" && role === "seller" && sellerStep === 2 ? 20 : 0, y: mode === "register" && role === "seller" && sellerStep === 2 ? 0 : 14 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: mode === "register" && role === "seller" && sellerStep === 1 ? -20 : 0, y: mode === "register" && role === "seller" && sellerStep === 2 ? 0 : -10 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Role selector (register only, step 1) */}
            {mode === "register" && sellerStep === 1 && (
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
                      onClick={() => setRole(val)}
                      style={{
                        flex: 1,
                        padding: "13px 12px",
                        borderRadius: 14,
                        border: `1.5px solid ${role === val ? cta : colors.border.default}`,
                        background: role === val ? (isDark ? `${cta}1a` : `${cta}0e`) : (isDark ? "rgba(255,255,255,0.03)" : colors.surface.secondary),
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        boxShadow: role === val ? `0 0 0 3px ${cta}1e` : "none",
                      }}
                    >
                      <Icon size={17} color={role === val ? cta : colors.text.tertiary} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: role === val ? cta : colors.text.secondary }}>
                        {label}
                      </span>
                      {role === val && <Check size={12} color={cta} style={{ marginLeft: "auto" }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BUYER REGISTER SCHEMA */}
            {mode === "register" && role === "buyer" && (
              <>
                <FloatingInput label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" colors={colors} isDark={isDark} />
                <FloatingInput label="Email Address" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" colors={colors} isDark={isDark} />
                <FloatingInput label="Password" type={showPass ? "text" : "password"} icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" colors={colors} isDark={isDark} suffix={<EyeBtn show={showPass} toggle={() => setShowPass((s) => !s)} colors={colors} />} />
                <PasswordStrengthMeter password={password} />
              </>
            )}

            {/* SELLER REGISTER SCHEMA - STEP 1 (Auth Details) */}
            {mode === "register" && role === "seller" && sellerStep === 1 && (
              <>
                <FloatingInput label="Your Full Name" icon={User} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} autoComplete="name" colors={colors} isDark={isDark} />
                <FloatingInput label="Business Email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" colors={colors} isDark={isDark} />
                <FloatingInput label="Password" type={showPass ? "text" : "password"} icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" colors={colors} isDark={isDark} suffix={<EyeBtn show={showPass} toggle={() => setShowPass((s) => !s)} colors={colors} />} />
                <PasswordStrengthMeter password={password} />
              </>
            )}

            {/* SELLER REGISTER SCHEMA - STEP 2 (Store Details) */}
            {mode === "register" && role === "seller" && sellerStep === 2 && (
              <>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <button onClick={() => setSellerStep(1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: colors.text.tertiary, fontSize: 13, fontWeight: 600 }}>
                    <ChevronLeft size={16} /> Back
                  </button>
                  <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: cta }}>Step 2 of 2</span>
                </div>
                <FloatingInput label="Store / Business Name" icon={Store} value={storeName} onChange={(e) => setStoreName(e.target.value)} autoComplete="organization" colors={colors} isDark={isDark} />
                <FloatingSelect label="Business Category" value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} colors={colors} isDark={isDark} />
                <FloatingInput label="Phone Number (WhatsApp)" icon={Phone} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" colors={colors} isDark={isDark} />
              </>
            )}

            {/* LOGIN SCHEMA */}
            {mode === "login" && (
              <>
                <FloatingInput label="Email Address" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" colors={colors} isDark={isDark} />
                <FloatingInput label="Password" type={showPass ? "text" : "password"} icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" colors={colors} isDark={isDark} suffix={<EyeBtn show={showPass} toggle={() => setShowPass((s) => !s)} colors={colors} />} />
                <div style={{ textAlign: "right", marginTop: -2, marginBottom: 18 }}>
                  <button className="forgot-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: cta }}>
                    Forgot password?
                  </button>
                </div>
              </>
            )}

            {/* CTA BUTTON */}
            <motion.button
              className="auth-cta"
              onClick={() => {
                if (mode === "register" && role === "seller" && sellerStep === 1) {
                  setSellerStep(2);
                } else {
                  handleSubmit();
                }
              }}
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
                boxShadow: success ? "0 8px 24px rgba(22,163,74,0.38)" : `0 8px 24px ${cta}44`,
                marginTop: mode === "login" ? 0 : 8,
                marginBottom: 18,
                transition: "background 0.28s ease, box-shadow 0.28s ease",
              }}
            >
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.span key="ok" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Check size={18} />
                    {mode === "login" ? "Signed In!" : "Account Created!"}
                  </motion.span>
                ) : loading ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2.5px solid ${ctaText}40`, borderTopColor: ctaText, animation: "auth-spin 0.72s linear infinite" }} />
                    {mode === "login" ? "Signing In…" : "Creating Account…"}
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {mode === "register" && role === "seller" && sellerStep === 1 ? (
                      <>Continue to Store Details <ChevronRight size={17} /></>
                    ) : (
                      <>{mode === "login" ? "Sign In" : "Create Account"} <ArrowRight size={17} /></>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Terms */}
            {mode === "register" && (
              <p style={{ fontSize: 11, color: colors.text.tertiary, textAlign: "center", lineHeight: 1.68, fontWeight: 400, marginBottom: 10 }}>
                By registering you agree to Woosho's <span style={{ color: cta, fontWeight: 700, cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: cta, fontWeight: 700, cursor: "pointer" }}>Privacy Policy</span>.
              </p>
            )}

            {/* Toggle mode link */}
            <p style={{ textAlign: "center", fontSize: 13, color: colors.text.tertiary, fontWeight: 400 }}>
              {mode === "login" ? "Don't have an account? " : "Already have one? "}
              <button
                className="mode-link"
                onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
                style={{ background: "none", border: "none", cursor: "pointer", color: cta, fontWeight: 800, fontSize: 13 }}
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
