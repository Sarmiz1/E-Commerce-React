// src/Context/ThemeContext.jsx
//
// ── Woosho Theme System ────────────────────────────────────────────────────────
// Provides light / dark mode switching with the full Woosho color palette.
// Persists user preference to localStorage.
// Every page in the project should consume this context.
//
// Usage:
//   import { useTheme } from "../Context/ThemeContext";
//   const { isDark, toggle, colors } = useTheme();
//
//   // Access any token:
//   colors.brand.electricBlue   →  "#0050d4" | "#90abff"
//   colors.surface.primary      →  "#FFFFFF"  | "#0E0E10"
//
// The ThemeProvider also injects a "data-theme" attribute on <html> and a CSS
// variable sheet so Tailwind `dark:` classes work alongside raw CSS.

// src/Context/ThemeContext.jsx
//
// ── Woosho Theme System ────────────────────────────────────────────────────────
// Provides light / dark mode switching with the full Woosho color palette.
// Persists user preference to localStorage.
// Every page in the project should consume this context.
//
// Usage:
//   import { useTheme } from "../Context/ThemeContext";
//   const { isDark, toggle, colors } = useTheme();
//
//   // Access any token:
//   colors.brand.electricBlue   →  "#0050d4" | "#90abff"
//   colors.surface.primary      →  "#FFFFFF"  | "#0E0E10"
//
// The ThemeProvider also injects a "data-theme" attribute on <html> and a CSS
// variable sheet so Tailwind `dark:` classes work alongside raw CSS.

import {
  createContext, useContext, useState, useEffect, useMemo,
} from "react";

// ─── Full palette definition ──────────────────────────────────────────────────
const PALETTE = {
  light: {
    brand: {
      electricBlue:  "#3b82f6",          // Woosho Signature Blue
      electricBlueAlt: "#60a5fa",
      neonGreen:     "#10b981",          // toned down for light bg readability
      gold:          "#c49a00",
      orange:        "#e54f00",
    },
    surface: {
      primary:       "#FFFFFF",          // main page bg
      secondary:     "#F5F6F7",          // card / sidebar bg
      tertiary:      "#ECEDEF",          // subtle inset bg
      elevated:      "#FFFFFF",          // modal / dropdown bg
    },
    border: {
      default:       "#E2E4E9",
      subtle:        "#F0F1F3",
      strong:        "#C8CBD4",
    },
    text: {
      primary:       "#0E0E10",
      secondary:     "#4B5563",
      tertiary:      "#9CA3AF",
      inverse:       "#FFFFFF",
      accent:        "#0050d4",
      accentGreen:   "#00915a",
    },
    state: {
      success:       "#059669",
      successBg:     "#ECFDF5",
      error:         "#DC2626",
      errorBg:       "#FEF2F2",
      warning:       "#C49A00",
      warningBg:     "#FFFBEB",
    },
    cta: {
      primary:       "#0050d4",
      primaryHover:  "#0041ac",
      primaryText:   "#FFFFFF",
      secondary:     "#F5F6F7",
      secondaryHover:"#ECEDEF",
      secondaryText: "#0E0E10",
    },
  },
  dark: {
    brand: {
      electricBlue:  "#60a5fa",
      electricBlueAlt: "#3b82f6",
      neonGreen:     "#34d399",
      gold:          "#FFD700",
      orange:        "#FF5E00",
    },
    surface: {
      primary:       "#0E0E10",          // Obsidian Black — main bg
      secondary:     "#131315",          // card bg
      tertiary:      "#19191C",          // Deep Slate — sidebar / insets
      elevated:      "#1F1F23",          // modal / dropdown
    },
    border: {
      default:       "#2C2C30",
      subtle:        "#1F1F23",
      strong:        "#48474A",
    },
    text: {
      primary:       "#F5F6F7",
      secondary:     "#9CA3AF",
      tertiary:      "#6B7280",
      inverse:       "#0E0E10",
      accent:        "#90abff",
      accentGreen:   "#00FF94",
    },
    state: {
      success:       "#00FF94",
      successBg:     "rgba(0,255,148,0.12)",
      error:         "#FF5E00",
      errorBg:       "rgba(255,94,0,0.12)",
      warning:       "#FFD700",
      warningBg:     "rgba(255,215,0,0.12)",
    },
    cta: {
      primary:       "#90abff",
      primaryHover:  "#a8bfff",
      primaryText:   "#0E0E10",
      secondary:     "#19191C",
      secondaryHover:"#232328",
      secondaryText: "#F5F6F7",
    },
  },
};

// ─── CSS variable injection ───────────────────────────────────────────────────
// Maps palette tokens to CSS custom properties so raw CSS & Tailwind can use them.
function buildCSSVars(tokens) {
  const flat = [];
  const walk = (obj, prefix) => {
    for (const [k, v] of Object.entries(obj)) {
      const key = `${prefix}-${k}`.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
      if (typeof v === "string") flat.push(`--woo${key}: ${v};`);
      else walk(v, `${prefix}-${k}`);
    }
  };
  walk(tokens, "");
  return `:root { ${flat.join(" ")} }`;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("woosho-theme");
      if (saved) return saved === "dark";
    } catch { /* ignore */ }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  // Persist + apply data-theme to <html> for Tailwind dark: class support
  useEffect(() => {
    try { localStorage.setItem("woosho-theme", isDark ? "dark" : "light"); } catch { /* ignore */ }
    
    const root = document.documentElement;
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [isDark]);

  const toggle = () => setIsDark((d) => !d);

  const colors = isDark ? PALETTE.dark : PALETTE.light;

  // Inject CSS variables into a <style> tag
  useEffect(() => {
    const id  = "woosho-css-vars";
    let style  = document.getElementById(id);
    if (!style) {
      style    = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = buildCSSVars(colors);
  }, [colors]);

  const value = useMemo(() => ({ isDark, toggle, colors, PALETTE }), [isDark, colors]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

