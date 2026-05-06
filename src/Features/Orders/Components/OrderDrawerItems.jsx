import { motion } from "framer-motion";
import { formatMoneyCents } from "../../../utils/FormatMoneyCents";
import {
  getOrderItemImage,
  getOrderItemName,
  getOrderItems,
  getOrderItemQuantity,
  getOrderItemTotalCents,
} from "../Utils/ordersUtils";
import { Icons } from "./OrderIcons";

export default function OrderDrawerItems({ order }) {
  const items = getOrderItems(order);

  if (!items.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
          <Icons.Package c="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold">No item details available</p>
      </div>
    );
  }

  return (
    <motion.div
      key="items"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="space-y-4"
    >
      {items.map((item, index) => {
        const image = getOrderItemImage(item);
        const name = getOrderItemName(item);

        return (
          <motion.div
            key={item.id || `${name}-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="flex gap-4 bg-gray-50 dark:bg-[#060B14] rounded-2xl p-4 border border-gray-100 dark:border-white dark:border-[#0D1421]/10 group hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white dark:bg-[#0D1421] border border-gray-100 dark:border-white dark:border-[#0D1421]/10">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "https://placehold.co/200x200?text=No+Image";
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Icons.Package c="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-snug">
                {name}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Qty: {getOrderItemQuantity(item)}
              </p>
            </div>
            <p className="font-black text-gray-900 dark:text-white text-sm flex-shrink-0">
              {formatMoneyCents(getOrderItemTotalCents(item))}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
