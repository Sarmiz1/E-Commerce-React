import { motion } from "framer-motion";
import { formatMoneyCents } from "../../../utils/FormatMoneyCents";
import { Ic, FREE_SHIP_THRESHOLD } from "./CartConstants";

export function FreeShippingBar({ subtotal, discount }) {
  const effective = subtotal - discount;
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - effective);
  const pct = Math.min(100, (effective / FREE_SHIP_THRESHOLD) * 100);
  const isFree = remaining === 0;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl px-5 py-4 transition-colors duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Ic.Truck c="w-4 h-4 text-blue-500" />
          <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
            {isFree ? "Free shipping unlocked" : `Add ${formatMoneyCents(remaining)} for free shipping`}
          </span>
        </div>
        <span className="text-xs text-blue-500 font-bold">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-blue-200 dark:bg-blue-900/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
