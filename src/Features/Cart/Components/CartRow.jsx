import { useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { formatMoneyMinor } from "../../../utils/formatMoneyMinor";
import { Ic, Spinner } from "./CartConstants";
import { getCartItemLineTotalCents, getCartItemUnitPriceCents } from "../utils/cartItemUtils";

function MechanicalDigit({ value }) {
  return (
    <span className="relative inline-block overflow-hidden leading-none w-[1ch] text-center select-none">
      <span key={value} className="ct-flip-up">{value}</span>
    </span>
  );
}

function QtyStepperButton({ dir, onClick, disabled }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.82 }}
      transition={{ type: "spring", stiffness: 600, damping: 18 }}
      onClick={onClick}
      onPointerDown={(event) => event.stopPropagation()}
      disabled={disabled}
      className="flex h-8 w-8 select-none items-center justify-center rounded-xl text-base font-bold leading-none text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 sm:text-lg"
    >
      {dir === "plus" ? "+" : "-"}
    </motion.button>
  );
}

export function CartRow({
  item,
  index,
  onQtyChange,
  onRemove,
  onSaveLater,
  pendingQty,
  isRemoving,
  isSaving,
}) {
  const previousQuantityRef = useRef(item.quantity);
  const rowRef = useRef(null);
  const swipeDeletingRef = useRef(false);

  useEffect(() => {
    if (!rowRef.current || previousQuantityRef.current === item.quantity) return;
    rowRef.current.classList.remove("ct-highlight");
    void rowRef.current.offsetWidth;
    rowRef.current.classList.add("ct-highlight");
    previousQuantityRef.current = item.quantity;
  }, [item.quantity]);

  const price = getCartItemUnitPriceCents(item);
  const lineTotal = getCartItemLineTotalCents(item);

  const dragX = useMotionValue(0);
  const opacity = useTransform(dragX, [-120, 0], [0, 1]);
  const deleteOpacity = useTransform(dragX, [-120, -60], [1, 0]);

  const actionPending = pendingQty || isRemoving || isSaving;
  const handleDragEnd = useCallback((_, info) => {
    if (actionPending || swipeDeletingRef.current) return;

    const shouldRemove = info.offset.x < -96 || info.velocity.x < -650;
    if (shouldRemove) {
      swipeDeletingRef.current = true;
      dragX.set(-150);
      window.setTimeout(() => onRemove(item), 120);
      return;
    }

    dragX.set(0);
  }, [actionPending, dragX, item, onRemove]);

  useEffect(() => {
    if (isRemoving) return;
    swipeDeletingRef.current = false;
    dragX.set(0);
  }, [dragX, isRemoving, item.id]);

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
        drag={actionPending ? false : "x"}
        dragConstraints={{ left: -150, right: 0 }}
        dragDirectionLock
        dragElastic={{ left: 0.08, right: 0 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
        transition={{ delay: index * 0.06, duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        layout
        className="relative touch-pan-y cursor-grab rounded-3xl border border-gray-100/80 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md active:cursor-grabbing dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
      >
        <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-2.5 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-4">
          <Link
            to={`/products/${item.products?.slug || item.products?.id}`}
            onPointerDown={(event) => event.stopPropagation()}
            className="flex-shrink-0"
          >
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition-transform duration-300 hover:scale-105 dark:border-neutral-700 dark:bg-neutral-800 sm-min:h-20 sm-min:w-20 sm:h-24 sm:w-24">
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
            <Link
              to={`/products/${item.products?.slug || item.products?.id}`}
              onPointerDown={(event) => event.stopPropagation()}
            >
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
              {formatMoneyMinor(price)}
              <span className="text-gray-400 dark:text-neutral-500 text-xs font-normal ml-1">each</span>
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
              <div className="flex items-center bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl">
                <QtyStepperButton dir="minus" disabled={item.quantity <= 1 || pendingQty}
                  onClick={() => onQtyChange(item.id, item.quantity - 1)} />
                <div className="relative overflow-hidden w-7 text-center tabular-nums font-black text-sm text-gray-900 dark:text-white select-none">
                  {pendingQty ? <Spinner c="w-3 h-3 mx-auto" /> : (
                    <MechanicalDigit value={item.quantity} />
                  )}
                </div>
                <QtyStepperButton dir="plus" 
                  disabled={item.quantity >= 10 || pendingQty || (item.variant?.stock_quantity != null && item.quantity >= item.variant.stock_quantity)}
                  onClick={() => onQtyChange(item.id, item.quantity + 1)} />
              </div>

              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onSaveLater(item)}
                disabled={actionPending}
                className="flex items-center gap-1 text-gray-400 dark:text-neutral-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors text-xs font-semibold disabled:cursor-wait disabled:opacity-50">
                {isSaving ? <Spinner c="w-3.5 h-3.5" /> : <Ic.Heart c="w-3.5 h-3.5" />} Save
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

          <div className="col-span-2 flex items-center justify-between gap-2 pl-[4.625rem] sm:col-span-1 sm:flex-col sm:items-end sm:justify-start sm:gap-2 sm:pl-0">
            <p className="whitespace-nowrap text-xs font-black text-gray-900 dark:text-white sm-min:text-sm sm:text-base">{formatMoneyMinor(lineTotal)}</p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.12, color: "#ef4444" }}
              whileTap={{ scale: 0.9 }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onRemove(item)}
              disabled={actionPending}
              className="-m-2 p-2 text-gray-300 transition-colors hover:text-red-400 disabled:opacity-40"
            >
              {isRemoving ? <Spinner c="w-4 h-4" /> : <Ic.Trash c="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
