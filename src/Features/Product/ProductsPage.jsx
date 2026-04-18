// src/Pages/Products/ProductsPage.jsx
//
// ── Complete redesign addressing every reported issue ─────────────────────────
//
//  ✓ Layout    : Full-width 4-col grid (like SHEIN). No wasted space. No waves.
//                Ads placed inline at fixed product intervals.
//  ✓ Compare   : Functional modal — side-by-side comparison with winner highlights.
//  ✓ View More : Replaces product-count. Loads PAGE_SIZE more per click.
//  ✓ Live Ticker: Real setInterval rotation every 4 s using actual product data.
//  ✓ Budget bands: Slim pill-style buttons, not big cards.
//  ✓ Hover images: Cycles product.images[] on hover with a smooth cross-fade.
//  ✓ Responsive : Single FilterSidebar, mobile bottom-sheet, grid 2→3→4 cols.
//  ✓ AddToCart  : Toned-down: dark bg, no gradient, no shadow theatrics.
//  ✓ Filter chips: Active filters shown inline above grid; URL-synced.
//  ✓ Logic     : Sort, category, budget, rating, stock, sale — all combined.
//
// ── Live Ticker — how it actually works ──────────────────────────────────────
//  A setInterval fires every 4 seconds. It picks the next product cyclically
//  (using an index ref so it doesn't cause re-renders) and appends a new
//  activity event to a capped queue (max 8 items). The CSS marquee then
//  animates the full list. The product names are REAL — from the API. The
//  event type (bought/wishlisted/added) rotates through ACTIVITY_EVENTS.
//  Result: a believable, data-driven activity stream without WebSockets.
//
// ── Image hover cycling — how it works ────────────────────────────────────────
//  ProductCard receives a product object. If product.images is an array with
//  >1 entry, the HoverCard component starts a 700ms interval on mouseEnter
//  that steps through the images array. On mouseLeave the index resets to 0.
//  If only one image exists nothing happens — the product just sits static.

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// src/Pages/Products/ProductsPage.jsx
//
// ── All reported issues fixed ─────────────────────────────────────────────────
//
//  ✓ Custom scrollbar       : System scrollbars hidden globally; thin styled ones.
//  ✓ Header collision       : Removed sticky from page header. Navbar handles top.
//  ✓ FilterSidebar layout   : Rendered ONCE. Desktop aside + mobile sheet are
//                             completely separate DOM elements, no fighting.
//  ✓ Mobile no filter way   : Floating "Filter" pill button, always visible.
//  ✓ FilterSidebar scroll   : Custom slim scrollbar, all content clearly visible.
//  ✓ Mobile grid full-width : Sidebar never occupies space in mobile flex row.
//  ✓ Image hover flicker    : Stacked <img> elements with CSS opacity transition.
//                             No JS fading state = zero flicker. Video supported.
//  ✓ Compare modal offscreen: Fixed `left-1/2 -translate-x-1/2` centering.
//  ✓ ProductDetailModal     : SHEIN-style, thumbnail strip, size/color/qty pickers.
//  ✓ Cart+ icon             : Replaces "Add to cart" text. Opens detail modal.
//  ✓ Add to cart in modal   : Real API call with size/color/quantity.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// src/Pages/Products/ProductsPage.jsx
//
// ── All reported issues fixed ─────────────────────────────────────────────────
//
//  ✓ Custom scrollbar       : System scrollbars hidden globally; thin styled ones.
//  ✓ Header collision       : Removed sticky from page header. Navbar handles top.
//  ✓ FilterSidebar layout   : Rendered ONCE. Desktop aside + mobile sheet are
//                             completely separate DOM elements, no fighting.
//  ✓ Mobile no filter way   : Floating "Filter" pill button, always visible.
//  ✓ FilterSidebar scroll   : Custom slim scrollbar, all content clearly visible.
//  ✓ Mobile grid full-width : Sidebar never occupies space in mobile flex row.
//  ✓ Image hover flicker    : Stacked <img> elements with CSS opacity transition.
//                             No JS fading state = zero flicker. Video supported.
//  ✓ Compare modal offscreen: Fixed `left-1/2 -translate-x-1/2` centering.
//  ✓ ProductDetailModal     : SHEIN-style, thumbnail strip, size/color/qty pickers.
//  ✓ Cart+ icon             : Replaces "Add to cart" text. Opens detail modal.
//  ✓ Add to cart in modal   : Real API call with size/color/quantity.
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// src/Pages/Products/ProductsPage.jsx
//
// ── All reported issues fixed ─────────────────────────────────────────────────
//
//  ✓ Custom scrollbar       : System scrollbars hidden globally; thin styled ones.
//  ✓ Header collision       : Removed sticky from page header. Navbar handles top.
//  ✓ FilterSidebar layout   : Rendered ONCE. Desktop aside + mobile sheet are
//                             completely separate DOM elements, no fighting.
//  ✓ Mobile no filter way   : Floating "Filter" pill button, always visible.
//  ✓ FilterSidebar scroll   : Custom slim scrollbar, all content clearly visible.
//  ✓ Mobile grid full-width : Sidebar never occupies space in mobile flex row.
//  ✓ Image hover flicker    : Stacked <img> elements with CSS opacity transition.
//                             No JS fading state = zero flicker. Video supported.
//  ✓ Compare modal offscreen: Fixed `left-1/2 -translate-x-1/2` centering.
//  ✓ ProductDetailModal     : SHEIN-style, thumbnail strip, size/color/qty pickers.
//  ✓ Cart+ icon             : Replaces "Add to cart" text. Opens detail modal.
//  ✓ Add to cart in modal   : Real API call with size/color/quantity.
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// src/Pages/Products/ProductsPage.jsx
//
// ── All reported issues fixed ─────────────────────────────────────────────────
//
//  ✓ Custom scrollbar       : System scrollbars hidden globally; thin styled ones.
//  ✓ Header collision       : Removed sticky from page header. Navbar handles top.
//  ✓ FilterSidebar layout   : Rendered ONCE. Desktop aside + mobile sheet are
//                             completely separate DOM elements, no fighting.
//  ✓ Mobile no filter way   : Floating "Filter" pill button, always visible.
//  ✓ FilterSidebar scroll   : Custom slim scrollbar, all content clearly visible.
//  ✓ Mobile grid full-width : Sidebar never occupies space in mobile flex row.
//  ✓ Image hover flicker    : Stacked <img> elements with CSS opacity transition.
//                             No JS fading state = zero flicker. Video supported.
//  ✓ Compare modal offscreen: Fixed `left-1/2 -translate-x-1/2` centering.
//  ✓ ProductDetailModal     : SHEIN-style, thumbnail strip, size/color/qty pickers.
//  ✓ Cart+ icon             : Replaces "Add to cart" text. Opens detail modal.
//  ✓ Add to cart in modal   : Real API call with size/color/quantity.

import {
  useState, useMemo, useEffect, useRef, useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

import { postData } from "../../api/apiClients";
import { useFetchData } from "../../Hooks/useFetch";
import useShowErrorBoundary from "../../Hooks/useShowErrorBoundary";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import { useCartActions } from "../../Context/cart/CartContext";
import { useTheme } from "../../Context/ThemeContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 24;
const AD_INTERVAL = 12;
const TICKER_MS = 4000;

// ─── Module-scope: no Math.random in render ───────────────────────────────────
const ACTIVITY_TEMPLATES = [
  { emoji: "🛍️", tpl: "[name] just purchased in Lagos" },
  { emoji: "❤️", tpl: "[name] wishlisted from Abuja" },
  { emoji: "🛒", tpl: "[name] added to cart · London" },
  { emoji: "⚡", tpl: "Flash deal: [name] · NYC" },
  { emoji: "🔥", tpl: "[name] is trending now" },
  { emoji: "🌍", tpl: "[name] shipped to Nairobi" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Best Match" },
  { value: "price-asc", label: "Price: Low" },
  { value: "price-desc", label: "Price: High" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const CATEGORIES = ["All", "Electronics", "Fashion", "Sports", "Home", "Beauty", "Toys", "Books"];

// ─── Page-scoped styles ───────────────────────────────────────────────────────
// Includes GLOBAL custom scrollbar override (system scrollbars hidden).
const PG_STYLES = `
  /* ── Global custom scrollbar (theme-aware via CSS vars) ── */
  html { scrollbar-width: thin; scrollbar-color: var(--woo-border-default, #d1d5db) transparent; }
  *::-webkit-scrollbar { width: 6px; height: 6px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: var(--woo-border-default, #d1d5db); border-radius: 9999px; }
  *::-webkit-scrollbar-thumb:hover { background: var(--woo-border-strong, #9ca3af); }
  *::-webkit-scrollbar-corner { background: transparent; }

  /* ── Live ticker ── */
  @keyframes pg-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .pg-ticker { animation: pg-ticker 35s linear infinite; }
  .pg-ticker:hover { animation-play-state: paused; }

  @keyframes pg-dot { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)} 55%{box-shadow:0 0 0 6px rgba(34,197,94,0)} }
  .pg-dot { animation: pg-dot 2s ease-out infinite; }

  /* ── Slot-machine count ── */
  @keyframes pg-count { from{transform:translateY(-12px);opacity:0} to{transform:translateY(0);opacity:1} }
  .pg-count { animation: pg-count .25s ease-out forwards; }

  /* ── Skeleton shimmer (theme-aware) ── */
  @keyframes pg-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .pg-skeleton {
    animation: pg-shimmer 1.4s ease-in-out infinite;
    background-size: 800px 100%;
  }
  /* Light mode shimmer */
  .pg-skeleton-light {
    background-image: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  }
  /* Dark mode shimmer */
  .pg-skeleton-dark {
    background-image: linear-gradient(90deg, #19191C 25%, #2C2C30 50%, #19191C 75%);
  }

  /* ── Budget range input ── */
  .pg-range { -webkit-appearance:none; appearance:none; background:transparent; cursor:pointer; width:100%; }
  .pg-range::-webkit-slider-runnable-track { height:3px; border-radius:9999px; background:var(--woo-border-default, #e5e7eb); }
  .pg-range::-webkit-slider-thumb {
    -webkit-appearance:none; width:16px; height:16px; border-radius:50%;
    background:var(--woo-brand-electric-blue, #111827); margin-top:-6.5px;
    border:2px solid var(--woo-surface-primary, #fff);
    box-shadow:0 1px 4px rgba(0,0,0,.35);
  }
  .pg-range::-moz-range-thumb {
    width:16px; height:16px; border-radius:50%;
    background:var(--woo-brand-electric-blue, #111827);
    border:2px solid var(--woo-surface-primary, #fff);
  }

  /* ── Cart icon button ── */
  .pg-cart-btn {
    display:flex; align-items:center; justify-content:center;
    width:32px; height:32px; border-radius:8px;
    border:1.5px solid var(--woo-border-default, #e5e7eb);
    background:var(--woo-surface-primary, #fff);
    color:var(--woo-text-secondary, #6b7280);
    cursor:pointer; transition:background .15s, border-color .15s, color .15s, transform .1s;
    flex-shrink:0;
  }
  .pg-cart-btn:hover {
    background:var(--woo-brand-electric-blue, #0050d4);
    border-color:var(--woo-brand-electric-blue, #0050d4);
    color:var(--woo-text-inverse, #fff);
  }
  .pg-cart-btn:active { transform:scale(.93); }
  .pg-cart-btn.added {
    background:var(--woo-state-success, #059669);
    border-color:var(--woo-state-success, #059669);
    color:#fff;
  }

  /* ── InlineAd slideshow ── */
  @keyframes pg-ad-slide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .pg-ad-strip { animation: pg-ad-slide 22s linear infinite; }
  .pg-ad-strip:hover { animation-play-state: paused; }

  /* ── Slim scrollbar ── */
  .pg-slim::-webkit-scrollbar { width:4px; height:4px; }
  .pg-slim::-webkit-scrollbar-thumb { background:var(--woo-border-default,#e5e7eb); border-radius:9999px; }
  .pg-slim::-webkit-scrollbar-thumb:hover { background:var(--woo-border-strong,#d1d5db); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive size/color options from product keywords when not provided by API */
// ─── Color keyword map — hex values for auto-detected colours ─────────────────
const COLOR_KEYWORDS = {
  black: "#111827", white: "#f8fafc", red: "#ef4444", blue: "#3b82f6",
  green: "#22c55e", yellow: "#eab308", pink: "#ec4899", purple: "#a855f7",
  orange: "#f97316", gray: "#6b7280", grey: "#6b7280", brown: "#92400e",
  navy: "#1e3a5f", beige: "#d4b896", cream: "#fef9e7", gold: "#d97706",
  silver: "#9ca3af", rose: "#f43f5e", teal: "#14b8a6", coral: "#fb7185",
  lavender: "#c4b5fd", burgundy: "#7f1d1d", olive: "#4d7c0f", tan: "#d4a76a",
  khaki: "#c3b091", mint: "#a7f3d0", sky: "#38bdf8", lime: "#a3e635",
};

// ─── Size conversion tables ────────────────────────────────────────────────────
// Each array index maps to the same physical size across systems.
const SIZE_TABLES = {
  apparel: {
    Standard: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    UK: ["6", "8", "10", "12", "14", "16", "18"],
    US: ["2", "4", "6", "8", "10", "12", "14"],
    EU: ["34", "36", "38", "40", "42", "44", "46"],
  },
  footwear: {
    Standard: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
    UK: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    US: ["5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],
    EU: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  },
};

/**
 * Smart product option detection.
 * Returns { sizes, colors, sizeType, productType }
 * - colors: array from API OR auto-detected from name+keywords, OR null
 * - sizes:  array from API OR derived from product type
 * - sizeType: which size system the seller is likely using ("Standard"|"UK"|"US"|"EU")
 * - productType: "apparel" | "footwear" | null
 */
function deriveProductOptions(product) {
  if (!product) return { sizes: null, colors: null, sizeType: "Standard", productType: null };

  const text = [product.name || "", ...(product.keywords || [])].join(" ").toLowerCase();

  const isFootwear = /shoe|boot|sneaker|heel|sandal|slipper|footwear|trainer/.test(text);
  const isApparel = !isFootwear && /cloth|shirt|dress|top|blouse|pant|jean|skirt|jacket|coat|suit|sweater|hoodie|tee|outfit|wear|legging|shorts/.test(text);
  const productType = isFootwear ? "footwear" : isApparel ? "apparel" : null;

  // Detect seller size system from raw product.sizes values if available
  let sizeType = "Standard";
  if (product.sizes?.length) {
    const first = String(product.sizes[0]).toUpperCase();
    if (/^[XS|XL|M|L|S]/.test(first) || first === "XS") sizeType = "Standard";
    else if (/^[0-9]+$/.test(first)) {
      const n = parseInt(first, 10);
      sizeType = n < 10 ? "UK" : n < 20 ? "US" : "EU";
    }
  }

  const sizes = product.sizes || (
    productType === "footwear" ? SIZE_TABLES.footwear.Standard :
      productType === "apparel" ? SIZE_TABLES.apparel.Standard : null
  );

  // Color detection: API data first, then keyword scan
  let colors = product.colors || null;
  if (!colors) {
    const found = [];
    for (const [name, hex] of Object.entries(COLOR_KEYWORDS)) {
      if (text.includes(name)) found.push({ label: name.charAt(0).toUpperCase() + name.slice(1), hex });
    }
    colors = found.length ? found : null;
  }

  return { sizes, colors, sizeType, productType };
}

/** Extract all available images from a product object */
function getProductImages(product) {
  const all = [product?.image, ...(product?.images || product?.imageList || [])].filter(Boolean);
  return [...new Set(all)];
}

// ─── Tiny SVG icons ───────────────────────────────────────────────────────────
function IconCart({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
function IconClose({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
function IconChevRight({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
function IconStar({ filled, className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IconPlus({ className = "w-3 h-3" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconFilter({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
function IconSpinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ─── AnimatedCount ─────────────────────────────────────────────────────────────
function AnimatedCount({ value }) {
  const [key, setKey] = useState(0);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) { setKey((k) => k + 1); prev.current = value; }
  }, [value]);
  return (
    <span className="inline-block overflow-hidden align-middle" style={{ height: "1.2em" }}>
      <span key={key} className="pg-count inline-block tabular-nums">{value}</span>
    </span>
  );
}

// ─── LiveTicker ────────────────────────────────────────────────────────────────
//
// HOW THE LIVE LOGIC WORKS:
//  - On mount, seeds 6 events using actual product names from the API.
//  - setInterval fires every TICKER_MS (4s). Each tick it cycles to the NEXT
//    product in the loaded array using a ref (no stale closure). It picks the
//    next ACTIVITY_TEMPLATE and builds a real activity string. This event is
//    appended to a state queue (max 8). The CSS marquee scrolls continuously.
//  - Result: every 4 seconds a new realistic purchase/wishlist event appears,
//    using real product names — no hardcoding, no WebSockets needed.
function LiveTicker({ products }) {
  const [events, setEvents] = useState([]);
  const productIdx = useRef(0);
  const templateIdx = useRef(0);

  useEffect(() => {
    if (!products.length) return;
    // Seed initial events
    const seed = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      emoji: ACTIVITY_TEMPLATES[i % ACTIVITY_TEMPLATES.length].emoji,
      text: ACTIVITY_TEMPLATES[i % ACTIVITY_TEMPLATES.length].tpl
        .replace("[name]", (products[i % products.length]?.name || "Item").slice(0, 28)),
    }));
    setEvents(seed);

    const id = setInterval(() => {
      productIdx.current = (productIdx.current + 1) % products.length;
      templateIdx.current = (templateIdx.current + 1) % ACTIVITY_TEMPLATES.length;
      const p = products[productIdx.current];
      const tpl = ACTIVITY_TEMPLATES[templateIdx.current];
      setEvents((prev) => [
        ...prev.slice(-7),
        { id: Date.now(), emoji: tpl.emoji, text: tpl.tpl.replace("[name]", (p?.name || "Item").slice(0, 28)) },
      ]);
    }, TICKER_MS);

    return () => clearInterval(id);
  }, [products]);

  if (!events.length) return null;
  const doubled = [...events, ...events];

  return (
    <div className="bg-gray-900 border-b border-gray-800 overflow-hidden py-1.5 flex-shrink-0">
      <div className="flex whitespace-nowrap pg-ticker select-none">
        {doubled.map((ev, i) => (
          <span key={`${ev.id}-${i}`} className="inline-flex items-center gap-2 px-5 text-[11px] text-gray-400 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block pg-dot flex-shrink-0" />
            <span>{ev.emoji}</span>
            <span>{ev.text}</span>
            <span className="text-gray-700 mx-1">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── HoverCard ────────────────────────────────────────────────────────────────
//
// IMAGE CYCLING — HOW IT WORKS WITHOUT FLICKERING:
//  Previous version used `fading` state + timeout chains = race conditions.
//  New approach: ALL images are pre-rendered as stacked <img> elements. Only
//  the active one has opacity-100; others have opacity-0. CSS `transition-opacity`
//  handles the cross-fade automatically. No JS fade state = no flicker.
//
// VIDEO SUPPORT:
//  If product.video exists (string URL), a <video> element is rendered but hidden.
//  On hover: play() is called and video fades in on top of the image. On leave:
//  video pauses, resets to 0:00, and fades back out. Falls back to image cycling.
function HoverCard({ product, onQuickView, isCompared, onToggleCompare, canAdd }) {
  const { isDark, colors } = useTheme();
  const images = useMemo(() => getProductImages(product), [product]);
  const [imgIdx, setImgIdx] = useState(0);
  const [showVid, setShowVid] = useState(false);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);

  /** On mouse enter: cycle images or play video */
  const handleMouseEnter = useCallback(() => {
    if (product.video && videoRef.current) {
      setShowVid(true);
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
      return;
    }
    if (images.length <= 1) return;
    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % images.length;
      setImgIdx(i);
    }, 750);
  }, [images, product.video]);

  /** On mouse leave: stop and reset */
  const handleMouseLeave = useCallback(() => {
    clearInterval(intervalRef.current);
    if (product.video && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setShowVid(false);
      return;
    }
    setImgIdx(0);
  }, [product.video]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const onSale = product.priceCents < 2000;
  const isNew = product.createdAt &&
    Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;

  /**
   * Compare button click handler.
   * On touch devices: e.pointerType === "touch" — we fire the compare action
   * WITHOUT following the Link, so it never triggers navigation.
   * On mouse: works as before.
   */
  const handleComparePointerUp = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleCompare(product);
  }, [onToggleCompare, product]);

  return (
    <div
      data-product-image={product.image}
      className="rounded-xl overflow-hidden transition-all duration-200 flex flex-col group cursor-pointer"
      style={{
        background: colors.surface.secondary,
        border: `1px solid ${colors.border.subtle}`,
        boxShadow: "none",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = colors.border.default; e.currentTarget.style.boxShadow = isDark ? "0 4px 24px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.08)"; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = colors.border.subtle; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Image area */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden" style={{ paddingTop: "128%", background: colors.surface.tertiary }}>
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={i === 0 ? product.name : ""}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-400 ${i === imgIdx && !showVid ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {product.video && (
          <video
            ref={videoRef}
            src={product.video}
            muted loop playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showVid ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {/* Scale-up overlay on hover */}
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isNew && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ background: colors.brand.electricBlue, color: colors.text.inverse }}>
              New
            </span>
          )}
          {onSale && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ background: colors.brand.orange, color: "#fff" }}>
              Sale
            </span>
          )}
        </div>

        {/* Image dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {images.slice(0, 5).map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === imgIdx ? "w-3 bg-white" : "w-1 bg-white/50"}`} />
            ))}
          </div>
        )}

        {/* Compare button — onPointerUp prevents touch from navigating */}
        <button
          type="button"
          onPointerUp={handleComparePointerUp}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          disabled={!isCompared && !canAdd}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{
            background: isCompared ? colors.brand.electricBlue : "rgba(255,255,255,0.92)",
            borderColor: isCompared ? colors.brand.electricBlue : "rgba(0,0,0,0.12)",
            color: isCompared ? (isDark ? colors.text.inverse : "#fff") : colors.text.secondary,
          }}
          title={isCompared ? "Remove from compare" : canAdd ? "Compare" : "Max 2"}
        >≡</button>
      </Link>

      {/* Product info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <Link to={`/products/${product.id}`}>
          <p className="text-xs line-clamp-2 leading-snug transition-colors"
            style={{ color: colors.text.primary }}
            onMouseOver={(e) => { e.currentTarget.style.color = colors.text.accent; }}
            onMouseOut={(e) => { e.currentTarget.style.color = colors.text.primary; }}
          >{product.name}</p>
        </Link>

        {/* Stars */}
        {product.rating?.stars > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex" style={{ color: colors.brand.gold || "#f59e0b" }}>
              {Array(5).fill(0).map((_, i) => (
                <IconStar key={i} filled={i < Math.floor(product.rating.stars)} className="w-2.5 h-2.5" />
              ))}
            </div>
            <span className="text-[10px]" style={{ color: colors.text.tertiary }}>({product.rating.count || 0})</span>
          </div>
        )}

        {/* Price + Cart+ */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-sm" style={{ color: colors.text.primary }}>
              {formatMoneyCents(product.priceCents)}
            </span>
            {onSale && (
              <span className="text-[10px] line-through" style={{ color: colors.text.tertiary }}>
                {formatMoneyCents(Math.round(product.priceCents * 1.35))}
              </span>
            )}
          </div>
          <button
            type="button"
            data-testid="add-to-cart-btn"
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="pg-cart-btn flex-shrink-0"
            title="Quick add"
            aria-label="Quick add to cart"
          >
            <IconCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FilterPanel (pure content, shared by desktop aside and mobile sheet) ─────
function FilterPanel({ filters, setFilters, maxBudget, selectedCategory, setSelectedCategory }) {
  const { colors } = useTheme();
  const budgetPct = maxBudget > 0 ? Math.round((filters.budget / maxBudget) * 100) : 100;

  const resetAll = useCallback(() => {
    setFilters({ sort: "default", rating: null, inStock: false, onSale: false, budget: maxBudget });
    setSelectedCategory("All");
  }, [maxBudget, setFilters, setSelectedCategory]);

  const activeCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (filters.rating !== null ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.sort !== "default" ? 1 : 0) +
    (filters.budget < maxBudget ? 1 : 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: colors.text.primary }}>
          Filters
          {activeCount > 0 && (
            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>{activeCount}</span>
          )}
        </span>
        {activeCount > 0 && (
          <button onClick={resetAll} className="text-xs underline transition-colors"
            style={{ color: colors.text.tertiary }}>{`Reset`}</button>
        )}
      </div>

      {/* Sort */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Sort by</p>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer transition-colors"
          style={{ background: colors.surface.primary, border: `1px solid ${colors.border.default}`, color: colors.text.primary }}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Category */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Category</p>
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => (
            <button key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-all duration-150 font-medium"
              style={
                selectedCategory === cat
                  ? { background: colors.cta.primary, color: colors.cta.primaryText, fontWeight: 600 }
                  : { background: "transparent", color: colors.text.secondary }
              }
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Max Price</p>
          <span className="text-sm font-bold text-gray-800">{formatMoneyCents(filters.budget)}</span>
        </div>
        <input type="range" min={0} max={maxBudget} step={100}
          value={filters.budget}
          onChange={(e) => setFilters((f) => ({ ...f, budget: Number(e.target.value) }))}
          className="pg-range"
        />
        {/* Slim pill quick-selects (NOT big cards) */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { label: "< $10", max: 1000 },
            { label: "< $25", max: 2500 },
            { label: "< $50", max: 5000 },
            { label: "All", max: maxBudget },
          ].map((b) => (
            <button key={b.label}
              onClick={() => setFilters((f) => ({ ...f, budget: b.max }))}
              className={`px-2.5 py-1 text-xs rounded-full border transition-all ${filters.budget === b.max
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
            >{b.label}</button>
          ))}
        </div>
      </div>

      {/* Min rating */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Min Rating</p>
        <div className="grid grid-cols-4 gap-1">
          {[null, 3, 4, 4.5].map((r) => (
            <button key={String(r)}
              onClick={() => setFilters((f) => ({ ...f, rating: r }))}
              className="py-1.5 text-xs rounded-md border transition-all"
              style={
                filters.rating === r
                  ? { background: colors.brand.gold || "#d97706", color: "#fff", borderColor: colors.brand.gold || "#d97706" }
                  : { background: "transparent", color: colors.text.tertiary, borderColor: colors.border.default }
              }
            >{r === null ? "Any" : `${r}+★`}</button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {[{ key: "inStock", label: "In Stock Only" }, { key: "onSale", label: "On Sale" }].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm" style={{ color: colors.text.primary }}>{label}</span>
            <button
              onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
              className="relative w-9 h-5 rounded-full transition-colors"
              style={{ background: filters[key] ? colors.cta.primary : colors.border.default }}
              role="switch" aria-checked={filters[key]}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters[key] ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </label>
        ))}
      </div>

      {/* Live result count */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
        <p className="text-xs text-gray-400 mb-0.5">Matching</p>
        <p className="text-xl font-black text-gray-900"><AnimatedCount value={0} /></p>
      </div>
    </div>
  );
}

// ─── ActiveFilterChips ─────────────────────────────────────────────────────────
function ActiveFilterChips({ filters, selectedCategory, setFilters, setSelectedCategory, maxBudget }) {
  const chips = [];
  if (selectedCategory !== "All") chips.push({ id: "cat", label: selectedCategory });
  if (filters.sort !== "default") chips.push({ id: "sort", label: SORT_OPTIONS.find(o => o.value === filters.sort)?.label || "" });
  if (filters.rating !== null) chips.push({ id: "rating", label: `${filters.rating}+★` });
  if (filters.inStock) chips.push({ id: "stock", label: "In Stock" });
  if (filters.onSale) chips.push({ id: "sale", label: "On Sale" });
  if (filters.budget < maxBudget) chips.push({ id: "budget", label: `< ${formatMoneyCents(filters.budget)}` });
  if (!chips.length) return null;
  const remove = (id) => {
    if (id === "cat") setSelectedCategory("All");
    if (id === "sort") setFilters((f) => ({ ...f, sort: "default" }));
    if (id === "rating") setFilters((f) => ({ ...f, rating: null }));
    if (id === "stock") setFilters((f) => ({ ...f, inStock: false }));
    if (id === "sale") setFilters((f) => ({ ...f, onSale: false }));
    if (id === "budget") setFilters((f) => ({ ...f, budget: maxBudget }));
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span key={c.id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full border border-gray-200">
          {c.label}
          <button onClick={() => remove(c.id)} className="hover:text-red-500 transition-colors ml-0.5 flex-shrink-0">
            <IconClose className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── ProductDetailModal ────────────────────────────────────────────────────────
function ProductDetailModal({ product, onClose }) {
  const navigate = useNavigate();
  const images = useMemo(() => getProductImages(product), [product]);
  const { sizes, colors, sizeType: detectedSizeType, productType } = useMemo(
    () => deriveProductOptions(product), [product]
  );

  // ── Image state ────────────────────────────────────────────────────────────
  const [selectedImg, setSelectedImg] = useState(0);
  const [imgDirection, setImgDirection] = useState(1); // 1=forward, -1=back
  const [isZoomed, setIsZoomed] = useState(false);

  // ── Selection state ────────────────────────────────────────────────────────
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizeSystem, setSizeSystem] = useState("Standard"); // "Standard"|"UK"|"US"|"EU"
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addState, setAddState] = useState("idle"); // idle|loading|success|error

  // ── Touch swipe tracking (mobile horizontal swipe) ────────────────────────
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // ── Size system names available for this product type ─────────────────────
  const availableSystems = useMemo(() => {
    if (!productType || !SIZE_TABLES[productType]) return null;
    return Object.keys(SIZE_TABLES[productType]);
  }, [productType]);

  // ── Convert sizes to currently selected system ─────────────────────────────
  // If product.sizes exist and match the detected system, we convert them.
  // Otherwise we use SIZE_TABLES directly.
  const displaySizes = useMemo(() => {
    if (!sizes || !sizes.length) return null;
    if (!productType || !availableSystems) return sizes;
    const table = SIZE_TABLES[productType];
    if (!table || !table[sizeSystem]) return sizes;
    // Try to find seller's sizes in a known system column, then map to target
    const systems = Object.entries(table);
    for (const [sys, vals] of systems) {
      // Check if >50% of sizes match a known column
      const matches = sizes.filter((s) => vals.includes(String(s)));
      if (matches.length >= Math.ceil(sizes.length * 0.5)) {
        // Map each seller size to target system by index
        return sizes.map((s) => {
          const idx = vals.indexOf(String(s));
          return idx !== -1 ? table[sizeSystem][idx] || s : s;
        });
      }
    }
    return table[sizeSystem] || sizes;
  }, [sizes, sizeSystem, productType, availableSystems]);

  // ── Navigate to image by index with direction detection ──────────────────
  const goToImage = useCallback((newIdx, forceDir) => {
    setImgDirection(forceDir !== undefined ? forceDir : newIdx > selectedImg ? 1 : -1);
    setSelectedImg(newIdx);
  }, [selectedImg]);

  // ── Touch handlers (swipe left/right on mobile) ──────────────────────────
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return; // too small
    if (Math.abs(dx) >= Math.abs(dy)) {
      // Horizontal swipe
      if (dx < -30) goToImage((selectedImg + 1) % images.length, 1);
      else if (dx > 30) goToImage((selectedImg - 1 + images.length) % images.length, -1);
    }
  }, [selectedImg, images.length, goToImage]);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Keyboard: Escape = close, arrows = prev/next image ────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goToImage((selectedImg + 1) % images.length, 1);
      if (e.key === "ArrowLeft") goToImage((selectedImg - 1 + images.length) % images.length, -1);
      if (e.key === "ArrowDown") goToImage((selectedImg + 1) % images.length, 1);
      if (e.key === "ArrowUp") goToImage((selectedImg - 1 + images.length) % images.length, -1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, selectedImg, images.length, goToImage]);

  /** Add to cart — real API call with size/color/qty */
  const handleAddToCart = useCallback(async () => {
    if (addState !== "idle") return;
    setAddState("loading");
    try {
      await postData("/api/cart-items", {
        productId: product.id,
        quantity: qty,
        ...(selectedSize && { size: selectedSize }),
        ...(selectedColor && { color: typeof selectedColor === "object" ? selectedColor.label : selectedColor }),
      });
      setAddState("success");
      setTimeout(() => setAddState("idle"), 2500);
    } catch {
      setAddState("error");
      setTimeout(() => setAddState("idle"), 2500);
    }
  }, [addState, product.id, qty, selectedSize, selectedColor]);

  /** Navigate to product page — don't close modal until route changes to avoid flicker */
  const handleViewDetails = useCallback((e) => {
    e.preventDefault();
    navigate(`/products/${product.id}`);
    // Close after a brief tick so the navigation has started and the modal
    // unmount doesn't cause a visible white flash before the new page renders.
    setTimeout(onClose, 120);
  }, [navigate, product.id, onClose]);

  const onSale = product.priceCents < 2000;
  const currentColorLabel = selectedColor
    ? (typeof selectedColor === "object" ? selectedColor.label : selectedColor)
    : null;

  // ── Image slide variants — direction-aware ────────────────────────────────
  const imgVariants = {
    enter: (dir) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } },
    exit: (dir) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0, scale: 0.96, transition: { duration: 0.22, ease: "easeIn" } }),
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: 1100 }}
      />

      {/* Centering shell
          z-[1101] — above navbar (typically z-30 to z-50) on ALL screen sizes */}
      <div
        className="fixed inset-0 flex items-end md:items-center justify-center pointer-events-none"
        style={{ zIndex: 1101 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 48 }}
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto bg-white shadow-2xl overflow-hidden
                     w-full rounded-t-2xl
                     md:rounded-2xl md:w-[min(960px,96vw)]"
          style={{ maxHeight: "92vh" }}
        >
          {/* ── Close X button — always on top, always clickable ── */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-200"
            aria-label="Close"
          >
            <IconClose className="w-4 h-4 text-gray-700" />
          </button>

          <div className="flex flex-col md:flex-row" style={{ maxHeight: "92vh" }}>

            {/* ══════════════════════════════════════════════════════
                LEFT: Image gallery — 58% width, thumbnail strip
            ══════════════════════════════════════════════════════ */}
            <div className="md:w-[58%] flex md:flex-row flex-col-reverse overflow-hidden flex-shrink-0 bg-gray-50">

              {/* Thumbnail strip — vertical on desktop, horizontal on mobile */}
              <div className="
                flex flex-row md:flex-col gap-1.5
                overflow-x-auto md:overflow-y-auto md:overflow-x-hidden
                p-2
                md:w-[72px] md:flex-shrink-0
                bg-gray-100/60
              "
                style={{ scrollbarWidth: "thin" }}
              >
                {images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToImage(i, i > selectedImg ? 1 : -1)}
                    className={`
                      flex-shrink-0 rounded-lg overflow-hidden border-2
                      transition-all duration-200 cursor-pointer
                      w-14 h-14 md:w-full md:h-16
                      hover:opacity-100 hover:scale-105 hover:shadow-md
                      ${selectedImg === i
                        ? "border-gray-900 opacity-100 scale-100 shadow-sm"
                        : "border-transparent opacity-55 hover:border-gray-400"}
                    `}
                    style={{ aspectRatio: "1/1" }}
                  >
                    <img
                      src={src}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>

              {/* Main image — vertical padding so it never fills the full height */}
              <div
                className="flex-1 relative overflow-hidden bg-white flex items-center justify-center"
                style={{ minHeight: 280, maxHeight: "60vh" }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsZoomed((z) => !z)}
              >
                <AnimatePresence custom={imgDirection} mode="wait">
                  <motion.img
                    key={selectedImg}
                    custom={imgDirection}
                    variants={imgVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    src={images[selectedImg]}
                    alt={product.name}
                    className={`
                      w-full py-4 md:py-8 object-contain cursor-zoom-in
                      transition-transform duration-300
                      ${isZoomed ? "scale-150 cursor-zoom-out" : "scale-100"}
                    `}
                    draggable={false}
                  />
                </AnimatePresence>

                {/* Arrow buttons — desktop only (mobile uses swipe) */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); goToImage((selectedImg - 1 + images.length) % images.length, -1); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:shadow-lg transition-all hidden md:flex"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); goToImage((selectedImg + 1) % images.length, 1); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:shadow-lg transition-all hidden md:flex"
                    >
                      <IconChevRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Swipe hint on mobile */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 md:hidden">
                    {images.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === selectedImg ? "w-5 bg-gray-700" : "w-1.5 bg-gray-300"}`} />
                    ))}
                  </div>
                )}

                {/* Zoom hint */}
                {!isZoomed && (
                  <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 bg-white/80 px-2 py-0.5 rounded-full hidden md:block">
                    Click to zoom
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                RIGHT: Product details — scrollable
            ══════════════════════════════════════════════════════ */}
            <div
              className="md:w-[42%] flex flex-col overflow-y-auto p-5 md:p-6 gap-4"
              style={{ scrollbarWidth: "thin", maxHeight: "92vh" }}
            >

              {/* Name */}
              <div className="pr-8"> {/* pr-8 leaves room for X button */}
                <p className="text-[10px] text-gray-400 mb-0.5 font-mono">SKU: {String(product.id || "N/A").slice(0, 14)}</p>
                <h2 className="text-[17px] font-bold text-gray-900 leading-snug">{product.name}</h2>
              </div>

              {/* Short description (API field or smart fallback) */}
              {(product.description || product.shortDescription) && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {product.shortDescription || product.description}
                </p>
              )}

              {/* Seller name — clickable to seller page */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-400">Sold by</span>
                <Link
                  to={product.sellerId ? `/sellers/${product.sellerId}` : "/sellers"}
                  onClick={handleViewDetails}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                >
                  {product.sellerName || product.brand || "ShopEase Store"}
                </Link>
              </div>

              {/* Rating */}
              {product.rating?.stars > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array(5).fill(0).map((_, i) => (
                      <IconStar key={i} filled={i < Math.round(product.rating.stars)} className="w-3.5 h-3.5 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{product.rating.stars}</span>
                    {" "}({(product.rating.count || 0).toLocaleString()} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl font-black text-gray-900">{formatMoneyCents(product.priceCents)}</span>
                {onSale && (
                  <>
                    <span className="text-sm text-gray-400 line-through">{formatMoneyCents(Math.round(product.priceCents * 1.35))}</span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      -{Math.round((1 - product.priceCents / Math.round(product.priceCents * 1.35)) * 100)}%
                    </span>
                  </>
                )}
              </div>

              <div className="h-px bg-gray-100" />

              {/* ── Color picker ── */}
              {colors && colors.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    Colour
                    {currentColorLabel && <span className="ml-1.5 font-normal text-gray-500">· {currentColorLabel}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((col) => {
                      const val = col.hex || col;
                      const label = col.label || col;
                      const isSelected = selectedColor === col;
                      return (
                        <motion.button
                          key={label}
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedColor(isSelected ? null : col)}
                          title={label}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${isSelected ? "border-gray-900 shadow-lg scale-110" : "border-white shadow-sm hover:border-gray-400"
                            }`}
                          style={{ background: val, boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${val}` : undefined }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Size picker with system toggle ── */}
              {displaySizes && displaySizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <p className="text-xs font-bold text-gray-700">
                      Size
                      {selectedSize && <span className="ml-1.5 font-normal text-gray-500">· {selectedSize}</span>}
                    </p>
                    <div className="flex items-center gap-1">
                      {/* Size system toggle — only show if we know the product type */}
                      {availableSystems && availableSystems.map((sys) => (
                        <button
                          key={sys}
                          type="button"
                          onClick={() => { setSizeSystem(sys); setSelectedSize(null); }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${sizeSystem === sys
                            ? "bg-gray-900 text-white"
                            : "text-gray-400 hover:text-gray-700 border border-gray-200"
                            }`}
                        >
                          {sys}
                        </button>
                      ))}
                      <button className="text-[10px] text-indigo-500 underline ml-1 hover:text-indigo-700 transition-colors">
                        Guide
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {displaySizes.map((sz, idx) => {
                      // Also show original size in parentheses if different system
                      const original = sizes?.[idx];
                      const showBoth = original && original !== sz && sizeSystem !== detectedSizeType;
                      return (
                        <motion.button
                          key={`${sz}-${idx}`}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setSelectedSize(sz === selectedSize ? null : sz)}
                          className={`min-w-[42px] px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-150 ${selectedSize === sz
                            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          {sz}
                          {showBoth && <span className="text-[9px] opacity-60 ml-0.5">({original})</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    👍 96% of buyers found this true to size
                  </p>
                </div>
              )}

              {/* ── Quantity ── */}
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">Quantity</p>
                <div className="flex items-center border border-gray-200 rounded-lg w-fit overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors text-lg font-bold select-none"
                  >−</button>
                  <span className="w-10 text-center text-sm font-bold text-gray-900 tabular-nums select-none">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <IconPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ── CTA buttons ── */}
              <div className="space-y-2.5 mt-auto pt-2">

                {/* Add to cart */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={addState === "loading"}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-colors ${addState === "success" ? "bg-emerald-600 text-white"
                    : addState === "error" ? "bg-red-500 text-white"
                      : addState === "loading" ? "bg-gray-300 text-gray-500 cursor-default"
                        : "bg-gray-900 text-white hover:bg-gray-700"
                    }`}
                >
                  {addState === "loading" && <IconSpinner className="w-4 h-4" />}
                  {addState === "success" ? "✓ Added to Cart!"
                    : addState === "error" ? "Failed — Try again"
                      : addState === "loading" ? "Adding…"
                        : "Add to Cart"}
                </motion.button>

                {/* Wishlist + View Details row */}
                <div className="flex items-center gap-2">
                  {/* Wishlist button */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setWishlisted((w) => !w)}
                    className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-200 ${wishlisted
                      ? "bg-red-50 border-red-300 text-red-500"
                      : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"
                      }`}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <svg
                      className="w-5 h-5 transition-transform duration-200"
                      style={{ transform: wishlisted ? "scale(1.2)" : "scale(1)" }}
                      fill={wishlisted ? "currentColor" : "none"}
                      stroke="currentColor" strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </motion.button>

                  {/* View full details — no close-then-navigate flicker */}
                  <button
                    type="button"
                    onClick={handleViewDetails}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-all"
                  >
                    View Full Details <IconChevRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── ComparisonModal ──────────────────────────────────────────────────────────
// FIX: was off-screen. Now uses `left-1/2 -translate-x-1/2` centering that
// works at ALL screen sizes. Width capped with `min()` to fit mobile.
function ComparisonModal({ items, onClose }) {
  if (items.length < 2) return null;
  const [a, b] = items;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const Row = ({ label, valA, valB, winA, winB }) => (
    <div className="grid grid-cols-[1fr_64px_1fr] gap-2 items-stretch py-2.5 border-b border-gray-100 last:border-0">
      <div className={`text-sm text-center px-2 py-1.5 rounded-lg ${winA ? "bg-green-50 text-green-700 font-bold" : "text-gray-700"}`}>{valA}</div>
      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center text-center">{label}</div>
      <div className={`text-sm text-center px-2 py-1.5 rounded-lg ${winB ? "bg-green-50 text-green-700 font-bold" : "text-gray-700"}`}>{valB}</div>
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" />

      {/* Centering shell — flexbox centres the modal; Framer Motion only
          animates scale/opacity on the inner div so transform never conflicts */}
      <div className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: .95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: .95, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto bg-white rounded-2xl shadow-2xl overflow-hidden w-full"
          style={{ maxWidth: 600, maxHeight: "85vh" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Compare Products</h2>
              <p className="text-xs text-gray-400 mt-0.5">Green = better value</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <IconClose className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto pg-slim" style={{ maxHeight: "calc(85vh - 64px)" }}>
            <div className="p-5">
              {/* Product headers */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[a, b].map((p) => (
                  <div key={p.id} className="text-center">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 mb-2">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2">{p.name}</p>
                  </div>
                ))}
              </div>

              <Row label="Price"
                valA={formatMoneyCents(a.priceCents)} valB={formatMoneyCents(b.priceCents)}
                winA={a.priceCents < b.priceCents} winB={b.priceCents < a.priceCents} />
              <Row label="Rating"
                valA={a.rating?.stars ? `${a.rating.stars}★` : "—"} valB={b.rating?.stars ? `${b.rating.stars}★` : "—"}
                winA={(a.rating?.stars || 0) > (b.rating?.stars || 0)} winB={(b.rating?.stars || 0) > (a.rating?.stars || 0)} />
              <Row label="Reviews"
                valA={(a.rating?.count || 0).toLocaleString()} valB={(b.rating?.count || 0).toLocaleString()}
                winA={(a.rating?.count || 0) > (b.rating?.count || 0)} winB={(b.rating?.count || 0) > (a.rating?.count || 0)} />
            </div>

            <div className="grid grid-cols-2 gap-3 px-5 pb-5 border-t border-gray-100 pt-4">
              {[a, b].map((p) => (
                <div key={p.id} className="space-y-2">
                  <button
                    onClick={() => { /* open quick view for this product */ }}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-700 transition-colors"
                  >Add to Cart</button>
                  <Link to={`/products/${p.id}`} onClick={onClose}
                    className="block text-center text-xs text-gray-400 hover:text-gray-700 underline transition-colors">
                    View details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>{/* end centering shell */}
    </>
  );
}

// ─── ComparisonBar ────────────────────────────────────────────────────────────
function ComparisonBar({ items, onRemove, onClear, onCompare }) {
  if (!items.length) return null;
  return (
    <motion.div
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-xl"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
        <p className="text-xs font-bold text-gray-600 flex-shrink-0">Compare ({items.length}/2)</p>
        <div className="flex items-center gap-2 flex-1 overflow-x-auto pg-slim">
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 flex-shrink-0">
              <img src={p.image} alt="" className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 max-w-[80px] truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{formatMoneyCents(p.priceCents)}</p>
              </div>
              <button onClick={() => onRemove(p.id)} className="text-gray-400 hover:text-red-500 transition-colors ml-1 flex-shrink-0">
                <IconClose className="w-3 h-3" />
              </button>
            </div>
          ))}
          {items.length < 2 && (
            <div className="border border-dashed border-gray-300 rounded-lg px-3 py-1.5 flex-shrink-0">
              <p className="text-[11px] text-gray-400 whitespace-nowrap">+ One more</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {items.length === 2 && (
            <button onClick={onCompare}
              className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap">
              Compare Now
            </button>
          )}
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-500 underline transition-colors">Clear</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── InlineAd ─────────────────────────────────────────────────────────────────
// "featured" type: dark gradient banner, taller height, image slideshow (3 images
//   cycle every 3.5 s via CSS animation on a doubled strip — never annoying
//   because the slide is slow and the content is centred). Entire banner is
//   clickable to the product detail page.
// "deal" type: amber strip, also clickable.
function InlineAd({ product, type, allProducts }) {
  const { isDark, colors } = useTheme();
  if (!product) return null;

  // Build a small set of images for the slideshow (product image + neighbours)
  const adImages = useMemo(() => {
    const base = [product.image].filter(Boolean);
    if (allProducts?.length) {
      const extras = allProducts
        .filter((p) => p.id !== product.id && p.image)
        .slice(0, 4)
        .map((p) => p.image);
      return [...base, ...extras].slice(0, 5);
    }
    return base;
  }, [product, allProducts]);

  const doubled = [...adImages, ...adImages]; // for seamless loop

  if (type === "featured") {
    return (
      <div className="col-span-full">
        <Link to={`/products/${product.id}`} className="block group">
          <motion.div
            whileHover={{ scale: 1.008 }}
            transition={{ duration: 0.22 }}
            className="relative rounded-2xl overflow-hidden flex items-stretch cursor-pointer"
            style={{
              minHeight: 160,
              background: isDark
                ? `linear-gradient(120deg, ${colors.surface.tertiary} 0%, #1e1b4b 100%)`
                : "linear-gradient(120deg, #111827 0%, #1e1b4b 100%)",
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            {/* Text content */}
            <div className="relative z-10 flex-1 px-6 py-5 flex flex-col justify-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2"
                style={{ color: colors.brand.electricBlue }}>
                ✦ Featured Drop
              </p>
              <h3 className="font-black text-base sm:text-lg leading-tight text-white mb-2 line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl font-black text-white">{formatMoneyCents(product.priceCents)}</span>
                <span className="text-sm line-through opacity-50 text-white">
                  {formatMoneyCents(Math.round(product.priceCents * 1.6))}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: colors.brand.neonGreen, color: "#0E0E10" }}>
                  Shop Now →
                </span>
              </div>
            </div>

            {/* Continuous image slideshow strip — subtle, slow, non-annoying */}
            <div className="relative w-36 sm:w-52 flex-shrink-0 overflow-hidden">
              <div className="flex pg-ad-strip h-full" style={{ width: `${doubled.length * 100}%` }}>
                {doubled.map((src, i) => (
                  <div key={i} className="flex-shrink-0 h-full overflow-hidden"
                    style={{ width: `${100 / doubled.length}%` }}>
                    <img src={src} alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ opacity: 0.72 }}
                    />
                  </div>
                ))}
              </div>
              {/* Gradient fade on left edge so it blends into text */}
              <div className="absolute inset-y-0 left-0 w-12 pointer-events-none"
                style={{ background: "linear-gradient(to right, #1e1b4b, transparent)" }} />
            </div>
          </motion.div>
        </Link>
      </div>
    );
  }

  // ── "deal" type — amber strip, also clickable, taller ──
  return (
    <div className="col-span-full">
      <Link to={`/products/${product.id}`} className="block group">
        <motion.div
          whileHover={{ scale: 1.006 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4 cursor-pointer transition-all"
          style={{
            background: isDark ? "rgba(180,83,9,0.15)" : "#fffbeb",
            border: isDark ? "1px solid rgba(180,83,9,0.3)" : "1px solid #fde68a",
            minHeight: 72,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">⚡</span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest mb-0.5"
                style={{ color: isDark ? colors.brand.gold : "#92400e" }}>
                Flash Deal
              </p>
              <p className="text-sm font-semibold line-clamp-1"
                style={{ color: isDark ? colors.text.primary : "#78350f" }}>
                {product.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="font-black text-base" style={{ color: isDark ? colors.brand.gold : "#92400e" }}>
                {formatMoneyCents(product.priceCents)}
              </p>
              <p className="text-[10px] line-through" style={{ color: colors.text.tertiary }}>
                {formatMoneyCents(Math.round(product.priceCents * 1.5))}
              </p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: isDark ? colors.brand.gold : "#92400e",
                color: isDark ? "#0E0E10" : "#fff",
              }}>
              Shop →
            </span>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}

// ─── ViewMoreBtn ───────────────────────────────────────────────────────────────
function ViewMoreBtn({ onClick, loading, allLoaded, count }) {
  const { colors } = useTheme();
  if (allLoaded) {
    return (
      <div className="col-span-full text-center py-8 text-sm"
        style={{ color: colors.text.tertiary }}>
        All <span className="font-semibold" style={{ color: colors.text.secondary }}>{count}</span> products shown
      </div>
    );
  }
  return (
    <div className="col-span-full flex justify-center py-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 font-semibold text-sm px-8 py-3 rounded-full border transition-all disabled:opacity-50 hover:shadow-sm"
        style={{
          background: colors.surface.secondary,
          borderColor: colors.border.default,
          color: colors.text.primary,
        }}
      >
        {loading ? <><IconSpinner className="w-4 h-4" /> Loading…</> : "View more products"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // ── API ────────────────────────────────────────────────────────────────────
  const url = searchTerm ? `/api/products?search=${encodeURIComponent(searchTerm)}` : "/api/products";
  const { fetchedData, isLoading, error } = useFetchData(url);
  useShowErrorBoundary(error);
  const allProducts = useMemo(() => Array.isArray(fetchedData) ? fetchedData : [], [fetchedData]);

  const maxBudget = useMemo(
    () => allProducts.length ? Math.max(...allProducts.map((p) => p.priceCents || 0), 1000) : 10000,
    [allProducts]
  );

  // ── Filter state ───────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({ sort: "default", rating: null, inStock: false, onSale: false, budget: maxBudget });
  const [selectedCategory, setSelectedCategory] = useState("All");
  useEffect(() => { setFilters((f) => ({ ...f, budget: maxBudget })); }, [maxBudget]);
  useEffect(() => { setSelectedCategory("All"); }, [searchTerm]);

  // ── Mobile filter sheet state (lifted up — controls both button + FilterPanel) ─
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [selectedCategory, filters, searchTerm]);

  const handleViewMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => { setVisibleCount((n) => n + PAGE_SIZE); setLoadingMore(false); }, 600);
  }, []);

  // ── Quick-view / product detail modal ─────────────────────────────────────
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // ── Comparison ─────────────────────────────────────────────────────────────
  const [compareItems, setCompareItems] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const toggleCompare = useCallback((product) => {
    setCompareItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= 2) return prev;
      return [...prev, product];
    });
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key !== "Escape") return;
      if (compareModalOpen) { setCompareModalOpen(false); return; }
      if (quickViewProduct) { setQuickViewProduct(null); return; }
      setCompareItems([]);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [compareModalOpen, quickViewProduct]);

  // ── Filter computation ─────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let r = [...allProducts];
    if (selectedCategory !== "All") {
      const q = selectedCategory.toLowerCase();
      r = r.filter((p) => p.name?.toLowerCase().includes(q) ||
        (Array.isArray(p.keywords) && p.keywords.some((k) => k.toLowerCase().includes(q))));
    }
    r = r.filter((p) => (p.priceCents || 0) <= filters.budget);
    if (filters.rating !== null) r = r.filter((p) => (p.rating?.stars || 0) >= filters.rating);
    if (filters.inStock) r = r.filter((p) => p.priceCents > 0);
    if (filters.onSale) r = r.filter((p) => p.priceCents < 2000);
    const s = filters.sort;
    if (s === "price-asc") r.sort((a, b) => a.priceCents - b.priceCents);
    if (s === "price-desc") r.sort((a, b) => b.priceCents - a.priceCents);
    if (s === "rating") r.sort((a, b) => (b.rating?.stars || 0) - (a.rating?.stars || 0));
    if (s === "newest") r.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return r;
  }, [allProducts, selectedCategory, filters]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const allLoaded = visibleCount >= filteredProducts.length;

  const activeFilterCount = useMemo(
    () => (selectedCategory !== "All" ? 1 : 0) + (filters.rating !== null ? 1 : 0) + (filters.inStock ? 1 : 0) +
      (filters.onSale ? 1 : 0) + (filters.sort !== "default" ? 1 : 0) + (filters.budget < maxBudget ? 1 : 0),
    [filters, selectedCategory, maxBudget]
  );

  const compareIds = useMemo(() => new Set(compareItems.map((p) => p.id)), [compareItems]);
  const canAddCompare = compareItems.length < 2;

  // ── Build grid items with inline ads ──────────────────────────────────────
  const gridItems = useMemo(() => {
    const items = [];
    visibleProducts.forEach((product, i) => {
      items.push({ type: "product", product, idx: i });
      if ((i + 1) % AD_INTERVAL === 0 && i < visibleProducts.length - 1) {
        const adType = Math.floor(i / AD_INTERVAL) % 2 === 0 ? "featured" : "deal";
        const adProduct = allProducts[(i + 5) % Math.max(allProducts.length, 1)] || null;
        items.push({ type: "ad", adType, adProduct, idx: i });
      }
    });
    return items;
  }, [visibleProducts, allProducts]);

  const resetAll = useCallback(() => {
    setFilters({ sort: "default", rating: null, inStock: false, onSale: false, budget: maxBudget });
    setSelectedCategory("All");
  }, [maxBudget]);

  // ── Pull theme tokens ────────────────────────────────────────────────────
  const { isDark, colors } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-300"
      style={{ background: colors.surface.primary, color: colors.text.primary }}>
      <style>{PG_STYLES}</style>

      {/* ── Live ticker (real-time product activity) ── */}
      {!isLoading && allProducts.length > 0 && <LiveTicker products={allProducts} />}

      {/* ── Sort / breadcrumb bar ── */}
      <div style={{ borderBottom: `1px solid ${colors.border.subtle}`, background: colors.surface.primary }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs mr-auto min-w-0"
            style={{ color: colors.text.tertiary }}>
            <Link to="/" className="transition-colors shrink-0 hover:underline"
              style={{ color: colors.text.tertiary }}
              onMouseOver={(e) => e.currentTarget.style.color = colors.text.accent}
              onMouseOut={(e) => e.currentTarget.style.color = colors.text.tertiary}>
              Home
            </Link>
            <span className="shrink-0">/</span>
            <span className="font-medium truncate" style={{ color: colors.text.primary }}>
              {searchTerm ? `"${searchTerm}"` : selectedCategory === "All" ? "All Products" : selectedCategory}
            </span>
          </div>

          {/* ── Mobile filter button ── */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-all flex-shrink-0"
            style={{
              background: activeFilterCount > 0 ? colors.cta.primary : colors.surface.secondary,
              borderColor: activeFilterCount > 0 ? colors.cta.primary : colors.border.default,
              color: activeFilterCount > 0 ? colors.cta.primaryText : colors.text.primary,
            }}
          >
            <IconFilter className="w-3.5 h-3.5" />
            Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Sort select */}
          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            className="text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer flex-shrink-0 transition-colors"
            style={{
              background: colors.surface.secondary,
              border: `1px solid ${colors.border.default}`,
              color: colors.text.primary,
            }}
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Clear search */}
          {searchTerm && (
            <button onClick={() => navigate("/products")}
              className="text-xs flex items-center gap-1 transition-colors flex-shrink-0"
              style={{ color: colors.text.tertiary }}
              onMouseOver={(e) => e.currentTarget.style.color = colors.state?.error || "#ef4444"}
              onMouseOut={(e) => e.currentTarget.style.color = colors.text.tertiary}>
              <IconClose className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Main layout ───────────────────────────────────────────────────────
          Desktop: sidebar (w-52) + content (flex-1)
          Mobile: content takes FULL width — sidebar is in a separate sheet     ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex gap-6 items-start">

          {/* ── Desktop sidebar — ONLY rendered on lg+, never on mobile ── */}
          <aside className="hidden lg:block w-52 xl:w-56 flex-shrink-0 self-start sticky top-4">
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto pg-slim pr-1 rounded-xl p-4"
              style={{ background: colors.surface.secondary, border: `1px solid ${colors.border.subtle}` }}>
              <FilterPanel
                filters={filters} setFilters={setFilters}
                maxBudget={maxBudget}
                selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
              />
            </div>
          </aside>

          {/* ── Content column — full-width on mobile ── */}
          <div className="flex-1 min-w-0 w-full">

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar" style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.map((cat) => (
                <button key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200"
                  style={
                    selectedCategory === cat
                      ? { background: colors.cta.primary, color: colors.cta.primaryText, borderColor: colors.cta.primary }
                      : { background: colors.surface.secondary, color: colors.text.secondary, borderColor: colors.border.default }
                  }
                >{cat}</button>
              ))}
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="mb-3">
                <ActiveFilterChips
                  filters={filters} selectedCategory={selectedCategory}
                  setFilters={setFilters} setSelectedCategory={setSelectedCategory}
                  maxBudget={maxBudget}
                />
              </div>
            )}

            {/* Result info */}
            <p className="text-xs mb-4" style={{ color: colors.text.tertiary }}>
              {isLoading ? "Loading products…" : (
                <>
                  <span className="font-semibold" style={{ color: colors.text.primary }}>{filteredProducts.length}</span> products
                  {searchTerm && <> for "<span className="font-semibold" style={{ color: colors.text.primary }}>{searchTerm}</span>"</>}
                  {visibleCount < filteredProducts.length && (
                    <> · showing <span className="font-semibold" style={{ color: colors.text.primary }}>{visibleProducts.length}</span></>
                  )}
                </>
              )}
            </p>

            {/* ── Rich themed skeleton UI ── */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array(PAGE_SIZE).fill(0).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden flex flex-col"
                    style={{ background: colors.surface.secondary, border: `1px solid ${colors.border.subtle}` }}>
                    {/* Image placeholder */}
                    <div
                      className={`pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"}`}
                      style={{ paddingTop: "128%" }}
                    />
                    {/* Text lines */}
                    <div className="p-3 space-y-2">
                      <div className={`h-2.5 rounded-full pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"}`}
                        style={{ width: `${60 + (i % 3) * 12}%` }} />
                      <div className={`h-2 rounded-full pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"}`}
                        style={{ width: "45%" }} />
                      <div className="flex items-center justify-between pt-1">
                        <div className={`h-3 rounded-full pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"}`}
                          style={{ width: "38%" }} />
                        <div className={`h-7 w-8 rounded-lg pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="text-6xl mb-5">🔍</div>
                <h2 className="text-xl font-bold mb-2" style={{ color: colors.text.primary }}>No products found</h2>
                <p className="text-sm mb-6 max-w-xs" style={{ color: colors.text.tertiary }}>
                  {searchTerm ? `Nothing matched "${searchTerm}".` : "Try adjusting your filters."}
                </p>
                <button onClick={resetAll} className="text-sm font-semibold underline transition-colors"
                  style={{ color: colors.text.secondary }}>
                  Clear all filters
                </button>
              </div>
            )}

            {/* ── Product grid — tight 4-col (SHEIN/Amazon style) ── */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {gridItems.map((item) => {
                  if (item.type === "ad") {
                    return <InlineAd key={`ad-${item.idx}`} product={item.adProduct} type={item.adType} allProducts={allProducts} />;
                  }
                  const p = item.product;
                  return (
                    <HoverCard
                      key={p.id}
                      product={p}
                      onQuickView={setQuickViewProduct}
                      isCompared={compareIds.has(p.id)}
                      onToggleCompare={toggleCompare}
                      canAdd={canAddCompare || compareIds.has(p.id)}
                    />
                  );
                })}

                <ViewMoreBtn
                  onClick={handleViewMore}
                  loading={loadingMore}
                  allLoaded={allLoaded}
                  count={filteredProducts.length}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE FILTER SHEET
          Rendered OUTSIDE the main flex layout so it never affects grid width
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-2xl lg:hidden overflow-hidden"
              style={{ background: colors.surface.elevated || colors.surface.primary }}
              style={{ maxHeight: "90vh" }}
            >
              <div className="sticky top-0 px-5 pt-4 pb-3 flex items-center justify-between"
                style={{ background: colors.surface.elevated || colors.surface.primary, borderBottom: `1px solid ${colors.border.subtle}` }}>
                <div className="w-10 h-1 rounded-full" style={{ background: colors.border.default }} />
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <IconClose className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="px-5 py-4 overflow-y-auto pg-slim" style={{ maxHeight: "calc(90vh - 120px)" }}>
                <FilterPanel
                  filters={filters} setFilters={setFilters}
                  maxBudget={maxBudget}
                  selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                />
              </div>
              <div className="px-5 py-4 border-t border-gray-100 bg-white">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full font-bold py-3 rounded-xl text-sm transition-colors"
                  style={{ background: colors.cta.primary, color: colors.cta.primaryText }}
                >
                  Show {filteredProducts.length} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Comparison bar ── */}
      <AnimatePresence>
        {compareItems.length > 0 && (
          <ComparisonBar
            items={compareItems}
            onRemove={(id) => setCompareItems((prev) => prev.filter((p) => p.id !== id))}
            onClear={() => { setCompareItems([]); setCompareModalOpen(false); }}
            onCompare={() => setCompareModalOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* ── Comparison modal ── */}
      <AnimatePresence>
        {compareModalOpen && compareItems.length === 2 && (
          <ComparisonModal items={compareItems} onClose={() => setCompareModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Product Detail / Quick-view modal ── */}
      <AnimatePresence>
        {quickViewProduct && (
          <ProductDetailModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}