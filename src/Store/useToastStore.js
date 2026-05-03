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
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const useToastStore = create(
  devtools(
    immer((set) => ({
      toasts: [],

      addToast: (msg, type = "success") => {
        const id = Date.now() + Math.random();
        set((state) => {
          state.toasts.push({ id, msg, type });
        });
        setTimeout(() => {
          set((state) => {
            state.toasts = state.toasts.filter((t) => t.id !== id);
          });
        }, 4000);
      },

      removeToast: (id) =>
        set((state) => {
          state.toasts = state.toasts.filter((t) => t.id !== id);
        }),
    })),
    { name: "ToastStore" }
  )
);

import { useShallow } from "zustand/react/shallow";

/** Convenience alias — keeps old useToast() call sites working */
export const useToast = () =>
  useToastStore(useShallow((s) => ({ addToast: s.addToast })));
