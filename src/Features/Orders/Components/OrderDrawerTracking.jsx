import { motion } from "framer-motion";
import TrackingTimeline from "./TrackingTimeline";
import { Icons } from "./OrderIcons";

export default function OrderDrawerTracking({ order }) {
  const showEstimate = !["cancelled", "delivered"].includes(order?.status);

  return (
    <motion.div
      key="tracking"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="space-y-4"
    >
      <TrackingTimeline order={order} />
      {showEstimate ? (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <Icons.Truck c="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-700 font-bold text-sm">Estimated Delivery</p>
            <p className="text-blue-500 text-xs mt-0.5">
              {order.status === "shipped" ? "Today - Tomorrow" : "Within 2-5 business days"}
            </p>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
