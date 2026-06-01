import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../../Store/useThemeStore";
import { useBuyer } from "../context/BuyerContext";
import { useBuyerOrders } from "../hooks/useBuyerQueries";
import { formatMoneyMinor } from "../../../utils/formatMoneyMinor";
import { BIcon } from "./BuyerIcon";
import { OrderStatusBadge, OrderTimeline } from "./BuyerOverview";
import BuyerReorderSuggestions from "./BuyerReorderSuggestions";

const FILTERS = ["all", "pending", "shipped", "delivered", "cancelled"];

const makeReceiptText = (receipt) => [
  `Receipt ${receipt.receiptNumber}`,
  `Order: ${receipt.orderNumber}`,
  `Paid: ${new Date(receipt.paidAt).toLocaleString()}`,
  "",
  ...(receipt.items || []).map((item) =>
    `${item.name}${item.variant ? ` (${item.variant})` : ""} x${item.quantity} - ${formatMoneyMinor(item.totalMinor)}`,
  ),
  "",
  `Subtotal: ${formatMoneyMinor(receipt.subtotalMinor)}`,
  `Discount: ${formatMoneyMinor(receipt.discountMinor)}`,
  `Shipping: ${formatMoneyMinor(receipt.shippingMinor)}`,
  `Total: ${formatMoneyMinor(receipt.totalMinor)}`,
].join("\n");

export default function BuyerOrders() {
  const { colors, isDark } = useTheme();
  const { addProductsToCart, getReceipt } = useBuyer();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [reordered, setReordered] = useState({});
  const [receiptLoading, setReceiptLoading] = useState({});
  const { data, isLoading, isFetching, error, refetch } = useBuyerOrders(page, filter);
  const orders = data?.items || [];
  const pageCount = data?.pageCount || 1;
  const total = data?.total || 0;

  const handleReorder = async (order) => {
    setReordered((current) => ({ ...current, [order.id]: "loading" }));
    const result = await addProductsToCart(order.order_items || []);
    setReordered((current) => ({ ...current, [order.id]: result?.success ? "done" : null }));
    if (result?.success) {
      setTimeout(() => setReordered((current) => ({ ...current, [order.id]: null })), 1800);
    }
  };

  const downloadReceipt = async (order) => {
    setReceiptLoading((current) => ({ ...current, [order.id]: true }));
    try {
      const receipt = await getReceipt(order.id);
      const url = URL.createObjectURL(new Blob([makeReceiptText(receipt)], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${receipt.receiptNumber}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // The provider shows the backend receipt error as a toast.
    } finally {
      setReceiptLoading((current) => ({ ...current, [order.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>My Orders</h2>
        <span className="text-xs font-bold" style={{ color: colors.text.tertiary }}>{total} orders</span>
      </div>

      <BuyerReorderSuggestions />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map((status) => (
          <motion.button key={status} onClick={() => { setFilter(status); setPage(1); setExpanded(null); }} whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap capitalize"
            style={filter === status
              ? { background: "linear-gradient(135deg,#667eea,#764ba2)", color: "#fff" }
              : { background: isDark ? colors.surface.tertiary : "#F3F4F6", color: colors.text.secondary }}>
            {status}
          </motion.button>
        ))}
      </div>

      <div className="space-y-4">
        {error ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>Orders could not be loaded.</p>
            <button type="button" onClick={() => refetch()} className="mt-3 text-xs font-bold" style={{ color: "#667eea" }}>Try again</button>
          </div>
        ) : isLoading ? (
          <p className="py-16 text-center text-sm font-semibold" style={{ color: colors.text.tertiary }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <BIcon name="package" size={36} style={{ color: colors.text.tertiary, opacity: 0.35 }} />
            <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>No orders here</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {orders.map((order, index) => {
              const isExpanded = expanded === order.id;
              const productName = order.order_items?.[0]?.product_name || order.order_items?.[0]?.products?.name || "Order";
              return (
                <motion.div key={order.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: index * 0.04 }}
                  className="rounded-2xl overflow-hidden shadow-sm"
                  style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
                  <button type="button" onClick={() => setExpanded(isExpanded ? null : order.id)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isDark ? colors.surface.tertiary : "#F3F4F6" }}>
                      <BIcon name="package" size={20} style={{ color: "#667eea" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{productName}</p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs font-mono" style={{ color: colors.text.tertiary }}>{order.order_number || order.id}</span>
                        <span className="text-sm font-black" style={{ color: colors.text.primary }}>{formatMoneyMinor(order.total_minor)}</span>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                      <BIcon name="chevron-down" size={18} style={{ color: colors.text.tertiary }} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 pb-5 space-y-4"
                        style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
                        <div className="pt-5">
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-4" style={{ color: colors.text.tertiary }}>Order progress</p>
                          <OrderTimeline steps={order.timeline || []} currentStep={order.currentStep || 0} />
                        </div>
                        <div className="rounded-xl p-3" style={{ background: isDark ? colors.surface.tertiary : "#F9FAFB" }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Payment</p>
                          <p className="mt-1 text-xs font-bold capitalize" style={{ color: order.payment_status === "paid" ? "#059669" : "#f59e0b" }}>
                            {order.payment_status || "unpaid"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(order.status === "delivered" || order.status === "shipped") && (
                            <button type="button" onClick={() => handleReorder(order)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                              style={{ background: isDark ? colors.surface.tertiary : "#F3F4F6", color: colors.text.secondary }}>
                              <BIcon name={reordered[order.id] === "done" ? "check" : "repeat"} size={13} />
                              {reordered[order.id] === "loading" ? "Adding..." : reordered[order.id] === "done" ? "Added to cart" : "Buy again"}
                            </button>
                          )}
                          {order.payment_status === "paid" && (
                            <button type="button" onClick={() => downloadReceipt(order)} disabled={receiptLoading[order.id]}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                              style={{ background: isDark ? colors.surface.tertiary : "#F3F4F6", color: colors.text.secondary }}>
                              <BIcon name="download" size={13} /> {receiptLoading[order.id] ? "Preparing..." : "Receipt"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={page === 1 || isFetching} className="rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-40"
            style={{ background: isDark ? colors.surface.tertiary : "#F3F4F6", color: colors.text.secondary }}>Previous</button>
          <span className="text-xs font-semibold" style={{ color: colors.text.tertiary }}>Page {page} of {pageCount}</span>
          <button type="button" onClick={() => setPage((current) => Math.min(current + 1, pageCount))}
            disabled={page === pageCount || isFetching} className="rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-40"
            style={{ background: isDark ? colors.surface.tertiary : "#F3F4F6", color: colors.text.secondary }}>Next</button>
        </div>
      )}
    </div>
  );
}
