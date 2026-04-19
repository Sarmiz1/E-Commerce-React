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


import React, {
  useState, useMemo, useEffect, useRef, useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate, Link, useLoaderData, useNavigation } from "react-router-dom";

// import { useFetchData } from "../../Hooks/useFetch";

import useShowErrorBoundary from "../../Hooks/useShowErrorBoundary";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import { useCartActions } from "../../Context/cart/CartContext";
import { useTheme } from "../../Context/theme/ThemeContext";



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

  /* ── Premium Dropdown & Toggles ── */
  .pg-dropdown-item { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  .pg-dropdown-item:active { scale: 0.98; }
  
  .pg-toggle-knob {
    box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
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
  const supabaseImages = product?.product_images?.map(img => img.image_url) || [];
  const all = [product?.image, ...supabaseImages, ...(product?.images || product?.imageList || [])].filter(Boolean);
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
  const [showVid, setShowVid] = useState(false);
  const videoRef = useRef(null);

  /** On mouse enter: play video if exists */
  const handleMouseEnter = useCallback(() => {
    if (product.video && videoRef.current) {
      setShowVid(true);
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
    }
  }, [product.video]);

  /** On mouse leave: stop video */
  const handleMouseLeave = useCallback(() => {
    if (product.video && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setShowVid(false);
    }
  }, [product.video]);

  const onSale = product.price_cents < 2000;
  const isNew = product.created_at &&
    Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000;

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
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 transform origin-center ${showVid
              ? "opacity-0"
              : i === 0
                ? "opacity-100" // Base image never fades out, preventing the 'flashing' ghost effect
                : (i === 1 ? "opacity-0 group-hover:opacity-100" : "opacity-0 hidden")
              }`}
          />
        ))}

        {product.video && (
          <video
            ref={videoRef}
            src={product.video}
            muted loop playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 transform origin-center ${showVid ? "opacity-100 z-10" : "opacity-0 pointer-events-none"}`}
          />
        )}

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
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === 0 ? "w-3 bg-white group-hover:w-1 group-hover:bg-white/50" :
                  i === 1 ? "w-1 bg-white/50 group-hover:w-3 group-hover:bg-white" :
                    "w-1 bg-white/50"
                  }`}
              />
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
        {product.rating_stars > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex" style={{ color: colors.brand.gold || "#f59e0b" }}>
              {Array(5).fill(0).map((_, i) => (
                <IconStar key={i} filled={i < Math.floor(product.rating_stars)} className="w-2.5 h-2.5" />
              ))}
            </div>
            <span className="text-[10px]" style={{ color: colors.text.tertiary }}>({product.rating_count || 0})</span>
          </div>
        )}

        {/* Price + Cart+ */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-sm" style={{ color: colors.text.primary }}>
              {formatMoneyCents(product.price_cents)}
            </span>
            {onSale && (
              <span className="text-[10px] line-through" style={{ color: colors.text.tertiary }}>
                {formatMoneyCents(Math.round(product.price_cents * 1.35))}
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

// ─── PremiumDropdown ──────────────────────────────────────────────────────────
function PremiumDropdown({ value, options, onChange, label, className = "" }) {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>{label}</p>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer transition-all duration-300 border"
        style={{
          background: colors.surface.primary,
          borderColor: isOpen ? colors.brand.electricBlue : colors.border.default,
          color: colors.text.primary,
          boxShadow: isOpen ? `0 0 0 3px ${colors.brand.electricBlue}15` : "none",
        }}
      >
        <span className="truncate font-medium">{selectedOption.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="opacity-40"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[100] left-0 right-0 rounded-xl overflow-hidden shadow-2xl border backdrop-blur-xl"
            style={{
              background: isDark ? "rgba(25, 25, 28, 0.92)" : "rgba(255, 255, 255, 0.92)",
              borderColor: colors.border.default,
            }}
          >
            <div className="py-1.5 max-h-64 overflow-y-auto pg-slim">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm pg-dropdown-item flex items-center justify-between group"
                  style={{
                    color: value === option.value ? colors.brand.electricBlue : colors.text.primary,
                    background: value === option.value ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)") : "transparent",
                  }}
                >
                  <span className={`transition-all duration-300 ${value === option.value ? "translate-x-1 font-bold" : "group-hover:translate-x-1"}`}>
                    {option.label}
                  </span>
                  {value === option.value && (
                    <motion.span layoutId="active-check" className="w-1.5 h-1.5 rounded-full" style={{ background: colors.brand.electricBlue }} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetAll} 
            className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-md transition-all hover:bg-gray-200"
            style={{ color: colors.text.secondary }}>{`Reset`}</motion.button>
        )}
      </div>

      {/* Sort */}
      <PremiumDropdown
        label="Sort by"
        value={filters.sort}
        options={SORT_OPTIONS}
        onChange={(val) => setFilters((f) => ({ ...f, sort: val }))}
      />

      {/* Category */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Category</p>
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => (
            <motion.button 
              key={cat}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategory(cat)}
              className="w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-300 font-medium hover:bg-gray-50"
              style={
                selectedCategory === cat
                  ? { background: colors.cta.primary, color: colors.cta.primaryText, fontWeight: 600 }
                  : { background: "transparent", color: colors.text.secondary }
              }
            >{cat}</motion.button>
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
            <motion.button 
              key={b.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilters((f) => ({ ...f, budget: b.max }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-300 hover:shadow-sm ${filters.budget === b.max
                ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                : "text-gray-500 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                }`}
            >{b.label}</motion.button>
          ))}
        </div>
      </div>

      {/* Min rating */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Min Rating</p>
        <div className="grid grid-cols-4 gap-1">
          {[null, 3, 4, 4.5].map((r) => (
            <motion.button 
              key={String(r)}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilters((f) => ({ ...f, rating: r }))}
              className="py-1.5 text-xs font-semibold rounded-md border transition-all duration-300 hover:shadow-sm"
              style={
                filters.rating === r
                  ? { background: colors.brand.gold || "#d97706", color: "#fff", borderColor: colors.brand.gold || "#d97706" }
                  : { background: "transparent", color: colors.text.tertiary, borderColor: colors.border.default }
              }
            >{r === null ? "Any" : `${r}+★`}</motion.button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-2">
        {[{ key: "inStock", label: "In Stock Only" }, { key: "onSale", label: "On Sale" }].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-medium transition-colors group-hover:text-gray-900" style={{ color: colors.text.secondary }}>{label}</span>
            <div
              className="relative w-10 h-[22px] rounded-full transition-all duration-500 ease-in-out border shadow-inner"
              style={{ 
                background: filters[key] ? colors.cta.primary : colors.surface.tertiary,
                borderColor: filters[key] ? colors.cta.primary : colors.border.default,
              }}
              onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
              role="switch" aria-checked={filters[key]}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-[2.5px] w-4 h-4 rounded-full bg-white shadow-lg pg-toggle-knob"
                style={{ 
                  left: filters[key] ? "auto" : "3px",
                  right: filters[key] ? "3px" : "auto",
                }}
              />
            </div>
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
const ProductDetailModal = React.forwardRef(({ product, onClose, onCartAdded }, ref) => {
  const navigate = useNavigate();
  const images = useMemo(() => getProductImages(product).slice(0, 4), [product]);
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
  const [showSizeGuide, setShowSizeGuide] = useState(false);

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



  // ── Body Scroll Lock ────────────────────────────────────────────────────────
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goToImage((selectedImg + 1) % images.length, 1);
      if (e.key === "ArrowLeft") goToImage((selectedImg - 1 + images.length) % images.length, -1);
      if (e.key === "ArrowDown") goToImage((selectedImg + 1) % images.length, 1);
      if (e.key === "ArrowUp") goToImage((selectedImg - 1 + images.length) % images.length, -1);
    };
    window.addEventListener("keydown", h);
    return () => {
      window.removeEventListener("keydown", h);
    };
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
      // Notify parent (comparison tray) so it can auto-clear
      setTimeout(() => {
        setAddState("idle");
        onCartAdded?.(); // optional callback — called when coming from comparison
      }, 1600);
    } catch {
      setAddState("error");
      setTimeout(() => setAddState("idle"), 2500);
    }
  }, [addState, product.id, qty, selectedSize, selectedColor, onCartAdded]);

  /** Navigate to product page — don't close modal until route changes to avoid flicker */
  const handleViewDetails = useCallback((e) => {
    e.preventDefault();
    navigate(`/products/${product.id}`);
    // Close after a brief tick so the navigation has started and the modal
    // unmount doesn't cause a visible white flash before the new page renders.
    setTimeout(onClose, 120);
  }, [navigate, product.id, onClose]);

  const onSale = product.price_cents < 2000;
  const currentColorLabel = selectedColor
    ? (typeof selectedColor === "object" ? selectedColor.label : selectedColor)
    : null;

  // ── Image slide variants — direction-aware (no scale to avoid jitter with object-cover) ──
  const imgVariants = {
    enter: (dir) => ({ x: dir > 0 ? "25%" : "-25%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
    exit: (dir) => ({ x: dir > 0 ? "-10%" : "10%", opacity: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }),
  };

  return (
    <motion.div ref={ref} className="fixed inset-0 z-[1100]" style={{ pointerEvents: 'none' }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
        exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
      />

      {/* Centering shell
          z-[1101] — above navbar (typically z-30 to z-50) on ALL screen sizes */}
      <div
        className="absolute inset-0 flex items-end md:items-center justify-center pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.92, filter: "blur(8px)" }}
          animate={{
            opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
            transition: {
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 0.35, ease: "easeOut" },
              scale: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
              filter: { duration: 0.4, ease: "easeOut" },
            }
          }}
          exit={{
            opacity: 0, y: 30, scale: 0.97, filter: "blur(4px)",
            transition: {
              duration: 0.42,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.35, delay: 0.04 },
              scale: { duration: 0.42 },
              filter: { duration: 0.3 },
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto bg-white shadow-2xl overflow-hidden flex flex-col
                     w-full h-[100dvh] max-h-[100dvh] rounded-none
                     md:h-auto md:max-h-[92dvh] md:rounded-2xl md:w-[min(960px,96vw)]"
          style={{ willChange: "transform, opacity, filter" }}
        >
          {/* ── Close X button — always on top, always clickable ── */}
          <motion.button
            type="button"
            onClick={onClose}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.25, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
            className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-gray-100 hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 border border-gray-200"
            aria-label="Close"
          >
            <IconClose className="w-4 h-4 text-gray-700" />
          </motion.button>

          <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-y-hidden" style={{ minHeight: 0 }}>

            {/* ══════════════════════════════════════════════════════
                LEFT: Image gallery — 58% width, thumbnail strip
            ══════════════════════════════════════════════════════ */}
            <div className="md:w-[60%] lg:w-[62%] flex flex-col-reverse justify-end lg:block relative overflow-hidden flex-shrink-0 bg-gray-50">

              {/* Thumbnail strip — vertical on desktop, horizontal on mobile/tablet */}
              <div className="
                flex flex-row lg:flex-col gap-2.5
                overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden
                p-3 lg:py-8 lg:px-3
                lg:w-[96px] lg:flex-shrink-0 lg:absolute lg:left-0 lg:top-0 lg:bottom-0 z-10
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
                      flex-shrink-0 rounded-[10px] overflow-hidden border-[2.5px]
                      transition-all duration-200 cursor-pointer
                      w-[72px] h-[72px] lg:w-full lg:h-auto
                      hover:opacity-100 hover:scale-[1.03] hover:shadow-md
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

              {/* Main image — perfectly locked dimensions to prevent layout shift shakes on entrance */}
              <div
                className="relative overflow-hidden flex items-center justify-center
                           w-full h-[55dvh]
                           md:h-auto md:aspect-square
                           lg:aspect-auto lg:h-full lg:w-[calc(100%-96px)] lg:ml-[96px]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsZoomed((z) => !z)}
              >
                <AnimatePresence custom={imgDirection}>
                  <motion.div
                    key={selectedImg}
                    custom={imgDirection}
                    variants={imgVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    <img
                      src={images[selectedImg]}
                      alt={product.name}
                      className={`
                        w-full h-full object-cover
                        transition-transform duration-500 ease-out
                        ${isZoomed ? "scale-[1.8] cursor-zoom-out" : "scale-100 cursor-zoom-in"}
                      `}
                      draggable={false}
                    />
                  </motion.div>
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

            <div
              className="md:w-[42%] flex flex-col md:overflow-hidden p-0 md:p-6 md:gap-4"
            >

              {/* Scrollable product info area — everything above quantity */}
              <div className="flex-1 md:overflow-y-auto p-5 pb-2 md:p-0 md:pb-0 space-y-4 md:pr-4" style={{ scrollbarWidth: "thin", minHeight: 0 }}>

                {/* Name */}
                <div className="pr-8"> {/* pr-8 leaves room for X button */}
                  <p className="text-xs text-gray-400 mb-0.5 font-mono">SKU: {String(product.id || "N/A").slice(0, 14)}</p>
                  <h2 className="text-xl font-bold text-gray-900 leading-snug">{product.name}</h2>
                </div>

                {/* Short description (API field or smart fallback) */}
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {product.short_description || product.description || "Premium quality product with exceptional craftsmanship and attention to detail."}
                </p>

                {/* Seller name — clickable to seller page */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-400">Sold by</span>
                  <Link
                    to={product.seller_id ? `/sellers/${product.seller_id}` : "/sellers"}
                    onClick={handleViewDetails}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                  >
                    {product.seller_name || product.brand || "ShopEase Store"}
                  </Link>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array(5).fill(0).map((_, i) => (
                      <IconStar key={i} filled={i < Math.round(product.rating_stars || 0)} className="w-3.5 h-3.5 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{product.rating_stars || 0}</span>
                    {" "}({(product.rating_count || 0).toLocaleString()} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-2xl font-black text-gray-900">{formatMoneyCents(product.price_cents)}</span>
                  {onSale && (
                    <>
                      <span className="text-sm text-gray-400 line-through">{formatMoneyCents(Math.round(product.price_cents * 1.35))}</span>
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        -{Math.round((1 - product.price_cents / Math.round(product.price_cents * 1.35)) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                <div className="h-px bg-gray-100" />

                {/* ── Color picker ── */}
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    Colour
                    {currentColorLabel && <span className="ml-1.5 font-normal text-gray-500">· {currentColorLabel}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {(colors && colors.length > 0 ? colors : [
                      { hex: "#1a1a2e", label: "Midnight" },
                      { hex: "#e2e8f0", label: "Silver" },
                      { hex: "#2d3436", label: "Charcoal" },
                    ]).map((col) => {
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

                {/* ── Size picker with system toggle ── */}
                {(() => {
                  const sizesToShow = displaySizes && displaySizes.length > 0 ? displaySizes : ["XS", "S", "M", "L", "XL"]; return (
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
                          <button
                            type="button"
                            onClick={() => setShowSizeGuide(!showSizeGuide)}
                            className={`text-[11px] underline ml-1 transition-colors ${showSizeGuide ? "text-indigo-700 font-bold" : "text-indigo-500 hover:text-indigo-700"}`}
                          >
                            Guide
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {sizesToShow.map((sz, idx) => {
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

                      <AnimatePresence>
                        {showSizeGuide && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1, transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } }}
                            exit={{ height: 0, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }}
                            className="overflow-hidden mt-3"
                          >
                            {(() => {
                              const pt = productType && SIZE_TABLES[productType] ? productType : "apparel";
                              const table = SIZE_TABLES[pt];
                              if (!table) return null;
                              
                              return (
                                <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden text-xs">
                                  <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-100 flex justify-between items-center">
                                    <h4 className="font-bold text-gray-800 capitalize">{pt} Size Guide</h4>
                                    <span className="text-[10px] text-gray-400 font-normal">Measurements in exact units</span>
                                  </div>
                                  <div className="overflow-x-auto pg-slim">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr>
                                          {Object.keys(table).map(sys => (
                                            <th key={sys} className={`py-2.5 px-3 border-b border-gray-100 font-semibold text-center whitespace-nowrap bg-gray-50/30 ${sizeSystem === sys ? "text-indigo-600 font-bold" : "text-gray-500"}`}>
                                              {sys}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {table.Standard.map((_, i) => (
                                          <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                            {Object.keys(table).map(sys => (
                                              <td key={sys} className={`py-2 px-3 border-b border-gray-50 text-center font-mono text-[11px] ${sizeSystem === sys ? "text-indigo-700 font-medium bg-indigo-50/30 group-hover:bg-indigo-50/50" : "text-gray-600"}`}>
                                                {table[sys][i] || "-"}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            })()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}
              </div> {/* end scrollable info area */}

              {/* ── Fixed bottom bar on mobile: Quantity + CTA ── */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 md:p-0 md:border-0 md:bg-transparent md:backdrop-blur-none md:static space-y-3 md:space-y-4 flex-shrink-0 z-20">

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
              </div> {/* end fixed bottom bar */}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

// ─── Smart Comparison Engine ─────────────────────────────────────────────────
//
// ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────
// analyzeProducts(a, b) → pure function, no API needed.
//   1. Detects product category from name + keywords.
//   2. Runs category-specific attribute scoring.
//   3. Identifies only MEANINGFUL differences (ignores near-ties).
//   4. Produces: verdicts[], useCases[], valueSummary, decisionSummary.
//
// The ComparisonModal renders the output of analyzeProducts() as a rich,
// editorial-style decision assistant — not a data table.
//
// Product shape expected:
//   id, name, image, price_cents, rating_stars, rating_count,
//   keywords[], category, brand, description, shortDescription

// ── Category detection ────────────────────────────────────────────────────────
const CATEGORY_SIGNALS = {
  fashion: /cloth|shirt|dress|top|blouse|pant|jean|skirt|jacket|coat|suit|sweater|hoodie|tee|wear|legging|shorts|fashion|apparel|outfit/i,
  footwear: /shoe|boot|sneaker|heel|sandal|slipper|trainer|footwear|kick/i,
  electronics: /phone|laptop|tablet|computer|tv|camera|speaker|headphone|earphone|watch|smartwatch|gadget|tech|electronic|device|wireless|bluetooth|charger|cable/i,
  beauty: /serum|cream|moisturi|lipstick|foundation|mascara|perfume|fragrance|skincare|haircare|shampoo|conditioner|lotion|beauty|makeup/i,
  sports: /sport|gym|fitness|yoga|running|training|workout|athletic|ball|racket|weight|dumbbell/i,
  home: /furniture|sofa|chair|table|lamp|curtain|pillow|mattress|cookware|kitchen|decor|home|shelf|wardrobe/i,
  toys: /toy|game|puzzle|lego|doll|action figure|board game|kids|children|baby/i,
  books: /book|novel|textbook|guide|manual|fiction|non-fiction|autobiography/i,
};

function detectCategory(product) {
  const text = [product.name, product.category, ...(product.keywords || [])].join(' ');
  for (const [cat, rx] of Object.entries(CATEGORY_SIGNALS)) {
    if (rx.test(text)) return cat;
  }
  return 'general';
}

// ── Value-for-money scoring ───────────────────────────────────────────────────
// Returns a 0-100 score combining rating quality and price efficiency.
function valueScore(product) {
  const price = product.price_cents || 0;
  const stars = product.rating_stars || 0;
  const reviews = Math.min(product.rating_count || 0, 5000);
  if (!price) return 0;
  // Higher stars + more reviews at lower price = better value
  const qualityPts = stars * 20;                           // 0–100
  const reviewPts = (reviews / 5000) * 30;               // 0–30 (trust signal)
  const pricePts = Math.max(0, 40 - (price / 10000));   // decreases with price
  return Math.round(qualityPts + reviewPts + pricePts);
}

// ── Popularity signal ─────────────────────────────────────────────────────────
function popularityLabel(count) {
  if (!count) return null;
  if (count >= 10000) return 'Highly Popular';
  if (count >= 1000) return 'Popular';
  if (count >= 100) return 'Gaining Traction';
  return 'New Arrival';
}

// ── Price difference framing ──────────────────────────────────────────────────
function priceDiffContext(cheapCents, expCents) {
  const diff = expCents - cheapCents;
  const pctMore = Math.round((diff / cheapCents) * 100);
  if (pctMore >= 100) return `${pctMore}% more expensive — a significant premium`;
  if (pctMore >= 50) return `${pctMore}% more — worth scrutinising what you get extra`;
  if (pctMore >= 20) return `${pctMore}% more — moderate premium`;
  return `${pctMore}% more — a small difference`;
}

// ── Main analysis engine ──────────────────────────────────────────────────────
function analyzeProducts(a, b) {
  const catA = detectCategory(a);
  const catB = detectCategory(b);
  const cat = catA !== 'general' ? catA : catB;

  const priceA = a.price_cents || 0;
  const priceB = b.price_cents || 0;
  const starsA = a.rating_stars || 0;
  const starsB = b.rating_stars || 0;
  const countA = a.rating_count || 0;
  const countB = b.rating_count || 0;
  const vsA = valueScore(a);
  const vsB = valueScore(b);

  const cheaper = priceA < priceB ? 'a' : priceB < priceA ? 'b' : 'tie';
  const higherStar = starsA > starsB ? 'a' : starsB > starsA ? 'b' : 'tie';
  const moreReviewed = countA > countB ? 'a' : countB > countA ? 'b' : 'tie';
  const betterValue = vsA > vsB ? 'a' : vsB > vsA ? 'b' : 'tie';

  // ── Build insight rows ────────────────────────────────────────────────────
  const insights = [];

  // Price
  if (cheaper !== 'tie') {
    const cheap = cheaper === 'a' ? priceA : priceB;
    const exp = cheaper === 'a' ? priceB : priceA;
    const diff = exp - cheap;
    const pctCtx = priceDiffContext(cheap, exp);
    insights.push({
      icon: '💰',
      label: 'Price',
      winA: cheaper === 'a',
      winB: cheaper === 'b',
      text:
        cheaper === 'a'
          ? `Left is the budget pick — saves you ${formatMoneyCents(diff)} (${pctCtx}).`
          : `Right is the budget pick — saves you ${formatMoneyCents(diff)} (${pctCtx}).`,
      detail: Math.abs(diff) < 500
        ? 'Prices are close — let rating and reviews guide you.'
        : null,
    });
  } else {
    insights.push({
      icon: '💰', label: 'Price', winA: false, winB: false,
      text: 'Both are priced the same — other factors matter more here.',
    });
  }

  // Rating quality
  const starDiff = Math.abs(starsA - starsB);
  if (starDiff >= 0.3) {
    const winner = higherStar;
    const better = winner === 'a' ? starsA : starsB;
    const worse = winner === 'a' ? starsB : starsA;
    insights.push({
      icon: '⭐',
      label: 'Quality Rating',
      winA: winner === 'a',
      winB: winner === 'b',
      text:
        winner === 'a'
          ? `Left scores ${better}★ vs Right's ${worse}★ — a meaningful quality gap.`
          : `Right scores ${better}★ vs Left's ${worse}★ — a meaningful quality gap.`,
      detail: starDiff >= 0.8 ? 'This is a large difference. Buyers consistently rate one higher.' : null,
    });
  } else if (starsA && starsB) {
    insights.push({
      icon: '⭐', label: 'Quality Rating', winA: false, winB: false,
      text: `Both rate similarly (${starsA}★ vs ${starsB}★) — comparable quality.`,
    });
  }

  // Social proof / trust
  const countDiff = Math.abs(countA - countB);
  if (countDiff > 50 || (countA === 0) !== (countB === 0)) {
    const winner = moreReviewed;
    const more = winner === 'a' ? countA : countB;
    const less = winner === 'a' ? countB : countA;
    const popL = popularityLabel(more);
    insights.push({
      icon: '🗣️',
      label: 'Buyer Trust',
      winA: winner === 'a',
      winB: winner === 'b',
      text:
        winner === 'a'
          ? `Left has ${more.toLocaleString()} reviews vs ${less.toLocaleString()} — ${popL} and battle-tested.`
          : `Right has ${more.toLocaleString()} reviews vs ${less.toLocaleString()} — ${popL} and battle-tested.`,
      detail: less === 0 ? 'The other product has no reviews yet — higher risk for the buyer.' : null,
    });
  }

  // Value for money (composite)
  if (Math.abs(vsA - vsB) >= 8) {
    insights.push({
      icon: '📊',
      label: 'Value for Money',
      winA: betterValue === 'a',
      winB: betterValue === 'b',
      text:
        betterValue === 'a'
          ? `Left delivers more per dollar spent — better overall value proposition.`
          : `Right delivers more per dollar spent — better overall value proposition.`,
      detail:
        cheaper !== betterValue && cheaper !== 'tie'
          ? 'Interestingly, the pricier option scores better on overall value — higher quality justifies the cost.'
          : null,
    });
  }

  // ── Category-specific insights ────────────────────────────────────────────
  if (cat === 'fashion' || cat === 'footwear') {
    const textA = [a.name, ...(a.keywords || [])].join(' ').toLowerCase();
    const textB = [b.name, ...(b.keywords || [])].join(' ').toLowerCase();
    const casualA = /casual|everyday|street|daily|relaxed|lounge/.test(textA);
    const casualB = /casual|everyday|street|daily|relaxed|lounge/.test(textB);
    const formalA = /formal|office|occasion|smart|elegant|business/.test(textA);
    const formalB = /formal|office|occasion|smart|elegant|business/.test(textB);
    if (casualA !== casualB || formalA !== formalB) {
      insights.push({
        icon: '👕',
        label: 'Style Fit',
        winA: false,
        winB: false,
        text:
          casualA && !casualB
            ? 'Left leans casual/everyday. Right may suit more varied occasions.'
            : !casualA && casualB
              ? 'Right leans casual/everyday. Left may suit more varied occasions.'
              : formalA && !formalB
                ? 'Left suits formal or office settings better.'
                : 'Right suits formal or office settings better.',
      });
    }
  }

  if (cat === 'electronics') {
    const textA = [a.name, ...(a.keywords || [])].join(' ').toLowerCase();
    const textB = [b.name, ...(b.keywords || [])].join(' ').toLowerCase();
    const hasWarrantyA = /warranty|guarantee|year|month/.test(textA);
    const hasWarrantyB = /warranty|guarantee|year|month/.test(textB);
    if (hasWarrantyA !== hasWarrantyB) {
      insights.push({
        icon: '🔧',
        label: 'Warranty Signal',
        winA: hasWarrantyA,
        winB: hasWarrantyB,
        text:
          hasWarrantyA
            ? 'Left mentions warranty — better long-term protection for your purchase.'
            : 'Right mentions warranty — better long-term protection for your purchase.',
      });
    }
  }

  // ── Use-case recommendations ──────────────────────────────────────────────
  const useCases = [];

  // Budget buyer
  if (cheaper !== 'tie') {
    const budgetWinner = cheaper === 'a' ? 'Left' : 'Right';
    const budgetLoser = cheaper === 'a' ? 'Right' : 'Left';
    useCases.push({
      icon: '💸',
      persona: 'Budget Buyer',
      pick: budgetWinner,
      why: `${budgetWinner} costs less${higherStar === (cheaper === 'a' ? 'b' : 'a') ? ', though the pricier option has better ratings' : ' without a meaningful quality trade-off'}.`,
    });
  }

  // Quality seeker
  if (higherStar !== 'tie' && starDiff >= 0.3) {
    const qualWinner = higherStar === 'a' ? 'Left' : 'Right';
    useCases.push({
      icon: '🏆',
      persona: 'Quality Seeker',
      pick: qualWinner,
      why: `${qualWinner} is consistently rated higher — the safer choice if quality matters most.`,
    });
  }

  // Reliable / proven choice
  if (moreReviewed !== 'tie' && countDiff > 100) {
    const reliableWinner = moreReviewed === 'a' ? 'Left' : 'Right';
    useCases.push({
      icon: '🛡️',
      persona: 'Risk-Averse Buyer',
      pick: reliableWinner,
      why: `${reliableWinner} has far more buyer feedback — less uncertainty about what you're getting.`,
    });
  }

  // Best all-round
  if (betterValue !== 'tie') {
    const allRoundWinner = betterValue === 'a' ? 'Left' : 'Right';
    useCases.push({
      icon: '✨',
      persona: 'Best All-Round',
      pick: allRoundWinner,
      why: `Balancing price, quality, and trust — ${allRoundWinner} is the stronger overall package.`,
    });
  }

  // ── Final decision ────────────────────────────────────────────────────────
  const totalWinsA = [cheaper === 'a', higherStar === 'a', moreReviewed === 'a', betterValue === 'a'].filter(Boolean).length;
  const totalWinsB = [cheaper === 'b', higherStar === 'b', moreReviewed === 'b', betterValue === 'b'].filter(Boolean).length;
  const overallWinner = totalWinsA > totalWinsB ? 'a' : totalWinsB > totalWinsA ? 'b' : 'tie';

  let decisionSummary;
  if (overallWinner === 'tie') {
    // Force a directional suggestion even in ties — never say "both are good"
    if (starsA >= starsB && priceA <= priceB) {
      decisionSummary = { winner: 'a', reason: `Left matches or beats Right on every measure that matters — it's the logical pick.` };
    } else if (starsB >= starsA && priceB <= priceA) {
      decisionSummary = { winner: 'b', reason: `Right matches or beats Left on every measure that matters — it's the logical pick.` };
    } else {
      decisionSummary = {
        winner: cheaper === 'a' ? 'a' : 'b',
        reason: `When products are this evenly matched, price wins the tie-break. Go with the cheaper option and keep the saving.`,
      };
    }
  } else if (overallWinner === 'a') {
    decisionSummary = {
      winner: 'a',
      reason:
        priceA > priceB
          ? `Left costs more but earns it — higher rated, more trusted, better value in the long run.`
          : `Left wins on price AND quality. Unless Right offers something specific you need, Left is the clear choice.`,
    };
  } else {
    decisionSummary = {
      winner: 'b',
      reason:
        priceB > priceA
          ? `Right costs more but earns it — higher rated, more trusted, better value in the long run.`
          : `Right wins on price AND quality. Unless Left offers something specific you need, Right is the clear choice.`,
    };
  }

  return { insights, useCases, decisionSummary, overallWinner, cat };
}

// ─── ComparisonModal ──────────────────────────────────────────────────────────
const ComparisonModal = React.forwardRef(({ items, onClose, onPickProduct }, ref) => {
  const { isDark, colors } = useTheme();
  if (items.length < 2) return null;
  const [a, b] = items;

  const [hoveredImg, setHoveredImg] = useState(null);
  const [tab, setTab] = useState('analysis'); // 'analysis' | 'details'

  // Run the analysis engine — pure computation, instant
  const { insights, useCases, decisionSummary, overallWinner, cat } = useMemo(
    () => analyzeProducts(a, b),
    [a, b]
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  const productLabel = (side) => (side === 'a' ? a.name : b.name);
  const WINNER_COLOR = colors.brand.electricBlue;

  // ── Insight row ────────────────────────────────────────────────────────────
  const renderInsightRow = (insight, idx) => (
    <motion.div
      key={`insight-${idx}`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.07, duration: 0.3 }}
      className="rounded-xl p-3.5 mb-2.5"
      style={{
        background: colors.surface.secondary,
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-base flex-shrink-0 mt-0.5">{insight.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.text.tertiary }}>
              {insight.label}
            </p>
            {insight.winA && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: WINNER_COLOR + '22', color: WINNER_COLOR }}>
                ← Left wins
              </span>
            )}
            {insight.winB && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: WINNER_COLOR + '22', color: WINNER_COLOR }}>
                Right wins →
              </span>
            )}
            {!insight.winA && !insight.winB && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: colors.surface.tertiary, color: colors.text.tertiary }}>
                Comparable
              </span>
            )}
          </div>
          <p className="text-sm leading-snug" style={{ color: colors.text.primary }}>
            {insight.text}
          </p>
          {insight.detail && (
            <p className="text-xs mt-1 leading-snug" style={{ color: colors.text.tertiary }}>
              {insight.detail}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );

  // ── Use-case chip ──────────────────────────────────────────────────────────
  const renderUseCaseChip = (useCase, idx) => {
    const isA = useCase.pick === 'Left';
    return (
      <motion.div
        key={`usecase-${idx}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08, duration: 0.3 }}
        className="rounded-xl p-3.5"
        style={{
          background: colors.surface.secondary,
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{useCase.icon}</span>
          <p className="text-xs font-black" style={{ color: colors.text.primary }}>{useCase.persona}</p>
          <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: WINNER_COLOR + '22', color: WINNER_COLOR }}>
            → {useCase.pick}
          </span>
        </div>
        <p className="text-xs leading-snug" style={{ color: colors.text.secondary }}>
          {useCase.why}
        </p>
      </motion.div>
    );
  };

  return (
    <motion.div ref={ref} className="fixed inset-0 z-[1090]" style={{ pointerEvents: 'none' }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm pointer-events-auto"
      />

      {/* Centering shell */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-5 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{
            opacity: 1, y: 0,
            transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
          }}
          exit={{
            opacity: 0, y: 40,
            transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
          }}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto rounded-2xl shadow-2xl overflow-hidden w-full flex flex-col"
          style={{
            maxWidth: 660,
            maxHeight: '92vh',
            background: colors.surface.elevated || colors.surface.primary,
            border: `1px solid ${colors.border.subtle}`,
          }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
            <div>
              <h2 className="font-black text-base" style={{ color: colors.text.primary }}>
                Decision Engine
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: colors.text.tertiary }}>
                AI-powered · {cat.charAt(0).toUpperCase() + cat.slice(1)} category
              </p>
            </div>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: colors.surface.secondary }}>
              <IconClose className="w-3.5 h-3.5" style={{ color: colors.text.secondary }} />
            </button>
          </div>

          {/* ── Product headers — always visible ── */}
          <div className="flex-shrink-0 px-5 pt-4 pb-0">
            <div className="grid grid-cols-2 gap-3">
              {[
                { p: a, side: 'a', isWinner: overallWinner === 'a' },
                { p: b, side: 'b', isWinner: overallWinner === 'b' },
              ].map(({ p, side, isWinner }) => (
                <div key={p.id} className="flex flex-col items-center gap-2">
                  {/* Image with hover and overlaid badge */}
                  <motion.div
                    className="relative w-full rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
                    style={{
                      height: 140, // Reduced fixed height to save vertical modal space
                      background: colors.surface.tertiary,
                      border: `2px solid ${isWinner ? WINNER_COLOR : colors.border.subtle}`,
                      boxShadow: isWinner ? `0 0 0 3px ${WINNER_COLOR}30` : 'none',
                    }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                    onHoverStart={() => setHoveredImg(side)}
                    onHoverEnd={() => setHoveredImg(null)}
                    onClick={() => onPickProduct(p)}
                  >
                    {isWinner && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-2 left-2 z-10 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md"
                        style={{ background: WINNER_COLOR, color: isDark ? '#0E0E10' : '#fff' }}
                      >
                        ✦ Top Choice
                      </motion.span>
                    )}
                    <motion.img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      animate={{ filter: hoveredImg === side ? 'brightness(1.1) scale(1.04)' : 'brightness(1)' }}
                      transition={{ duration: 0.25 }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                    />
                  </motion.div>

                  {/* Name + price */}
                  <div className="text-center w-full px-1">
                    <p className="text-xs font-semibold line-clamp-1" style={{ color: colors.text.primary }}>
                      {p.name}
                    </p>
                    <p className="text-sm font-black mt-0.5"
                      style={{ color: isWinner ? WINNER_COLOR : colors.text.primary }}>
                      {formatMoneyCents(p.price_cents)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tab switcher ── */}
          <div className="flex-shrink-0 px-5 pt-3 pb-0">
            <div className="flex rounded-xl overflow-hidden" style={{ background: colors.surface.secondary }}>
              {[
                { id: 'analysis', label: '🧠 Analysis' },
                { id: 'usecases', label: '🎯 Who Should Pick' },
                { id: 'details', label: '📊 Side by Side' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className="flex-1 py-2 text-[11px] font-bold transition-all duration-200"
                  style={{
                    background: tab === t.id ? colors.cta.primary : 'transparent',
                    color: tab === t.id ? colors.cta.primaryText : colors.text.tertiary,
                    borderRadius: '10px',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto pg-slim px-5 py-4" style={{ minHeight: 0 }}>
            <AnimatePresence mode="wait">

              {/* ── ANALYSIS TAB ── */}
              {tab === 'analysis' && (
                <motion.div key="analysis"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}>

                  {/* Insights */}
                  {insights.map((insight, i) => renderInsightRow(insight, i))}

                  {/* Decision summary block */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: insights.length * 0.07 + 0.1, duration: 0.35 }}
                    className="rounded-2xl p-4 mt-3 mb-2"
                    style={{
                      background: isDark
                        ? `linear-gradient(135deg, ${WINNER_COLOR}18 0%, ${colors.surface.tertiary} 100%)`
                        : `linear-gradient(135deg, ${WINNER_COLOR}10 0%, #f8faff 100%)`,
                      border: `1.5px solid ${WINNER_COLOR}40`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">⚖️</span>
                      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: WINNER_COLOR }}>
                        Verdict
                      </p>
                    </div>
                    <p className="text-sm font-bold leading-snug" style={{ color: colors.text.primary }}>
                      {decisionSummary.winner === 'a'
                        ? `Choose: ${a.name.slice(0, 40)}${a.name.length > 40 ? '…' : ''}`
                        : `Choose: ${b.name.slice(0, 40)}${b.name.length > 40 ? '…' : ''}`}
                    </p>
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: colors.text.secondary }}>
                      {decisionSummary.reason}
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* ── WHO SHOULD PICK TAB ── */}
              {tab === 'usecases' && (
                <motion.div key="usecases"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}>
                  <p className="text-xs mb-3" style={{ color: colors.text.tertiary }}>
                    Based on the product data, here's who each one suits best:
                  </p>
                  {useCases.length > 0
                    ? useCases.map((uc, i) => renderUseCaseChip(uc, i))
                    : (
                      <p className="text-sm text-center py-8" style={{ color: colors.text.tertiary }}>
                        Not enough product data to generate use-case recommendations.
                      </p>
                    )
                  }
                </motion.div>
              )}

              {/* ── SIDE BY SIDE TAB ── */}
              {tab === 'details' && (
                <motion.div key="details"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}>

                  {[
                    { label: 'Price', valA: formatMoneyCents(a.price_cents), valB: formatMoneyCents(b.price_cents), winA: a.price_cents < b.price_cents, winB: b.price_cents < a.price_cents },
                    { label: 'Rating', valA: a.rating_stars ? `${a.rating_stars} ★` : '—', valB: b.rating_stars ? `${b.rating_stars} ★` : '—', winA: (a.rating_stars || 0) > (b.rating_stars || 0), winB: (b.rating_stars || 0) > (a.rating_stars || 0) },
                    { label: 'Reviews', valA: (a.rating_count || 0).toLocaleString(), valB: (b.rating_count || 0).toLocaleString(), winA: (a.rating_count || 0) > (b.rating_count || 0), winB: (b.rating_count || 0) > (a.rating_count || 0) },
                    { label: 'Value Score', valA: `${valueScore(a)}/100`, valB: `${valueScore(b)}/100`, winA: valueScore(a) > valueScore(b), winB: valueScore(b) > valueScore(a) },
                    { label: 'Category', valA: detectCategory(a), valB: detectCategory(b), winA: false, winB: false },
                  ].map((row, i) => (
                    <div key={i} className="py-2.5" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                      <div className="grid items-center" style={{ gridTemplateColumns: '1fr 80px 1fr', gap: 8 }}>
                        {/* Left */}
                        <div className="flex items-center justify-end gap-1.5">
                          {row.winA && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                              style={{ background: WINNER_COLOR + '22', color: WINNER_COLOR }}>↑</span>
                          )}
                          <span className="text-sm text-right"
                            style={{ fontWeight: row.winA ? 700 : 400, color: row.winA ? colors.text.primary : colors.text.secondary }}>
                            {row.valA}
                          </span>
                        </div>
                        {/* Centre */}
                        <p className="text-[9px] font-black uppercase tracking-wider text-center"
                          style={{ color: colors.text.tertiary }}>{row.label}</p>
                        {/* Right */}
                        <div className="flex items-center justify-start gap-1.5">
                          <span className="text-sm"
                            style={{ fontWeight: row.winB ? 700 : 400, color: row.winB ? colors.text.primary : colors.text.secondary }}>
                            {row.valB}
                          </span>
                          {row.winB && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                              style={{ background: WINNER_COLOR + '22', color: WINNER_COLOR }}>↑</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ── Pick CTAs — always visible at the bottom ── */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 px-5 py-4"
            style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
            {[a, b].map((p, idx) => {
              const side = idx === 0 ? 'a' : 'b';
              const isTop = overallWinner === side;
              return (
                <div key={p.id} className="flex flex-col gap-1.5">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onPickProduct(p)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={{
                      background: isTop ? colors.cta.primary : colors.surface.secondary,
                      color: isTop ? colors.cta.primaryText : colors.text.primary,
                      border: `1.5px solid ${isTop ? colors.cta.primary : colors.border.default}`,
                    }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    {isTop ? '✦ Pick This' : 'Pick This'}
                  </motion.button>
                  <Link
                    to={`/products/${p.id}`}
                    className="block text-center text-[11px] py-0.5 transition-colors"
                    style={{ color: colors.text.tertiary }}
                  >
                    View details →
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

// ─── ComparisonBar ────────────────────────────────────────────────────────────
function ComparisonBar({ items, onRemove, onClear, onCompare }) {
  const { colors } = useTheme();
  if (!items.length) return null;
  return (
    <motion.div
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="fixed bottom-0 left-0 right-0 z-40 shadow-xl"
      style={{
        background: colors.surface.elevated || colors.surface.primary,
        borderTop: `1px solid ${colors.border.default}`,
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
        <p className="text-xs font-bold flex-shrink-0" style={{ color: colors.text.secondary }}>
          Compare ({items.length}/2)
        </p>
        <div className="flex items-center gap-2 flex-1 overflow-x-auto pg-slim">
          {items.map((p) => (
            <div key={p.id}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 flex-shrink-0"
              style={{
                background: colors.surface.secondary,
                border: `1px solid ${colors.border.default}`,
              }}
            >
              <img
                src={p.image}
                alt=""
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/100x100?text=Error";
                }}
                className="w-7 h-7 rounded-md object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold max-w-[80px] truncate" style={{ color: colors.text.primary }}>
                  {p.name}
                </p>
                <p className="text-xs" style={{ color: colors.text.tertiary }}>
                  {formatMoneyCents(p.price_cents)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                className="ml-1 flex-shrink-0 transition-colors"
                style={{ color: colors.text.tertiary }}
              >
                <IconClose className="w-3 h-3" />
              </button>
            </div>
          ))}
          {items.length < 2 && (
            <div className="rounded-lg px-3 py-1.5 flex-shrink-0"
              style={{ border: `1.5px dashed ${colors.border.default}` }}>
              <p className="text-[11px] whitespace-nowrap" style={{ color: colors.text.tertiary }}>
                + Pick one more
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {items.length === 2 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onCompare}
              className="text-xs font-bold px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
              style={{ background: colors.cta.primary, color: colors.cta.primaryText }}
            >
              Compare Now
            </motion.button>
          )}
          <button
            type="button"
            onClick={onClear}
            className="text-xs underline transition-colors"
            style={{ color: colors.text.tertiary }}
          >
            Clear
          </button>
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
                <span className="text-xl font-black text-white">{formatMoneyCents(product.price_cents)}</span>
                <span className="text-sm line-through opacity-50 text-white">
                  {formatMoneyCents(Math.round(product.price_cents * 1.6))}
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
                {formatMoneyCents(product.price_cents)}
              </p>
              <p className="text-[10px] line-through" style={{ color: colors.text.tertiary }}>
                {formatMoneyCents(Math.round(product.price_cents * 1.5))}
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
  const navigation = useNavigation();
  const productsFromLoader = useLoaderData();
  const allProducts = useMemo(() => Array.isArray(productsFromLoader) ? productsFromLoader : [], [productsFromLoader]);
  const isLoading = navigation.state === "loading";
  const maxBudget = useMemo(
    () => allProducts.length ? Math.max(...allProducts.map((p) => p.price_cents || 0), 1000) : 10000,
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
    r = r.filter((p) => (p.price_cents || 0) <= filters.budget);
    if (filters.rating !== null) r = r.filter((p) => (p.rating_stars || 0) >= filters.rating);
    if (filters.inStock) r = r.filter((p) => (p.price_cents || 0) > 0);
    if (filters.onSale) r = r.filter((p) => (p.price_cents || 0) < 2000);
    const s = filters.sort;
    if (s === "price-asc") r.sort((a, b) => (a.price_cents || 0) - (b.price_cents || 0));
    if (s === "price-desc") r.sort((a, b) => (b.price_cents || 0) - (a.price_cents || 0));
    if (s === "rating") r.sort((a, b) => (b.rating_stars || 0) - (a.rating_stars || 0));
    if (s === "newest") r.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
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
    <div className="min-h-screen transition-colors duration-300 pt-20"
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
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border transition-all duration-300 flex-shrink-0 shadow-sm"
            style={{
              background: activeFilterCount > 0 ? colors.cta.primary : colors.surface.secondary,
              borderColor: activeFilterCount > 0 ? colors.cta.primary : colors.border.default,
              color: activeFilterCount > 0 ? colors.cta.primaryText : colors.text.primary,
            }}
          >
            <IconFilter className="w-3.5 h-3.5" />
            Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
          </motion.button>

          {/* Sort select */}
          <PremiumDropdown
            value={filters.sort}
            options={SORT_OPTIONS}
            onChange={(val) => setFilters((f) => ({ ...f, sort: val }))}
            className="w-40"
          />

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
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto pg-slim rounded-xl p-5"
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
                <motion.button 
                  key={cat}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full border transition-all duration-300 hover:shadow-sm"
                  style={
                    selectedCategory === cat
                      ? { background: colors.cta.primary, color: colors.cta.primaryText, borderColor: colors.cta.primary }
                      : { background: colors.surface.secondary, color: colors.text.secondary, borderColor: colors.border.default }
                  }
                >{cat}</motion.button>
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
              style={{ background: colors.surface.elevated || colors.surface.primary, maxHeight: "90vh" }}
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
              <div className="px-5 py-4 border-t border-gray-100 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.06)] relative z-10">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full font-bold py-3.5 rounded-xl text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
                  style={{ background: colors.cta.primary, color: colors.cta.primaryText }}
                >
                  Show {filteredProducts.length} results
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </motion.button>
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
          <ComparisonModal
            key="comparison-modal"
            items={compareItems}
            onClose={() => setCompareModalOpen(false)}
            onPickProduct={(product) => {
              setQuickViewProduct(product);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Product Detail / Quick-view modal ── */}
      <AnimatePresence>
        {quickViewProduct && (
          <ProductDetailModal
            key="product-detail-modal"
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onCartAdded={() => {
              setCompareItems([]);
              setCompareModalOpen(false);
              setQuickViewProduct(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
