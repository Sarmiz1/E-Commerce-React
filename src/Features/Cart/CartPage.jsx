// src/Pages/Cart/CartPage.jsx
//
// ── API ─────────────────────────────────────────────────────────────────────
//   GET    /api/cart-items           → array of cart items
//   PATCH  /api/cart-items/:id       → { quantity } → update qty
//   DELETE /api/cart-items/:id       → remove item
//   GET    /api/products?limit=6     → recommendations
//
// ── Smart features ───────────────────────────────────────────────────────────
//   • Optimistic quantity updates (local state first, API sync in background)
//   • Undo-remove (5-second toast window before item is truly gone)
//   • Promo code (SAVE10 / WELCOME20 / FREESHIP / FLAT5)
//   • Saved-for-later list (client-side, persists in component state)
//   • Free shipping threshold progress bar
//   • Upsell row pulled from /api/products
//   • Order notes text field
//   • Smart "You might have forgotten" — surfaces saved items when cart is empty
//   • Mobile sticky checkout bar slides up from bottom
//   • Keyboard shortcut: Delete key removes focused item
//
// ── Animation system (ct- prefix — never used elsewhere) ─────────────────────
//   ct-clip-wipe     clip-path left→right reveal (unique in this project)
//   ct-swipe-out     item exits via x-translate + height collapse
//   ct-digit-flip    qty digit rolls up/down like a mechanical counter
//   ct-ticker        savings marquee crawl
//   ct-breathe       cart total gentle scale pulse
//   ct-shimmer-gold  gold gradient shimmer on savings text
//   ct-bar-fill      CSS width transition on free-shipping bar
//   ct-sticky-rise   mobile bar slides from below viewport
//   ct-row-highlight flash highlight on updated row
//   ct-bubble-pop    qty badge spring pop
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform
} from "framer-motion";
import { useNavigate, Link, useLoaderData } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCartState, useCartActions } from "../../Context/cart/CartContext";
import useShowErrorBoundary from "../../Hooks/useShowErrorBoundary";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import ProductCard from "../../Components/Ui/ProductCard";


gsap.registerPlugin(ScrollTrigger);

// ─── Page-scoped keyframes (ct-) ─────────────────────────────────────────────
const CT_STYLES = `
  /* Clip-path wipe: left → right */
  @keyframes ct-clip-wipe{
    from{clip-path:inset(0 100% 0 0)}
    to  {clip-path:inset(0 0%   0 0)}
  }
  .ct-clip-wipe{clip-path:inset(0 100% 0 0);animation:ct-clip-wipe .55s cubic-bezier(.4,0,.2,1) forwards}

  /* Digit-flip (mechanical counter) */
  @keyframes ct-flip-up  {from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes ct-flip-down{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
  .ct-flip-up  {animation:ct-flip-up   .22s ease-out forwards}
  .ct-flip-down{animation:ct-flip-down .22s ease-out forwards}

  /* Savings shimmer (gold) */
  @keyframes ct-shimmer-gold{
    0%{background-position:-200% center}
    100%{background-position:200% center}
  }
  .ct-shimmer-gold{
    background:linear-gradient(90deg,#d97706 0%,#fbbf24 30%,#f59e0b 60%,#fcd34d 90%);
    background-size:200% auto;
    -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
    animation:ct-shimmer-gold 2.8s linear infinite;
  }

  /* Total breathe */
  @keyframes ct-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.018)}}
  .ct-breathe{animation:ct-breathe 3.5s ease-in-out infinite}

  /* Savings ticker tape */
  @keyframes ct-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .ct-ticker{animation:ct-ticker 22s linear infinite}
  .ct-ticker:hover{animation-play-state:paused}

  /* Row highlight flash */
  @keyframes ct-highlight{
    0%  {background:rgba(99,102,241,.12)}
    100%{background:transparent}
  }
  .ct-highlight{animation:ct-highlight .6s ease-out forwards}

  /* Bubble pop */
  @keyframes ct-pop{0%{transform:scale(1)}40%{transform:scale(1.55)}70%{transform:scale(.88)}100%{transform:scale(1)}}
  .ct-pop{animation:ct-pop .38s cubic-bezier(.36,.07,.19,.97)}

  /* Mobile sticky bar rise */
  @keyframes ct-sticky-rise{from{transform:translateY(100%)}to{transform:translateY(0)}}
  .ct-sticky-rise{animation:ct-sticky-rise .32s cubic-bezier(.32,.72,0,1) forwards}

  /* Spinner */
  @keyframes ct-spin{to{transform:rotate(360deg)}}
  .ct-spin{animation:ct-spin .7s linear infinite}

  /* Input focus glow */
  .ct-input:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12)}

  /* No scrollbar */
  .ct-no-scroll::-webkit-scrollbar{display:none}
  .ct-no-scroll{-ms-overflow-style:none;scrollbar-width:none}
`;

// ─── Promo codes ──────────────────────────────────────────────────────────────
const PROMOS = {
  SAVE10: { type: "percent", value: 10, label: "10% off everything" },
  WELCOME20: { type: "percent", value: 20, label: "20% off — welcome gift" },
  FREESHIP: { type: "shipping", value: 0, label: "Free shipping" },
  FLAT5: { type: "fixed", value: 500, label: "$5 off" },
};

// ─── Shipping & threshold ─────────────────────────────────────────────────────
const SHIPPING_COST = 499;   // cents ($4.99)
const FREE_SHIP_THRESHOLD = 5000;  // cents ($50)

// ─── SVG icons ────────────────────────────────────────────────────────────────
const Ic = {
  Trash: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>,
  Heart: ({ c = "w-4 h-4", filled = false }) => <svg className={c} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
  Bag: ({ c = "w-5 h-5" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>,
  Tag: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  Truck: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  Lock: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  Check: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>,
  Close: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>,
  Undo: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" /></svg>,
  Star: ({ c = "w-4 h-4" }) => <svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  Chev: ({ dir = "right", c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{dir === "right" ? <path d="M9 18l6-6-6-6" /> : dir === "down" ? <path d="M6 9l6 6 6-6" /> : <path d="M15 18l-6-6 6-6" />}</svg>,
  Gift: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></svg>,
  Notes: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  Arrow: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
};

const Spinner = ({ c = "w-4 h-4" }) => (
  <svg className={`${c} ct-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ─── Mechanical digit counter ──────────────────────────────────────────────────
// Shows a digit that flips up or down when value changes — like a departure board.
function MechanicalDigit({ value, prevValue }) {
  const dir = value > prevValue ? "up" : "down";
  const cls = dir === "up" ? "ct-flip-up" : "ct-flip-down";
  const keyRef = useRef(0);
  keyRef.current++;
  return (
    <span className="relative inline-block overflow-hidden leading-none w-[1ch] text-center select-none">
      <span key={keyRef.current} className={cls}>{value}</span>
    </span>
  );
}

// ─── Quantity stepper with spring physics ─────────────────────────────────────
function QtyStepperButton({ dir, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.82 }}
      transition={{ type: "spring", stiffness: 600, damping: 18 }}
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg leading-none select-none"
    >
      {dir === "plus" ? "+" : "−"}
    </motion.button>
  );
}

// ─── Undo-remove toast ────────────────────────────────────────────────────────
// Floats above the page for UNDO_DURATION ms with a shrinking progress bar.
const UNDO_DURATION = 5000;
function UndoToast({ item, onUndo, onExpire }) {
  const [progress, setProgress] = useState(100);
  const start = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - start.current;
      const pct = Math.max(0, 100 - (elapsed / UNDO_DURATION) * 100);
      setProgress(pct);
      if (pct === 0) { clearInterval(id); onExpire(); }
    }, 40);
    return () => clearInterval(id);
  }, [onExpire]);

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99] flex items-center gap-4 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl min-w-[280px] max-w-[360px]"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">Removed "{item?.name}"</p>
        <div className="h-0.5 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-indigo-400 rounded-full transition-none" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        onClick={onUndo}
        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-3 py-2 rounded-xl flex-shrink-0 transition-colors"
      >
        <Ic.Undo c="w-3 h-3" /> Undo
      </motion.button>
    </motion.div>
  );
}

// ─── Savings ticker tape ──────────────────────────────────────────────────────
// A gold marquee strip announcing the user's current savings.
function SavingsTicker({ savings }) {
  if (savings <= 0) return null;
  const msg = `🎉 You're saving ${formatMoneyCents(savings)} on this order`;
  const doubled = Array(12).fill(msg).join("  ·  ");
  return (
    <div className="overflow-hidden bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-y border-amber-200/60 py-2.5">
      <div className="flex whitespace-nowrap ct-ticker">
        <span className="text-amber-700 text-xs font-bold tracking-wide px-4">{doubled}</span>
        <span className="text-amber-700 text-xs font-bold tracking-wide px-4">{doubled}</span>
      </div>
    </div>
  );
}

// ─── Free-shipping progress bar ───────────────────────────────────────────────
function FreeShippingBar({ subtotal, discount }) {
  const effective = subtotal - discount;
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - effective);
  const pct = Math.min(100, (effective / FREE_SHIP_THRESHOLD) * 100);
  const isFree = remaining === 0;

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Ic.Truck c="w-4 h-4 text-blue-500" />
          <span className="text-sm font-bold text-blue-800">
            {isFree ? "🎉 Free shipping unlocked!" : `Add ${formatMoneyCents(remaining)} for free shipping`}
          </span>
        </div>
        <span className="text-xs text-blue-500 font-bold">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "power3.out" }}
        />
      </div>
    </div>
  );
}

// ─── Single cart row ──────────────────────────────────────────────────────────
function CartRow({ item,
  index,
  onQtyChange,
  onRemove,
  onSaveLater,
  pendingQty,
  isRemoving }) {
  const [prevQty, setPrevQty] = useState(item.quantity);
  const rowRef = useRef(null);

  // Flash highlight when quantity changes
  useEffect(() => {
    if (!rowRef.current || prevQty === item.quantity) return;
    rowRef.current.classList.remove("ct-highlight");
    void rowRef.current.offsetWidth; // reflow
    rowRef.current.classList.add("ct-highlight");
    setPrevQty(item.quantity);
  }, [item.quantity, prevQty]);

  const price = item?.products?.price_cents || 0;
  const lineTotal = price * item.quantity;

  // Swipe-to-delete gesture via drag
  const dragX = useMotionValue(0);
  const opacity = useTransform(dragX, [-120, 0], [0, 1]);
  const deleteOpacity = useTransform(dragX, [-120, -60], [1, 0]);

  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.x < -100) onRemove(item.id, item.product?.name);
  }, [item, onRemove]);

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Swipe-delete background */}
      <motion.div style={{ opacity: deleteOpacity }}
        className="absolute inset-0 bg-red-50 rounded-3xl flex items-center justify-end pr-6 pointer-events-none">
        <div className="flex flex-col items-center gap-1 text-red-400">
          <Ic.Trash c="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider">Remove</span>
        </div>
      </motion.div>

      {/* Row card — draggable on mobile */}
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
        className="relative bg-white border border-gray-100/80 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-grab active:cursor-grabbing"
      >
        {/* Product Display */}
        <div className="flex gap-4 items-start">
          {/* Product image */}
          <Link to={`/products/${item.product?.slug || item.product?.id}`} className="flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 hover:scale-105 transition-transform duration-300">
              {item.products?.image && (
                <img src={item.products.image} alt={item.products.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/200x200?text=No+Image";
                  }}
                  className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
          </Link>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <Link to={`/products/${item.products?.slug || item.products?.id}`}>
              <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-indigo-700 transition-colors">
                {item.products?.name || "Product"}
              </p>
            </Link>

            {/* Star rating */}
            {item.products?.rating_stars > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className={`w-3 h-3 ${i < Math.floor(item.products.rating_stars) ? "text-yellow-400" : "text-gray-200"}`}
                    fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
                <span className="text-gray-400 text-[10px] ml-0.5">({item.products.rating_count})</span>
              </div>
            )}

            <p className="text-indigo-600 font-black text-base mt-2">
              {formatMoneyCents(price)}
              <span className="text-gray-400 text-xs font-normal ml-1">each</span>
            </p>

            {/* Qty stepper */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl">
                <QtyStepperButton dir="minus" disabled={item.quantity <= 1 || pendingQty}
                  onClick={() => onQtyChange(item.id, item.quantity - 1)} />
                <div className="relative overflow-hidden w-7 text-center tabular-nums font-black text-sm text-gray-900 select-none">
                  {pendingQty ? <Spinner c="w-3 h-3 mx-auto" /> : (
                    <MechanicalDigit value={item.quantity} prevValue={prevQty} />
                  )}
                </div>
                <QtyStepperButton dir="plus" disabled={item.quantity >= 10 || pendingQty}
                  onClick={() => onQtyChange(item.id, item.quantity + 1)} />
              </div>

              {/* Save for later */}
              <button onClick={() => onSaveLater(item)}
                className="flex items-center gap-1 text-gray-400 hover:text-rose-500 transition-colors text-xs font-semibold">
                <Ic.Heart c="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>

          {/* Line total + remove */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <p className="font-black text-gray-900 text-base">{formatMoneyCents(lineTotal)}</p>
            <motion.button
              whileHover={{ scale: 1.12, color: "#ef4444" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(item.id, item.products?.name)}
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

// ─── Promo code input ─────────────────────────────────────────────────────────
function PromoInput({ promo, onApply, onRemove }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = useCallback(async () => {
    const clean = code.trim().toUpperCase();
    if (!clean) { setError("Enter a promo code."); return; }
    setLoading(true);
    // Simulate async validation (replace with real API call if needed)
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    const found = PROMOS[clean];
    if (!found) { setError("Invalid promo code. Try SAVE10 or WELCOME20."); return; }
    setError("");
    setCode("");
    onApply({ code: clean, ...found });
  }, [code, onApply]);

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
        <Ic.Tag c="w-3.5 h-3.5" /> Promo Code
      </p>
      {promo ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Ic.Check c="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-700 font-black text-sm">{promo.code}</span>
            <span className="text-emerald-500 text-xs">— {promo.label}</span>
          </div>
          <button onClick={onRemove} className="text-emerald-400 hover:text-red-400 transition-colors">
            <Ic.Close c="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text" value={code} maxLength={12}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder="Enter code…"
              className="ct-input flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-900 uppercase tracking-wider placeholder:normal-case placeholder:font-normal placeholder:tracking-normal transition"
            />
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleApply} disabled={loading}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-sm font-black hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? <Spinner c="w-4 h-4" /> : "Apply"}
            </motion.button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-red-500 text-xs font-semibold mt-2">{error}</motion.p>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// ─── Order summary card (sticky on desktop) ───────────────────────────────────
function OrderSummary({ subtotal, discount, shipping, total, itemCount, promo, onApplyPromo, onRemovePromo, onCheckout, isCheckingOut }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Order Summary</p>

      {/* Line items */}
      <div className="space-y-2.5">
        {[
          ["Subtotal", formatMoneyCents(subtotal)],
          ...(discount > 0 ? [["Discount", `-${formatMoneyCents(discount)}`, true]] : []),
          ["Shipping", shipping === 0 ? "Free 🎉" : formatMoneyCents(shipping)],
        ].map(([k, v, green]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-500">{k}</span>
            <span className={`font-semibold ${green ? "text-emerald-600" : "text-gray-900"}`}>{v}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
        <span className="text-gray-700 font-bold">Total</span>
        <span className="text-3xl font-black text-gray-900 ct-breathe">{formatMoneyCents(total)}</span>
      </div>

      <PromoInput promo={promo} onApply={onApplyPromo} onRemove={onRemovePromo} />

      {/* Checkout CTA */}
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: "0 16px 40px rgba(79,70,229,0.3)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isCheckingOut ? <Spinner /> : <Ic.Lock c="w-4 h-4" />}
        {isCheckingOut ? "Redirecting…" : `Checkout — ${formatMoneyCents(total)}`}
      </motion.button>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 flex-wrap">
        {["🔒 SSL Secure", "↩️ Free Returns", "🚀 Fast Delivery"].map((t) => (
          <span key={t} className="font-medium">{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Saved for later section ──────────────────────────────────────────────────
function SavedForLater({ items, onMoveToCart }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
        <Ic.Heart c="w-5 h-5 text-rose-400" filled />
        Saved for Later
        <span className="text-sm font-bold text-gray-400">({items.length})</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <motion.div key={item.id || i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            {console.log("SavedForLater", item)}
            <div className="aspect-square bg-gray-50 overflow-hidden">
              {item.products?.image && <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />}
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.products?.name}</p>
              <p className="text-indigo-600 font-black text-sm mt-0.5">{formatMoneyCents(item.products?.price_cents)}</p>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => onMoveToCart(item)}
                className="w-full mt-2 bg-gray-900 text-white text-xs font-black py-2 rounded-xl hover:bg-indigo-700 transition-colors">
                Move to Cart
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Upsell / recommended row ──────────────────────────────────────────────────
function RecommendedRow({ products, onAddToCart, cartProductIds }) {
  if (!products.length) return null;
  const filtered = products.filter((p) => !cartProductIds.has(String(p.id))).slice(0, 5);
  if (!filtered.length) return null;

  return (
    <section>
      <h2 className="text-xl font-black text-gray-900 mb-2">You Might Have Forgotten</h2>
      <p className="text-gray-400 text-sm mb-6">Frequently bought together with items in your cart.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {filtered.map((p) => (
            // {console.log(p)}
          <ProductCard product={p} key={p.id} variant="compact"/>
        ))}
      </div>
    </section>
  );
}

// ─── Empty cart state ─────────────────────────────────────────────────────────
function EmptyCart({ savedItems, onMoveToCart, navigate }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center">
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, -4, 4, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="text-8xl mb-6"
      >
        🛒
      </motion.div>
      <h2 className="text-3xl font-black text-gray-900 mb-3">Your cart is empty</h2>
      <p className="text-gray-400 text-base mb-8 max-w-sm leading-relaxed">
        Looks like you haven't added anything yet. Let's fix that.
      </p>
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/products")}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-10 py-4 rounded-2xl shadow-lg shadow-indigo-500/25 text-base">
        Browse Products →
      </motion.button>
      {savedItems.length > 0 && (
        <div className="mt-16 w-full max-w-2xl mx-auto">
          <p className="text-gray-400 text-sm mb-6">You have <span className="font-bold text-gray-700">{savedItems.length}</span> item{savedItems.length !== 1 ? "s" : ""} saved for later.</p>
          <SavedForLater items={savedItems} onMoveToCart={onMoveToCart} />
        </div>
      )}
    </motion.div>
  );
}

// ─── Mobile sticky checkout bar ───────────────────────────────────────────────
function StickyMobileBar({ total, itemCount, onCheckout }) {
  if (itemCount === 0) return null;
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 ct-sticky-rise bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-3 shadow-2xl">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </p>
          <p className="font-black text-gray-900 text-lg leading-tight">{formatMoneyCents(total)}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onCheckout}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-indigo-500/25">
          <Ic.Lock c="w-4 h-4" />
          Checkout
        </motion.button>
      </div>
    </div>
  );
}

// ─── Order notes ──────────────────────────────────────────────────────────────
function OrderNotes({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
        <Ic.Notes c="w-4 h-4" />
        Add order note
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Ic.Chev dir="down" c="w-3.5 h-3.5" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Gift message, delivery instructions, special requests…"
              rows={3}
              className="ct-input w-full mt-3 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 resize-none placeholder-gray-400 transition"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page skeleton ────────────────────────────────────────────────────────────
function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 flex gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-8 bg-gray-100 rounded-xl w-24 mt-2" />
          </div>
          <div className="w-16 space-y-2 items-end flex flex-col pt-1">
            <div className="h-5 bg-gray-200 rounded w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CART PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CartPage() {
  const navigate = useNavigate();

  // ── Cart data from API ───o──────────────────────────────────────────────────
  const { updateQuantity, removeItem, addItem } = useCartActions();
  const { cart, loading, error } = useCartState();

  // console.log(cart)

  useShowErrorBoundary(error);

  // ── Recommendations from API ───────────────────────────────────────────────
  const cartRecommendations = useLoaderData();

  console.log(cartRecommendations)

  const recommendations = useMemo(() => cartRecommendations?.recommendations || [], [cartRecommendations]);


  // ── Local cart state (optimistic) ─────────────────────────────────────────
  // We maintain a local copy so QTY changes feel instant.
  const [localCart, setLocalCart] = useState([]);
  useEffect(() => {
    if (cart) setLocalCart(cart);
  }, [cart]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [pendingQtyId, setPendingQtyId] = useState(null);   // item being updated
  const [removingId, setRemovingId] = useState(null);    // item being removed
  const [undoItem, setUndoItem] = useState(null);    // { id, name, data } for undo
  const [savedForLater, setSavedForLater] = useState([]);      // saved-later list
  const [promo, setPromo] = useState(null);    // applied promo
  const [orderNote, setOrderNote] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // IDs of products already in cart (for deduplication in recommendations)
  const cartProductIds = useMemo(
    () => new Set(localCart.map((i) => String(i.products?.id))),
    [localCart]
  );

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = useMemo(
    () => localCart.reduce((s, i) => s + (i.products?.price_cents || 0) * i.quantity, 0),
    [localCart]
  );
  const discount = useMemo(() => {
    if (!promo) return 0;
    if (promo.type === "percent") return Math.round(subtotal * promo.value / 100);
    if (promo.type === "fixed") return promo.value;
    return 0;
  }, [promo, subtotal]);
  const shipping = useMemo(() => {
    if (!localCart.length) return 0;
    if (promo?.type === "shipping") return 0;
    return subtotal - discount >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_COST;
  }, [promo, subtotal, discount, localCart.length]);
  const total = subtotal - discount + shipping;
  const savings = discount + (subtotal >= FREE_SHIP_THRESHOLD ? SHIPPING_COST : 0);



  // ── Update quantity — optimistic + API sync ────────────────────────────────
  const handleQtyChange = useCallback(async (itemId, newQty) => {
    if (newQty < 1 || newQty > 10) return;

    // optimistic visual update (local UI state)
    setLocalCart(prev =>
      prev.map(i =>
        i.id === itemId ? { ...i, quantity: newQty } : i
      )
    );

    setPendingQtyId(itemId);

    try {
      await updateQuantity(itemId, newQty);
      // provider handles server sync
    } catch {
      // provider already rolls back if needed
    } finally {
      setPendingQtyId(null);
    }
  }, [updateQuantity]);

  // ── Remove item — optimistic with undo window ──────────────────────────────
  const handleRemove = useCallback(async (itemId, itemName) => {
    const item = localCart.find(i => i.id === itemId);
    if (!item) return;

    // optimistic remove (visual only)
    setLocalCart(prev =>
      prev.filter(i => i.id !== itemId)
    );

    // keep undo snapshot
    setUndoItem({ id: itemId, name: itemName, data: item });

    setRemovingId(itemId);

    try {
      await removeItem(itemId);
      // provider handles API + sync
    } catch {
      // provider will rollback internally if needed
    } finally {
      setRemovingId(null);
    }
  }, [localCart, removeItem]);

  // ── Undo remove ────────────────────────────────────────────────────────────
  const handleUndo = useCallback(async () => {
    if (!undoItem) return;

    const itemToRestore = undoItem;
    setUndoItem(null);

    try {
      await addItem(
        itemToRestore.data.products?.id,
        itemToRestore.data.quantity
      );
      // provider handles API + sync internally
    } catch {
      // provider will handle rollback if needed
    }
  }, [undoItem, addItem]);

  // ── Save for later ─────────────────────────────────────────────────────────
  const handleSaveLater = useCallback(async (item) => {
    const exists = savedForLater.some(i => i.id === item.id);
    if (exists) return;

    try {
      await handleRemove(item.id, item.products?.name);
      setSavedForLater(prev => [...prev, item]);
    } catch {
      // do nothing
    }
  }, [handleRemove, savedForLater]);

  // ── Move saved item back to cart ───────────────────────────────────────────
  const handleMoveToCart = useCallback(async (item) => {
    const removedItem = item;

    // optimistic remove from saved list
    setSavedForLater(prev =>
      prev.filter(i => i.id !== item.id)
    );

    try {
      await addItem(
        item.products?.id,
        item.quantity
      );
      // provider handles API + cart sync
    } catch {
      // rollback saved state if failed
      setSavedForLater(prev => [...prev, removedItem]);
    }
  }, [addItem]);

  // ── Add recommended product to cart ───────────────────────────────────────
  const handleAddRecommended = useCallback(async (product) => {
    try {
      await addItem(product.id);
      console.log(product)
      // provider handles everything
    } catch {
      // optional: show toast
    }
  }, [addItem]);

  // ── Checkout ───────────────────────────────────────────────────────────────
  const handleCheckout = useCallback(() => {
    if (!localCart.length) return;
    setIsCheckingOut(true);
    // Brief delay so the button animation is visible
    setTimeout(() => navigate("/checkout"), 500);
  }, [localCart.length, navigate]);

  // ── Hero entrance animation ────────────────────────────────────────────────
  const headingRef = useRef(null);
  useEffect(() => {
    if (!headingRef.current) return;
    gsap.fromTo(headingRef.current.querySelectorAll(".ct-head-item"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: "power3.out", clearProps: "all" }
    );
  }, []);

  const isEmpty = !loading && localCart.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden pt-16">
      <style>{CT_STYLES}</style>

      {/* ════════════════════════════════════════════════════════════
          HERO HEADER
      ════════════════════════════════════════════════════════════ */}
      <div ref={headingRef} className="relative overflow-hidden bg-white border-b border-gray-100 px-6 py-10">
        {/* Decorative ink brushstroke accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.025] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at right center, #6366f1 0%, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="ct-head-item flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <button onClick={() => navigate("/")} className="hover:text-indigo-600 transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate("/products")} className="hover:text-indigo-600 transition-colors">Products</button>
            <span>/</span>
            <span className="text-gray-700 font-bold">Cart</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="ct-head-item text-5xl font-black text-gray-900 leading-tight">
                Shopping Cart
              </h1>
              <p className="ct-head-item text-gray-400 mt-2 text-base">
                {loading
                  ? "Loading…"
                  : localCart.length === 0
                    ? "Your cart is empty"
                    : `${localCart.length} item${localCart.length !== 1 ? "s" : ""} ready to checkout`}
              </p>
            </div>
            {localCart.length > 0 && (
              <div className="ct-head-item flex items-center gap-2">
                {/* Qty bubble */}
                <motion.div
                  key={localCart.length}
                  animate={{ scale: [1, 1.4, 0.9, 1] }}
                  transition={{ duration: 0.4 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/25"
                >
                  <span className="text-white font-black text-lg">{localCart.length}</span>
                </motion.div>
                <Ic.Bag c="w-6 h-6 text-gray-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Savings ticker ── */}
      <SavingsTicker savings={savings} />

      {/* ════════════════════════════════════════════════════════════
          MAIN GRID
      ════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28 lg:pb-8">
        {isEmpty ? (
          <EmptyCart savedItems={savedForLater} onMoveToCart={handleMoveToCart} navigate={navigate} />
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* ── LEFT: Cart items + extras ── */}
            <div className="space-y-8">

              {/* Free shipping progress */}
              <div className="ct-clip-wipe" style={{ animationDelay: "0.1s" }}>
                <FreeShippingBar subtotal={subtotal} discount={discount} />
              </div>

              {/* Cart items list */}
              <div className="space-y-4">
                {loading ? (
                  <CartSkeleton />
                ) : (
                  <AnimatePresence mode="popLayout">
                    {localCart.map((item, i) => (
                      <CartRow
                        key={item.id}
                        item={item}
                        index={i}
                        onQtyChange={handleQtyChange}
                        onRemove={handleRemove}
                        onSaveLater={handleSaveLater}
                        pendingQty={pendingQtyId === item.id}
                        isRemoving={removingId === item.id}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
              {console.log(localCart)}

              {/* Order notes */}
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                <OrderNotes value={orderNote} onChange={setOrderNote} />
              </div>

              {/* Saved for later */}
              <SavedForLater items={savedForLater} onMoveToCart={handleMoveToCart} />

              {/* Recommendations */}
              <RecommendedRow
                products={recommendations}
                onAddToCart={handleAddRecommended}
                cartProductIds={cartProductIds}
              />

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "🔒", title: "Secure Checkout", sub: "256-bit SSL" },
                  { icon: "↩️", title: "Free 30-Day Returns", sub: "No questions" },
                  { icon: "🚀", title: "Fast Dispatch", sub: "Within 24h" },
                ].map((t) => (
                  <div key={t.title} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
                    <div className="text-2xl mb-1.5">{t.icon}</div>
                    <p className="font-bold text-gray-900 text-xs">{t.title}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">{t.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Order summary (sticky) ── */}
            <div className="hidden lg:block sticky top-24">
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                shipping={shipping}
                total={total}
                itemCount={localCart.length}
                promo={promo}
                onApplyPromo={setPromo}
                onRemovePromo={() => setPromo(null)}
                onCheckout={handleCheckout}
                isCheckingOut={isCheckingOut}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile sticky checkout bar ── */}
      {!isEmpty && (
        <StickyMobileBar
          total={total}
          itemCount={localCart.length}
          onCheckout={handleCheckout}
        />
      )}

      {/* ── Undo toast ── */}
      <AnimatePresence>
        {undoItem && (
          <UndoToast
            key={undoItem.id}
            item={{ name: undoItem.name }}
            onUndo={handleUndo}
            onExpire={() => setUndoItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}