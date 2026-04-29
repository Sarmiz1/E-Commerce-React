import { motion } from "framer-motion";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { Ic, Spinner } from "./CartConstants";

export function StickyMobileBar({ total, itemCount, onCheckout, isCheckingOut = false, checkoutError = "" }) {
  if (itemCount === 0) return null;
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 ct-sticky-rise bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-neutral-800 px-4 py-3 shadow-2xl transition-colors duration-300">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <p className={`text-xs ${checkoutError ? "text-red-500 font-semibold" : "text-gray-400 dark:text-neutral-500"}`}>
            {checkoutError || `${itemCount} item${itemCount !== 1 ? "s" : ""}`}
          </p>
          <p className="font-black text-gray-900 dark:text-white text-lg leading-tight">{formatMoneyCents(total)}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onCheckout}
          disabled={isCheckingOut}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-60">
          {isCheckingOut ? <Spinner c="w-4 h-4" /> : <Ic.Lock c="w-4 h-4" />}
          {isCheckingOut ? "Opening" : "Checkout"}
        </motion.button>
      </div>
    </div>
  );
}
