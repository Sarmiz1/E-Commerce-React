import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { formatMoneyCents } from '../../../../Utils/formatMoneyCents';
import { IconSpinner } from '../../../../Components/Icons/IconSpinner';
import ProductCard from '../../../../Components/Ui/ProductCard';
import { ErrorMessage } from '../../../../Components/ErrorMessage';
import { 
  BagIcon, HeartIcon, ShareIcon, ChevronLeft, ChevronRight, 
  CheckIcon, SpinnerIcon, ShieldIcon, TruckIcon, RefreshIcon, 
  BellIcon, CloseIcon, LockIcon 
} from './Icons';

import { useAddToCart } from '../../../../Hooks/cart/useAddToCart';


// ─── StickyATCBar ─────────────────────────────────────────────────────────────
export function StickyATCBar({ product, productId, variantId, visible }) {
  const [dismissed, setDismissed] = useState(false);

  const {
    handleAdd,
    loading,
    success: done,
  } = useAddToCart(productId, { variantId, quantity: 1 });

  useEffect(() => { if (!visible) setDismissed(false); }, [visible]);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-[60]"
          style={{ background: "var(--pd-overlay)", backdropFilter: "blur(20px) saturate(1.8)", borderTop: "1px solid var(--pd-b5)", paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
          <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--pd-b5)" }}>
              <img src={product.image} alt="" className="w-full h-full object-cover"
                onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=?"; }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium line-clamp-1" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>{product.name}</p>
              <p className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "Cormorant Garamond,serif" }}>{formatMoneyCents(product.price_cents)}</p>
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleAdd} disabled={loading}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider"
              style={{ fontFamily: "Jost,sans-serif", background: done ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#C9A96E,#A8834A)", color: done ? "#fff" : "var(--obsidian)", boxShadow: "0 4px 14px rgba(201,169,110,0.2)" }}>
              {done ? <><CheckIcon className="w-3.5 h-3.5" />Added!</> : loading ? <SpinnerIcon className="w-3.5 h-3.5" /> : <><BagIcon className="w-3.5 h-3.5" />Add to Bag</>}
            </motion.button>
            <button onClick={() => setDismissed(true)} className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ color: "var(--mist)", background: "var(--pd-s2)" }}>
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}