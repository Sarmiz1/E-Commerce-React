import { motion } from "framer-motion";
import { formatMoneyMinor } from "../../../utils/formatMoneyMinor";
import { Ic, Spinner } from "./CartConstants";

export function StickyMobileBar({ total, itemCount, onCheckout, isCheckingOut = false, checkoutError = "" }) {
  if (itemCount === 0) return null;
  return (
    <div className="ct-sticky-rise fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl backdrop-blur-xl transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900/95 lg:hidden sm:px-4">
      <div className="mx-auto flex max-w-lg items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-xs ${checkoutError ? "text-red-500 font-semibold" : "text-gray-400 dark:text-neutral-500"}`}>
            {checkoutError || `${itemCount} item${itemCount !== 1 ? "s" : ""}`}
          </p>
          <p className="font-black text-gray-900 dark:text-white text-lg leading-tight">{formatMoneyMinor(total)}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onCheckout}
          disabled={isCheckingOut}
          className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-3 py-3 text-xs font-black text-white shadow-md shadow-indigo-500/15 transition-colors hover:bg-indigo-700 disabled:opacity-60 sm:gap-2 sm:px-6 sm:py-3.5 sm:text-sm">
          {isCheckingOut ? <Spinner c="w-4 h-4" /> : <Ic.Lock c="w-4 h-4" />}
          {isCheckingOut ? "Opening" : "Checkout"}
        </motion.button>
      </div>
    </div>
  );
}
