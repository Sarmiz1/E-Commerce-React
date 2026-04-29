import { motion } from "framer-motion";
import { EMPTY_STATE_CONFIG } from "../Utils/ordersConstants";
import { Icons } from "./OrderIcons";

const emptyIcons = {
  package: Icons.Package,
  refresh: Icons.Refresh,
  truck: Icons.Truck,
  check: Icons.CheckCircle,
  x: Icons.XCircle,
  search: Icons.Search,
};

export default function EmptyState({ statusFilter, search, onReset, onShop }) {
  const cfg = search
    ? {
        ...EMPTY_STATE_CONFIG.search,
        title: `No results for "${search}"`,
      }
    : EMPTY_STATE_CONFIG[statusFilter] || EMPTY_STATE_CONFIG.all;
  const EmptyIcon = emptyIcons[cfg.icon] || Icons.Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6 shadow-lg text-indigo-500"
      >
        <EmptyIcon c="w-11 h-11" />
      </motion.div>
      <h3 className="text-2xl font-black text-gray-900 mb-3">{cfg.title}</h3>
      <p className="text-gray-400 max-w-sm leading-relaxed text-sm mb-8">{cfg.sub}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {search || statusFilter !== "all" ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReset}
            className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition text-sm"
          >
            Clear Filters
          </motion.button>
        ) : null}
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onShop}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-indigo-500/25 text-sm flex items-center justify-center gap-2"
        >
          <Icons.Bag c="w-4 h-4" />
          Start Shopping
        </motion.button>
      </div>
    </motion.div>
  );
}
