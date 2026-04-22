// AuthPage.jsx
// Woosho · Premium Authentication Page
// Animations: GSAP (entrance orchestration) + Framer Motion (micro-interactions)
// Theme: useTheme() — full light/dark support

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Mail,
  Lock,
  User,
  Check,
  ShoppingBag,
  Store,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { useTheme } from "../../Context/theme/ThemeContext";

// ─── Google SVG icon ──────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
    />
  </svg>
);

// ─── Animated floating orb background ────────────────────────────────────────
function BrandOrbs({ colors, isDark }) {
  const orbs = [
    { size: 320, x: "15%", y: "10%", delay: 0, dur: 8, opacity: 0.18 },
    { size: 200, x: "65%", y: "5%", delay: 1.2, dur: 11, opacity: 0.12 },
    { size: 260, x: "-5%", y: "55%", delay: 0.6, dur: 9, opacity: 0.15 },
    { size: 180, x: "70%", y: "65%", delay: 2, dur: 13, opacity: 0.1 },
    { size: 140, x: "40%", y: "80%", delay: 0.3, dur: 7, opacity: 0.13 },
    { size: 100, x: "55%", y: "30%", delay: 1.8, dur: 10, opacity: 0.09 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: isDark
              ? `radial-gradient(circle, ${colors.brand.electricBlue}55 0%, transparent 70%)`
              : `radial-gradient(circle, ${colors.cta.primary}33 0%, transparent 70%)`,
            opacity: orb.opacity,
            animation: `orbFloat${i} ${orb.dur}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            filter: "blur(1px)",
          }}
        />
      ))}
      {/* Grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: isDark ? 0.04 : 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// ─── Floating stat badge ──────────────────────────────────────────────────────
function StatBadge({ icon: Icon, value, label, colors, isDark, className }) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 18px",
        background: isDark
          ? "rgba(255,255,255,0.07)"
          : "rgba(255,255,255,0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: 16,
        border: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(255,255,255,0.8)",
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.3)"
          : "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,80,212,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={17} color={isDark ? "#90abff" : "#0050d4"} />
      </div>
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: isDark ? "#F5F6F7" : "#0E0E10",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            fontFamily: "'DM Serif Display', 'Georgia', serif",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: isDark ? "rgba(245,246,247,0.55)" : "rgba(14,14,16,0.55)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Floating input with animated label ──────────────────────────────────────
function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  colors,
  isDark,
  autoComplete,
  suffix,
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      {/* Label */}
      <label
        style={{
          position: "absolute",
          left: Icon ? 46 : 16,
          zIndex: 2,
          top: active ? 7 : "50%",
          transform: active ? "translateY(0)" : "translateY(-50%)",
          fontSize: active ? 10 : 14,
          fontWeight: active ? 700 : 500,
          color: focused
            ? colors.cta.primary
            : active
              ? colors.text.tertiary
              : colors.text.tertiary,
          letterSpacing: active ? "0.07em" : "-0.01em",
          textTransform: active ? "uppercase" : "none",
          transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {label}
      </label>

      {/* Left icon */}
      {Icon && (
        <div
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            transition: "color 0.2s",
            color: focused ? colors.cta.primary : colors.text.tertiary,
          }}
        >
          <Icon size={16} />
        </div>
      )}

      {/* Input */}
      <input
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: 58,
          borderRadius: 14,
          border: `1.5px solid ${focused ? colors.cta.primary : colors.border.default}`,
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : colors.surface.secondary,
          color: colors.text.primary,
          fontSize: 14,
          fontWeight: 500,
          paddingTop: active ? 18 : 0,
          paddingBottom: active ? 4 : 0,
          paddingLeft: Icon ? 46 : 16,
          paddingRight: suffix ? 44 : 16,
          outline: "none",
          transition: "all 0.22s ease",
          fontFamily: "inherit",
          boxShadow: focused ? `0 0 0 3px ${colors.cta.primary}22` : "none",
          boxSizing: "border-box",
        }}
      />

      {/* Right suffix (show/hide) */}
      {suffix && (
        <div
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          {suffix}
        </div>
      )}
    </div>
  );
}

// ─── Main AuthPage ────────────────────────────────────────────────────────────
export default function AuthNew() {
  const { colors, isDark, toggle } = useTheme();

  // Form mode: "login" | "register"
  const [mode, setMode] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "buyer",
  });

  // GSAP refs
  const brandRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const statsRef = useRef(null);
  const formPanelRef = useRef(null);

  // ── GSAP entrance animation on mount ──────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Brand panel — staggered reveal from left
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(brandRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
        .fromTo(
          logoRef.current,
          { opacity: 0, scale: 0.7, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.5)" },
          "-=0.2",
        )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" },
          { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 0.85 },
          "-=0.4",
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.5",
        )
        .fromTo(
          statsRef.current?.children || [],
          { opacity: 0, x: -24, y: 10 },
          { opacity: 1, x: 0, y: 0, duration: 0.55, stagger: 0.12 },
          "-=0.3",
        )
        // Form panel slides in from right
        .fromTo(
          formPanelRef.current,
          { opacity: 0, x: 60 },
          { opacity: 1, x: 0, duration: 0.85, ease: "power3.out" },
          "-=0.8",
        );
    });

    return () => ctx.revert();
  }, []);

  // ── Handle theme toggle with GSAP flash ──────────────────────────────────
  const handleToggle = () => {
    gsap.to("body", {
      opacity: 0.85,
      duration: 0.12,
      onComplete: () => {
        toggle();
        gsap.to("body", { opacity: 1, duration: 0.18 });
      },
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2400);
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  // ── CSS ───────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }

    ${[0, 1, 2, 3, 4, 5]
      .map(
        (i) => `
      @keyframes orbFloat${i} {
        0%,100% { transform: translate(0,0) scale(1); }
        33%      { transform: translate(${(i % 2 === 0 ? 1 : -1) * 18}px, ${-12 - i * 4}px) scale(1.04); }
        66%      { transform: translate(${(i % 2 === 0 ? -1 : 1) * 10}px, ${8 + i * 3}px) scale(0.97); }
      }
    `,
      )
      .join("")}

    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes checkPop {
      0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
      60%  { transform: scale(1.2) rotate(4deg);  opacity: 1; }
      100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes gradShift {
      0%,100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }

    .auth-input-wrap input::placeholder { color: transparent; }
    .auth-input-wrap input:focus { outline: none; }
    .tab-btn { transition: all 0.22s ease; }
    .tab-btn:hover { opacity: 0.8; }
    .role-card { transition: all 0.2s ease; cursor: pointer; }
    .role-card:hover { transform: translateY(-2px); }
    .submit-btn { transition: all 0.2s ease; }
    .submit-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
    .submit-btn:active:not(:disabled) { transform: translateY(0); }
    .google-btn { transition: all 0.2s ease; }
    .google-btn:hover { transform: translateY(-1px); }
    .theme-btn { transition: all 0.22s ease; }
    .theme-btn:hover { transform: rotate(20deg) scale(1.1); }

    ::-webkit-scrollbar { width: 0px; }
  `;

  const bg = isDark
    ? `linear-gradient(135deg, #0E0E10 0%, #131315 50%, #0E0E10 100%)`
    : `linear-gradient(135deg, #EEF2FF 0%, #F5F6F7 50%, #E8F0FE 100%)`;

  const brandBg = isDark
    ? `linear-gradient(145deg, #0d1929 0%, #0a0f1e 40%, #111827 100%)`
    : `linear-gradient(145deg, #0041ac 0%, #0050d4 50%, #1a65e8 100%)`;

  return (
    <>
      <style>{css}</style>

      {/* Full page wrapper */}
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: bg,
          display: "flex",
          alignItems: "stretch",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* ── THEME TOGGLE ─────────────────────────────────────────────── */}
        <button
          className="theme-btn"
          onClick={handleToggle}
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 100,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
            border: `1px solid ${colors.border.default}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
          }}
        >
          {isDark ? (
            <Sun size={18} color={colors.text.secondary} />
          ) : (
            <Moon size={18} color={colors.text.secondary} />
          )}
        </button>

        {/* ── LEFT · BRAND PANEL ───────────────────────────────────────── */}
        <div
          ref={brandRef}
          style={{
            width: "45%",
            minHeight: "100vh",
            background: brandBg,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 52px",
            // Hide on small screens
            ...(typeof window !== "undefined" && window.innerWidth < 900
              ? { display: "none" }
              : {}),
          }}
        >
          <BrandOrbs colors={colors} isDark={isDark} />

          {/* Grid lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage: isDark
                ? `linear-gradient(rgba(144,171,255,0.04) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(144,171,255,0.04) 1px, transparent 1px)`
                : `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Logo mark */}
          <div ref={logoRef} style={{ marginBottom: 40 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: isDark
                  ? "rgba(144,171,255,0.15)"
                  : "rgba(255,255,255,0.2)",
                backdropFilter: "blur(12px)",
                border: isDark
                  ? "1px solid rgba(144,171,255,0.25)"
                  : "1px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                boxShadow: isDark
                  ? "0 8px 32px rgba(0,0,0,0.5)"
                  : "0 8px 32px rgba(0,0,0,0.15)",
              }}
            >
              <Sparkles
                size={26}
                color={isDark ? "#90abff" : "#fff"}
                fill={isDark ? "#90abff" : "#fff"}
              />
            </div>

            {/* Wordmark */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isDark
                  ? "rgba(144,171,255,0.7)"
                  : "rgba(255,255,255,0.65)",
                marginBottom: 4,
              }}
            >
              Woosho Marketplace
            </div>
          </div>

          {/* Hero heading */}
          <div ref={titleRef} style={{ marginBottom: 20, overflow: "hidden" }}>
            <h1
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(36px, 3.8vw, 52px)",
                fontWeight: 400,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: isDark ? "#F5F6F7" : "#ffffff",
                marginBottom: 0,
              }}
            >
              Buy smarter.
              <br />
              <em
                style={{
                  fontStyle: "italic",
                  color: isDark ? "#90abff" : "rgba(255,255,255,0.85)",
                }}
              >
                Sell faster.
              </em>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            style={{
              fontSize: 15,
              fontWeight: 400,
              lineHeight: 1.7,
              color: isDark
                ? "rgba(245,246,247,0.55)"
                : "rgba(255,255,255,0.7)",
              maxWidth: 340,
              marginBottom: 44,
            }}
          >
            Nigeria's most trusted marketplace. Millions of products, thousands
            of verified sellers — all in one place.
          </p>

          {/* Stats */}
          <div
            ref={statsRef}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <StatBadge
              icon={Store}
              value="50k+"
              label="Active Sellers"
              colors={colors}
              isDark={isDark}
            />
            <StatBadge
              icon={ShoppingBag}
              value="2M+"
              label="Products Listed"
              colors={colors}
              isDark={isDark}
            />
            <StatBadge
              icon={TrendingUp}
              value="₦8B+"
              label="Monthly GMV"
              colors={colors}
              isDark={isDark}
            />
          </div>

          {/* Bottom trust badge */}
          <div
            style={{
              position: "absolute",
              bottom: 32,
              left: 52,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Shield
              size={13}
              color={
                isDark ? "rgba(144,171,255,0.5)" : "rgba(255,255,255,0.45)"
              }
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: isDark
                  ? "rgba(144,171,255,0.45)"
                  : "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
              }}
            >
              256-bit SSL · Verified Sellers · Buyer Protection
            </span>
          </div>
        </div>

        {/* ── RIGHT · FORM PANEL ───────────────────────────────────────── */}
        <div
          ref={formPanelRef}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 32px",
            overflowY: "auto",
          }}
        >
          <div style={{ width: "100%", maxWidth: 420 }}>
            {/* Mobile logo — only shows when brand panel is hidden */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 36,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: colors.cta.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles
                  size={18}
                  color={colors.cta.primaryText}
                  fill={colors.cta.primaryText}
                />
              </div>
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 22,
                  fontWeight: 400,
                  color: colors.text.primary,
                  letterSpacing: "-0.03em",
                }}
              >
                Woosho
              </span>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 30,
                  fontWeight: 400,
                  lineHeight: 1.15,
                  color: colors.text.primary,
                  letterSpacing: "-0.03em",
                  marginBottom: 8,
                }}
              >
                {mode === "login" ? "Welcome back." : "Create your account."}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: colors.text.tertiary,
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              >
                {mode === "login"
                  ? "Sign in to your Woosho account to continue."
                  : "Join thousands of buyers and sellers on Woosho."}
              </p>
            </div>

            {/* Tab switcher */}
            <div
              style={{
                display: "flex",
                gap: 0,
                background: colors.surface.secondary,
                borderRadius: 14,
                padding: 5,
                border: `1px solid ${colors.border.default}`,
                marginBottom: 28,
                position: "relative",
              }}
            >
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  className="tab-btn"
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    position: "relative",
                    background: mode === m ? colors.cta.primary : "transparent",
                    color:
                      mode === m
                        ? colors.cta.primaryText
                        : colors.text.tertiary,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    boxShadow:
                      mode === m
                        ? `0 4px 14px ${colors.cta.primary}40`
                        : "none",
                    transition: "all 0.24s ease",
                  }}
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            {/* Google OAuth */}
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
                marginBottom: 22,
                color: colors.text.primary,
                fontSize: 14,
                fontWeight: 600,
                boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 22,
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
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.text.tertiary,
                  letterSpacing: "0.08em",
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

            {/* Form fields (animated between login/register) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
                className="auth-input-wrap"
              >
                {/* Name field — register only */}
                {mode === "register" && (
                  <FloatingInput
                    label="Full Name"
                    icon={User}
                    autoComplete="name"
                    colors={colors}
                    isDark={isDark}
                    {...field("name")}
                  />
                )}

                {/* Email */}
                <FloatingInput
                  label="Email Address"
                  icon={Mail}
                  autoComplete="email"
                  colors={colors}
                  isDark={isDark}
                  {...field("email")}
                />

                {/* Password */}
                <FloatingInput
                  label="Password"
                  type={showPass ? "text" : "password"}
                  icon={Lock}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  colors={colors}
                  isDark={isDark}
                  {...field("password")}
                  suffix={
                    <button
                      onClick={() => setShowPass((s) => !s)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        color: colors.text.tertiary,
                      }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                {/* Confirm password — register only */}
                {mode === "register" && (
                  <FloatingInput
                    label="Confirm Password"
                    type={showConfirm ? "text" : "password"}
                    icon={Lock}
                    autoComplete="new-password"
                    colors={colors}
                    isDark={isDark}
                    {...field("confirm")}
                    suffix={
                      <button
                        onClick={() => setShowConfirm((s) => !s)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          color: colors.text.tertiary,
                        }}
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                )}

                {/* Role selector — register only */}
                {mode === "register" && (
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontSize: 11,
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
                        {
                          val: "buyer",
                          label: "Shop & Buy",
                          icon: ShoppingBag,
                        },
                        { val: "seller", label: "Sell Products", icon: Store },
                      ].map(({ val, label, icon: Icon }) => (
                        <div
                          key={val}
                          className="role-card"
                          onClick={() => setForm((f) => ({ ...f, role: val }))}
                          style={{
                            flex: 1,
                            padding: "14px 12px",
                            borderRadius: 14,
                            border: `1.5px solid ${
                              form.role === val
                                ? colors.cta.primary
                                : colors.border.default
                            }`,
                            background:
                              form.role === val
                                ? isDark
                                  ? `${colors.cta.primary}18`
                                  : `${colors.cta.primary}0d`
                                : isDark
                                  ? "rgba(255,255,255,0.03)"
                                  : colors.surface.secondary,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            boxShadow:
                              form.role === val
                                ? `0 0 0 3px ${colors.cta.primary}22`
                                : "none",
                          }}
                        >
                          <Icon
                            size={18}
                            color={
                              form.role === val
                                ? colors.cta.primary
                                : colors.text.tertiary
                            }
                          />
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color:
                                form.role === val
                                  ? colors.cta.primary
                                  : colors.text.secondary,
                            }}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Forgot password */}
                {mode === "login" && (
                  <div
                    style={{
                      textAlign: "right",
                      marginBottom: 20,
                      marginTop: -6,
                    }}
                  >
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.cta.primary,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <motion.button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%",
                    height: 54,
                    borderRadius: 14,
                    border: "none",
                    background: success
                      ? "#16a34a"
                      : `linear-gradient(135deg, ${colors.cta.primary} 0%, ${
                          isDark ? "#6b8eff" : "#0041ac"
                        } 100%)`,
                    backgroundSize: "200% 200%",
                    animation: loading
                      ? "gradShift 1.5s ease infinite"
                      : "none",
                    color: success ? "#fff" : colors.cta.primaryText,
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: loading ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    letterSpacing: "-0.01em",
                    boxShadow: success
                      ? "0 8px 24px rgba(22,163,74,0.4)"
                      : `0 8px 24px ${colors.cta.primary}55`,
                    marginBottom: 20,
                    transition: "background 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Check size={18} />
                        {mode === "login" ? "Signed In!" : "Account Created!"}
                      </motion.span>
                    ) : loading ? (
                      <motion.span
                        key="load"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${colors.cta.primaryText}44`,
                            borderTopColor: colors.cta.primaryText,
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        {mode === "login" ? "Signing In…" : "Creating Account…"}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {mode === "login" ? "Sign In" : "Create Account"}
                        <ArrowRight size={17} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Terms — register only */}
                {mode === "register" && (
                  <p
                    style={{
                      fontSize: 11,
                      color: colors.text.tertiary,
                      textAlign: "center",
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    By creating an account you agree to Woosho's{" "}
                    <span
                      style={{
                        color: colors.cta.primary,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span
                      style={{
                        color: colors.cta.primary,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Privacy Policy
                    </span>
                    .
                  </p>
                )}

                {/* Toggle mode link */}
                <p
                  style={{
                    textAlign: "center",
                    marginTop: 18,
                    fontSize: 13,
                    color: colors.text.tertiary,
                    fontWeight: 500,
                  }}
                >
                  {mode === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={() =>
                      setMode((m) => (m === "login" ? "register" : "login"))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: colors.cta.primary,
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {mode === "login" ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
