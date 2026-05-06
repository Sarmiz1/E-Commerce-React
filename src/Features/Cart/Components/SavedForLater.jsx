import { motion } from "framer-motion";
import { formatMoneyCents } from "../../../utils/FormatMoneyCents";
import { Ic } from "./CartConstants";

export function SavedForLater({ items, onMoveToCart }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <Ic.Heart c="w-5 h-5 text-rose-400" filled />
        Saved for Later
        <span className="text-sm font-bold text-gray-400 dark:text-neutral-500">({items.length})</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <motion.div key={item.id || i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="aspect-square bg-gray-50 dark:bg-neutral-800 overflow-hidden">
              {item.products?.image && <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />}
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-gray-800 dark:text-neutral-200 line-clamp-1">{item.products?.name}</p>
              <p className="text-indigo-600 dark:text-indigo-400 font-black text-sm mt-0.5">{formatMoneyCents(item.products?.price_cents)}</p>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => onMoveToCart(item)}
                className="w-full mt-2 bg-gray-900 dark:bg-indigo-600 text-white text-xs font-black py-2 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors">
                Move to Cart
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
