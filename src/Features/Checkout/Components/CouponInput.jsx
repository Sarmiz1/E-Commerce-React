import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VALID_COUPONS } from "../Utils/checkoutConstants";
import { Icon } from "./CheckoutIcons";

export function CouponInput({ onApply, appliedCoupon }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");

  const handleApply = () => {
    if (!code.trim()) return;

    setStatus("checking");
    setTimeout(() => {
      const normalizedCode = code.trim().toUpperCase();
      const found = VALID_COUPONS[normalizedCode];

      if (found) {
        setStatus("valid");
        onApply(found, normalizedCode);
        return;
      }

      setStatus("invalid");
    }, 600);
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
        <Icon.Tag className="h-4 w-4 flex-shrink-0 text-emerald-600" />
        <span className="flex-1 text-sm font-bold text-emerald-700">{appliedCoupon.label} applied!</span>
        <button type="button" onClick={() => onApply(null, "")} className="text-xs font-bold text-emerald-500 transition hover:text-red-500">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setStatus("idle");
          }}
          onKeyDown={(event) => event.key === "Enter" && handleApply()}
          placeholder="Coupon code"
          className="co-input flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-mono text-sm tracking-widest"
        />
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleApply}
          disabled={status === "checking"}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 disabled:opacity-60"
        >
          {status === "checking" ? <Icon.Spin className="h-4 w-4 animate-spin" /> : "Apply"}
        </motion.button>
      </div>

      <AnimatePresence>
        {status === "invalid" && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
            <Icon.Info className="h-3.5 w-3.5" /> Invalid coupon code. Try: SAVE10, WELCOME20, FREESHIP
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
