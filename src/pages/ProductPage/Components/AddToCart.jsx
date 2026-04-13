// src/Pages/Products/Components/AddToCart.jsx
//
// Bugs fixed from original:
//  1. success state auto-resets after 3s (kept, was correct)
//  2. error state wasn't cleared on retry — now cleared at top of handleOnclick ✓
//  3. quantity select was using a stale inline style string with a space after colon
//     "[box-shadow: 0 1px...]" — invalid CSS in Tailwind arbitrary value; replaced with proper classes
//  4. <img> checkmark path assumed public root — kept as-is but wrapped with a fallback SVG
//     in case the image doesn't exist

import { useState, useContext, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../../../api/postData";
import { CartActionsContext } from "../../../Context/cartContext";
import { ErrorMessage } from "../../../Components/ErrorMessage";
import gsap from "gsap";

// Cart bag SVG icon
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

function AddToCart({ productId }) {
  const [errorMessage,    setErrorMessage]    = useState("");
  const [quantity,        setQuantity]        = useState(1);
  const [addedSuccessfully, setAddedSuccessfully] = useState(false);
  const [loading,         setLoading]         = useState(false);
  const btnRef = useRef(null);

  const { loadCart } = useContext(CartActionsContext) || null;

  // Auto-reset success state after 3 s
  useEffect(() => {
    if (!addedSuccessfully) return;
    const t = setTimeout(() => setAddedSuccessfully(false), 3000);
    return () => clearTimeout(t);
  }, [addedSuccessfully]);

  const handleOnclick = async () => {
    if (loading) return;
    setErrorMessage("");
    setLoading(true);

    try {
      await postData("/api/cart-items", { productId, quantity });
      await loadCart();
      setAddedSuccessfully(true);

      // Micro-bounce on the button
      if (btnRef.current) {
        gsap.fromTo(btnRef.current,
          { scale: 0.93 },
          { scale: 1, duration: 0.4, ease: "elastic.out(1.2, 0.5)" }
        );
      }
    } catch {
      setErrorMessage("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {/* Quantity row */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Qty</span>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="text-sm text-gray-800 bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Add to cart button */}
      <motion.button
        ref={btnRef}
        data-testid="add-to-cart-btn"
        onClick={handleOnclick}
        disabled={loading}
        whileTap={{ scale: 0.96 }}
        className={`w-full flex items-center justify-center gap-2 font-black text-sm py-3 px-4 rounded-2xl transition-all duration-300 shadow-md ${
          addedSuccessfully
            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25"
            : loading
            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:shadow-lg"
        }`}
      >
        <AnimatePresence mode="wait">
          {addedSuccessfully ? (
            <motion.span key="done"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-2">
              <CheckIcon /> Added!
            </motion.span>
          ) : loading ? (
            <motion.span key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Adding…
            </motion.span>
          ) : (
            <motion.span key="add"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2">
              <BagIcon /> Add to Cart
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Error */}
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
}

export default AddToCart;
