import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./CheckoutIcons";

export function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-500">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-500"
          >
            <Icon.Info className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
