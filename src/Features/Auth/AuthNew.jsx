// AuthPage.jsx — Woosho Marketplace · Premium Auth Page
// Photo BG · GSAP entrance · Framer Motion micro-interactions
// Buyer / Seller split schema · ThemeContext light+dark · Fully responsive

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  Eye, EyeOff, ArrowRight, Sparkles, Sun, Moon,
  Mail, Lock, User, Check, ShoppingBag, Store,
  TrendingUp, Shield, Phone, ChevronDown,
} from "lucide-react";
import { useTheme } from "../../Context/theme/ThemeContext";

// ─── IMPORTANT: Copy the uploaded image to your project assets ───────────────
// Place it at: src/assets/marketing/woosho-hero.jpg  (or .png)
// Then update this import path accordingly.
import heroImage from "../../assets/marketing/mktimg2.png";

// ─── Reactive window-size hook (no flicker on resize) ────────────────────────
function useWindowSize() {
  const [size, setSize] = useState({
    width:  typeof window !== "undefined" ? window.innerWidth  : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  useEffect(() => {
    let raf;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setSize({ width: window.innerWidth, height: window.innerHeight })
      );
    };
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
      cancelAnimationFrame(raf);
    };
  }, []);
  return size;
}

// ─── Google Icon ─────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

// ─── Stat Badge (always sits on photo — uses strong glass) ───────────────────
function StatBadge({ icon: Icon, value, label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 16px",
      background: "rgba(10, 14, 26, 0.52)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.14)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: "rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={16} color="rgba(255,255,255,0.88)" />
      </div>
      <div>
        <div style={{
          fontSize: 15, fontWeight: 800, color: "#ffffff",
          letterSpacing: "-0.03em", lineHeight: 1.1,
          fontFamily: "'DM Serif Display', Georgia, serif",
          textShadow: "0 1px 8px rgba(0,0,0,0.5)",
        }}>{value}</div>
        <div style={{
          fontSize: 10, fontWeight: 600,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: "0.07em",
          textTransform: "uppercase", marginTop: 1,
        }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Floating label input ────────────────────────────────────────────────────
function FloatingInput({ label, type = "text", value, onChange, icon: Icon,
  colors, isDark, autoComplete, suffix }) {
  const [focused, setFocused] = useState(false);
  const active = focused || (value && value.length > 0);

  return (
    <div style={{ position: "relative", marginBottom: 13 }}>
      {/* Floating label */}
      <label style={{
        position: "absolute",
        left: Icon ? 46 : 16, zIndex: 2,
        top: active ? 8 : "50%",
        transform: active ? "translateY(0)" : "translateY(-50%)",
        fontSize: active ? 9.5 : 13.5,
        fontWeight: active ? 700 : 400,
        color: focused ? colors.cta.primary : colors.text.tertiary,
        letterSpacing: active ? "0.08em" : "-0.01em",
        textTransform: active ? "uppercase" : "none",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none", userSelect: "none",
      }}>{label}</label>

      {/* Left icon */}
      {Icon && (
        <div style={{
          position: "absolute", left: 14, top: "50%",
          transform: "translateY(-50%)", zIndex: 2,
          color: focused ? colors.cta.primary : colors.text.tertiary,
          transition: "color 0.2s",
        }}>
          <Icon size={16} />
        </div>
      )}

      <input
        type={type} value={value} onChange={onChange}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 56, borderRadius: 14, boxSizing: "border-box",
          border: `1.5px solid ${focused ? colors.cta.primary : colors.border.default}`,
          background: isDark ? "rgba(255,255,255,0.04)" : colors.surface.secondary,
          color: colors.text.primary,
          fontSize: 14, fontWeight: 500, fontFamily: "inherit",
          paddingTop: active ? 18 : 0,
          paddingBottom: active ? 4 : 0,
          paddingLeft: Icon ? 46 : 16,
          paddingRight: suffix ? 46 : 16,
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused ? `0 0 0 3px ${colors.cta.primary}20` : "none",
        }}
      />

      {suffix && (
        <div style={{
          position: "absolute", right: 12, top: "50%",
          transform: "translateY(-50%)", zIndex: 2,
        }}>{suffix}</div>
      )}
    </div>
  );
}

// ─── Floating label select ───────────────────────────────────────────────────
function FloatingSelect({ label, value, onChange, options, colors, isDark }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div style={{ position: "relative", marginBottom: 13 }}>
      <label style={{
        position: "absolute", left: 46, zIndex: 2,
        top: active ? 8 : "50%",
        transform: active ? "translateY(0)" : "translateY(-50%)",
        fontSize: active ? 9.5 : 13.5,
        fontWeight: active ? 700 : 400,
        color: focused ? colors.cta.primary : colors.text.tertiary,
        letterSpacing: active ? "0.08em" : "-0.01em",
        textTransform: active ? "uppercase" : "none",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none", userSelect: "none",
      }}>{label}</label>

      <div style={{
        position: "absolute", left: 14, top: "50%",
        transform: "translateY(-50%)", zIndex: 2,
        color: focused ? colors.cta.primary : colors.text.tertiary,
        transition: "color 0.2s",
      }}>
        <Store size={16} />
      </div>

      <select
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 56, borderRadius: 14, boxSizing: "border-box",
          border: `1.5px solid ${focused ? colors.cta.primary : colors.border.default}`,
          background: isDark ? "rgba(255,255,255,0.04)" : colors.surface.secondary,
          color: value ? colors.text.primary : "transparent",
          fontSize: 14, fontWeight: 500, fontFamily: "inherit",
          paddingTop: active ? 18 : 0,
          paddingBottom: active ? 4 : 0,
          paddingLeft: 46, paddingRight: 36,
          outline: "none", cursor: "pointer",
          appearance: "none", WebkitAppearance: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused ? `0 0 0 3px ${colors.cta.primary}20` : "none",
        }}
      >
        <option value="" disabled />
        {options.map(o => (
          <option key={o.value} value={o.value}
            style={{
              background: isDark ? "#131315" : "#fff",
              color: colors.text.primary,
            }}>{o.label}</option>
        ))}
      </select>

      <div style={{
        position: "absolute", right: 14, top: "50%",
        transform: "translateY(-50%)", zIndex: 2,
        color: colors.text.tertiary, pointerEvents: "none",
      }}>
        <ChevronDown size={16} />
      </div>
    </div>
  );
}

// ─── Business categories ──────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "electronics",  label: "Electronics & Gadgets"    },
  { value: "fashion",      label: "Fashion & Clothing"        },
  { value: "home",         label: "Home & Living"             },
  { value: "beauty",       label: "Beauty & Health"           },
  { value: "food",         label: "Food & Beverages"          },
  { value: "sports",       label: "Sports & Fitness"          },
  { value: "auto",         label: "Auto Parts & Accessories"  },
  { value: "books",        label: "Books & Stationery"        },
  { value: "other",        label: "Other"                     },
];

// ─── Eye toggle button ────────────────────────────────────────────────────────
function EyeBtn({ show, toggle, colors }) {
  return (
    <button className="eye-btn" onClick={toggle} style={{
      background: "none", border: "none", cursor: "pointer",
      padding: 4, display: "flex", alignItems: "center",
      color: colors.text.tertiary,
    }}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN AUTH PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AuthNew() {
  const { colors, isDark, toggle } = useTheme();
  const { width } = useWindowSize();

  // Layout breakpoints — purely reactive, no flicker
  const showBrand = width >= 900;
  const isWide    = width >= 1100;
  const isMobile  = width < 540;

  // ── UI state ──────────────────────────────────────────────────────────────
  const [mode,        setMode]        = useState("login");   // "login" | "register"
  const [role,        setRole]        = useState("buyer");   // "buyer" | "seller"
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  // ── Shared fields ──────────────────────────────────────────────────────────
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");

  // ── Buyer fields ───────────────────────────────────────────────────────────
  const [name, setName] = useState("");

  // ── Seller fields ──────────────────────────────────────────────────────────
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone,     setPhone]     = useState("");
  const [category,  setCategory]  = useState("");

  // Reset form when switching mode or role
  useEffect(() => {
    setEmail(""); setPassword(""); setConfirm("");
    setName(""); setStoreName(""); setOwnerName("");
    setPhone(""); setCategory("");
    setShowPass(false); setShowConfirm(false);
  }, [mode, role]);

  // ── GSAP refs ──────────────────────────────────────────────────────────────
  const brandRef    = useRef(null);
  const logoRef     = useRef(null);
  const headingRef  = useRef(null);
  const subRef      = useRef(null);
  const statsRef    = useRef(null);
  const formRef     = useRef(null);
  const formCardRef = useRef(null);

  // ── GSAP entrance timeline ─────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (showBrand && brandRef.current) {
        tl
          .fromTo(brandRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4 })
          .fromTo(logoRef.current,
            { opacity: 0, scale: 0.62, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.72, ease: "back.out(1.7)" }, "-=0.1")
          .fromTo(headingRef.current,
            { opacity: 0, y: 46, clipPath: "inset(100% 0 0 0)" },
            { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 0.82 }, "-=0.44")
          .fromTo(subRef.current,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.55 }, "-=0.5")
          .fromTo(statsRef.current ? [...statsRef.current.children] : [],
            { opacity: 0, x: -22 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.11 }, "-=0.35")
          .fromTo(formRef.current,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.75 }, "-=0.75");
      } else if (formRef.current) {
        tl.fromTo(formRef.current,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.6 });
      }

      if (formCardRef.current) {
        tl.fromTo(formCardRef.current,
          { opacity: 0, y: 22, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.58, ease: "back.out(1.4)" },
          showBrand ? "-=0.52" : "-=0.28");
      }
    });
    return () => ctx.revert();
    // eslint-disable-next-line
  }, [showBrand]);

  // ── Theme toggle with GSAP blink ───────────────────────────────────────────
  const handleToggle = () => {
    gsap.to("body", {
      opacity: 0.9, duration: 0.1,
      onComplete: () => {
        toggle();
        gsap.to("body", { opacity: 1, duration: 0.18 });
      },
    });
  };

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1700));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2800);
  };

  const cta     = colors.cta.primary;
  const ctaText = colors.cta.primaryText;

  const pageBg = isDark
    ? "linear-gradient(135deg,#0E0E10 0%,#111318 100%)"
    : "linear-gradient(135deg,#eef3ff 0%,#F5F6F7 60%,#e8efff 100%)";

  // ─────────────────────────────────────────────────────────────────────────────
  // CSS
  // ─────────────────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }

    .woo-auth { font-family: 'DM Sans', system-ui, sans-serif; }
    .woo-auth input::placeholder,
    .woo-auth select::placeholder { color: transparent; }
    .woo-auth input:focus,
    .woo-auth select:focus { outline: none; }

    /* Scrollbar hidden on form panel */
    .woo-form-scroll::-webkit-scrollbar { width: 0; }

    /* Tabs */
    .auth-tab { transition: all 0.22s ease; cursor: pointer; }

    /* Role cards */
    .role-card { transition: transform 0.18s ease, border-color 0.18s ease; cursor: pointer; }
    .role-card:hover { transform: translateY(-2px); }

    /* CTA */
    .auth-cta { transition: transform 0.18s ease, filter 0.18s ease; }
    .auth-cta:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.07); }
    .auth-cta:active:not(:disabled) { transform: translateY(0); }

    /* Google */
    .google-btn { transition: transform 0.18s ease, box-shadow 0.18s ease !important; }
    .google-btn:hover { transform: translateY(-1px) !important; }

    /* Eye, forgot, mode-link */
    .eye-btn:hover { color: ${cta} !important; }
    .forgot-link { transition: opacity 0.15s ease; }
    .forgot-link:hover { opacity: 0.7; }
    .mode-link { transition: opacity 0.15s ease; }
    .mode-link:hover { opacity: 0.72; }

    /* Theme button */
    .theme-btn { transition: transform 0.22s ease; }
    .theme-btn:hover { transform: rotate(22deg) scale(1.1); }

    /* Stat badge hover */
    .stat-badge { transition: transform 0.18s ease; }
    .stat-badge:hover { transform: translateX(4px); }

    @keyframes auth-spin {
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{css}</style>

      <div className="woo-auth" style={{
        minHeight: "100vh", width: "100%",
        background: pageBg,
        display: "flex", alignItems: "stretch",
        position: "relative", overflow: "hidden",
      }}>

        {/* ── THEME TOGGLE ─────────────────────────────────────────────── */}
        <button
          className="theme-btn"
          onClick={handleToggle}
          style={{
            position: "fixed", top: 20, right: 20, zIndex: 300,
            width: 42, height: 42, borderRadius: "50%",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            border: `1px solid ${colors.border.default}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", backdropFilter: "blur(10px)",
          }}
        >
          {isDark
            ? <Sun  size={17} color={colors.text.secondary} />
            : <Moon size={17} color={colors.text.secondary} />}
        </button>

        {/* ══════════════════════════════════════════════════════════════
            LEFT — BRAND PANEL WITH PHOTO
            Only rendered on screens ≥ 900px
        ══════════════════════════════════════════════════════════════ */}
        {showBrand && (
          <div
            ref={brandRef}
            style={{
              width: isWide ? "46%" : "42%",
              minHeight: "100vh",
              position: "relative",
              flexShrink: 0,
              overflow: "hidden",
              // The photo — fills the panel, cropped to cover
              backgroundImage: `url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/*
              ── OVERLAY LAYERS ───────────────────────────────────────
              Layer 1: top-to-bottom gradient — darkens bottom where
                       text + stats live, leaves upper area bright so
                       the family is clearly visible
              Layer 2: left-edge vignette — subtle, just enough depth
              Layer 3: subtle dark scrim across the whole panel so text
                       always has contrast without washing the image
            */}

            {/* Layer 1 — vertical gradient (bottom-heavy) */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 1,
              background: [
                "linear-gradient(",
                "  to top,",
                "  rgba(4, 7, 20, 0.93) 0%,",     /* bottom: stats area — deep dark */
                "  rgba(4, 7, 20, 0.80) 20%,",     /* subtitle + lower heading */
                "  rgba(4, 7, 20, 0.58) 42%,",     /* heading */
                "  rgba(4, 7, 20, 0.30) 65%,",     /* upper mid — family visible */
                "  rgba(4, 7, 20, 0.15) 100%",     /* very top — almost clear */
                ")",
              ].join(""),
            }} />

            {/* Layer 2 — left-edge vignette (pure aesthetic depth) */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 1,
              background:
                "linear-gradient(to right, rgba(4,7,20,0.35) 0%, transparent 55%)",
            }} />

            {/* Layer 3 — noise grain texture (premium feel) */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              opacity: 0.032,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            }} />

            {/* ── CONTENT ───────────────────────────────────────────── */}
            <div style={{
              position: "relative", zIndex: 3,
              display: "flex", flexDirection: "column",
              justifyContent: "space-between",
              height: "100%", minHeight: "100vh",
              padding: isWide ? "52px 52px" : "44px 40px",
            }}>

              {/* Top: Logo mark */}
              <div ref={logoRef}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: "rgba(255,255,255,0.14)",
                    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
                  }}>
                    <Sparkles size={22} color="#fff" fill="#fff" />
                  </div>
                  <span style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 22, fontWeight: 400,
                    color: "#ffffff",
                    letterSpacing: "-0.025em",
                    textShadow: "0 2px 12px rgba(0,0,0,0.45)",
                  }}>
                    Woosho
                  </span>
                </div>
              </div>

              {/* Bottom: Headline + subtitle + stats */}
              <div>
                {/* Headline */}
                <div ref={headingRef} style={{ overflow: "hidden", marginBottom: 14 }}>
                  <h1 style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: isWide ? "clamp(36px, 3.5vw, 52px)" : "clamp(28px, 3vw, 40px)",
                    fontWeight: 400, lineHeight: 1.07,
                    letterSpacing: "-0.035em",
                    color: "#ffffff",
                    textShadow: "0 2px 24px rgba(0,0,0,0.6)",
                    margin: 0,
                  }}>
                    Buy smarter.<br />
                    <em style={{
                      fontStyle: "italic",
                      color: "rgba(255,255,255,0.78)",
                    }}>
                      Sell faster.
                    </em>
                  </h1>
                </div>

                {/* Subtitle */}
                <p ref={subRef} style={{
                  fontSize: isWide ? 15 : 14,
                  lineHeight: 1.72, fontWeight: 400,
                  color: "rgba(255,255,255,0.68)",
                  maxWidth: 340, marginBottom: isWide ? 36 : 28,
                  textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                }}>
                  Nigeria's most trusted marketplace — millions of products, thousands of verified sellers, all in one place.
                </p>

                {/* Stats badges */}
                <div ref={statsRef} style={{
                  display: "flex", flexDirection: "column",
                  gap: 10, marginBottom: 32,
                }}>
                  <div className="stat-badge"><StatBadge icon={Store}       value="50k+"  label="Active Sellers"  /></div>
                  <div className="stat-badge"><StatBadge icon={ShoppingBag} value="2M+"   label="Products Listed" /></div>
                  <div className="stat-badge"><StatBadge icon={TrendingUp}  value="₦8B+"  label="Monthly GMV"     /></div>
                </div>

                {/* Trust line */}
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Shield size={12} color="rgba(255,255,255,0.38)" />
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.07em",
                    color: "rgba(255,255,255,0.36)",
                    textTransform: "uppercase",
                  }}>
                    256-bit SSL · Verified Sellers · Buyer Protection
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            RIGHT — FORM PANEL
        ══════════════════════════════════════════════════════════════ */}
        <div
          ref={formRef}
          className="woo-form-scroll"
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: isMobile ? "24px 18px 40px" : showBrand ? "40px 36px" : "48px 28px",
            overflowY: "auto", minHeight: "100vh",
          }}
        >
          <div
            ref={formCardRef}
            style={{ width: "100%", maxWidth: isMobile ? "100%" : 420 }}
          >

            {/* Mobile / no-brand-panel logo */}
            {!showBrand && (
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 10, marginBottom: 32,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 13, background: cta,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 6px 20px ${cta}44`,
                }}>
                  <Sparkles size={20} color={ctaText} fill={ctaText} />
                </div>
                <span style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 24, fontWeight: 400,
                  color: colors.text.primary, letterSpacing: "-0.035em",
                }}>
                  Woosho
                </span>
              </div>
            )}

            {/* Heading */}
            <div style={{ marginBottom: 26, textAlign: "center" }}>
              <h2 style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: isMobile ? 25 : 29, fontWeight: 400, lineHeight: 1.15,
                color: colors.text.primary, letterSpacing: "-0.035em", marginBottom: 7,
              }}>
                {mode === "login" ? "Welcome back." : "Create your account."}
              </h2>
              <p style={{
                fontSize: 14, color: colors.text.tertiary,
                fontWeight: 400, lineHeight: 1.55,
              }}>
                {mode === "login"
                  ? "Sign in to continue to Woosho."
                  : "Join millions of buyers and sellers."}
              </p>
            </div>

            {/* Tab switcher */}
            <div style={{
              display: "flex",
              background: colors.surface.secondary,
              borderRadius: 14, padding: 5,
              border: `1px solid ${colors.border.default}`,
              marginBottom: 22,
            }}>
              {[["login", "Sign In"], ["register", "Register"]].map(([m, label]) => (
                <button
                  key={m} className="auth-tab"
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: "10px 0", border: "none", borderRadius: 10,
                    background: mode === m ? cta : "transparent",
                    color: mode === m ? ctaText : colors.text.tertiary,
                    fontSize: 13, fontWeight: 700, letterSpacing: "0.01em",
                    boxShadow: mode === m ? `0 4px 14px ${cta}44` : "none",
                    transition: "all 0.22s ease",
                  }}
                >{label}</button>
              ))}
            </div>

            {/* Google OAuth */}
            <button className="google-btn" style={{
              width: "100%", height: 52, borderRadius: 14,
              border: `1.5px solid ${colors.border.default}`,
              background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 12,
              cursor: "pointer", marginBottom: 18,
              color: colors.text.primary, fontSize: 14, fontWeight: 600,
              boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <GoogleIcon /> Continue with Google
            </button>

            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
            }}>
              <div style={{ flex: 1, height: 1, background: colors.border.default }} />
              <span style={{
                fontSize: 10, fontWeight: 700, color: colors.text.tertiary,
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>or</span>
              <div style={{ flex: 1, height: 1, background: colors.border.default }} />
            </div>

            {/* ── DYNAMIC FORM FIELDS ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mode}-${role}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* ── Role selector (register only) ── */}
                {mode === "register" && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: colors.text.tertiary,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      marginBottom: 10,
                    }}>
                      I want to
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      {[
                        { val: "buyer",  label: "Shop & Buy",    Icon: ShoppingBag },
                        { val: "seller", label: "Sell Products", Icon: Store       },
                      ].map(({ val, label, Icon }) => (
                        <div
                          key={val} className="role-card"
                          onClick={() => setRole(val)}
                          style={{
                            flex: 1, padding: "13px 12px", borderRadius: 14,
                            border: `1.5px solid ${role === val ? cta : colors.border.default}`,
                            background: role === val
                              ? isDark ? `${cta}1a` : `${cta}0e`
                              : isDark ? "rgba(255,255,255,0.03)" : colors.surface.secondary,
                            display: "flex", alignItems: "center", gap: 9,
                            boxShadow: role === val ? `0 0 0 3px ${cta}1e` : "none",
                          }}
                        >
                          <Icon size={17} color={role === val ? cta : colors.text.tertiary} />
                          <span style={{
                            fontSize: 13, fontWeight: 700,
                            color: role === val ? cta : colors.text.secondary,
                          }}>
                            {label}
                          </span>
                          {role === val && (
                            <Check size={12} color={cta} style={{ marginLeft: "auto" }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────
                    BUYER — REGISTER SCHEMA
                    Fields: Full Name · Email · Password · Confirm
                ───────────────────────────────────────────────────── */}
                {mode === "register" && role === "buyer" && (
                  <>
                    <FloatingInput
                      label="Full Name" icon={User}
                      value={name} onChange={e => setName(e.target.value)}
                      autoComplete="name"
                      colors={colors} isDark={isDark}
                    />
                    <FloatingInput
                      label="Email Address" icon={Mail}
                      value={email} onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      colors={colors} isDark={isDark}
                    />
                    <FloatingInput
                      label="Password" type={showPass ? "text" : "password"} icon={Lock}
                      value={password} onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                      colors={colors} isDark={isDark}
                      suffix={<EyeBtn show={showPass} toggle={() => setShowPass(s => !s)} colors={colors} />}
                    />
                    <FloatingInput
                      label="Confirm Password" type={showConfirm ? "text" : "password"} icon={Lock}
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      colors={colors} isDark={isDark}
                      suffix={<EyeBtn show={showConfirm} toggle={() => setShowConfirm(s => !s)} colors={colors} />}
                    />
                  </>
                )}

                {/* ─────────────────────────────────────────────────────
                    SELLER — REGISTER SCHEMA
                    Fields: Store Name · Owner Name · Business Email ·
                            Phone (WhatsApp) · Category · Password · Confirm
                ───────────────────────────────────────────────────── */}
                {mode === "register" && role === "seller" && (
                  <>
                    <FloatingInput
                      label="Store / Business Name" icon={Store}
                      value={storeName} onChange={e => setStoreName(e.target.value)}
                      autoComplete="organization"
                      colors={colors} isDark={isDark}
                    />
                    <FloatingInput
                      label="Your Full Name" icon={User}
                      value={ownerName} onChange={e => setOwnerName(e.target.value)}
                      autoComplete="name"
                      colors={colors} isDark={isDark}
                    />
                    <FloatingInput
                      label="Business Email" icon={Mail}
                      value={email} onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      colors={colors} isDark={isDark}
                    />
                    <FloatingInput
                      label="Phone Number (WhatsApp)" icon={Phone} type="tel"
                      value={phone} onChange={e => setPhone(e.target.value)}
                      autoComplete="tel"
                      colors={colors} isDark={isDark}
                    />
                    <FloatingSelect
                      label="Business Category"
                      value={category} onChange={e => setCategory(e.target.value)}
                      options={CATEGORIES}
                      colors={colors} isDark={isDark}
                    />
                    <FloatingInput
                      label="Password" type={showPass ? "text" : "password"} icon={Lock}
                      value={password} onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                      colors={colors} isDark={isDark}
                      suffix={<EyeBtn show={showPass} toggle={() => setShowPass(s => !s)} colors={colors} />}
                    />
                    <FloatingInput
                      label="Confirm Password" type={showConfirm ? "text" : "password"} icon={Lock}
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      colors={colors} isDark={isDark}
                      suffix={<EyeBtn show={showConfirm} toggle={() => setShowConfirm(s => !s)} colors={colors} />}
                    />
                  </>
                )}

                {/* ─────────────────────────────────────────────────────
                    LOGIN SCHEMA
                    Fields: Email · Password · Forgot link
                ───────────────────────────────────────────────────── */}
                {mode === "login" && (
                  <>
                    <FloatingInput
                      label="Email Address" icon={Mail}
                      value={email} onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      colors={colors} isDark={isDark}
                    />
                    <FloatingInput
                      label="Password" type={showPass ? "text" : "password"} icon={Lock}
                      value={password} onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      colors={colors} isDark={isDark}
                      suffix={<EyeBtn show={showPass} toggle={() => setShowPass(s => !s)} colors={colors} />}
                    />
                    <div style={{ textAlign: "right", marginTop: -2, marginBottom: 18 }}>
                      <button className="forgot-link" style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 12, fontWeight: 700, color: cta,
                      }}>
                        Forgot password?
                      </button>
                    </div>
                  </>
                )}

                {/* ── CTA BUTTON ── */}
                <motion.button
                  className="auth-cta"
                  onClick={handleSubmit}
                  disabled={loading}
                  whileTap={{ scale: 0.975 }}
                  style={{
                    width: "100%", height: 54, borderRadius: 14, border: "none",
                    background: success ? "#16a34a" : cta,
                    color: success ? "#fff" : ctaText,
                    fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em",
                    cursor: loading ? "wait" : "pointer",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 10,
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
                      <motion.span key="ok"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <Check size={18} />
                        {mode === "login" ? "Signed In!" : "Account Created!"}
                      </motion.span>
                    ) : loading ? (
                      <motion.span key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ display: "flex", alignItems: "center", gap: 9 }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%",
                          border: `2.5px solid ${ctaText}40`,
                          borderTopColor: ctaText,
                          animation: "auth-spin 0.72s linear infinite",
                        }} />
                        {mode === "login" ? "Signing In…" : "Creating Account…"}
                      </motion.span>
                    ) : (
                      <motion.span key="idle"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                      >
                        {mode === "login" ? "Sign In" : "Create Account"}
                        <ArrowRight size={17} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Terms — register only */}
                {mode === "register" && (
                  <p style={{
                    fontSize: 11, color: colors.text.tertiary,
                    textAlign: "center", lineHeight: 1.68, fontWeight: 400,
                    marginBottom: 10,
                  }}>
                    By registering you agree to Woosho's{" "}
                    <span style={{ color: cta, fontWeight: 700, cursor: "pointer" }}>
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span style={{ color: cta, fontWeight: 700, cursor: "pointer" }}>
                      Privacy Policy
                    </span>.
                  </p>
                )}

                {/* Toggle mode link */}
                <p style={{
                  textAlign: "center", fontSize: 13,
                  color: colors.text.tertiary, fontWeight: 400,
                }}>
                  {mode === "login" ? "Don't have an account? " : "Already have one? "}
                  <button
                    className="mode-link"
                    onClick={() => setMode(m => m === "login" ? "register" : "login")}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: cta, fontWeight: 800, fontSize: 13,
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