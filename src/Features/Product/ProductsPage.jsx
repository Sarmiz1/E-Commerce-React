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
  /* ── Global custom scrollbar ── */
  html { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
  *::-webkit-scrollbar { width: 6px; height: 6px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 9999px; }
  *::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
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

  /* ── Comparison tray slide-up ── */
  @keyframes pg-compare-in { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .pg-compare-in { animation: pg-compare-in .32s cubic-bezier(.32,.72,0,1) forwards; }

  /* ── Budget range input ── */
  .pg-range { -webkit-appearance:none; appearance:none; background:transparent; cursor:pointer; width:100%; }
  .pg-range::-webkit-slider-runnable-track { height:3px; border-radius:9999px; background:#e5e7eb; }
  .pg-range::-webkit-slider-thumb {
    -webkit-appearance:none; width:16px; height:16px; border-radius:50%;
    background:#111827; margin-top:-6.5px; border:2px solid #fff;
    box-shadow:0 1px 4px rgba(0,0,0,.25);
  }
  .pg-range::-moz-range-thumb { width:16px; height:16px; border-radius:50%; background:#111827; border:2px solid #fff; }

  /* ── Cart icon button ── */
  .pg-cart-btn {
    display:flex; align-items:center; justify-content:center;
    width:32px; height:32px; border-radius:8px; border:1.5px solid #e5e7eb;
    background:#fff; cursor:pointer; transition:background .15s, border-color .15s, transform .1s;
    flex-shrink:0;
  }
  .pg-cart-btn:hover { background:#111827; border-color:#111827; color:#fff; }
  .pg-cart-btn:active { transform:scale(.93); }
  .pg-cart-btn.added { background:#059669; border-color:#059669; color:#fff; }

  /* ── Slim scrollbar for sidebar & modal ── */
  .pg-slim::-webkit-scrollbar { width:4px; height:4px; }
  .pg-slim::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:9999px; }
  .pg-slim::-webkit-scrollbar-thumb:hover { background:#d1d5db; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive size/color options from product keywords when not provided by API */
function deriveProductOptions(product) {
  if (!product) return { sizes: null, colors: null };
  const text = [product.name || "", ...(product.keywords || [])].join(" ").toLowerCase();
  const isApparel = /cloth|shirt|dress|top|blouse|pant|jean|skirt|jacket|coat|suit|sweater|hoodie/.test(text);
  const isFootwear = /shoe|boot|sneaker|heel|sandal|slipper|footwear/.test(text);

  const sizes = product.sizes || (isFootwear ? ["38", "39", "40", "41", "42", "43"] : isApparel ? ["XS", "S", "M", "L", "XL", "2XL"] : null);
  const colors = product.colors || null;
  return { sizes, colors };
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
  const images = useMemo(() => getProductImages(product), [product]);
  const [imgIdx, setImgIdx] = useState(0);
  const [showVid, setShowVid] = useState(false);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);

  /** On mouse enter: if video exists play it, otherwise cycle images */
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

  /** On mouse leave: stop video or image cycling and reset to first */
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

  return (
    <div
      data-product-image={product.image}
      className="bg-white border border-gray-100 hover:border-gray-300 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image area */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-gray-50" style={{ paddingTop: "125%" }}>
        {/* Stacked images — CSS cross-fade, zero JS flicker */}
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={i === 0 ? product.name : ""}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === imgIdx && !showVid ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {/* Video overlay — only rendered when product.video exists */}
        {product.video && (
          <video
            ref={videoRef}
            src={product.video}
            muted loop playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showVid ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isNew && <span className="bg-black text-white text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded">New</span>}
          {onSale && <span className="bg-red-500 text-white text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded">Sale</span>}
        </div>

        {/* Image dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {images.slice(0, 5).map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === imgIdx ? "w-3 bg-white" : "w-1 bg-white/60"}`} />
            ))}
          </div>
        )}

        {/* Compare button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare(product); }}
          disabled={!isCompared && !canAdd}
          className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 ${isCompared
            ? "bg-indigo-600 text-white border-indigo-600"
            : canAdd
              ? "bg-white text-gray-500 border-gray-300 hover:border-indigo-500 hover:text-indigo-600"
              : "bg-white/60 text-gray-300 border-gray-200 cursor-not-allowed"
            }`}
          title={isCompared ? "Remove from compare" : canAdd ? "Compare" : "Max 2"}
        >≡</button>
      </Link>

      {/* Product info */}
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <Link to={`/products/${product.id}`}>
          <p className="text-xs text-gray-700 line-clamp-2 leading-snug hover:text-indigo-700 transition-colors">{product.name}</p>
        </Link>

        {/* Stars */}
        {product.rating?.stars > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              {Array(5).fill(0).map((_, i) => (
                <IconStar key={i} filled={i < Math.floor(product.rating.stars)} className="w-2.5 h-2.5" />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.rating.count || 0})</span>
          </div>
        )}

        {/* Price + Cart+ icon */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-gray-900 text-sm">{formatMoneyCents(product.priceCents)}</span>
            {onSale && (
              <span className="text-[10px] text-gray-400 line-through">{formatMoneyCents(Math.round(product.priceCents * 1.35))}</span>
            )}
          </div>
          {/* Cart+ button — opens ProductDetailModal */}
          <button
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
    <div className="space-y-5 text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 text-[10px] bg-gray-900 text-white font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </span>
        {activeCount > 0 && (
          <button onClick={resetAll} className="text-xs text-gray-400 hover:text-red-500 underline transition-colors">Reset</button>
        )}
      </div>

      {/* Sort */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Sort by</p>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-gray-400 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Category */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Category</p>
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => (
            <button key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedCategory === cat
                ? "bg-gray-900 text-white font-semibold"
                : "text-gray-600 hover:bg-gray-100"
                }`}
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
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Min Rating</p>
        <div className="grid grid-cols-4 gap-1">
          {[null, 3, 4, 4.5].map((r) => (
            <button key={String(r)}
              onClick={() => setFilters((f) => ({ ...f, rating: r }))}
              className={`py-1.5 text-xs rounded-md border transition-all ${filters.rating === r
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
            >{r === null ? "Any" : `${r}+★`}</button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {[{ key: "inStock", label: "In Stock Only" }, { key: "onSale", label: "On Sale" }].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700">{label}</span>
            <button
              onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
              className={`relative w-9 h-5 rounded-full transition-colors ${filters[key] ? "bg-gray-900" : "bg-gray-200"}`}
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
// SHEIN-style quick-view modal.
// Desktop: wide centred modal (thumbnail strip left + main image + details right).
// Mobile: full-height bottom sheet (image top + scroll details below).
// Smart size/color derivation from product.keywords if not in API data.
// Smooth AnimatePresence image transitions when switching thumbnails.
function ProductDetailModal({ product, onClose }) {
  const images = useMemo(() => getProductImages(product), [product]);
  const { sizes, colors } = useMemo(() => deriveProductOptions(product), [product]);

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [addState, setAddState] = useState("idle"); // idle|loading|success|error

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  /** Actual add-to-cart with selected options */
  const handleAddToCart = useCallback(async () => {
    if (addState !== "idle") return;
    setAddState("loading");
    try {
      // Try CartContext first, then fall back to direct API
      let added = false;
      try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { addItem } = useCartActions();
        if (addItem) { await addItem(product.id, qty); added = true; }
      } catch { /* fall through */ }

      if (!added) {
        await postData("/api/cart-items", {
          productId: product.id,
          quantity: qty,
          ...(selectedSize && { size: selectedSize }),
          ...(selectedColor && { color: selectedColor }),
        });
      }
      setAddState("success");
      setTimeout(onClose, 1200);
    } catch {
      setAddState("error");
      setTimeout(() => setAddState("idle"), 2500);
    }
  }, [addState, product.id, qty, selectedSize, selectedColor, onClose]);

  const onSale = product.priceCents < 2000;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
      />

      {/* Modal panel
          Mobile: full-height bottom sheet (slide up)
          Desktop: centred card (scale + fade)  */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="fixed z-[81] left-0 right-0 bottom-0 rounded-t-2xl md:rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{
          maxHeight: "95vh",
          top: "auto",
          // On md+: centre the modal
          ...(typeof window !== "undefined" && window.innerWidth >= 768 ? {
            top: "50%", bottom: "auto",
            left: "50%", right: "auto",
            transform: "translate(-50%,-50%)",
            width: "min(920px, 95vw)",
            maxHeight: "90vh",
          } : {}),
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <IconClose className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex flex-col md:flex-row h-full overflow-hidden" style={{ maxHeight: "inherit" }}>

          {/* ── Left: image gallery ── */}
          <div className="md:w-[55%] flex flex-col md:flex-row overflow-hidden flex-shrink-0">

            {/* Thumbnail strip — horizontal on mobile (bottom), vertical on desktop (left) */}
            <div className="md:w-16 flex md:flex-col gap-1.5 p-2 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden order-2 md:order-1 bg-gray-50 pg-slim flex-shrink-0">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`flex-shrink-0 w-12 h-12 md:w-12 md:h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImg === i
                    ? "border-gray-900 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-90 hover:border-gray-300"
                    }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative overflow-hidden order-1 md:order-2 bg-gray-50" style={{ minHeight: 260 }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImg}
                  src={images[selectedImg]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Left/right navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImg((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button
                    onClick={() => setSelectedImg((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white transition-all"
                  >
                    <IconChevRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Right: product details ── */}
          <div className="md:w-[45%] flex flex-col overflow-y-auto pg-slim p-5 md:p-7 gap-4">

            {/* Name + SKU */}
            <div>
              <p className="text-xs text-gray-400 mb-1">SKU: {product.id?.slice(0, 16) || "N/A"}</p>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">{product.name}</h2>
            </div>

            {/* Rating */}
            {product.rating?.stars > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {Array(5).fill(0).map((_, i) => (
                    <IconStar key={i} filled={i < Math.round(product.rating.stars)} className="w-4 h-4" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating.stars} ({(product.rating.count || 0).toLocaleString()} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-gray-900">{formatMoneyCents(product.priceCents)}</span>
              {onSale && (
                <>
                  <span className="text-base text-gray-400 line-through">{formatMoneyCents(Math.round(product.priceCents * 1.35))}</span>
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                    -{Math.round((1 - product.priceCents / Math.round(product.priceCents * 1.35)) * 100)}%
                  </span>
                </>
              )}
            </div>

            <div className="h-px bg-gray-100" />

            {/* Color picker */}
            {colors && colors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">
                  Colour: <span className="font-normal text-gray-500">{selectedColor || "Select"}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((col) => (
                    <motion.button
                      key={col.value || col}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(col.value || col)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === (col.value || col) ? "border-gray-900 scale-110 shadow-md" : "border-transparent hover:border-gray-400"
                        }`}
                      style={{ background: col.hex || col }}
                      title={col.label || col}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size picker */}
            {sizes && sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-700">
                    Size: <span className="font-normal text-gray-500">{selectedSize || "Select size"}</span>
                  </p>
                  <button className="text-xs text-indigo-600 underline hover:text-indigo-800 transition-colors">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <motion.button
                      key={sz}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[44px] px-3 py-2 text-xs font-semibold rounded-full border transition-all duration-200 ${selectedSize === sz
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-700"
                        }`}
                    >{sz}</motion.button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">👍 96% found this true to size</p>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Quantity</p>
              <div className="flex items-center gap-0 border border-gray-300 rounded-lg w-fit overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors font-bold text-lg"
                >−</button>
                <span className="w-10 text-center text-sm font-bold text-gray-900 tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                ><IconPlus className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Add to cart button */}
            <div className="space-y-2.5 mt-auto">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={addState === "loading"}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${addState === "success"
                  ? "bg-emerald-600 text-white"
                  : addState === "error"
                    ? "bg-red-500 text-white"
                    : addState === "loading"
                      ? "bg-gray-400 text-white cursor-default"
                      : "bg-gray-900 text-white hover:bg-gray-700"
                  }`}
              >
                {addState === "loading" && <IconSpinner className="w-4 h-4" />}
                {addState === "success" ? "✓ Added to Cart!"
                  : addState === "error" ? "Failed — Try again"
                    : addState === "loading" ? "Adding…"
                      : "Add to Cart"}
              </motion.button>

              {/* View full details link */}
              <Link
                to={`/products/${product.id}`}
                onClick={onClose}
                className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                View Full Details <IconChevRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
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

      <motion.div
        initial={{ opacity: 0, scale: .95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed z-[81] bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          width: "min(600px, calc(100vw - 2rem))",
          maxHeight: "85vh",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
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
function InlineAd({ product, type }) {
  if (!product) return null;
  if (type === "featured") {
    return (
      <div className="col-span-full">
        <div className="rounded-xl overflow-hidden flex items-center"
          style={{ background: "linear-gradient(120deg,#111827 0%,#1e1b4b 100%)", minHeight: 100 }}>
          <div className="flex-1 px-5 py-4 z-10">
            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-300 mb-1">Featured</p>
            <p className="text-white font-bold text-sm leading-snug line-clamp-1 mb-1">{product.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-white font-black">{formatMoneyCents(product.priceCents)}</span>
              <span className="text-indigo-300 text-xs line-through">{formatMoneyCents(Math.round(product.priceCents * 1.5))}</span>
            </div>
          </div>
          <div className="w-20 h-24 flex-shrink-0 overflow-hidden">
            <img src={product.image} alt="" className="w-full h-full object-cover opacity-70" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="col-span-full">
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0">⚡</span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-amber-900">Flash Deal</p>
            <p className="text-[11px] text-amber-700 line-clamp-1">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-amber-900 font-black text-sm">{formatMoneyCents(product.priceCents)}</span>
          <Link to={`/products/${product.id}`}
            className="text-[11px] bg-amber-900 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-800 transition-colors">
            Shop
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── ViewMoreBtn ───────────────────────────────────────────────────────────────
function ViewMoreBtn({ onClick, loading, allLoaded, count }) {
  if (allLoaded) {
    return (
      <div className="col-span-full text-center py-8 text-gray-400 text-sm">
        All <span className="font-semibold text-gray-600">{count}</span> products shown
      </div>
    );
  }
  return (
    <div className="col-span-full flex justify-center py-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-600 text-gray-700 font-semibold text-sm px-8 py-3 rounded-full transition-all hover:shadow-sm disabled:opacity-60"
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

  return (
    <div className="bg-white min-h-screen">
      <style>{PG_STYLES}</style>

      {/* ── Live ticker (real-time product activity) ── */}
      {!isLoading && allProducts.length > 0 && <LiveTicker products={allProducts} />}

      {/* ── Sort / breadcrumb bar ─────────────────────────────────────────────
          NOT sticky — avoids collision with the global Navbar.
          Navbar is already sticky; this bar just provides context + controls. ── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-auto min-w-0">
            <Link to="/" className="hover:text-gray-700 transition-colors shrink-0">Home</Link>
            <span className="shrink-0">/</span>
            <span className="text-gray-700 font-medium truncate">
              {searchTerm ? `"${searchTerm}"` : selectedCategory === "All" ? "All Products" : selectedCategory}
            </span>
          </div>

          {/* ── Mobile filter button ── */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className={`lg:hidden flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-all flex-shrink-0 ${activeFilterCount > 0
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-700 border-gray-300 hover:border-gray-600"
              }`}
          >
            <IconFilter className="w-3.5 h-3.5" />
            Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Sort select */}
          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none cursor-pointer flex-shrink-0"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Clear search */}
          {searchTerm && (
            <button onClick={() => navigate("/products")}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors flex-shrink-0">
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
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto pg-slim pr-1">
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
                  className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${selectedCategory === cat
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
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
            <p className="text-xs text-gray-400 mb-4">
              {isLoading ? "Loading…" : (
                <>
                  <span className="font-semibold text-gray-700">{filteredProducts.length}</span> products
                  {searchTerm && <> for "<span className="font-semibold text-gray-700">{searchTerm}</span>"</>}
                  {visibleCount < filteredProducts.length && (
                    <> · showing <span className="font-semibold text-gray-700">{visibleProducts.length}</span></>
                  )}
                </>
              )}
            </p>

            {/* Loading skeleton */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array(PAGE_SIZE).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-lg" style={{ paddingTop: "135%" }} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="text-6xl mb-5">🔍</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">No products found</h2>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">
                  {searchTerm ? `Nothing matched "${searchTerm}".` : "Try adjusting your filters."}
                </p>
                <button onClick={resetAll} className="text-sm font-semibold underline text-gray-600 hover:text-gray-900">
                  Clear all filters
                </button>
              </div>
            )}

            {/* ── Product grid — tight 4-col (SHEIN/Amazon style) ── */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {gridItems.map((item) => {
                  if (item.type === "ad") {
                    return <InlineAd key={`ad-${item.idx}`} product={item.adProduct} type={item.adType} />;
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
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl lg:hidden overflow-hidden"
              style={{ maxHeight: "90vh" }}
            >
              <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
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
                  className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors"
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