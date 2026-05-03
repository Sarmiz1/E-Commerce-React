/**
 * AuthBootstrap
 *
 * Mounts once at the app root. Calls initAuth() to hydrate the
 * useAuthStore from the Supabase session and subscribe to future
 * auth state changes. Also initialises the theme DOM attributes.
 *
 * Place this INSIDE <QueryWrapper> but BEFORE any children that need
 * auth or theme data:
 *
 *   <QueryWrapper>
 *     <AuthBootstrap />
 *     <RouterProvider router={router} />
 *   </QueryWrapper>
 */
import { useEffect } from "react";
import { initAuth } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";

export function AuthBootstrap({ children }) {
  const themeInit = useThemeStore((s) => s.init);

  useEffect(() => {
    themeInit();            // Apply data-theme + CSS vars on first mount
    const unsub = initAuth(); // Subscribe to Supabase auth events
    return unsub;
  }, [themeInit]);

  return children ?? null;
}
