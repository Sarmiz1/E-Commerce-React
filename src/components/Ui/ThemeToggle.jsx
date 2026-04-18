// ─── Theme toggle button (drop-in component) ──────────────────────────────────
import { useTheme } from "../../Context/theme/ThemeContext";
export function ThemeToggle({ className = "" }) {
  const { isDark, toggle, colors } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex items-center px-0.5 ${className}`}
      style={{
        background: isDark ? colors.brand.electricBlue : "#E2E4E9",
      }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] shadow-sm transition-all duration-300"
        style={{
          transform: isDark ? "translateX(20px)" : "translateX(0)",
          background: isDark ? colors.surface.primary : "#FFFFFF",
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}