import { motion } from "framer-motion";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { STATUS_CONFIG } from "../Utils/ordersConstants";
import {
  formatOrderDate,
  getOrderCreatedAt,
  getOrderItemImage,
  getOrderItemName,
  getOrderItems,
  getOrderShortId,
  getOrderTotalCents,
} from "../Utils/ordersUtils";
import { Icons } from "./OrderIcons";
import StatusBadge from "./StatusBadge";

const statusIcon = {
  processing: Icons.Refresh,
  shipped: Icons.Truck,
  delivered: Icons.CheckCircle,
  cancelled: Icons.XCircle,
};

export default function OrderCard({ order, index, onOpen }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;
  const items = getOrderItems(order);
  const StatusIcon = statusIcon[order.status] || Icons.Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
      whileHover={{ y: -4, boxShadow: "0 20px 50px rgba(79,70,229,0.12)" }}
      className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden group cursor-pointer transition-shadow duration-300"
      onClick={() => onOpen(order)}
    >
      <div className={`h-1 bg-gradient-to-r ${cfg.cardStripe}`} />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Order Number
            </p>
            <p className="font-black text-gray-900 text-sm truncate">
              #{getOrderShortId(order)}
            </p>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={order.status} />
          </div>
        </div>

        {items.length > 0 ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-3">
              {items.slice(0, 4).map((item, itemIndex) => {
                const image = getOrderItemImage(item);
                const name = getOrderItemName(item);

                return (
                  <div
                    key={item.id || `${name}-${itemIndex}`}
                    className="w-10 h-10 rounded-xl border-2 border-white overflow-hidden bg-gray-100 shadow-sm flex-shrink-0"
                  >
                    {image ? (
                      <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Icons.Package c="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
              {items.length > 4 ? (
                <div className="w-10 h-10 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-gray-500 text-[10px] font-black">+{items.length - 4}</span>
                </div>
              ) : null}
            </div>
            <p className="text-gray-400 text-xs ml-1">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Ordered</p>
            <p className="text-sm font-bold text-gray-700">
              {formatOrderDate(getOrderCreatedAt(order))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Total</p>
            <p className="text-lg font-black text-gray-900">
              {formatMoneyCents(getOrderTotalCents(order))}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-indigo-500 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
            View details <Icons.Chev c="w-3.5 h-3.5" />
          </p>
          <span className="text-indigo-500">
            <StatusIcon c="w-5 h-5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
