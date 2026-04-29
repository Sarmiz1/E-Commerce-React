import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { Ic, Spinner } from "./CartConstants";

function PromoInput({ promo, onApply, onRemove }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = useCallback(async () => {
    const clean = code.trim().toUpperCase();
    if (!clean) { setError("Enter a promo code."); return; }
    setLoading(true);
    try {
      await onApply(clean);
      setError("");
      setCode("");
    } catch (err) {
      setError(err.message || "Invalid promo code.");
    } finally {
      setLoading(false);
    }
  }, [code, onApply]);

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-3">
        <Ic.Tag c="w-3.5 h-3.5" /> Promo Code
      </p>
      {promo ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Ic.Check c="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-300 font-black text-sm">{promo.code}</span>
            <span className="text-emerald-500 dark:text-emerald-500/80 text-xs">— {promo.label}</span>
          </div>
          <button onClick={onRemove} className="text-emerald-400 dark:text-emerald-500 hover:text-red-400 dark:hover:text-red-400 transition-colors">
            <Ic.Close c="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text" value={code} maxLength={12}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder="Enter code…"
              className="ct-input flex-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider placeholder:normal-case placeholder:font-normal placeholder:tracking-normal transition-all duration-300"
            />
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleApply} disabled={loading}
              className="bg-gray-900 dark:bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-black hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors disabled:opacity-50">
              {loading ? <Spinner c="w-4 h-4" /> : "Apply"}
            </motion.button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-red-500 text-xs font-semibold mt-2">{error}</motion.p>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export function OrderSummary({ subtotal, discount, shipping, total, itemCount, promo, onApplyPromo, onRemovePromo, onCheckout, isCheckingOut }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6 space-y-5 transition-colors duration-300">
      <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Order Summary</p>

      <div className="space-y-2.5">
        {[
          ["Subtotal", formatMoneyCents(subtotal)],
          ...(discount > 0 ? [["Discount", `-${formatMoneyCents(discount)}`, true]] : []),
          ["Shipping", shipping === 0 ? "Free 🎉" : formatMoneyCents(shipping)],
        ].map(([k, v, green]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-neutral-400">{k}</span>
            <span className={`font-semibold ${green ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>{v}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 flex justify-between items-baseline">
        <span className="text-gray-700 dark:text-neutral-300 font-bold">Total</span>
        <span className="text-3xl font-black text-gray-900 dark:text-white ct-breathe">{formatMoneyCents(total)}</span>
      </div>

      <PromoInput promo={promo} onApply={onApplyPromo} onRemove={onRemovePromo} />

      <motion.button
        whileHover={{ scale: 1.02, boxShadow: "0 16px 40px rgba(79,70,229,0.3)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isCheckingOut ? <Spinner /> : <Ic.Lock c="w-4 h-4" />}
        {isCheckingOut ? "Redirecting…" : `Checkout — ${formatMoneyCents(total)}`}
      </motion.button>

      <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 dark:text-neutral-500 flex-wrap">
        {["🔒 SSL Secure", "↩️ Free Returns", "🚀 Fast Delivery"].map((t) => (
          <span key={t} className="font-medium">{t}</span>
        ))}
      </div>
    </div>
  );
}
