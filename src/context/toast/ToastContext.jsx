/**
 * ToastContext — now a compatibility shim.
 * All state lives in src/store/useToastStore.js.
 * Existing imports of `useToast` / `ToastProvider` continue to work.
 */
import { useToastStore } from "../../Store/useToastStore";
import { ToastRenderer } from "../../components/Ui/ToastRenderer";

/** Keep ToastProvider import working — now just renders the toast stack */
export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <ToastRenderer />
    </>
  );
}

/** Keep the old useToast() import working */
export const useToast = () =>
  useToastStore((s) => ({ addToast: s.addToast }));

export { useToastStore };
