import { motion } from "framer-motion";
import { formatMoneyCents } from "../../../utils/FormatMoneyCents";
import { getOrderTotalCents } from "../Utils/ordersUtils";
import { Icons } from "./OrderIcons";

export default function OrderDrawerInvoice({ order }) {
  const subtotal = order?.totals?.subtotal ?? getOrderTotalCents(order);
  const shipping = order?.totals?.shipping ?? 0;
  const discount = order?.totals?.discount ?? 0;

  return (
    <motion.div
      key="invoice"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="space-y-3"
    >
      <div className="bg-gray-50 dark:bg-[#060B14] rounded-2xl p-5 border border-gray-100 dark:border-white dark:border-[#0D1421]/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
          Shipped To
        </p>
        <p className="font-bold text-gray-900 dark:text-white text-sm">{order?.shipping?.name || "-"}</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">
          {order?.shipping?.address || "-"}
          <br />
          {order?.shipping?.city || ""}
          {order?.shipping?.state ? `, ${order.shipping.state}` : ""} {order?.shipping?.zip || ""}
          <br />
          {order?.shipping?.country || ""}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-[#060B14] rounded-2xl p-5 border border-gray-100 dark:border-white dark:border-[#0D1421]/10 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
          Invoice Summary
        </p>
        {[
          ["Subtotal", formatMoneyCents(subtotal)],
          ["Shipping", shipping === 0 ? "Free" : formatMoneyCents(shipping)],
          ...(discount > 0 ? [["Discount", `-${formatMoneyCents(discount)}`]] : []),
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className={`font-bold ${label === "Discount" ? "text-emerald-600" : "text-gray-900 dark:text-white"}`}>
              {value}
            </span>
          </div>
        ))}
        <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-white dark:border-[#0D1421]/10 mt-2">
          <span>Total</span>
          <span className="text-indigo-700">{formatMoneyCents(getOrderTotalCents(order))}</span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#060B14] rounded-2xl p-5 border border-gray-100 dark:border-white dark:border-[#0D1421]/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
          Payment
        </p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <Icons.CreditCard c="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            **** {order?.payment?.last4 || "****"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
