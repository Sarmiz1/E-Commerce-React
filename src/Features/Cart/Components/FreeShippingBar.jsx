import { motion } from "framer-motion";
import { formatMoneyMinor } from "../../../utils/formatMoneyMinor";
import { Ic } from "./CartConstants";

export function FreeShippingBar({ progress = {} }) {
  if (!Number(progress.threshold)) return null;

  const remaining = Number(progress.remaining) || 0;
  const pct = Number(progress.percent) || 0;
  const isFree = Boolean(progress.unlocked);

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5 transition-colors duration-300 dark:border-blue-900/30 dark:bg-blue-900/10 sm:px-5 sm:py-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Ic.Truck c="h-4 w-4 flex-shrink-0 text-blue-500" />
          <span className="text-xs font-bold leading-snug text-blue-800 dark:text-blue-300 sm:text-sm">
            {isFree ? "Free shipping unlocked" : `Add ${formatMoneyMinor(remaining)} for free shipping`}
          </span>
        </div>
        <span className="flex-shrink-0 text-xs font-bold text-blue-500">{Math.round(pct)}%</span>
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
