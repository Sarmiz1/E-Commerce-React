import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StatusBadge from "./StatusBadge";
import Spinner from "./Spinner";
import { Icons } from "./OrderIcons";
import OrderDrawerItems from "./OrderDrawerItems";
import OrderDrawerTracking from "./OrderDrawerTracking";
import OrderDrawerInvoice from "./OrderDrawerInvoice";
import { canCancelOrder, formatOrderDate, getOrderCreatedAt, getOrderShortId } from "../Utils/ordersUtils";

const TABS = [
  { id: "items", label: "Items" },
  { id: "tracking", label: "Tracking" },
  { id: "invoice", label: "Invoice" },
];

export default function OrderDrawer({
  order,
  onClose,
  onCancel,
  onReorder,
  isCancelling,
  isReordering,
}) {
  const [tab, setTab] = useState("items");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!order) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30, mass: 0.8 }}
        className="fixed top-0 right-0 bottom-0 z-[81] or-scroll overflow-y-auto flex flex-col"
        style={{
          width: "min(520px, 100vw)",
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(24px)",
          boxShadow: "-12px 0 60px rgba(0,0,0,0.15)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Order Details
            </p>
            <h2 className="font-black text-gray-900 text-lg">#{getOrderShortId(order, 12)}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={order.status} />
              <span className="text-gray-400 text-xs">
                {formatOrderDate(getOrderCreatedAt(order))}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-200 border border-transparent hover:border-red-200"
          >
            <Icons.Close c="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex gap-0 px-6 border-b border-gray-100">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`relative px-5 py-3.5 text-sm font-bold transition-colors ${
                tab === item.id ? "text-indigo-700" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {item.label}
              {tab === item.id ? (
                <motion.div
                  layoutId="drawer-tab-line"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-full"
                />
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex-1 px-6 py-6 space-y-5">
          <AnimatePresence mode="wait">
            {tab === "items" ? <OrderDrawerItems order={order} /> : null}
            {tab === "tracking" ? <OrderDrawerTracking order={order} /> : null}
            {tab === "invoice" ? <OrderDrawerInvoice order={order} /> : null}
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 py-4 space-y-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="sm:hidden w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors duration-200 border border-gray-200"
          >
            <Icons.Close c="w-4 h-4" />
            Close
          </button>

          <motion.button
            type="button"
            whileHover={{ scale: isReordering ? 1 : 1.02 }}
            whileTap={{ scale: isReordering ? 1 : 0.97 }}
            onClick={() => onReorder(order)}
            disabled={isReordering}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3.5 rounded-2xl text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-70"
          >
            {isReordering ? <Spinner className="w-4 h-4" /> : <Icons.Bag c="w-4 h-4" />}
            {isReordering ? "Adding Items..." : "Re-order These Items"}
          </motion.button>

          {canCancelOrder(order) ? (
            <motion.button
              type="button"
              whileHover={{ scale: isCancelling ? 1 : 1.02 }}
              whileTap={{ scale: isCancelling ? 1 : 0.97 }}
              onClick={() => onCancel(order.id)}
              disabled={isCancelling}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 font-bold py-3.5 rounded-2xl text-sm transition-all disabled:opacity-50"
            >
              {isCancelling ? <Spinner className="w-4 h-4" /> : <Icons.XCircle c="w-4 h-4" />}
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </motion.button>
          ) : null}
        </div>
      </motion.div>
    </>
  );
}
