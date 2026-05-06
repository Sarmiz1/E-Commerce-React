/**
 * AuthContext — now a compatibility shim.
 * All state lives in src/store/useAuthStore.js.
 * Existing imports of `useAuth` / `AuthProvider` continue to work.
 */
import { useEffect } from "react";
import { initAuth, useAuthStore } from "../../Store/useAuthStore";
import { RealtimeProvider } from "../realtime/RealtimeProvider";

/** Keep the old AuthProvider import working — now it just bootstraps the store */
export function AuthProvider({ children }) {
  useEffect(() => {
    const unsub = initAuth();
    return unsub;
  }, []);

  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  return (
    <RealtimeProvider user={user}>
      {!loading && children}
    </RealtimeProvider>
  );
}

/** Keep the old useAuth() import working */
export { useAuthStore as useAuth };
export { useAuthStore };
