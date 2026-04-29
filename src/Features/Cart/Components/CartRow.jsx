import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { Ic, Spinner } from "./CartConstants";

function MechanicalDigit({ value, prevValue }) {
  const dir = value > prevValue ? "up" : "down";
  const cls = dir === "up" ? "ct-flip-up" : "ct-flip-down";
  return (
    <span className="relative inline-block overflow-hidden leading-none w-[1ch] text-center select-none">
      <span key={value} className={cls}>{value}</span>
    </span>
  );
}

function QtyStepperButton({ dir, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.82 }}
      transition={{ type: "spring", stiffness: 600, damping: 18 }}
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg leading-none select-none"
    >
      {dir === "plus" ? "+" : "−"}
    </motion.button>
  );
}

export function CartRow({ item, index, onQtyChange, onRemove, onSaveLater, pendingQty, isRemoving }) {
  const [prevQty, setPrevQty] = useState(item.quantity);
  const rowRef = useRef(null);

  useEffect(() => {
    if (!rowRef.current || prevQty === item.quantity) return;
    rowRef.current.classList.remove("ct-highlight");
    void rowRef.current.offsetWidth;
    rowRef.current.classList.add("ct-highlight");
    setPrevQty(item.quantity);
  }, [item.quantity, prevQty]);

  const price = item?.products?.price_cents || 0;
  const lineTotal = price * item.quantity;

  const dragX = useMotionValue(0);
  const opacity = useTransform(dragX, [-120, 0], [0, 1]);
  const deleteOpacity = useTransform(dragX, [-120, -60], [1, 0]);

  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.x < -100) onRemove(item);
  }, [item, onRemove]);

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <motion.div style={{ opacity: deleteOpacity }}
        className="absolute inset-0 bg-red-50 dark:bg-red-950/20 rounded-3xl flex items-center justify-end pr-6 pointer-events-none">
        <div className="flex flex-col items-center gap-1 text-red-400 dark:text-red-500">
          <Ic.Trash c="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider">Remove</span>
        </div>
      </motion.div>

      <motion.div
        ref={rowRef}
        style={{ x: dragX, opacity }}
        drag="x" dragConstraints={{ left: -150, right: 0 }}
        dragElastic={{ left: 0.2, right: 0 }}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
        transition={{ delay: index * 0.06, duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        layout
        className="relative bg-white dark:bg-neutral-900 border border-gray-100/80 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing"
      >
        <div className="flex gap-4 items-start">
          <Link to={`/products/${item.products?.slug || item.products?.id}`} className="flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 hover:scale-105 transition-transform duration-300">
              {item.products?.image && (
                <motion.img 
                  layoutId={`product-image-${item.products?.id}`}
                  src={item.products.image} alt={item.products.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/200x200?text=No+Image";
                  }}
                  className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link to={`/products/${item.products?.slug || item.products?.id}`}>
              <motion.p 
                layoutId={`product-title-${item.products?.id}`}
                className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
              >
                {item.products?.name || "Product"}
              </motion.p>
            </Link>

            {item.products?.rating_stars > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className={`w-3 h-3 ${i < Math.floor(item.products.rating_stars) ? "text-yellow-400" : "text-gray-200 dark:text-neutral-700"}`}
                    fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
                <span className="text-gray-400 dark:text-neutral-500 text-[10px] ml-0.5">({item.products.rating_count})</span>
              </div>
            )}

            <p className="text-indigo-600 dark:text-indigo-400 font-black text-base mt-2">
              {formatMoneyCents(price)}
              <span className="text-gray-400 dark:text-neutral-500 text-xs font-normal ml-1">each</span>
            </p>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl">
                <QtyStepperButton dir="minus" disabled={item.quantity <= 1 || pendingQty}
                  onClick={() => onQtyChange(item.id, item.quantity - 1)} />
                <div className="relative overflow-hidden w-7 text-center tabular-nums font-black text-sm text-gray-900 dark:text-white select-none">
                  {pendingQty ? <Spinner c="w-3 h-3 mx-auto" /> : (
                    <MechanicalDigit value={item.quantity} prevValue={prevQty} />
                  )}
                </div>
                <QtyStepperButton dir="plus" 
                  disabled={item.quantity >= 10 || pendingQty || (item.variant?.stock_quantity != null && item.quantity >= item.variant.stock_quantity)}
                  onClick={() => onQtyChange(item.id, item.quantity + 1)} />
              </div>

              <button onClick={() => onSaveLater(item)}
                className="flex items-center gap-1 text-gray-400 dark:text-neutral-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors text-xs font-semibold">
                <Ic.Heart c="w-3.5 h-3.5" /> Save
              </button>
            </div>

            {item.variant?.stock_quantity > 0 && item.variant?.stock_quantity <= 5 && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-md text-[11px] font-bold text-amber-700 dark:text-amber-400 overflow-hidden"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Only {item.variant.stock_quantity} remaining in stock
              </motion.div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <p className="font-black text-gray-900 dark:text-white text-base">{formatMoneyCents(lineTotal)}</p>
            <motion.button
              whileHover={{ scale: 1.12, color: "#ef4444" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(item)}
              disabled={isRemoving}
              className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              {isRemoving ? <Spinner c="w-4 h-4" /> : <Ic.Trash c="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
