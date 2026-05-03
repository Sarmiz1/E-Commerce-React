/**
 * ThemeContext — now a compatibility shim.
 * All state lives in src/store/useThemeStore.js.
 * Existing imports of `useTheme` / `ThemeProvider` continue to work.
 */
import { useEffect } from "react";
import { useThemeStore } from "../../store/useThemeStore";

/** Keep ThemeProvider import working — now just applies DOM side-effects */
export function ThemeProvider({ children }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = useThemeStore((s) => s.colors);
  const init = useThemeStore((s) => s.init);

  useEffect(() => {
    // This runs on mount and whenever isDark/colors change,
    // ensuring the DOM is always in sync with Zustand state,
    // even after persist rehydration completes.
    init();
  }, [isDark, colors, init]);

  return children;
}

/** Keep the old useTheme() import working */
export { useThemeStore as useTheme };
export { useThemeStore };
