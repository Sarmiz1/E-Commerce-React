import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMoneyMinor } from "../../../utils/formatMoneyMinor";
import { Ic, Spinner } from "./CartConstants";

function PromoInput({ promo, onApply, onRemove }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = useCallback(async () => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError("Enter a promo code.");
      return;
    }

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

  const handleRemove = useCallback(async () => {
    setLoading(true);
    try {
      await onRemove();
      setError("");
    } catch (err) {
      setError(err.message || "Promo code could not be removed.");
    } finally {
      setLoading(false);
    }
  }, [onRemove]);

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-3">
        <Ic.Tag c="w-3.5 h-3.5" /> Promo Code
      </p>
      {promo ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Ic.Check c="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="flex-shrink-0 text-sm font-black text-emerald-700 dark:text-emerald-300">
              {promo.code}
            </span>
            <span className="truncate text-xs text-emerald-500 dark:text-emerald-500/80">
              - {promo.label}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="text-emerald-400 dark:text-emerald-500 hover:text-red-400 dark:hover:text-red-400 transition-colors disabled:cursor-wait disabled:opacity-50"
          >
            <Ic.Close c="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={code}
              maxLength={12}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(event) => event.key === "Enter" && handleApply()}
              placeholder="Enter code..."
              className="ct-input min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-900 transition-all duration-300 placeholder:font-normal placeholder:normal-case placeholder:tracking-normal dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:px-4"
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleApply}
              disabled={loading}
              className="flex justify-center rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500 sm:px-5"
            >
              {loading ? <Spinner c="w-4 h-4" /> : "Apply"}
            </motion.button>
          </div>
          <AnimatePresence>
            {error ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-xs font-semibold mt-2"
              >
                {error}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export function OrderSummary({
  subtotal,
  discount,
  shipping,
  total,
  itemCount,
  promo,
  onApplyPromo,
  onRemovePromo,
  onCheckout,
  isCheckingOut,
  checkoutError = "",
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900 sm:space-y-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">
        Order Summary
      </p>

      <div className="space-y-2.5">
        {[
          ["Subtotal", formatMoneyMinor(subtotal)],
          ...(discount > 0 ? [["Discount", `-${formatMoneyMinor(discount)}`, true]] : []),
          ["Shipping", shipping === 0 ? "Free" : formatMoneyMinor(shipping)],
        ].map(([label, value, green]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-neutral-400">{label}</span>
            <span
              className={`font-semibold ${
                green ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 flex justify-between items-baseline">
        <span className="text-gray-700 dark:text-neutral-300 font-bold">Total</span>
        <span className="ct-breathe text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
          {formatMoneyMinor(total)}
        </span>
      </div>

      <PromoInput promo={promo} onApply={onApplyPromo} onRemove={onRemovePromo} />

      <motion.button
        type="button"
        whileHover={{ scale: 1.02, boxShadow: "0 16px 40px rgba(79,70,229,0.3)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-black text-white shadow-md shadow-indigo-500/15 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4"
      >
        {isCheckingOut ? <Spinner /> : <Ic.Lock c="w-4 h-4" />}
        {isCheckingOut ? "Redirecting..." : `Checkout - ${formatMoneyMinor(total)}`}
      </motion.button>

      <AnimatePresence>
        {checkoutError ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-500 text-xs font-semibold"
          >
            {checkoutError}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-gray-400 dark:text-neutral-500 sm:gap-4">
        {["SSL Secure", "Free Returns", "Fast Delivery"].map((label) => (
          <span key={label} className="font-medium">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
