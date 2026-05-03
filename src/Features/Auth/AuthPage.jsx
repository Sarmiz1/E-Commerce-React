import { useState, useEffect } from "react";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../store/useThemeStore";
import { useLocation } from "react-router-dom";

import BrandPanel from "./Components/BrandPanel";
import AuthForm from "./AuthFormComponent/AuthForm";
import AuthStyles from "./Components/AuthStyles";

// ─── Reactive window-size hook (no flicker on resize) ────────────────────────
function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  useEffect(() => {
    let raf;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setSize({ width: window.innerWidth, height: window.innerHeight }),
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

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN AUTH PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AuthPage() {
  const { colors, isDark, toggle } = useTheme();
  const { width } = useWindowSize();
  const location = useLocation();

  // Layout breakpoints — purely reactive, no flicker
  const showBrand = width >= 900;
  const isWide = width >= 1100;
  const isMobile = width < 540;

  // Derive initial mode from route
  const isSignup = location.pathname.includes("signup");
  const initialMode = isSignup ? "register" : "login";

  // ── Theme toggle ───────────────────────────────────────────
  const handleToggle = () => {
    toggle();
  };

  const cta = colors.cta.primary;
  const ctaText = colors.cta.primaryText;

  const pageBg = isDark
    ? "linear-gradient(135deg,#0E0E10 0%,#111318 100%)"
    : "linear-gradient(135deg,#eef3ff 0%,#F5F6F7 60%,#e8efff 100%)";

  return (
    <>
      <AuthStyles cta={cta} isDark={isDark} />

      <div
        className="woo-auth"
        style={{
          minHeight: "100vh",
          width: "100%",
          background: pageBg,
          display: "flex",
          alignItems: "stretch",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <button
          className="theme-btn"
          onClick={handleToggle}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 300,
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            border: `1px solid ${colors.border.default}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
          }}
        >
          {isDark ? (
            <Sun size={17} color={colors.text.secondary} />
          ) : (
            <Moon size={17} color={colors.text.secondary} />
          )}
        </button>

        {showBrand && <BrandPanel isWide={isWide} />}

        <AuthForm
          colors={colors}
          isDark={isDark}
          cta={cta}
          ctaText={ctaText}
          isMobile={isMobile}
          showBrand={showBrand}
          initialMode={initialMode}
        />
      </div>
    </>
  );
}
