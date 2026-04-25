import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ErrorMessage } from '../../../../Components/ErrorMessage';
import {
  BagIcon, CheckIcon, SpinnerIcon,
} from './Icons';
import { useMagnetic } from '../Hooks/useMagnetic';
import { useAddToCart } from '../../../../Hooks/cart/useAddToCart';

// ─── AddToCartPanel ───────────────────────────────────────────────────────────
export function AddToCartPanel({ productId, variantId, atcRef }) {
  const btnRef = useRef(null);

  const {
    handleAdd: triggerAdd,
    loading,
    success: done,
    error,
  } = useAddToCart(productId, { variantId, quantity: 1 });

  useMagnetic(btnRef, 0.3);

  const handleAdd = (e) => {
    triggerAdd(e);
    // Elastic bounce on the button
    if (btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { scale: 0.94 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1.1,0.5)" }
      );
    }
  };

  return (
    <div
      className="space-y-4 fixed bottom-0 left-0 w-full z-[100] px-5 py-4 bg-[var(--pd-overlay)] border-t border-[var(--pd-b5)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:static lg:p-0 lg:bg-transparent lg:shadow-none lg:border-none lg:w-auto"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      ref={atcRef}
    >
      <motion.button ref={btnRef} onClick={handleAdd} disabled={loading} whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-semibold text-sm tracking-wider transition-all duration-400"
        style={{
          fontFamily: "Jost,sans-serif",
          letterSpacing: "0.12em",
          background: done
            ? "linear-gradient(135deg, #059669, #047857)"
            : loading ? "var(--pd-s2)"
              : "linear-gradient(135deg, #C9A96E 0%, #A8834A 100%)",
          color: done || !loading ? (done ? "#fff" : "#0A0A0B") : "var(--silver)",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: done ? "0 8px 28px rgba(5,150,105,0.28)"
            : loading ? "none"
              : "0 8px 28px rgba(201,169,110,0.22), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}>
        <AnimatePresence mode="wait">
          {done ? <motion.span key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex items-center gap-2"><CheckIcon />Added to Bag</motion.span>
            : loading ? <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><SpinnerIcon />Adding…</motion.span>
              : <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 uppercase text-xs"><BagIcon />Add to Bag</motion.span>}
        </AnimatePresence>
      </motion.button>

      <ErrorMessage errorMessage={error?.message || error} />
    </div>
  );
}