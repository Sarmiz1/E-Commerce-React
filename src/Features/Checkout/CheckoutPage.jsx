// src/Pages/Checkout/CheckoutPage.jsx
//
// ── Architecture ──────────────────────────────────────────────────────────────
// Cart data: pulled live from /api/cart-items via useFetchData hook.
//            Quantities updated via PATCH /api/cart-items/:id
//            Items removed via DELETE /api/cart-items/:id
//            Order placed via POST /api/orders
//
// Smart behaviours:
//   • Coupon validation (mock list, easily swapped for real API call)
//   • Real-time price breakdown (subtotal, shipping tier, coupon, tax, total)
//   • Form validation with field-level inline errors
//   • Auto-detects card type from number prefix (Visa/Mastercard/Amex/Discover)
//   • Card number auto-formats with spaces; expiry auto-inserts slash
//   • Prevents checkout if cart is empty or form has errors
//   • 3-step animated progress bar (Cart → Details → Confirmation)
//   • Step 3 = order confirmation with animated success state
//   • Fully responsive: stacked on mobile, side-by-side on lg+
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useCartState, useCartActions } from "../../Context/cart/CartContext";
import { OrderAPI } from "../../api/orderApi"; 

import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import useShowErrorBoundary from "../../Hooks/useShowErrorBoundary";
// import { mockedCart } from "../../Data/mockedCart";

gsap.registerPlugin(ScrollTrigger);

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_COUPONS = {
  SAVE10: { type: "percent", value: 10, label: "10% off" },
  WELCOME20: { type: "percent", value: 20, label: "20% off" },
  FLAT5: { type: "flat", value: 500, label: "$5 off" },
  FREESHIP: { type: "ship", value: 0, label: "Free shipping" },
};

const SHIPPING_TIERS = [
  { label: "Standard (5–7 days)", price: 499, id: "standard" },
  { label: "Express (2–3 days)", price: 999, id: "express" },
  { label: "Overnight (next day)", price: 1999, id: "overnight" },
];

const TAX_RATE = 0.085; // 8.5%

const CARD_PATTERNS = {
  visa: /^4/,
  mastercard: /^5[1-5]/,
  amex: /^3[47]/,
  discover: /^6(?:011|5)/,
};

// ─── Page-scoped styles ───────────────────────────────────────────────────────
const CO_STYLES = `
  @keyframes co-orb{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(24px,-28px)scale(1.05)}66%{transform:translate(-18px,20px)scale(0.96)}}
  .co-orb{animation:co-orb linear infinite}

  @keyframes co-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .co-shimmer{
    background:linear-gradient(90deg,#fff 0%,#a5b4fc 35%,#fff 60%,#818cf8 90%);
    background-size:200% auto;-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;animation:co-shimmer 4s linear infinite;
  }

  @keyframes co-success-ring{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
  .co-success-ring{animation:co-success-ring 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards}

  @keyframes co-check{0%{stroke-dashoffset:40}100%{stroke-dashoffset:0}}
  .co-check-path{stroke-dasharray:40;stroke-dashoffset:40;animation:co-check 0.5s 0.55s ease forwards}

  @keyframes co-confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-80px) rotate(720deg);opacity:0}}

  @keyframes co-bounce-in{0%{transform:scale(0);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
  .co-bounce-in{animation:co-bounce-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards}

  /* Input focus ring */
  .co-input:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}
  .co-input{transition:border-color .2s,box-shadow .2s}
  .co-input.error{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,0.12)}
`;

// ─── Utility — deep clone form errors ────────────────────────────────────────
const EMPTY_ERRORS = () => ({ name: "", email: "", phone: "", address: "", city: "", zip: "", country: "", cardNumber: "", expiry: "", cvv: "", cardName: "" });
const EMPTY_FORM = () => ({ name: "", email: "", phone: "", address: "", city: "", zip: "", country: "Nigeria", cardNumber: "", expiry: "", cvv: "", cardName: "" });

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  Bag: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>,
  Trash: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>,
  Check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>,
  Lock: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  Tag: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  Truck: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  Info: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
  Star: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  Arrow: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
  Spin: (p) => <svg {...p} viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>,
  Gift: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></svg>,
  Shield: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
};

// ─── Detect card type from number ─────────────────────────────────────────────
function detectCardType(num) {
  const n = num.replace(/\s/g, "");
  for (const [type, pat] of Object.entries(CARD_PATTERNS)) {
    if (pat.test(n)) return type;
  }
  return null;
}

// ─── Card type logo/label ─────────────────────────────────────────────────────
function CardTypeBadge({ type }) {
  if (!type) return null;
  const labels = { visa: "VISA", mastercard: "MC", amex: "AMEX", discover: "DISC" };
  const colors = { visa: "bg-blue-600", mastercard: "bg-red-500", amex: "bg-green-600", discover: "bg-orange-500" };
  return (
    <span className={`text-[9px] font-black text-white px-2 py-0.5 rounded ml-2 ${colors[type] || "bg-gray-400"}`}>
      {labels[type]}
    </span>
  );
}

// ─── Floating orbs decoration ─────────────────────────────────────────────────
function FloatingOrbs({ dark = false }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w: 450, h: 450, top: "-12%", left: "-8%", delay: 0, dur: 20 },
        { w: 350, h: 350, top: "50%", right: "-8%", delay: 5, dur: 24 },
        { w: 250, h: 250, bottom: "5%", left: "40%", delay: 10, dur: 18 },
      ].map((o, i) => (
        <div key={i} className={`absolute rounded-full blur-3xl co-orb ${dark ? "bg-indigo-900/40" : "bg-gradient-to-br from-blue-400/20 to-indigo-500/20"}`}
          style={{
            width: o.w, height: o.h, top: o.top, left: o.left, right: o.right, bottom: o.bottom,
            animationDelay: `${o.delay}s`, animationDuration: `${o.dur}s`
          }} />
      ))}
    </div>
  );
}

// ─── Step progress bar ────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Cart", "Details", "Done"];
  return (
    <div className="flex items-center justify-center mb-10 px-2">
      {steps.map((s, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <div key={s} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={done ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.35 }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-all duration-300 ${done ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : current ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-200"
                    : "bg-gray-100 text-gray-400"
                  }`}>
                {done ? <Icon.Check className="w-3.5 h-3.5" /> : i + 1}
              </motion.div>
              {/* Label — visible at all sizes */}
              <span className={`text-[10px] font-bold transition-colors duration-200 whitespace-nowrap ${current || done ? "text-indigo-700" : "text-gray-400"}`}>
                {s}
              </span>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className="mx-2 sm:mx-3 mb-4 flex-shrink-0 w-8 sm:w-16 h-0.5 bg-gray-200 overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "power3.out" }}
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Cart item row ─────────────────────────────────────────────────────────────
function CartItemRow({ item, onUpdateQty, onRemove, removing }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.28 }}
      className={`flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 hover:shadow-sm transition-all duration-200 ${removing ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Product image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {item.image
          ? <img 
              src={item.image} 
              alt={item.name} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/200x200?text=No+Image";
              }}
              className="w-full h-full object-cover" 
            />
          : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{item.name || item.productId}</p>
        <p className="font-black text-indigo-700 text-base mt-1">{formatMoneyCents((item.products?.price_cents || 0) * item.quantity)}</p>
        <p className="text-gray-400 text-[11px]">{formatMoneyCents(item.products?.price_cents || 0)} each</p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => onUpdateQty(item, -1)}
            disabled={item.quantity <= 1}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-gray-600 font-black text-sm transition">−</button>
          <span className="w-6 text-center text-sm font-black text-gray-900">{item.quantity}</span>
          <button onClick={() => onUpdateQty(item, 1)}
            disabled={item.quantity >= 10}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-gray-600 font-black text-sm transition">+</button>
        </div>
      </div>

      {/* Remove */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(item)}
        className="self-start w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-300 transition-all duration-200 flex-shrink-0">
        <Icon.Trash className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  );
}

// ─── Order summary sidebar ────────────────────────────────────────────────────
function OrderSummary({ cart, shipping, coupon, shippingOptions, selectedShipping, onShippingChange, step }) {
  const subtotal = useMemo(() => cart.reduce((a, i) => a + (i.products?.price_cents || 0) * i.quantity, 0), [cart]);
  const shipPrice = selectedShipping === "free" ? 0 : (shippingOptions.find(s => s.id === selectedShipping)?.price ?? 499);
  const couponDisc = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === "percent") return Math.round(subtotal * coupon.value / 100);
    if (coupon.type === "flat") return coupon.value;
    if (coupon.type === "ship") return shipPrice;
    return 0;
  }, [coupon, subtotal, shipPrice]);
  const taxable = subtotal - couponDisc;
  const tax = Math.round(taxable * TAX_RATE);
  const finalShip = coupon?.type === "ship" ? 0 : shipPrice;
  const total = taxable + finalShip + tax;

  const [mobileOpen, setMobileOpen] = useState(false);

  const summaryInner = (
    <>
      <h3 className="font-black text-gray-900 text-lg mb-5 flex items-center gap-2">
        <Icon.Bag className="w-5 h-5 text-indigo-500" /> Order Summary
        <span className="ml-auto text-sm font-bold text-indigo-600">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
      </h3>

      {/* Mini cart items preview */}
      <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
        {cart.map((item) => (
          <div key={item.id || item.productId} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt="" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/100x100?text=Error";
                  }}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 line-clamp-1">{item.name || item.productId}</p>
              <p className="text-[10px] text-gray-400">×{item.quantity}</p>
            </div>
            <p className="text-xs font-black text-gray-900 flex-shrink-0">{formatMoneyCents((item.products?.price_cents || 0) * item.quantity)}</p>
          </div>
        ))}
      </div>

      {/* Shipping selector — only on step 1 */}
      {step === 1 && (
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Shipping Method</p>
          <div className="space-y-2">
            {shippingOptions.map((s) => (
              <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${selectedShipping === s.id ? "border-indigo-300 bg-indigo-50" : "border-gray-100 hover:border-gray-200"}`}>
                <input type="radio" name="shipping" value={s.id} checked={selectedShipping === s.id} onChange={() => onShippingChange(s.id)} className="accent-indigo-600" />
                <span className="text-sm text-gray-700 flex-1">{s.label}</span>
                <span className="text-sm font-black text-gray-900">{s.price === 0 ? "Free" : formatMoneyCents(s.price)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price breakdown */}
      <div className="border-t border-gray-100 pt-4 space-y-2.5">
        {[
          { label: "Subtotal", value: subtotal, style: "" },
          { label: "Shipping", value: finalShip, style: "", zero: "Free" },
          ...(couponDisc > 0 ? [{ label: `Coupon (${coupon.label})`, value: -couponDisc, style: "text-emerald-600" }] : []),
          { label: `Tax (${(TAX_RATE * 100).toFixed(1)}%)`, value: tax, style: "text-gray-400" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className={`text-gray-500 ${row.style}`}>{row.label}</span>
            <span className={`font-bold ${row.style || "text-gray-900"}`}>
              {row.value < 0
                ? `−${formatMoneyCents(-row.value)}`
                : row.zero && row.value === 0 ? row.zero
                  : formatMoneyCents(row.value)}
            </span>
          </div>
        ))}

        {/* Total */}
        <div className="flex justify-between pt-3 border-t border-gray-100">
          <span className="font-black text-gray-900 text-lg">Total</span>
          <span className="font-black text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatMoneyCents(total)}
          </span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-5 flex flex-col gap-2">
        {[
          { icon: <Icon.Lock className="w-3.5 h-3.5" />, text: "SSL encrypted checkout" },
          { icon: <Icon.Truck className="w-3.5 h-3.5" />, text: "Real-time order tracking" },
          { icon: <Icon.Shield className="w-3.5 h-3.5" />, text: "Buyer protection guarantee" },
        ].map((b) => (
          <div key={b.text} className="flex items-center gap-2 text-gray-400 text-[11px]">
            <span className="text-indigo-400">{b.icon}</span>
            {b.text}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop: sticky sidebar ── */}
      <div className="hidden lg:block bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-24">
        {summaryInner}
      </div>

      {/* ── Mobile: collapsible panel + sticky bottom bar ── */}
      <div className="lg:hidden">
        {/* Sticky bottom total bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-3 shadow-2xl">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex items-center gap-2 flex-1 text-left"
            >
              <span className="text-xs text-gray-500">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
              <Icon.Bag className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600">{mobileOpen ? "Hide" : "Show"} summary</span>
              <motion.span animate={{ rotate: mobileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </motion.span>
            </button>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-gray-400">Total</p>
              <p className="font-black text-gray-900 text-lg leading-tight">{formatMoneyCents(total)}</p>
            </div>
          </div>
        </div>

        {/* Expandable panel (slides up above bottom bar) */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto pb-24"
              >
                <div className="p-5">
                  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                  {summaryInner}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ─── Coupon input ─────────────────────────────────────────────────────────────
function CouponInput({ onApply, appliedCoupon }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | checking | valid | invalid

  const handleApply = () => {
    if (!code.trim()) return;
    setStatus("checking");
    // Simulate API delay for realism
    setTimeout(() => {
      const found = VALID_COUPONS[code.trim().toUpperCase()];
      if (found) { setStatus("valid"); onApply(found, code.trim().toUpperCase()); }
      else { setStatus("invalid"); }
    }, 600);
  };

  if (appliedCoupon) return (
    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
      <Icon.Tag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      <span className="text-sm font-bold text-emerald-700 flex-1">{appliedCoupon.label} applied!</span>
      <button onClick={() => onApply(null, "")} className="text-emerald-400 hover:text-red-400 text-xs font-bold transition">Remove</button>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus("idle"); }}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Coupon code"
          className="flex-1 co-input text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-mono tracking-widest"
        />
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={handleApply} disabled={status === "checking"}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-60">
          {status === "checking" ? <Icon.Spin className="w-4 h-4 animate-spin" /> : "Apply"}
        </motion.button>
      </div>
      <AnimatePresence>
        {status === "invalid" && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
            <Icon.Info className="w-3.5 h-3.5" /> Invalid coupon code. Try: SAVE10, WELCOME20, FREESHIP
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Form field wrapper ───────────────────────────────────────────────────────
function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
            <Icon.Info className="w-3 h-3" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Checkout form (Step 1) ───────────────────────────────────────────────────
function CheckoutForm({ form, errors, onChange, onSubmit, loading }) {
  const cardType = detectCardType(form.cardNumber);

  // ── Auto-format card number with spaces (1234 5678 9012 3456) ──────────────
  const handleCardNumber = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const fmt = raw.match(/.{1,4}/g)?.join(" ") ?? raw;
    onChange("cardNumber", fmt);
  };

  // ── Auto-format expiry (MM/YY) ─────────────────────────────────────────────
  const handleExpiry = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    const fmt = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    onChange("expiry", fmt);
  };

  const inputBase = "w-full co-input border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      {/* Delivery section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Icon.Truck className="w-5 h-5 text-indigo-500" />
          <h3 className="font-black text-gray-900 text-base">Delivery Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" error={errors.name} required>
            <input value={form.name} onChange={(e) => onChange("name", e.target.value)} placeholder="John Doe"
              className={`${inputBase} ${errors.name ? "error" : ""}`} />
          </Field>
          <Field label="Email" error={errors.email} required>
            <input type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} placeholder="john@example.com"
              className={`${inputBase} ${errors.email ? "error" : ""}`} />
          </Field>
          <Field label="Phone Number" error={errors.phone} required>
            <input type="tel" value={form.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="+1 (555) 000-0000"
              className={`${inputBase} ${errors.phone ? "error" : ""}`} />
          </Field>
          <Field label="Country" error={errors.country} required>
            <select value={form.country} onChange={(e) => onChange("country", e.target.value)}
              className={`${inputBase} cursor-pointer ${errors.country ? "error" : ""}`}>
              {["Nigeria", "United States", "United Kingdom", "Canada", "Germany", "France", "Australia", "Ghana", "South Africa", "Kenya", "India", "UAE"].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Street Address" error={errors.address} required>
            <input value={form.address} onChange={(e) => onChange("address", e.target.value)} placeholder="123 Main Street, Apt 4B"
              className={`${inputBase} ${errors.address ? "error" : ""} sm:col-span-2`} />
          </Field>
          <Field label="City" error={errors.city} required>
            <input value={form.city} onChange={(e) => onChange("city", e.target.value)} placeholder="Lagos"
              className={`${inputBase} ${errors.city ? "error" : ""}`} />
          </Field>
          <Field label="ZIP / Postal Code" error={errors.zip} required>
            <input value={form.zip} onChange={(e) => onChange("zip", e.target.value)} placeholder="100001"
              className={`${inputBase} ${errors.zip ? "error" : ""}`} />
          </Field>
        </div>
      </div>

      {/* Payment section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Icon.Lock className="w-5 h-5 text-indigo-500" />
          <h3 className="font-black text-gray-900 text-base">Payment Details</h3>
          <span className="ml-auto text-[10px] text-gray-400 flex items-center gap-1"><Icon.Lock className="w-3 h-3" /> 256-bit SSL</span>
        </div>

        {/* Card type indicators */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["visa", "mastercard", "amex", "discover"].map((t) => (
            <span key={t} className={`text-[9px] font-black px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border transition-all duration-200 whitespace-nowrap ${cardType === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-50 text-gray-400 border-gray-200"
              }`}>{t.toUpperCase()}</span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Cardholder Name" error={errors.cardName} required>
              <input value={form.cardName} onChange={(e) => onChange("cardName", e.target.value)} placeholder="John Doe"
                className={`${inputBase} ${errors.cardName ? "error" : ""}`} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Card Number" error={errors.cardNumber} required>
              <div className="relative">
                <input value={form.cardNumber} onChange={handleCardNumber} placeholder="1234 5678 9012 3456"
                  className={`${inputBase} font-mono tracking-widest pr-20 ${errors.cardNumber ? "error" : ""}`} maxLength={19} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  <CardTypeBadge type={cardType} />
                </div>
              </div>
            </Field>
          </div>
          <Field label="Expiry Date" error={errors.expiry} required>
            <input value={form.expiry} onChange={handleExpiry} placeholder="MM/YY"
              className={`${inputBase} font-mono ${errors.expiry ? "error" : ""}`} maxLength={5} />
          </Field>
          <Field label="CVV" error={errors.cvv} required>
            <input value={form.cvv} onChange={(e) => onChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="•••"
              type="password"
              className={`${inputBase} font-mono tracking-widest ${errors.cvv ? "error" : ""}`} maxLength={4} />
          </Field>
        </div>
      </div>

      {/* Submit */}
      <motion.button type="submit" disabled={loading}
        whileHover={!loading ? { scale: 1.02, boxShadow: "0 16px 40px rgba(99,102,241,0.35)" } : {}}
        whileTap={!loading ? { scale: 0.97 } : {}}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4.5 py-4 px-8 rounded-2xl text-base shadow-xl shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300">
        {loading
          ? <><Icon.Spin className="w-5 h-5 animate-spin" /> Processing…</>
          : <><Icon.Lock className="w-5 h-5" /> Place Order Securely <Icon.Arrow className="w-4 h-4" /></>
        }
      </motion.button>

      <p className="text-center text-gray-400 text-xs">
        By placing your order you agree to our <Link to="/terms" className="text-indigo-500 hover:underline">Terms</Link> and <Link to="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</Link>.
      </p>
    </form>
  );
}

// ─── Confetti pieces — generated at module scope (never inside render) ────────
const CONFETTI_PIECES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 4.17).toFixed(1)}%`,
  delay: (i * 0.025).toFixed(3),
  color: ["#6366f1", "#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#10b981"][i % 6],
  size: 6 + (i % 9),
  round: i % 2 === 0,
  dur: (0.8 + (i % 5) * 0.12).toFixed(2),
}));

// ─── Confetti burst (CSS-only, no canvas) ─────────────────────────────────────
function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {CONFETTI_PIECES.map((p) => (
        <div key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: "30%",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animation: `co-confetti ${p.dur}s ${p.delay}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Success screen (Step 2) ──────────────────────────────────────────────────
function SuccessScreen({ orderNumber, cart, total }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(el.querySelectorAll(".co-s-item"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.75, ease: "power3.out", clearProps: "all" });
  }, []);

  return (
    <div ref={ref} className="text-center max-w-lg mx-auto py-10 relative">
      <Confetti />

      {/* Animated check circle */}
      <div className="co-s-item flex justify-center mb-8">
        <div className="co-success-ring w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
          <svg className="w-12 h-12" viewBox="0 0 40 40" fill="none">
            <path className="co-check-path" d="M10 20l8 8 12-16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="co-s-item mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-500">Order Confirmed</span>
      </div>
      <h2 className="co-s-item text-4xl font-black text-gray-900 mb-3">You're all set! 🎉</h2>
      <p className="co-s-item text-gray-500 text-base mb-6 leading-relaxed">
        Your order has been placed and is being processed. You'll receive a confirmation email shortly.
      </p>

      {/* Order number */}
      <div className="co-s-item bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-8">
        <p className="text-xs text-gray-400 mb-1">Order Number</p>
        <p className="font-black text-2xl text-indigo-700 font-mono tracking-widest">{orderNumber}</p>
      </div>

      {/* Mini order recap */}
      <div className="co-s-item bg-white border border-gray-100 rounded-2xl p-5 mb-8 text-left shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Items Ordered</p>
        <div className="space-y-2">
          {cart.slice(0, 4).map((item) => (
            <div key={item.id || item.productId} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">📦</div>}
              </div>
              <p className="text-sm text-gray-700 flex-1 line-clamp-1">{item.name || item.productId}</p>
              <p className="text-sm font-bold text-gray-900">×{item.quantity}</p>
            </div>
          ))}
          {cart.length > 4 && <p className="text-xs text-gray-400 pl-12">+{cart.length - 4} more items</p>}
        </div>
        <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between">
          <span className="text-sm font-medium text-gray-500">Order Total</span>
          <span className="font-black text-indigo-700">{formatMoneyCents(total)}</span>
        </div>
      </div>

      {/* What happens next */}
      <div className="co-s-item grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        {[
          { icon: "📧", label: "Email sent", sub: "Check your inbox" },
          { icon: "📦", label: "Being packed", sub: "Within 2–4 hours" },
          { icon: "🚀", label: "On its way", sub: "Track in My Orders" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="font-bold text-gray-900 text-xs">{s.label}</p>
            <p className="text-gray-400 text-[10px] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="co-s-item flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/products">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 text-sm">
            Continue Shopping →
          </motion.button>
        </Link>
        <Link to="/">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="border border-gray-200 text-gray-600 font-bold px-8 py-3.5 rounded-2xl text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors">
            Back to Home
          </motion.button>
        </Link>
      </div>
    </div>
  );
}

// ─── Empty cart screen ────────────────────────────────────────────────────────
function EmptyCart() {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="text-center py-24 max-w-md mx-auto">
      <div className="text-7xl mb-6">🛒</div>
      <h2 className="text-3xl font-black text-gray-900 mb-4">Your bag is empty</h2>
      <p className="text-gray-400 mb-8 leading-relaxed">Looks like you haven't added anything yet. Start browsing our products!</p>
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/products")}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-10 py-4 rounded-2xl shadow-lg shadow-indigo-500/30 text-base">
        Browse Products →
      </motion.button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function CheckoutPage() {
  const navigate = useNavigate();

  // ── Step: 0 = cart review, 1 = details + payment, 2 = confirmed ──────────
  const [step, setStep] = useState(0);

  // ── Fetch live cart from API ──────────────────────────────────────────────
  const { cart: cartData, error: cartError, loading: cartLoading, cartId } = useCartState();
  useShowErrorBoundary(cartError);

  // Cart Actions from Api
  const { updateQuantity , removeItem } = useCartActions();

  // ── Local cart state (mirrors API, updated optimistically) ────────────────
  const [cart, setCart] = useState([]);
  const [removing, setRemoving] = useState(null); // id of item being removed

  // Sync local cart whenever API data loads
  useEffect(() => {
    if (cartData) setCart(Array.isArray(cartData) ? cartData : []);
  }, [cartData]);

  // ── Shipping & coupon state ───────────────────────────────────────────────
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [coupon, setCoupon] = useState(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM());
  const [errors, setErrors] = useState(EMPTY_ERRORS());

  // ── Submission state ──────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);

  // ── Page entrance animation ───────────────────────────────────────────────
  const heroRef = useRef(null);
  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(heroRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", clearProps: "all" }
    );
  }, []);

  // ── Scroll to top on step change ─────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // ── Update cart item quantity (optimistic + API PATCH) ────────────────────
  const handleUpdateQty = useCallback(async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1 || newQty > 10) return;

    const prevQty = item.quantity;

    // optimistic update
    setCart(prev =>
      prev.map(i =>
        i.id === item.id ? { ...i, quantity: newQty } : i
      )
    );

    try {
      await updateQuantity(item.id, newQty);
    } catch {
      // rollback
      setCart(prev =>
        prev.map(i =>
          i.id === item.id ? { ...i, quantity: prevQty } : i
        )
      );
    }
  }, []);

  // ── Remove cart item (optimistic + API DELETE) ────────────────────────────
  const handleRemove = useCallback(async (item) => {
    setRemoving(item.id);

    // optimistic remove
    setCart(prev =>
      prev.filter(i => i.id !== item.id)
    );

    try {
      await removeItem(item.id); 

    } catch {
      // safer rollback → re-sync full state OR restore item correctly
      setCart(prev => {
        const exists = prev.find(i => i.id === item.id);
        if (exists) return prev; // avoid duplicates

        return [...prev, item];
      });
    } finally {
      setRemoving(null);
    }
  }, []);

  // ── Apply / remove coupon ─────────────────────────────────────────────────
  const handleCoupon = useCallback((couponData, code) => {
    setCoupon(couponData ? { ...couponData, code } : null);
  }, []);

  // ── Form field change ─────────────────────────────────────────────────────
  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  // ── Form validation ───────────────────────────────────────────────────────
  const validate = () => {
    const e = EMPTY_ERRORS();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const expiryRe = /^(0[1-9]|1[0-2])\/\d{2}$/;

    if (!form.name.trim()) e.name = "Full name is required";
    if (!emailRe.test(form.email)) e.email = "Valid email address required";
    if (!form.phone.trim() || form.phone.length < 7) e.phone = "Valid phone number required";
    if (!form.address.trim()) e.address = "Street address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.zip.trim()) e.zip = "ZIP / postal code required";
    if (!form.cardName.trim()) e.cardName = "Cardholder name required";
    const rawCard = form.cardNumber.replace(/\s/g, "");
    if (rawCard.length < 13 || rawCard.length > 16) e.cardNumber = "Enter a valid 13–16 digit card number";
    if (!expiryRe.test(form.expiry)) {
      e.expiry = "Enter expiry as MM/YY";
    } else {
      const [mo, yr] = form.expiry.split("/").map(Number);
      const now = new Date();
      const cardYear = 2000 + yr;
      const cardMonth = mo - 1;
      if (cardYear < now.getFullYear() || (cardYear === now.getFullYear() && cardMonth < now.getMonth())) {
        e.expiry = "Card has expired";
      }
    }
    if (form.cvv.length < 3) e.cvv = "CVV must be 3–4 digits";
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  // ── Compute totals for order ──────────────────────────────────────────────
  const computeTotal = useCallback(() => {
    const subtotal = cart.reduce((a, i) => a + (i.products?.price_cents || 0) * i.quantity, 0);
    const shipPrice = selectedShipping === "free" ? 0 : (SHIPPING_TIERS.find(s => s.id === selectedShipping)?.price ?? 499);
    const couponDisc = coupon?.type === "percent" ? Math.round(subtotal * coupon.value / 100)
      : coupon?.type === "flat" ? coupon.value
        : coupon?.type === "ship" ? shipPrice : 0;
    const taxable = subtotal - couponDisc;
    const tax = Math.round(taxable * TAX_RATE);
    const finalShip = coupon?.type === "ship" ? 0 : shipPrice;
    return taxable + finalShip + tax;
  }, [cart, selectedShipping, coupon]);

  // ── Place order ───────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      document
        .querySelector(".co-input.error")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const total = computeTotal();

      // Because we use Supabase RPC, we only need cartId and couponCode.
      // Addresses/Payments are snapshotted or updated after the RPC call in a real app,
      // but for this RPC it strictly needs these 3:
      const result = await OrderAPI.createOrder({ 
        cartId, 
        userId: "550e8400-e29b-41d4-a716-446655440000", // Fallback for demo or pull from Auth context
        couponCode: coupon?.code || null 
      });

      setOrderNumber(
        result?.orderNumber ||
        result?.id ||
        `SE-${Date.now().toString(36).toUpperCase()}`
      );

      setOrderTotal(total);
      setStep(2);

    } catch (err) {
      setSubmitError("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <style>{CO_STYLES}</style>

      {/* ── Ambient hero gradient header ── */}
      <div ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 pt-24 pb-10 md:pb-14 px-4 sm:px-6">
        <FloatingOrbs />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mb-3">WooSho · Secure Checkout</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
            {step === 2 ? <span className="co-shimmer">Order Confirmed!</span>
              : step === 1 ? "Your Details"
                : "Review Your Bag"}
          </h1>
          {step < 2 && (
            <p className="text-blue-200 text-sm mt-2">
              {cart.length} item{cart.length !== 1 ? "s" : ""} · <Icon.Lock className="inline w-3 h-3 mr-1" />Encrypted & Secure
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-8 pb-28 lg:pb-10">
        {/* Step bar */}
        <StepBar step={step} />

        {/* ── Loading state ── */}
        {cartLoading && step < 2 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Icon.Spin className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-gray-400 font-medium text-sm">Loading your bag…</p>
          </div>
        )}

        {/* ── Global submit error ── */}
        <AnimatePresence>
          {submitError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">
              <Icon.Info className="w-5 h-5 flex-shrink-0 text-red-500" />
              {submitError}
            </motion.div>
          )}
        </AnimatePresence>

        {!cartLoading && (
          <AnimatePresence mode="wait">

            {/* ══════════════════════════════════════════════════════════
                STEP 0 — Cart Review
            ══════════════════════════════════════════════════════════ */}
            {step === 0 && (
              <motion.div key="step0"
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}>

                {cart.length === 0 ? <EmptyCart /> : (
                  <div className="grid lg:grid-cols-5 gap-6">
                    {/* Cart items — 3 cols */}
                    <div className="lg:col-span-3 space-y-5">
                      <div className="flex items-center justify-between">
                        <h2 className="font-black text-gray-900 text-xl">Your Bag</h2>
                        <Link to="/products" className="text-sm text-indigo-600 font-bold hover:underline">+ Add more</Link>
                      </div>

                      <AnimatePresence>
                        {cart.map((item) => (
                          <CartItemRow key={item.id || item.productId} item={item}
                            onUpdateQty={handleUpdateQty} onRemove={handleRemove}
                            removing={removing === item.id} />
                        ))}
                      </AnimatePresence>

                      {/* Coupon */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon.Tag className="w-4 h-4 text-indigo-500" />
                          <h3 className="font-black text-gray-900 text-sm">Coupon / Promo Code</h3>
                        </div>
                        <CouponInput onApply={handleCoupon} appliedCoupon={coupon} />
                        <p className="text-[10px] text-gray-400 mt-2">Try: SAVE10 · WELCOME20 · FLAT5 · FREESHIP</p>
                      </div>

                      {/* Proceed button */}
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 16px 40px rgba(99,102,241,0.3)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setStep(1)}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/25 text-base">
                        Proceed to Checkout <Icon.Arrow className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Summary — 2 cols */}
                    <div className="lg:col-span-2">
                      <OrderSummary cart={cart} shipping={selectedShipping} coupon={coupon}
                        shippingOptions={SHIPPING_TIERS} selectedShipping={selectedShipping}
                        onShippingChange={setSelectedShipping} step={step} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 1 — Details & Payment
            ══════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}>
                <div className="grid lg:grid-cols-5 gap-6">
                  {/* Form — 3 cols */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-3 mb-6">
                      <motion.button whileHover={{ x: -3 }} onClick={() => setStep(0)}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 transition-colors text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                        </svg>
                        Back to Bag
                      </motion.button>
                    </div>
                    <CheckoutForm form={form} errors={errors} onChange={handleFieldChange}
                      onSubmit={handleSubmit} loading={submitting} />
                  </div>

                  {/* Summary — 2 cols */}
                  <div className="lg:col-span-2">
                    <OrderSummary cart={cart} shipping={selectedShipping} coupon={coupon}
                      shippingOptions={SHIPPING_TIERS} selectedShipping={selectedShipping}
                      onShippingChange={setSelectedShipping} step={step} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 2 — Order Confirmed
            ══════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}>
                <SuccessScreen orderNumber={orderNumber} cart={cart} total={orderTotal} />
              </motion.div>
            )}

          </AnimatePresence>
        )}

        {/* ── Bottom trust bar ── */}
        {step < 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "🔒", title: "Encrypted", sub: "256-bit SSL security on all transactions" },
              { icon: "🚀", title: "Fast Delivery", sub: "Same-day dispatch on orders before 2pm" },
              { icon: "↩️", title: "Easy Returns", sub: "30-day hassle-free return policy" },
              { icon: "🏆", title: "Award Winning", sub: "#1 customer satisfaction 3 years running" },
            ].map((b) => (
              <div key={b.title} className="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-indigo-100 hover:shadow-sm transition-all duration-200">
                <div className="text-3xl mb-2">{b.icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{b.title}</p>
                <p className="text-gray-400 text-[11px] leading-relaxed">{b.sub}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}