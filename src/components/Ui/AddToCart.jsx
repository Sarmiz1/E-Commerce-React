import { AnimatePresence, motion as Motion } from "framer-motion";
import { BagIcon } from "../Icons/BagIcon";
import { CheckIcon } from "../Icons/CheckIcon";
import { IconSpinner } from "../Icons/IconSpinner";
import { useAddToCart } from "../../Hooks/cart/useAddToCart";

export default function AddToCart({
  productId,
  variantId,
  variant = "primary",
  quantity = 1,
  className = "",
}) {
  const safeQuantity = Math.max(Number(quantity) || 1, 1);
  const {
    handleAdd,
    loading,
    success,
    error,
  } = useAddToCart(productId, { variantId, quantity: safeQuantity });

  const variantName = variant === true ? "primary" : variant || "primary";
  const isIconOnly = variantName === "icon";

  const handleClick = (event) => {
    if (!productId) return;
    handleAdd(event, { variantId, quantity: safeQuantity });
  };

  const state = loading ? "loading" : success ? "success" : "idle";
  const variantClass = {
    primary:
      "w-full min-h-11 px-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] hover:shadow-[0_18px_38px_rgba(79,70,229,0.28)]",
    pill:
      "min-h-9 px-4 rounded-full bg-slate-950 text-white shadow-[0_10px_22px_rgba(15,23,42,0.16)] hover:bg-indigo-700",
    ghost:
      "min-h-9 px-4 rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md shadow-[0_10px_24px_rgba(0,0,0,0.22)] hover:bg-white/20",
    icon:
      "w-9 h-9 rounded-xl bg-slate-950 text-white shadow-[0_10px_22px_rgba(15,23,42,0.18)] hover:bg-indigo-700",
  }[variantName] || "";

  const stateClass = success
    ? "!bg-emerald-600 !text-white !shadow-[0_14px_30px_rgba(5,150,105,0.24)]"
    : loading
      ? "opacity-80 cursor-wait"
      : "";

  return (
    <div className="space-y-2">
      <Motion.button
        type="button"
        onClick={handleClick}
        disabled={loading}
        data-testid="add-to-cart-btn"
        data-state={state}
        whileHover={loading ? undefined : { y: -1 }}
        whileTap={{ scale: 0.95 }}
        className={`relative isolate inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-[11px] uppercase tracking-[0.16em] transition-all duration-300 disabled:pointer-events-none ${variantClass} ${stateClass} ${className}`}
        aria-label={
          success
            ? "Added to cart"
            : loading
              ? "Adding to cart"
              : "Add to cart"
        }
      >
        <span className="absolute inset-x-0 top-0 h-px bg-white/45" aria-hidden="true" />
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <Motion.span
              key="loading"
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <IconSpinner className="w-4 h-4" />
              {!isIconOnly && <span>Adding</span>}
            </Motion.span>
          ) : success ? (
            <Motion.span
              key="success"
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <CheckIcon />
              {!isIconOnly && <span>Added</span>}
            </Motion.span>
          ) : (
            <Motion.span
              key="idle"
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <BagIcon />
              {!isIconOnly && <span>Add to Bag</span>}
            </Motion.span>
          )}
        </AnimatePresence>
      </Motion.button>

      {error && (
        <p className="text-xs text-red-500">
          {error.message || "Failed to add item"}
        </p>
      )}
    </div>
  );
}
