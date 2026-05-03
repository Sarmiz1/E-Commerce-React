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
import { supabase } from "../lib/supabaseClient";
import { useToastStore } from "./useToastStore";

const toast = (msg, type = "success") =>
  useToastStore.getState().addToast(msg, type);

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

  // ─── Actions ──────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      toast(result.error.message || "Sign-in failed. Please try again.", "error");
    } else {
      toast("Welcome back! 👋", "success");
    }
    return result;
  },

  signUp: async (email, password) => {
    const result = await supabase.auth.signUp({ email, password });
    if (result.error) {
      toast(result.error.message || "Sign-up failed. Please try again.", "error");
    } else {
      toast("Account created! Check your email to confirm.", "success");
    }
    return result;
  },

  signOut: async () => {
    const result = await supabase.auth.signOut();
    if (result.error) {
      toast("Sign-out failed. Please try again.", "error");
    } else {
      toast("You've been signed out.", "info");
    }
    return result;
  },

  loginGuest: async () => {
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
    set({ session, user: session?.user ?? null, loading: false }),

  _setLoading: (loading) => set({ loading }),
}));

// ─── Bootstrap ────────────────────────────────────────────────────────────────
let _unsubscribe = null;

export function initAuth() {
  if (_unsubscribe) return;

  const { _setSession } = useAuthStore.getState();

  supabase.auth.getSession().then(({ data: { session } }) => {
    _setSession(session);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      _setSession(session);
    }
  );

  _unsubscribe = () => subscription.unsubscribe();
  return _unsubscribe;
}

/** Convenience alias — keeps the old `useAuth` call sites working */
export const useAuth = useAuthStore;
