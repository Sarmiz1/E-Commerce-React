/**
 * useToastStore — Zustand global toast store
 *
 * Replaces ToastContext. The UI (toast stack) is rendered by
 * <ToastRenderer /> which should live at the root of the app.
 *
 * Usage:
 *   import { useToastStore } from "@/store/useToastStore";
 *   const { addToast } = useToastStore();
 *   addToast("Saved!", "success");   // types: "success" | "error" | "info"
 */
import { create } from "zustand";

export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (msg, type = "success") => {
    const id = Date.now() + Math.random();
    set((state) => ({ toasts: [...state.toasts, { id, msg, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience alias — keeps old useToast() call sites working */
export const useToast = () => useToastStore((s) => ({ addToast: s.addToast }));
