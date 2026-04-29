import { motion } from "framer-motion";
import { Icon } from "./CheckoutIcons";

export function SubmitErrorAlert({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
    >
      <Icon.Info className="h-5 w-5 flex-shrink-0 text-red-500" />
      {message}
    </motion.div>
  );
}
