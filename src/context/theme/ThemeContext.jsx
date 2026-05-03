/**
 * ThemeContext — now a compatibility shim.
 * All state lives in src/store/useThemeStore.js.
 * Existing imports of `useTheme` / `ThemeProvider` continue to work.
 */
import { useEffect } from "react";
import { useThemeStore } from "../../store/useThemeStore";

/** Keep ThemeProvider import working — now just applies DOM side-effects */
export function ThemeProvider({ children }) {
  const init = useThemeStore((s) => s.init);
  useEffect(() => { init(); }, [init]);
  return children;
}

/** Keep the old useTheme() import working */
export { useThemeStore as useTheme };
export { useThemeStore };
