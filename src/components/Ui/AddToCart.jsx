// src/Pages/Products/Components/AddToCart.jsx
//
// Uses the shared useAddToCart hook which handles:
//   - POST /api/cart-items
//   - loadCart() context sync
//   - fly-to-cart animation (fires instantly, before the API resolves)
//   - loading / success / error state
//
// Pass the click event to handleAdd so the animation can find the product image.

import { motion, AnimatePresence } from "framer-motion";
import { useAddToCart } from "../../Hooks/useAddCart"; 
import { ErrorMessage } from "../ErrorMessage"; 

// ── Icons ─────────────────────────────────────────────────────────────────────
const BagIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const SpinIcon = () => (
  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
function AddToCart({ productId }) {
  const { handleAdd, loading, success, error } = useAddToCart(productId);

  return (
    <div className="mt-3 space-y-2">
      {/* Add to cart button — pass the click event for fly animation */}
      <motion.button
        data-testid="add-to-cart-btn"
        onClick={handleAdd}
        disabled={loading}
        whileTap={{ scale: 0.96 }}
        className={`w-full flex items-center justify-center gap-2 font-black text-sm py-3 px-4 rounded-2xl transition-all duration-300 shadow-md ${success
            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25"
            : loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:shadow-lg"
          }`}
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.span key="done"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-2">
              <CheckIcon /> Added!
            </motion.span>
          ) : loading ? (
            <motion.span key="spin"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2">
              <SpinIcon /> Adding…
            </motion.span>
          ) : (
            <motion.span key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2">
              <BagIcon /> Add to Cart
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <ErrorMessage errorMessage={error} />
    </div>
  );
}

export default AddToCart;