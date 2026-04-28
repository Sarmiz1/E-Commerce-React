import React, { useRef } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import gsap from 'gsap';
import { ErrorMessage } from '../../../../Components/ErrorMessage';
import {
  BagIcon, CheckIcon, SpinnerIcon,
} from './Icons';
import { useMagnetic } from '../Hooks/useMagnetic';
import { useAddToCart } from '../../../../Hooks/cart/useAddToCart';

const clampQuantity = (value) => Math.min(20, Math.max(1, Number(value) || 1));

export function AddToCartPanel({ productId, variantId, quantity = 1, onQuantityChange, atcRef }) {
  const btnRef = useRef(null);
  const safeQuantity = clampQuantity(quantity);

  const {
    handleAdd: triggerAdd,
    loading,
    success: done,
    error,
  } = useAddToCart(productId, { variantId, quantity: safeQuantity });

  useMagnetic(btnRef, 0.3);

  const setQuantity = (nextQuantity) => {
    onQuantityChange?.(clampQuantity(nextQuantity));
  };

  const handleAdd = (e) => {
    triggerAdd(e, { variantId, quantity: safeQuantity });

    if (btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { scale: 0.94 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1.1,0.5)" },
      );
    }
  };

  return (
    <div
      className="space-y-4 fixed bottom-0 left-0 w-full z-[100] px-5 py-4 bg-[var(--pd-overlay)] border-t border-[var(--pd-b5)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:static lg:p-0 lg:bg-transparent lg:shadow-none lg:border-none lg:w-auto"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      ref={atcRef}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>
            Quantity
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>
            Add {safeQuantity} to bag
          </p>
        </div>

        <div
          className="h-11 flex items-center rounded-xl overflow-hidden"
          style={{
            background: "var(--pd-s2)",
            border: "1px solid var(--pd-b3)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <button
            type="button"
            onClick={() => setQuantity(safeQuantity - 1)}
            disabled={safeQuantity <= 1 || loading}
            className="w-10 h-full flex items-center justify-center text-lg font-semibold disabled:opacity-35"
            style={{ color: "var(--platinum)" }}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max="20"
            value={safeQuantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={loading}
            className="w-12 h-full text-center bg-transparent outline-none text-sm font-bold tabular-nums"
            style={{ color: "var(--cream)", fontFamily: "Jost,sans-serif" }}
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={() => setQuantity(safeQuantity + 1)}
            disabled={safeQuantity >= 20 || loading}
            className="w-10 h-full flex items-center justify-center text-lg font-semibold disabled:opacity-35"
            style={{ color: "var(--platinum)" }}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <Motion.button
        ref={btnRef}
        onClick={handleAdd}
        disabled={loading}
        whileTap={{ scale: 0.97 }}
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
        }}
      >
        <AnimatePresence mode="wait">
          {done ? (
            <Motion.span key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex items-center gap-2">
              <CheckIcon />Added to Bag
            </Motion.span>
          ) : loading ? (
            <Motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <SpinnerIcon />Adding...
            </Motion.span>
          ) : (
            <Motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 uppercase text-xs">
              <BagIcon />Add {safeQuantity} to Bag
            </Motion.span>
          )}
        </AnimatePresence>
      </Motion.button>

      <ErrorMessage errorMessage={error?.message || error} />
    </div>
  );
}
