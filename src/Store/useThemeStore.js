/**
 * useThemeStore — Zustand global theme store
 *
 * Replaces ThemeContext. Persists preference to localStorage via Zustand's
 * `persist` middleware. Also synchronises the data-theme attribute on <html>
 * and injects the full Woosho CSS variable sheet.
 *
 * Usage:
 *   import { useThemeStore } from "@/store/useThemeStore";
 *   const { isDark, toggle, colors } = useThemeStore();
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Full Woosho Palette ──────────────────────────────────────────────────────
const PALETTE = {
  light: {
    brand: {
      electricBlue:    "#3b82f6",
      electricBlueAlt: "#60a5fa",
      neonGreen:       "#10b981",
      gold:            "#c49a00",
      orange:          "#e54f00",
    },
    surface: {
      primary:   "#FFFFFF",
      secondary: "#F5F6F7",
      tertiary:  "#ECEDEF",
      elevated:  "#FFFFFF",
    },
    border: {
      default: "#E2E4E9",
      subtle:  "#F0F1F3",
      strong:  "#C8CBD4",
    },
    text: {
      primary:     "#0E0E10",
      secondary:   "#4B5563",
      tertiary:    "#9CA3AF",
      inverse:     "#FFFFFF",
      accent:      "#0050d4",
      accentGreen: "#00915a",
    },
    state: {
      success:   "#059669",
      successBg: "#ECFDF5",
      error:     "#DC2626",
      errorBg:   "#FEF2F2",
      warning:   "#C49A00",
      warningBg: "#FFFBEB",
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
      electricBlue:    "#60a5fa",
      electricBlueAlt: "#3b82f6",
      neonGreen:       "#34d399",
      gold:            "#FFD700",
      orange:          "#FF5E00",
    },
    surface: {
      primary:   "#0E0E10",
      secondary: "#131315",
      tertiary:  "#19191C",
      elevated:  "#1F1F23",
    },
    border: {
      default: "#2C2C30",
      subtle:  "#1F1F23",
      strong:  "#48474A",
    },
    text: {
      primary:     "#F5F6F7",
      secondary:   "#9CA3AF",
      tertiary:    "#6B7280",
      inverse:     "#0E0E10",
      accent:      "#90abff",
      accentGreen: "#00FF94",
    },
    state: {
      success:   "#00FF94",
      successBg: "rgba(0,255,148,0.12)",
      error:     "#FF5E00",
      errorBg:   "rgba(255,94,0,0.12)",
      warning:   "#FFD700",
      warningBg: "rgba(255,215,0,0.12)",
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function applyThemeToDom(isDark) {
  const root = document.documentElement;
  root.setAttribute("data-theme", isDark ? "dark" : "light");
  if (isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }

  const colors = isDark ? PALETTE.dark : PALETTE.light;
  const styleId = "woosho-css-vars";
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }
  style.textContent = buildCSSVars(colors);
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,

      get colors() {
        return get().isDark ? PALETTE.dark : PALETTE.light;
      },

      PALETTE,

      toggle: () => {
        const next = !get().isDark;
        applyThemeToDom(next);
        set({ isDark: next });
      },

      // Initialise DOM on first render
      init: () => applyThemeToDom(get().isDark),
    }),
    {
      name: "woosho-theme",
      partialize: (state) => ({ isDark: state.isDark }),
    }
  )
);

/** Convenience alias — keeps old useTheme() call sites working */
export const useTheme = useThemeStore;
