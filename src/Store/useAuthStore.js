/**
 * useAuthStore — Zustand global auth store
 *
 * Replaces AuthContext. Initialises from Supabase's persisted session
 * on first load and subscribes to future auth state changes.
 *
 * Usage:
 *   import { useAuthStore, initAuth } from "@/store/useAuthStore";
 *   const { user, session, loading } = useAuthStore();
 */
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  isSupabaseConfigured,
  supabase,
  supabaseConfigError,
} from "../lib/supabaseClient";
import { useToastStore } from "./useToastStore";

const toast = (msg, type = "success") =>
  useToastStore.getState().addToast(msg, type);

const unavailableAuthResult = () => ({
  data: null,
  error: new Error(supabaseConfigError),
});

export const useAuthStore = create(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        session: null,
        loading: true,
        isLoading: true, // Alias for backward compatibility

  // ─── Actions ──────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      toast(supabaseConfigError, "error");
      return unavailableAuthResult();
    }

    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      toast(result.error.message || "Sign-in failed. Please try again.", "error");
    } else {
      toast("Welcome back! 👋", "success");
    }
    return result;
  },

  signUp: async (email, password) => {
    if (!isSupabaseConfigured) {
      toast(supabaseConfigError, "error");
      return unavailableAuthResult();
    }

    const result = await supabase.auth.signUp({ email, password });
    if (result.error) {
      toast(result.error.message || "Sign-up failed. Please try again.", "error");
    } else {
      toast("Account created! Check your email to confirm.", "success");
    }
    return result;
  },

  signOut: async () => {
    if (!isSupabaseConfigured) {
      return { data: null, error: null };
    }

    const result = await supabase.auth.signOut();
    if (result.error) {
      toast("Sign-out failed. Please try again.", "error");
    } else {
      toast("You've been signed out.", "info");
    }
    return result;
  },

  loginGuest: async () => {
    if (!isSupabaseConfigured) {
      toast(supabaseConfigError, "error");
      return unavailableAuthResult();
    }

    const guestEmail = "guest_tester@WooSho.local";
    const guestPass  = "supa_strong_password_123!";
    let { data, error } = await supabase.auth.signInWithPassword({
      email: guestEmail,
      password: guestPass,
    });
    if (error?.message?.includes("Invalid login credentials")) {
      const res = await supabase.auth.signUp({ email: guestEmail, password: guestPass });
      if (!res.error) toast("Guest account created!", "info");
      return res;
    }
    if (error) {
      toast("Guest login failed.", "error");
    }
    return { data, error };
  },

      // Internal – called by initAuth to sync session updates
      _setSession: (session) =>
        set((state) => {
          state.session = session;
          state.user = session?.user ?? null;
          state.loading = false;
          state.isLoading = false;
        }),

      _setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
          state.isLoading = loading;
        }),
    })),
    {
      name: "woosho-auth",
      // Only persist user and session for instant UI feedback.
      // Don't persist `loading` so the app knows it still needs to verify with Supabase.
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  ),
  { name: "AuthStore" }
));

// ─── Bootstrap ────────────────────────────────────────────────────────────────
let _unsubscribe = null;

export function initAuth() {
  if (_unsubscribe) return _unsubscribe;

  const { _setSession } = useAuthStore.getState();

  if (!isSupabaseConfigured) {
    _setSession(null);
    _unsubscribe = () => {};
    return _unsubscribe;
  }

  supabase.auth.getSession().then(({ data: { session } }) => {
    _setSession(session);
  }).catch(() => {
    _setSession(null);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      _setSession(session);
    }
  );

  _unsubscribe = () => subscription.unsubscribe();
  return _unsubscribe;
}

import { useShallow } from "zustand/react/shallow";

/** Custom hook that safely enforces shallow selector performance for destructured imports */
export const useAuth = () => {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      session: state.session,
      loading: state.loading,
      isLoading: state.isLoading,
      signIn: state.signIn,
      signUp: state.signUp,
      signOut: state.signOut,
      loginGuest: state.loginGuest,
    }))
  );
};
