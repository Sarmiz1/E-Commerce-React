import { motion } from "framer-motion";
import { TRUST_BADGES } from "../Utils/checkoutConstants";
import { Icon } from "./CheckoutIcons";

const TRUST_ICONS = [Icon.Lock, Icon.Truck, Icon.Shield, Icon.Star];

export function TrustBar({ visible }) {
  if (!visible) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
      {TRUST_BADGES.map((badge, index) => {
        const TrustIcon = TRUST_ICONS[index] || Icon.Shield;

        return (
          <div key={badge.title} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 p-5 text-center transition-all duration-200 hover:border-indigo-100 hover:shadow-sm">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <TrustIcon className="h-5 w-5" />
            </div>
            <p className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-100">{badge.title}</p>
            <p className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">{badge.sub}</p>
          </div>
        );
      })}
    </motion.div>
  );
}
