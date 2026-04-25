// src/Components/Ui/AddToCart.jsx
//
// ── Variants ──────────────────────────────────────────────────────────────────
//
//  "primary"   Full-width gradient button with loading / success states.
//              Default. Use inside full product cards on white backgrounds.
//
//  "outline"   Border-only button, transparent fill.
//              Use when the background is light-grey or you want a subtler CTA.
//
//  "ghost"     White-text borderless button.
//              Use on dark / glassmorphism cards (ghost, overlay variants).
//
//  "icon"      Circular icon-only button — no text.
//              Use in tight spaces: compact cards, overlay corners, list rows.
//
//  "pill"      Small rounded pill with "+  Cart" label.
//              Use inside horizontal / compact cards where full width is wrong.
//
// ── Usage ─────────────────────────────────────────────────────────────────────
//
//   <AddToCart productId={product.id} />                 // primary (default)
//   <AddToCart productId={product.id} variant="pill" />
//   <AddToCart productId={product.id} variant="icon" />
//
//  onClick is handled internally via useAddToCart.
//  The click event is forwarded to runFlyToCart automatically — no extra props.
//
// ── Bugs fixed from original ──────────────────────────────────────────────────
//  • handleAdd(e, productId) — productId was being passed as a 2nd argument to
//    a function that only accepts (event). The productId is already bound inside
//    useAddToCart(productId). Removed the spurious second argument.
//  • "minimal" and "pureBlue" variants had no loading/success feedback.
//  • Inconsistent class string construction — replaced with a clean variant map.

import { motion, AnimatePresence } from "framer-motion";
import { useAddToCart } from "../../Hooks/cart/useAddToCart";
import { ErrorMessage } from "../ErrorMessage";

// ── Inline SVG icons (no external icon lib dependency) ────────────────────────

function BagIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function SpinnerIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={`${className} animate-spin`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  );
}

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ── Variant style maps ────────────────────────────────────────────────────────
//
// Each variant has three states: idle | loading | success
// Defined here so the component body stays readable.

const VARIANT_STYLES = {
  primary: {
    base: "w-full flex items-center justify-center gap-2 font-black text-sm py-3 px-4 rounded-2xl transition-all duration-300 shadow-md",
    idle: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:shadow-lg",
    loading: "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none",
    success:
      "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25",
  },
  outline: {
    base: "w-full flex items-center justify-center gap-2 font-bold text-sm py-2.5 px-4 rounded-2xl transition-all duration-200 border-2",
    idle: "border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white",
    loading: "border-gray-300 text-gray-400 cursor-not-allowed",
    success: "border-emerald-500 bg-emerald-500 text-white",
  },
  ghost: {
    base: "w-full flex items-center justify-center gap-2 font-bold text-sm py-2.5 px-4 rounded-2xl transition-all duration-200 bg-white/15 border border-white/30 backdrop-blur-sm",
    idle: "text-white hover:bg-white/25",
    loading: "text-white/40 cursor-not-allowed",
    success: "bg-emerald-500/30 border-emerald-400/50 text-white",
  },
  icon: {
    base: "flex items-center justify-center rounded-full transition-all duration-200 shadow-md",
    idle: "w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:scale-110 hover:shadow-indigo-500/40 hover:shadow-lg",
    loading: "w-9 h-9 bg-gray-200 text-gray-400 cursor-not-allowed",
    success:
      "w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
  },
  pill: {
    base: "inline-flex items-center gap-1.5 font-bold text-xs py-1.5 px-3 rounded-full transition-all duration-200",
    idle: "bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-transparent",
    loading:
      "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
};

// ── Animated inner content ────────────────────────────────────────────────────

function ButtonContent({ variant, loading, success }) {
  const isIconOnly = variant === "icon";

  return (
    <AnimatePresence mode="wait">
      {success ? (
        <motion.span
          key="success"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="flex items-center gap-1.5"
        >
          <CheckIcon />
          {!isIconOnly && "Added!"}
        </motion.span>
      ) : loading ? (
        <motion.span
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5"
        >
          <SpinnerIcon />
          {!isIconOnly && "Adding…"}
        </motion.span>
      ) : (
        <motion.span
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5"
        >
          {variant === "pill" ? <PlusIcon /> : <BagIcon />}
          {!isIconOnly && (variant === "pill" ? "Add" : "Add to Cart")}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * AddToCart
 *
 * @param {string|number} productId   Required. The product to add.
 * @param {string}  [variantId]       Optional. Variant ID to add. Falls back to first variant.
 * @param {"primary"|"outline"|"ghost"|"icon"|"pill"} [variant="primary"]
 * @param {number}  [quantity=1]      Default quantity to add.
 * @param {string}  [className]       Extra Tailwind classes on the button.
 */
function AddToCart({
  productId,
  variantId,
  variant = "primary",
  quantity = 1,
  className = "",
}) {
  // useAddToCart handles: API call, cart sync, fly animation, state management
  const { handleAdd, loading, success, error } = useAddToCart(productId, {
    variantId,
    quantity,
  });

  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const state = loading ? "loading" : success ? "success" : "idle";

  return (
    <div
      className={
        variant === "primary" || variant === "outline" || variant === "ghost"
          ? "space-y-2"
          : ""
      }
    >
      <motion.button
        data-testid="add-to-cart-btn"
        onClick={handleAdd} // event is forwarded to runFlyToCart internally
        disabled={loading}
        whileTap={{ scale: 0.94 }}
        className={`${styles.base} ${styles[state]} ${className}`}
        aria-label={
          success ? "Added to cart" : loading ? "Adding to cart" : "Add to cart"
        }
      >
        <ButtonContent variant={variant} loading={loading} success={success} />
      </motion.button>

      {/* Only show error on full-width variants where there's room */}
      {(variant === "primary" ||
        variant === "outline" ||
        variant === "ghost") && <ErrorMessage errorMessage={error} />}
    </div>
  );
}

export default AddToCart;
