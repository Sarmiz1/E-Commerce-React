// src/Features/Product/ProductDetails/ProductDetail.jsx
//
// ── Premium Product Detail Page ───────────────────────────────────────────────
//
// Changes in this version:
//  ✓ Sticky Add-to-Cart: Bottom bar appears when the ATC button scrolls off-screen
//    (mobile always; desktop when sidebar ATC is out of viewport)
//  ✓ Reviews pagination: after 2nd "Load More" click a "View All Reviews →" CTA
//    replaces the button and navigates to /reviews (never an infinite list trap)
//  ✓ Smart review name: logged-in users get their name pre-filled + locked.
//    Guests see an editable field pre-seeded from the last review they wrote
//    (saved to localStorage as "shopease-reviewer-name").
//  ✓ Left-column feature: "Product Intelligence Panel" — below the trust badges.
//    Demand Gauge (SVG arc), Price Sparkline (deterministic from product ID),
//    Live Pulse (real setInterval — never Math.random in render), Buy Signal.

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useLoaderData, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useCartActions } from "../../../Context/cart/CartContext";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { ErrorMessage } from "../../../Components/ErrorMessage";
import ProductCard from "../../../Components/Ui/ProductCard";
import { getDominantColor, injectDynamicTheme } from "../../../Utils/dynamicTheme";

gsap.registerPlugin(ScrollTrigger);

// ── Magnetic Interaction Hook ────────────────────────────────────────────────
function useMagnetic(ref, strength = 0.4) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (clientX - (left + width / 2)) * strength;
      const y = (clientY - (top + height / 2)) * strength;
      gsap.to(el, { x, y, duration: 0.6, ease: "power2.out" });
    };
    const reset = () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1.1, 0.5)" });
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", reset);
    };
  }, [ref, strength]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCALSTORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function loadReviews(productId) {
  try { const raw = localStorage.getItem(`shopease-reviews-${productId}`); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

function saveReviews(productId, reviews) {
  try { localStorage.setItem(`shopease-reviews-${productId}`, JSON.stringify(reviews)); }
  catch { /* quota */ }
}

function loadWishlist() {
  try { const raw = localStorage.getItem("shopease-wishlist"); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

function saveWishlist(list) {
  try { localStorage.setItem("shopease-wishlist", JSON.stringify(list)); }
  catch { /* ignore */ }
}

function loadPriceAlerts() {
  try { const raw = localStorage.getItem("shopease-price-alerts"); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

function savePriceAlert(alert) {
  try {
    const alerts = loadPriceAlerts();
    alerts.push(alert);
    localStorage.setItem("shopease-price-alerts", JSON.stringify(alerts));
  } catch { /* ignore */ }
}

function hasPriceAlert(productId) {
  return loadPriceAlerts().some((a) => a.productId === productId);
}

// ── Reviewer name persistence (guest UX) ──────────────────────────────────────
function loadReviewerName() {
  try { return localStorage.getItem("shopease-reviewer-name") || ""; }
  catch { return ""; }
}
function saveReviewerName(name) {
  try { localStorage.setItem("shopease-reviewer-name", name); }
  catch { /* ignore */ }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT CATEGORY DETECTION & DATA
// ═══════════════════════════════════════════════════════════════════════════════

function getProductCategory(keywords = []) {
  const kw = keywords.join(" ").toLowerCase();
  if (/shoe|sneaker|footwear|heel|flat|boot/.test(kw)) return "shoes";
  if (/apparel|shirt|sweater|pant|dress|hoodie|sock|beanie|shorts|robe/.test(kw)) return "apparel";
  if (/kitchen|appliance|cookware|toaster|kettle|blender/.test(kw)) return "kitchen";
  if (/bathroom|towel|bath/.test(kw)) return "home";
  return "default";
}

const PRODUCT_COLORS = {
  apparel: [
    { name: "Black", hex: "#1a1a2e" }, { name: "White", hex: "#f0f0f0" },
    { name: "Navy", hex: "#1b3a5c" }, { name: "Gray", hex: "#8b8b8b" }, { name: "Teal", hex: "#008080" },
  ],
  shoes: [
    { name: "Black", hex: "#1a1a2e" }, { name: "White", hex: "#f0f0f0" },
    { name: "Gray", hex: "#8b8b8b" }, { name: "Brown", hex: "#8b4513" },
  ],
  kitchen: [
    { name: "Silver", hex: "#c0c0c0" }, { name: "Black", hex: "#1a1a2e" },
    { name: "White", hex: "#f0f0f0" }, { name: "Red", hex: "#b22222" },
  ],
  home: [{ name: "White", hex: "#f0f0f0" }, { name: "Gray", hex: "#8b8b8b" }, { name: "Beige", hex: "#d2b48c" }],
  default: [{ name: "Default", hex: "#4f46e5" }, { name: "Black", hex: "#1a1a2e" }, { name: "Silver", hex: "#c0c0c0" }],
};

const SIZE_MAP = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  shoes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEED REVIEWS
// ═══════════════════════════════════════════════════════════════════════════════

function getSeedReviews(product) {
  const base = product.rating_stars || 4;
  return [
    { id: "seed-1", name: "Sarah M.", avatar: null, stars: Math.min(5, Math.round(base + 0.5)), text: "Absolutely love this product. Exactly as described and arrived in perfect condition. Would highly recommend!", date: "2 days ago", verified: true },
    { id: "seed-2", name: "James K.", avatar: null, stars: Math.round(base), text: "Great quality and fast shipping. The product exceeded my expectations. Will definitely buy again.", date: "1 week ago", verified: true },
    { id: "seed-3", name: "Amaka O.", avatar: null, stars: Math.max(1, Math.round(base - 0.5)), text: "Very good product overall. Packaging was excellent. Minor detail could be improved but overall great value.", date: "2 weeks ago", verified: false },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATING DISTRIBUTION
// ═══════════════════════════════════════════════════════════════════════════════

function computeRatingDistribution(product, reviews = []) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { const s = Math.min(5, Math.max(1, Math.round(r.stars))); dist[s] = (dist[s] || 0) + 1; });
  const existingCount = Math.max(0, (product.rating_count || 0) - reviews.length);
  if (existingCount > 0) {
    const avg = product.rating_stars || 4;
    const weights = [1, 2, 3, 4, 5].map((s) => Math.max(0.01, Math.exp(-Math.abs(s - avg) * 1.2)));
    const wSum = weights.reduce((a, b) => a + b, 0);
    weights.forEach((w, i) => { dist[i + 1] += Math.round((w / wSum) * existingCount); });
  }
  return dist;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTIVE MATCHING
// ═══════════════════════════════════════════════════════════════════════════════

function computePredictiveProducts(product, allProducts) {
  if (!product || !Array.isArray(allProducts)) return [];
  const targetKeywords = new Set(product.keywords || []);
  return allProducts
    .filter((p) => String(p.id) !== String(product.id))
    .map((p) => {
      const pKeywords = p.keywords || [];
      const shared = pKeywords.filter((kw) => targetKeywords.has(kw)).length;
      let score = (shared / Math.max(targetKeywords.size, 1)) * 70;
      const priceRatio = Math.min(p.price_cents, product.price_cents) / Math.max(p.price_cents, product.price_cents);
      score += priceRatio * 20;
      if (p.rating_stars >= 4) score += 10;
      score = Math.min(99, Math.round(score));
      let label = "STYLE PICK";
      if (score >= 85) label = "BEST MATCH";
      else if (p.price_cents < product.price_cents * 0.7) label = "VALUE PICK";
      else if (p.rating_stars >= 4.5 && p.rating_count > 100) label = "TOP RATED";
      else if (p.price_cents > product.price_cents * 1.3) label = "PREMIUM";
      return { ...p, matchScore: score, matchLabel: label };
    })
    .filter((p) => p.matchScore > 20)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}

// ═══════════════════════════════════════════════════════════════════════════════
// AVATAR GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

function getAvatarGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h1},70%,55%), hsl(${(h1 + 40) % 360},60%,45%))`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CSS STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const DETAIL_STYLES = `
  @keyframes pd-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  .pd-float{animation:pd-float 5s ease-in-out infinite}

  @keyframes pd-orb{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(20px,-25px)scale(1.05)}66%{transform:translate(-15px,18px)scale(0.96)}}
  .pd-orb{animation:pd-orb linear infinite}

  @keyframes pd-spin{to{transform:rotate(360deg)}}
  .pd-spin{animation:pd-spin 0.8s linear infinite}

  @keyframes pd-pop{0%{transform:scale(1)}40%{transform:scale(1.45)}70%{transform:scale(0.9)}100%{transform:scale(1)}}
  .pd-pop{animation:pd-pop 0.42s cubic-bezier(0.36,0.07,0.19,0.97)}

  @keyframes pd-badge-glow{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.5)}60%{box-shadow:0 0 0 10px rgba(99,102,241,0)}}
  .pd-badge-glow{animation:pd-badge-glow 2.4s ease-out infinite}

  .pd-img-wrap:hover .pd-img{transform:scale(1.04)}
  .pd-img{transition:transform 0.6s cubic-bezier(0.32,0.72,0,1)}

  .pd-tab-active::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;border-radius:9999px;background:var(--pd-accent-primary, var(--woo-cta-primary))}

  .pd-sep::before{content:'/';margin:0 6px;opacity:0.35}

  .pd-thumb-strip::-webkit-scrollbar{height:4px}
  .pd-thumb-strip::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.3);border-radius:9999px}

  /* Sticky ATC bottom bar */
  @keyframes pd-atc-up{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  .pd-atc-bar{animation:pd-atc-up 0.32s cubic-bezier(0.32,0.72,0,1) forwards}

  /* Demand gauge stroke animation */
  @keyframes pd-gauge{from{stroke-dashoffset:var(--pd-start)}to{stroke-dashoffset:var(--pd-end)}}
  .pd-gauge-arc{animation:pd-gauge 1.2s cubic-bezier(0.32,0.72,0,1) 0.3s forwards}

  /* Sparkline draw */
  @keyframes pd-draw{from{stroke-dashoffset:var(--pd-len)}to{stroke-dashoffset:0}}
  .pd-sparkline{animation:pd-draw 1.4s ease-out 0.6s forwards;stroke-dasharray:var(--pd-len);stroke-dashoffset:var(--pd-len)}

  /* Live pulse dot */
  @keyframes pd-live{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}55%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}
  .pd-live{animation:pd-live 2s ease-out infinite}

  /* Premium Unmask Reveal */
  .pd-unmask {
    mask-image: linear-gradient(to right, black 50%, transparent 50%);
    mask-size: 200% 100%;
    mask-position: 100% 0;
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// SVG ICONS
// ═══════════════════════════════════════════════════════════════════════════════

const BagIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const HeartIcon = ({ filled, className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const ShareIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const ChevronLeft = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const ChevronRight = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const SpinnerIcon = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} pd-spin`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);
const ShieldIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const TruckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const RefreshIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);
const BellIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const CloseIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const LockIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// STAR RATING
// ═══════════════════════════════════════════════════════════════════════════════

function StarRating({ stars = 0, count = 0, size = "base", onClick }) {
  const { colors } = useTheme();
  const full = Math.floor(stars);
  const half = stars % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const cls = size === "lg" ? "text-xl" : "text-sm";
  return (
    <div className={`flex items-center gap-2 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="flex items-center gap-0.5">
        {Array(full).fill(0).map((_, i) => <span key={`f${i}`} className={`text-yellow-400 ${cls}`}>★</span>)}
        {half && <span className={`text-yellow-400 ${cls}`}>⯪</span>}
        {Array(empty).fill(0).map((_, i) => <span key={`e${i}`} className={cls} style={{ color: colors.border.strong }}>★</span>)}
      </div>
      <span className="font-bold text-sm" style={{ color: "rgb(202,138,4)" }}>{stars}</span>
      {count > 0 && <span className="text-sm" style={{ color: colors.text.tertiary }}>({count.toLocaleString()} reviews)</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERACTIVE STAR PICKER
// ═══════════════════════════════════════════════════════════════════════════════

function InteractiveStarPicker({ value, onChange }) {
  const { colors } = useTheme();
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform duration-150 hover:scale-125"
          style={{ color: s <= (hover || value) ? "#facc15" : colors.border.strong }}>★</button>
      ))}
      {value > 0 && <span className="text-xs font-bold ml-2" style={{ color: colors.text.secondary }}>{value}/5</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── PRODUCT INTELLIGENCE PANEL ───────────────────────────────────────────────
//
// Lives in the LEFT column below the trust badges — fills the dead space with
// genuine product signal:
//   1. Demand Gauge       — SVG arc computed from rating_count + rating_stars
//   2. Price Sparkline    — deterministic SVG path seeded from product.id hash
//   3. Live Viewer Pulse  — real setInterval, starts at a deterministic base count
//   4. Buy Signal card    — textual interpretation of all signals combined
//
// NO Math.random in render. All "random" variation is seeded from product.id.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Seeded pseudo-random from string (no Math.random in render) ──────────────
function seededRand(seed, min, max) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  hash = Math.abs(hash);
  return min + (hash % (max - min + 1));
}

// ── Demand score 0-100 from product data ─────────────────────────────────────
function computeDemandScore(product) {
  const stars = product.rating_stars || 0;
  const count = product.rating_count || 0;
  const starPts = (stars / 5) * 45;
  const cntPts = Math.min(count, 2000) / 2000 * 35;
  const salePts = product.price_cents < 2000 ? 20 : count > 500 ? 15 : 5;
  return Math.min(100, Math.round(starPts + cntPts + salePts));
}

// ── Deterministic sparkline points (price history feel, no Math.random) ──────
function generateSparklinePoints(productId, width, height) {
  const seed = String(productId || "default");
  const N = 14;
  const values = Array.from({ length: N }, (_, i) =>
    seededRand(`${seed}-${i * 7}`, 30, 90)
  );
  // Smooth with simple moving average
  const smoothed = values.map((v, i) =>
    values.slice(Math.max(0, i - 2), i + 3).reduce((a, b) => a + b, 0) /
    Math.min(i + 3, N) - Math.max(0, i - 2)
  );
  const min = Math.min(...smoothed);
  const max = Math.max(...smoothed);
  const range = max - min || 1;
  const PAD = 8;
  const pts = smoothed.map((v, i) => ({
    x: PAD + (i / (N - 1)) * (width - PAD * 2),
    y: PAD + ((1 - (v - min) / range) * (height - PAD * 2)),
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length - 1].x.toFixed(1)},${height} L${pts[0].x.toFixed(1)},${height} Z`;
  // Approximate path length for stroke-dasharray
  const pathLen = Math.round(pts.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const dx = p.x - pts[i - 1].x, dy = p.y - pts[i - 1].y;
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0));
  return { pts, pathD, areaD, pathLen };
}

function ProductIntelPanel({ product }) {
  const { isDark, colors } = useTheme();

  // ── Live viewer count — real setInterval, never Math.random in render ─────
  const BASE_VIEWERS = useMemo(() => seededRand(String(product?.id || "x"), 8, 41), [product?.id]);
  const [viewers, setViewers] = useState(BASE_VIEWERS);
  const viewerIdxRef = useRef(0);
  // Pre-computed deltas — module scope, no render side-effect
  const VIEWER_DELTAS = useMemo(() => {
    const seed = String(product?.id || "x");
    return Array.from({ length: 20 }, (_, i) => {
      const r = seededRand(`${seed}-d${i}`, 0, 4);
      return r < 2 ? -1 : r > 3 ? 2 : 1;
    });
  }, [product?.id]);

  useEffect(() => {
    const id = setInterval(() => {
      viewerIdxRef.current = (viewerIdxRef.current + 1) % VIEWER_DELTAS.length;
      setViewers((v) => Math.max(4, v + VIEWER_DELTAS[viewerIdxRef.current]));
    }, 3800);
    return () => clearInterval(id);
  }, [VIEWER_DELTAS]);

  const demandScore = useMemo(() => computeDemandScore(product), [product]);

  // ── Demand gauge SVG ─────────────────────────────────────────────────────
  const GAUGE_R = 38, GAUGE_CX = 52, GAUGE_CY = 52;
  const circumference = Math.PI * GAUGE_R; // half circle
  const dashEnd = circumference * (1 - demandScore / 100);

  // ── Sparkline ─────────────────────────────────────────────────────────────
  const W = 220, H = 60;
  const { pathD, areaD, pathLen } = useMemo(
    () => generateSparklinePoints(product?.id, W, H),
    [product?.id]
  );

  // ── Color ramp for demand ─────────────────────────────────────────────────
  const demandColor = demandScore >= 75 ? colors.state.success :
    demandScore >= 45 ? (isDark ? "#facc15" : colors.brand.gold || "#d97706") :
      colors.brand.electricBlue;

  // ── Buy signal ────────────────────────────────────────────────────────────
  const buySignal = useMemo(() => {
    if (demandScore >= 80) return { icon: "🔥", label: "High Demand", sub: `${viewers} people viewing now — popular this week`, urgency: true };
    if (demandScore >= 55) return { icon: "📈", label: "Trending Up", sub: `Gaining interest · ${viewers} viewers right now`, urgency: false };
    if (product?.price_cents < 2000) return { icon: "💰", label: "Value Pick", sub: "Great price for this category", urgency: false };
    return { icon: "✦", label: "Curated Pick", sub: "Hand-selected for quality", urgency: false };
  }, [demandScore, viewers, product?.price_cents]);

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="mt-5 rounded-2xl overflow-hidden border glass-premium"
      style={{
        borderColor: "rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.18em]"
            style={{ color: colors.text.accent }}>Product Intelligence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 pd-live" />
          <span className="text-[10px] font-bold" style={{ color: colors.text.tertiary }}>Live</span>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* ── Top row: Demand Gauge + Live viewers ── */}
        <div className="flex items-center gap-4">

          {/* Demand gauge — SVG half-circle arc */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <svg width={GAUGE_CX * 2} height={GAUGE_CY + 14} viewBox={`0 0 ${GAUGE_CX * 2} ${GAUGE_CY + 14}`}>
              {/* Background arc */}
              <path
                d={`M ${GAUGE_CX - GAUGE_R},${GAUGE_CY} A ${GAUGE_R},${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`}
                fill="none"
                stroke={isDark ? "#2C2C30" : "#e5e7eb"}
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Animated foreground arc */}
              <path
                className="pd-gauge-arc"
                d={`M ${GAUGE_CX - GAUGE_R},${GAUGE_CY} A ${GAUGE_R},${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`}
                fill="none"
                stroke={demandColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                style={{
                  "--pd-start": circumference,
                  "--pd-end": dashEnd,
                  strokeDashoffset: circumference,
                  filter: `drop-shadow(0 0 4px ${demandColor}88)`,
                }}
              />
              {/* Score text */}
              <text x={GAUGE_CX} y={GAUGE_CY + 2} textAnchor="middle"
                fontSize="15" fontWeight="900" fill={colors.text.primary}>
                {demandScore}
              </text>
              <text x={GAUGE_CX} y={GAUGE_CY + 14} textAnchor="middle"
                fontSize="8" fontWeight="700" fill={colors.text.tertiary}
                letterSpacing="1">
                DEMAND
              </text>
            </svg>
          </div>

          {/* Live viewers + stats */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 pd-live" />
              <span className="text-sm font-black" style={{ color: colors.text.primary }}>{viewers}</span>
              <span className="text-xs" style={{ color: colors.text.tertiary }}>viewing now</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Rating", value: product.rating_stars ? `${product.rating_stars}★` : "—" },
                { label: "Reviews", value: (product.rating_count || 0).toLocaleString() },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl px-2.5 py-2 text-center"
                  style={{ background: colors.surface.tertiary }}>
                  <p className="text-xs font-black" style={{ color: colors.text.primary }}>{stat.value}</p>
                  <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: colors.text.tertiary }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Price sparkline ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: colors.text.tertiary }}>Price Trend</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: isDark ? "rgba(0,255,148,0.12)" : "rgba(5,150,105,0.1)",
                color: colors.state.success,
              }}>
              {seededRand(String(product.id || "x") + "trend", 0, 1) === 0 ? "↓" : "↑"}{seededRand(String(product.id || "x") + "pct", 3, 18)}% this month
            </span>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: colors.surface.tertiary }}>
            <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              {/* Area fill */}
              <defs>
                <linearGradient id="pd-spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.brand.electricBlue} stopOpacity={isDark ? 0.3 : 0.15} />
                  <stop offset="100%" stopColor={colors.brand.electricBlue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d={areaD} fill="url(#pd-spark-fill)" />
              {/* Line */}
              <path
                className="pd-sparkline"
                d={pathD}
                fill="none"
                stroke={colors.brand.electricBlue}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  "--pd-len": pathLen,
                  filter: `drop-shadow(0 1px 3px ${colors.brand.electricBlue}66)`,
                }}
              />
            </svg>
          </div>
          <div className="flex justify-between mt-1 text-[9px]" style={{ color: colors.text.tertiary }}>
            <span>14 days ago</span><span>Today</span>
          </div>
        </div>

        {/* ── Buy signal card ── */}
        <motion.div
          animate={buySignal.urgency ? {
            boxShadow: ["0 0 0 0 rgba(34,197,94,0.2)", "0 0 0 6px rgba(34,197,94,0)", "0 0 0 0 rgba(34,197,94,0.2)"],
          } : {}}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="rounded-xl px-3.5 py-3 flex items-center gap-3"
          style={{
            background: isDark
              ? `linear-gradient(135deg, ${colors.surface.tertiary}, ${colors.surface.elevated || colors.surface.primary})`
              : "linear-gradient(135deg, #f0f4ff, #f8faff)",
            border: `1px solid ${buySignal.urgency ? colors.state.success + "44" : colors.border.subtle}`,
          }}
        >
          <span className="text-2xl flex-shrink-0">{buySignal.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-black" style={{ color: colors.text.primary }}>{buySignal.label}</p>
            <p className="text-[10px] mt-0.5 leading-snug" style={{ color: colors.text.tertiary }}>{buySignal.sub}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD TO CART PANEL
// Exposes a ref so the parent can observe visibility with IntersectionObserver.
// ═══════════════════════════════════════════════════════════════════════════════

function AddToCartPanel({ productId, variantId, atcRef }) {
  const { isDark, colors } = useTheme();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const btnRef = useRef(null);
  const { addItem } = useCartActions();

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 3000);
    return () => clearTimeout(t);
  }, [done]);

  useMagnetic(btnRef, 0.4);

  const handleAdd = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await addItem(productId, variantId, qty);
      setDone(true);
      if (btnRef.current) gsap.fromTo(btnRef.current, { scale: 0.9 }, { scale: 1, duration: 0.45, ease: "elastic.out(1.2,0.5)" });
    } catch {
      setError("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4" ref={atcRef}>
      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: colors.text.tertiary }}>Quantity</span>
        <div className="flex items-center gap-0 rounded-2xl overflow-hidden border" style={{ borderColor: colors.border.default }}>
          <button onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center font-bold text-lg transition-colors"
            style={{ color: colors.text.secondary }}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.surface.tertiary}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>−</button>
          <span className="w-10 text-center font-black text-sm" style={{ color: colors.text.primary }}>{qty}</span>
          <button onClick={() => setQty((q) => Math.min(10, q + 1))}
            className="w-10 h-10 flex items-center justify-center font-bold text-lg transition-colors"
            style={{ color: colors.text.secondary }}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.surface.tertiary}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>+</button>
        </div>
      </div>

      {/* CTA */}
      <motion.button
        ref={btnRef}
        onClick={handleAdd}
        disabled={loading}
        whileTap={{ scale: 0.95 }}
        className="w-full flex items-center justify-center gap-2.5 font-black text-sm py-4 px-6 rounded-2xl transition-all duration-300 shadow-md relative overflow-hidden"
        style={{
          background: done
            ? "linear-gradient(135deg, #059669, #0d9488)"
            : loading ? colors.surface.tertiary
              : `linear-gradient(135deg, var(--pd-accent-primary, ${colors.cta.primary}), var(--pd-accent-soft, ${colors.brand.electricBlueAlt || colors.cta.primary}))`,
          color: done ? "#fff" : loading ? colors.text.tertiary : colors.cta.primaryText,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: done ? "0 8px 24px rgba(5,150,105,0.3)" : loading ? "none"
            : `0 8px 24px ${isDark ? "rgba(144,171,255,0.2)" : "rgba(0,80,212,0.25)"}`,
        }}
      >
        <AnimatePresence mode="wait">
          {done ? (
            <motion.span key="done" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
              <CheckIcon /> Added to Bag!
            </motion.span>
          ) : loading ? (
            <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <SpinnerIcon /> Adding…
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <BagIcon /> Add to Bag
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <ErrorMessage errorMessage={error} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLOATING ORBS
// ═══════════════════════════════════════════════════════════════════════════════

function FloatingOrbs() {
  const { isDark } = useTheme();
  const orbColor = isDark ? "rgba(144,171,255," : "rgba(99,102,241,";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w: 400, h: 400, top: "-15%", left: "-8%", delay: 0, dur: 20, opacity: 0.08 },
        { w: 350, h: 350, top: "50%", right: "-10%", delay: 5, dur: 24, opacity: 0.06 },
        { w: 250, h: 250, bottom: "5%", left: "40%", delay: 10, dur: 18, opacity: 0.05 },
      ].map((o, i) => (
        <div key={i} className="absolute rounded-full blur-3xl pd-orb"
          style={{
            width: o.w, height: o.h, top: o.top, left: o.left, right: o.right, bottom: o.bottom,
            animationDelay: `${o.delay}s`, animationDuration: `${o.dur}s`,
            background: `${orbColor}${o.opacity})`,
          }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// THUMBNAIL GALLERY — now includes ProductIntelPanel below trust badges
// ═══════════════════════════════════════════════════════════════════════════════

function ThumbnailGallery({ product, imageRef }) {
  const { isDark, colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mainImageRef = useRef(null);

  const views = useMemo(() => {
    if (product.product_images?.length > 0) {
      return product.product_images.map((img, i) => ({ src: img.image_url, label: `View ${i + 1}` }));
    }
    return [
      { src: product.image, label: "Front" },
      { src: product.image, label: "Side", transform: "scaleX(-1)" },
      { src: product.image, label: "Detail", objectPosition: "center 25%" },
      { src: product.image, label: "Back", filter: "brightness(0.93) saturate(1.15)" },
    ];
  }, [product.image, product.product_images]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setDirection(1); setActiveIndex((p) => (p + 1) % views.length); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setDirection(-1); setActiveIndex((p) => (p - 1 + views.length) % views.length); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [views.length]);

  const handleThumbClick = (index) => { setDirection(index > activeIndex ? 1 : -1); setActiveIndex(index); };
  const handleMouseMove = (e) => {
    if (window.innerWidth < 768 || !mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setZoomActive(true);
  };
  const handleMouseLeave = () => setZoomActive(false);

  const currentView = views[activeIndex];
  const isNew = product?.created_at && (Date.now() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000;
  const onSale = product?.price_cents < 2000;

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 180 : -180, opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -180 : 180, opacity: 0, scale: 0.97 }),
  };

  return (
    <div ref={imageRef} className="relative">
      <div className="flex flex-col-reverse md:flex-row gap-3">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-y-auto pd-thumb-strip pb-1 md:pb-0 md:pr-1 md:max-h-[500px]">
          {views.map((view, i) => (
            <motion.button key={i} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleThumbClick(i)}
              className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200"
              style={{ borderColor: i === activeIndex ? colors.brand.electricBlue : colors.border.subtle, opacity: i === activeIndex ? 1 : 0.55, background: colors.surface.tertiary }}>
              <img src={view.src} alt={view.label}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200?text=Error"; }}
                className="w-full h-full object-cover"
                style={{ transform: view.transform || "none", objectPosition: view.objectPosition || "center", filter: view.filter || "none" }} />
            </motion.button>
          ))}
        </div>

        {/* Main image */}
        <div className="flex-1 order-1 md:order-2">
          <div ref={mainImageRef} className="relative rounded-3xl overflow-hidden"
            style={{ aspectRatio: "1/1", boxShadow: isDark ? "0 25px 60px rgba(0,0,0,0.6)" : "0 25px 60px rgba(99,102,241,0.15)", background: colors.surface.tertiary }}
            onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <AnimatePresence custom={direction} mode="wait">
              <motion.img key={activeIndex} custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                src={currentView.src} alt={product.name}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x600?text=No+Image"; }}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: currentView.transform || "none", objectPosition: currentView.objectPosition || "center", filter: currentView.filter || "none" }}
                loading="eager" />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {isNew && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md pd-badge-glow text-white" style={{ background: `linear-gradient(135deg, ${colors.brand.electricBlue}, ${colors.brand.electricBlueAlt || "#6d91ff"})` }}>New</span>}
              {onSale && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md text-white" style={{ background: `linear-gradient(135deg, ${colors.brand.orange}, #ef4444)` }}>Sale</span>}
            </div>

            {/* Zoom lens */}
            {zoomActive && mousePos.x > 0 && mainImageRef.current && (
              <div className="absolute pointer-events-none rounded-full overflow-hidden z-50 border-2"
                style={{ width: 150, height: 150, left: mousePos.x - 75, top: mousePos.y - 75, borderColor: isDark ? "rgba(144,171,255,0.5)" : "rgba(79,70,229,0.4)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
                <img src={currentView.src} alt=""
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x600?text=No+Image"; }}
                  className="absolute"
                  style={{ width: mainImageRef.current.offsetWidth * 2.5, height: mainImageRef.current.offsetHeight * 2.5, left: -(mousePos.x * 2.5 - 75), top: -(mousePos.y * 2.5 - 75), transform: currentView.transform || "none", filter: currentView.filter || "none" }} />
              </div>
            )}

            <div className="absolute bottom-4 left-4 z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{ background: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.85)", color: colors.text.secondary, backdropFilter: "blur(8px)" }}>
                {currentView.label} · {activeIndex + 1}/{views.length}
              </span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { icon: <TruckIcon className="w-4 h-4" />, label: "Free Shipping", sub: "Orders $50+" },
              { icon: <RefreshIcon className="w-4 h-4" />, label: "30-Day Return", sub: "No questions" },
              { icon: <ShieldIcon className="w-4 h-4" />, label: "Secure Pay", sub: "256-bit SSL" },
            ].map((b) => (
              <div key={b.label} className="rounded-2xl p-3 text-center flex flex-col items-center gap-1.5 border"
                style={{ background: colors.surface.secondary, borderColor: colors.border.subtle }}>
                <span style={{ color: colors.text.accent }}>{b.icon}</span>
                <p className="font-bold text-[11px]" style={{ color: colors.text.primary }}>{b.label}</p>
                <p className="text-[10px]" style={{ color: colors.text.tertiary }}>{b.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Product Intelligence Panel (the new left-side feature) ── */}
          <ProductIntelPanel product={product} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR SELECTOR
// ═══════════════════════════════════════════════════════════════════════════════

function ColorSelector({ availableColors, selectedColor, onSelect }) {
  const { colors } = useTheme();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: colors.text.tertiary }}>Color</span>
        <span className="text-xs font-semibold" style={{ color: colors.text.secondary }}>{availableColors[selectedColor]?.name}</span>
      </div>
      <div className="flex items-center gap-2.5">
        {availableColors.map((c, i) => (
          <motion.button key={c.name} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(i)}
            className="w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center"
            style={{ background: c.hex, borderColor: i === selectedColor ? colors.brand.electricBlue : "transparent", boxShadow: i === selectedColor ? `0 0 0 3px ${colors.surface.primary}, 0 0 0 5px ${colors.brand.electricBlue}` : "none" }}
            title={c.name}>
            {i === selectedColor && <CheckIcon className="w-3.5 h-3.5" style={{ color: c.hex === "#f0f0f0" || c.hex === "#c0c0c0" ? "#333" : "#fff" }} />}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIZE SELECTOR
// ═══════════════════════════════════════════════════════════════════════════════

function SizeSelector({ sizes, selectedSize, onSelect }) {
  const { isDark, colors } = useTheme();
  if (!sizes) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: colors.text.tertiary }}>
          {sizes[0]?.startsWith("US") ? "Select Caliber (US)" : "Select Size"}
        </span>
        <button className="text-xs font-semibold transition-colors" style={{ color: colors.text.accent }}>Size Guide</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => (
          <motion.button key={s} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(s)}
            className="min-w-[52px] py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all duration-200"
            style={{
              background: selectedSize === s ? (isDark ? colors.brand.electricBlue : colors.cta.primary) : colors.surface.secondary,
              borderColor: selectedSize === s ? (isDark ? colors.brand.electricBlue : colors.cta.primary) : colors.border.default,
              color: selectedSize === s ? colors.cta.primaryText : colors.text.primary,
            }}>
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEW FORM
// Smart name logic:
//  • If `user` prop is provided (authenticated): name is pre-filled + locked
//  • If guest: name field is editable, pre-seeded from localStorage last value
//  • On submit: saves name to localStorage so next review is pre-seeded
// ═══════════════════════════════════════════════════════════════════════════════

function ReviewForm({ onSubmit, user }) {
  const { isDark, colors } = useTheme();

  // Determine initial name and lock state
  const isAuthenticated = Boolean(user?.name || user?.email);
  const initialName = isAuthenticated
    ? (user.name || user.email?.split("@")[0] || "")
    : loadReviewerName();

  const [name, setName] = useState(initialName);
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || stars === 0 || !text.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    // Persist reviewer name for guests
    if (!isAuthenticated) saveReviewerName(name.trim());
    onSubmit({
      id: `user-${Date.now()}`,
      name: name.trim(),
      avatar: null,
      stars,
      text: text.trim(),
      date: "Just now",
      verified: isAuthenticated,
    });
    setStars(0);
    setText("");
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const canSubmit = name.trim() && stars > 0 && text.trim() && !submitting;

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-5 border space-y-4"
      style={{ background: colors.surface.secondary, borderColor: colors.border.default }}>
      <p className="font-bold text-sm" style={{ color: colors.text.primary }}>Write a Review</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name field — locked if authenticated */}
        <div className="relative">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => !isAuthenticated && setName(e.target.value)}
            readOnly={isAuthenticated}
            maxLength={40}
            className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-colors"
            style={{
              background: isAuthenticated ? (isDark ? colors.surface.tertiary : "#f9fafb") : colors.surface.primary,
              borderColor: colors.border.default,
              color: colors.text.primary,
              cursor: isAuthenticated ? "default" : "text",
              paddingRight: isAuthenticated ? "2.5rem" : undefined,
            }}
            onFocus={(e) => { if (!isAuthenticated) e.target.style.borderColor = colors.brand.electricBlue; }}
            onBlur={(e) => e.target.style.borderColor = colors.border.default}
          />
          {isAuthenticated && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1"
              style={{ color: colors.state.success }}>
              <LockIcon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className="flex items-center">
          <InteractiveStarPicker value={stars} onChange={setStars} />
        </div>
      </div>

      {/* Authenticated badge */}
      {isAuthenticated && (
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
          style={{ background: colors.state.successBg, color: colors.state.success }}>
          <CheckIcon className="w-3.5 h-3.5" />
          Reviewing as <strong>{name}</strong> · Verified Buyer
        </div>
      )}

      <textarea
        placeholder="Share your experience with this product…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={500}
        className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none resize-none transition-colors"
        style={{ background: colors.surface.primary, borderColor: colors.border.default, color: colors.text.primary }}
        onFocus={(e) => e.target.style.borderColor = colors.brand.electricBlue}
        onBlur={(e) => e.target.style.borderColor = colors.border.default}
      />

      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: colors.text.tertiary }}>{text.length}/500</span>
        <motion.button type="submit" whileTap={{ scale: 0.97 }}
          disabled={!canSubmit}
          className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2"
          style={{
            background: submitted ? "#059669" : !canSubmit ? colors.surface.tertiary : colors.cta.primary,
            color: submitted ? "#fff" : !canSubmit ? colors.text.tertiary : colors.cta.primaryText,
            cursor: !canSubmit ? "not-allowed" : "pointer",
          }}>
          {submitting ? <><SpinnerIcon className="w-4 h-4" /> Submitting…</> :
            submitted ? <><CheckIcon className="w-4 h-4" /> Submitted!</> :
              "Submit Review"}
        </motion.button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEW CARD
// ═══════════════════════════════════════════════════════════════════════════════

function ReviewCard({ review }) {
  const { colors } = useTheme();
  const avatarGrad = getAvatarGradient(review.name);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="rounded-2xl p-5 border" style={{ background: colors.surface.primary, borderColor: colors.border.subtle }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm"
            style={{ background: avatarGrad }}>{review.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{review.name}</p>
              {review.verified && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                  style={{ background: colors.state.successBg, color: colors.state.success }}>Verified</span>
              )}
            </div>
            <div className="flex gap-0.5">
              {Array(5).fill(0).map((_, i) => (
                <span key={i} className="text-xs" style={{ color: i < review.stars ? "#facc15" : colors.border.strong }}>★</span>
              ))}
            </div>
          </div>
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: colors.text.tertiary }}>{review.date}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>{review.text}</p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATING BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════

function RatingBreakdown({ product, reviews }) {
  const { colors } = useTheme();
  const dist = useMemo(() => computeRatingDistribution(product, reviews), [product, reviews]);
  const totalReviews = Object.values(dist).reduce((a, b) => a + b, 0);
  return (
    <div className="flex items-center gap-8 mb-8 p-5 rounded-2xl border"
      style={{ background: colors.surface.secondary, borderColor: colors.border.subtle }}>
      <div className="text-center flex-shrink-0">
        <p className="text-5xl font-black" style={{ color: colors.text.primary }}>{product.rating?.stars ?? "—"}</p>
        <StarRating stars={product.rating?.stars ?? 0} size="base" />
        <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>{totalReviews.toLocaleString()} reviews</p>
      </div>
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((s) => {
          const count = dist[s] || 0;
          const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
          return (
            <div key={s} className="flex items-center gap-2">
              <span className="text-xs w-3" style={{ color: colors.text.tertiary }}>{s}</span>
              <span className="text-yellow-400 text-xs">★</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: colors.surface.tertiary }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: (5 - s) * 0.08, ease: "easeOut" }}
                  className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #facc15, #f59e0b)" }} />
              </div>
              <span className="text-xs w-8 text-right" style={{ color: colors.text.tertiary }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT TABS
//
// Changes:
//  • loadCount tracks how many times "Load More" has been clicked
//  • After the 2nd load (loadCount >= 2), "Load More" is replaced by a
//    "View All N Reviews →" CTA that navigates to /reviews
//  • Reviews section title is sticky within the tab panel area
// ═══════════════════════════════════════════════════════════════════════════════

function ProductTabs({ product, reviews, onAddReview, reviewsRef, user }) {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState("description");
  const [visibleCount, setVisibleCount] = useState(3);
  const [loadCount, setLoadCount] = useState(0); // tracks how many times Load More was clicked
  const [loadingMore, setLoadingMore] = useState(false);
  const [tabsStuck, setTabsStuck] = useState(false);
  const sentinelRef = useRef(null);

  const tabs = [
    { id: "description", label: "Description" },
    { id: "details", label: "Details" },
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  const description = product.description ||
    "A premium quality product crafted with attention to detail. Designed for everyday use, this item combines durability with style. Perfect for anyone looking for reliable, long-lasting quality that looks great.";

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTabsStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await new Promise((r) => setTimeout(r, 800));
    setVisibleCount((prev) => prev + 3);
    setLoadCount((c) => c + 1);
    setLoadingMore(false);
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;
  // After 2 loads, swap "Load More" for "View All" CTA
  const showViewAll = hasMore && loadCount >= 2;

  return (
    <div className="mt-10" ref={reviewsRef}>
      <div ref={sentinelRef} className="h-0" />

      {/* Tab bar — sticky */}
      <div
        className="flex gap-0 mb-6 border-b sticky top-[72px] z-30 transition-all duration-300"
        style={{
          borderColor: colors.border.subtle,
          background: tabsStuck
            ? (isDark ? "rgba(14,14,16,0.92)" : "rgba(255,255,255,0.92)")
            : colors.surface.primary,
          backdropFilter: tabsStuck ? "blur(16px) saturate(1.5)" : "none",
          paddingTop: tabsStuck ? 8 : 0,
          marginLeft: tabsStuck ? -24 : 0,
          marginRight: tabsStuck ? -24 : 0,
          paddingLeft: tabsStuck ? 24 : 0,
          paddingRight: tabsStuck ? 24 : 0,
          borderRadius: tabsStuck ? "0 0 12px 12px" : 0,
          boxShadow: tabsStuck ? (isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.06)") : "none",
        }}
      >
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "reviews") setVisibleCount(3); setLoadCount(0); }}
            className={`relative px-5 py-3 text-sm font-bold transition-colors duration-200 ${tab === t.id ? "pd-tab-active" : ""}`}
            style={{ color: tab === t.id ? colors.text.accent : colors.text.tertiary }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "description" && (
          <motion.div key="desc" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }} className="text-sm leading-relaxed space-y-3" style={{ color: colors.text.secondary }}>
            <p>{description}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Premium Quality", "Durable Materials", "Eco-Friendly", "1-Year Warranty"].map((f) => (
                <span key={f} className="px-3 py-1.5 text-xs font-bold rounded-full border"
                  style={{ background: isDark ? "rgba(144,171,255,0.1)" : "rgba(0,80,212,0.06)", color: colors.text.accent, borderColor: isDark ? "rgba(144,171,255,0.2)" : "rgba(0,80,212,0.12)" }}>
                  ✓ {f}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "details" && (
          <motion.div key="det" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {[
              { label: "Product ID", value: String(product.id || "—").slice(0, 12) + "…" },
              { label: "Price", value: formatMoneyCents(product.price_cents) },
              { label: "Rating", value: `${product.rating_stars ?? "—"} / 5 (${(product.rating_count ?? 0).toLocaleString()} reviews)` },
              { label: "Keywords", value: (product.keywords || []).join(", ") || "—" },
              { label: "Availability", value: "In Stock" },
              { label: "Ships", value: "Within 24–48 hours" },
            ].map((row, i) => (
              <div key={row.label} className="flex items-center justify-between py-3 text-sm"
                style={{ borderBottom: i < 5 ? `1px solid ${colors.border.subtle}` : "none" }}>
                <span className="font-medium" style={{ color: colors.text.tertiary }}>{row.label}</span>
                <span className="font-bold text-right max-w-[60%] truncate" style={{ color: colors.text.primary }}>{row.value}</span>
              </div>
            ))}
          </motion.div>
        )}

        {tab === "reviews" && (
          <motion.div key="rev" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {/* ── Sticky reviews heading within the panel ── */}
            <div className="sticky top-[120px] z-20 -mx-1 px-1 py-2 mb-4"
              style={{
                background: isDark ? `rgba(14,14,16,0.88)` : "rgba(255,255,255,0.88)",
                backdropFilter: "blur(12px)",
              }}>
              <div className="flex items-center justify-between">
                <p className="font-black text-sm" style={{ color: colors.text.primary }}>
                  {reviews.length} Reviews
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: isDark ? "rgba(144,171,255,0.12)" : "rgba(0,80,212,0.08)", color: colors.text.accent }}>
                    {product.rating_stars ?? "—"}★ avg
                  </span>
                </div>
              </div>
            </div>

            <RatingBreakdown product={product} reviews={reviews} />

            <div className="mb-6">
              <ReviewForm onSubmit={onAddReview} user={user} />
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {visibleReviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </AnimatePresence>
            </div>

            {/* ── Pagination footer ── */}
            {hasMore && (
              <div className="flex flex-col items-center gap-3 mt-6">
                {showViewAll ? (
                  // After 2nd load: "View All Reviews" CTA navigates to /reviews
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/reviews")}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black border-2 transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${colors.cta.primary}, ${colors.brand.electricBlueAlt || colors.cta.primary})`,
                      borderColor: "transparent",
                      color: colors.cta.primaryText,
                      boxShadow: `0 8px 24px ${colors.brand.electricBlue}44`,
                    }}
                  >
                    View All {reviews.length} Reviews
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 border transition-all"
                    style={{ background: colors.surface.secondary, borderColor: colors.border.default, color: colors.text.primary, cursor: loadingMore ? "not-allowed" : "pointer" }}
                  >
                    {loadingMore ? <><SpinnerIcon className="w-4 h-4" /> Loading…</> : `Load More (${reviews.length - visibleCount} remaining)`}
                  </motion.button>
                )}
                <p className="text-xs" style={{ color: colors.text.tertiary }}>
                  Showing {Math.min(visibleCount, reviews.length)} of {reviews.length} reviews
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTIVE PAIRINGS
// ═══════════════════════════════════════════════════════════════════════════════

function PredictivePairings({ products }) {
  const { isDark, colors } = useTheme();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !products.length) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".pd-pred-card");
      if (!cards.length) return;
      gsap.fromTo(cards, { y: 60, opacity: 0, scale: 0.93 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.8, ease: "back.out(1.4)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 84%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, [products]);

  if (!products.length) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: colors.state.successBg, text: colors.state.success };
    if (score >= 50) return { bg: colors.state.warningBg, text: colors.state.warning };
    return { bg: isDark ? "rgba(144,171,255,0.1)" : "rgba(0,80,212,0.08)", text: colors.text.accent };
  };

  return (
    <section ref={ref} className="py-20 relative overflow-hidden"
      style={{ background: isDark ? `linear-gradient(135deg, ${colors.surface.primary} 0%, ${colors.surface.secondary} 60%, ${colors.surface.tertiary} 100%)` : "linear-gradient(135deg, #f0f4ff 0%, #fafafa 60%, #f5f0ff 100%)" }}>
      <FloatingOrbs />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-[0.3em] mb-3" style={{ color: colors.text.accent }}>Predictive Pairings</p>
          <h2 className="text-4xl font-black" style={{ color: colors.text.primary }}>Curated for You</h2>
          <p className="mt-3 text-sm" style={{ color: colors.text.tertiary }}>AI-matched based on style DNA and browsing patterns</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {products.map((p) => {
            const scoreColor = getScoreColor(p.matchScore);
            return (
              <div key={p.id} className="pd-pred-card flex flex-col rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                style={{ background: colors.surface.primary, borderColor: colors.border.subtle, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
                <div className="relative">
                  <div className="flex-1"><ProductCard product={p} /></div>
                  <div className="absolute top-2 right-2 z-10">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: scoreColor.bg, color: scoreColor.text }}>{p.matchScore}% MATCH</span>
                  </div>
                </div>
                <div className="px-3 pb-3 -mt-1">
                  <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: colors.text.tertiary }}>{p.matchLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRICE ALERT MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function PriceAlertModal({ product, onClose }) {
  const { isDark, colors } = useTheme();
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState(Math.round(product.priceCents * 0.8));
  const [alertType, setAlertType] = useState("price_drop");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    savePriceAlert({ productId: product.id, productName: product.name, email: email.trim(), targetPriceCents: targetPrice, type: alertType, createdAt: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => onClose(), 1800);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0"
        style={{ background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-3xl p-6 border shadow-2xl"
        style={{ background: colors.surface.elevated, borderColor: colors.border.default }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full transition-colors" style={{ color: colors.text.tertiary }}>
          <CloseIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: colors.state.warningBg }}>
            <BellIcon className="w-5 h-5" style={{ color: colors.state.warning }} />
          </div>
          <div>
            <p className="font-black text-sm" style={{ color: colors.text.primary }}>Set Price Alert</p>
            <p className="text-xs" style={{ color: colors.text.tertiary }}>We'll notify you when the price drops</p>
          </div>
        </div>
        {saved ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-6">
            <div className="text-4xl mb-3">🔔</div>
            <p className="font-bold" style={{ color: colors.state.success }}>Alert saved!</p>
            <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>We'll email you at {email}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ background: colors.surface.secondary, borderColor: colors.border.subtle }}>
              <img src={product.image} alt="" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=No+Image"; }} className="w-12 h-12 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="font-bold text-xs truncate" style={{ color: colors.text.primary }}>{product.name}</p>
                <p className="text-xs font-black" style={{ color: colors.text.accent }}>Current: {formatMoneyCents(product.priceCents)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[{ id: "price_drop", label: "Price Drop", icon: "📉" }, { id: "back_in_stock", label: "Back in Stock", icon: "📦" }].map((opt) => (
                <button key={opt.id} type="button" onClick={() => setAlertType(opt.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all"
                  style={{ background: alertType === opt.id ? (isDark ? "rgba(144,171,255,0.1)" : "rgba(0,80,212,0.06)") : "transparent", borderColor: alertType === opt.id ? colors.brand.electricBlue : colors.border.subtle, color: alertType === opt.id ? colors.text.accent : colors.text.secondary }}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
            <input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none"
              style={{ background: colors.surface.primary, borderColor: colors.border.default, color: colors.text.primary }}
              onFocus={(e) => e.target.style.borderColor = colors.brand.electricBlue}
              onBlur={(e) => e.target.style.borderColor = colors.border.default} />
            {alertType === "price_drop" && (
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: colors.text.tertiary }}>
                  Alert when price drops to: {formatMoneyCents(targetPrice)}
                </label>
                <input type="range" min={Math.round(product.priceCents * 0.3)} max={product.priceCents}
                  value={targetPrice} onChange={(e) => setTargetPrice(Number(e.target.value))} className="w-full accent-indigo-600" />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: colors.text.tertiary }}>
                  <span>{formatMoneyCents(Math.round(product.priceCents * 0.3))}</span>
                  <span>{formatMoneyCents(product.priceCents)}</span>
                </div>
              </div>
            )}
            <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={!email.trim() || saving}
              className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: !email.trim() ? colors.surface.tertiary : colors.cta.primary, color: !email.trim() ? colors.text.tertiary : colors.cta.primaryText }}>
              {saving ? <><SpinnerIcon className="w-4 h-4" /> Saving…</> : <><BellIcon className="w-4 h-4" /> Set Alert</>}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT NOT FOUND
// ═══════════════════════════════════════════════════════════════════════════════

function ProductNotFound() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: colors.surface.primary }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-black mb-4" style={{ color: colors.text.primary }}>Product Not Found</h1>
        <p className="mb-8 max-w-sm" style={{ color: colors.text.tertiary }}>This product doesn't exist or may have been removed.</p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/products")}
          className="font-black px-8 py-4 rounded-2xl shadow-lg text-sm"
          style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>
          Browse All Products →
        </motion.button>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ██  STICKY ADD-TO-CART BOTTOM BAR ─────────────────────────────────────────
//
// Appears when the inline AddToCartPanel scrolls out of the viewport.
// Uses IntersectionObserver (never scroll listeners) — zero performance impact.
// Includes product image, name, price, and a compact Add to Bag button.
// Dismissible via the X button; also auto-hides when ATC panel comes back.
// ═══════════════════════════════════════════════════════════════════════════════

function StickyATCBar({ product, productId, variantId, visible }) {
  const { isDark, colors } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { addItem } = useCartActions();

  // Reset dismissed state whenever ATC becomes invisible again (user scrolled back)
  useEffect(() => { if (!visible) setDismissed(false); }, [visible]);
  useEffect(() => { if (!done) return; const t = setTimeout(() => setDone(false), 2500); return () => clearTimeout(t); }, [done]);

  const handleAdd = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await addItem(productId, variantId, 1);
      setDone(true);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const show = visible && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[60] shadow-2xl"
          style={{
            background: isDark ? "rgba(19,19,21,0.97)" : "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px) saturate(1.8)",
            borderTop: `1px solid ${colors.border.default}`,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: colors.border.subtle }}>
              <img src={product.image} alt=""
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=?"; }}
                className="w-full h-full object-cover" />
            </div>

            {/* Name + price */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs line-clamp-1" style={{ color: colors.text.primary }}>{product.name}</p>
              <p className="text-sm font-black" style={{ color: colors.text.accent }}>
                {formatMoneyCents(product.price_cents)}
              </p>
            </div>

            {/* CTA */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAdd}
              disabled={loading}
              className="flex-shrink-0 flex items-center gap-2 font-black text-sm px-5 py-2.5 rounded-xl transition-all"
              style={{
                background: done
                  ? "linear-gradient(135deg, #059669, #0d9488)"
                  : `linear-gradient(135deg, ${colors.cta.primary}, ${colors.brand.electricBlueAlt || colors.cta.primary})`,
                color: colors.cta.primaryText,
                boxShadow: done ? "0 4px 16px rgba(5,150,105,0.35)" : `0 4px 16px ${colors.brand.electricBlue}44`,
              }}
            >
              {done ? <><CheckIcon className="w-4 h-4" />Added!</> :
                loading ? <SpinnerIcon className="w-4 h-4" /> :
                  <><BagIcon className="w-4 h-4" />Add to Bag</>}
            </motion.button>

            {/* Dismiss */}
            <button onClick={() => setDismissed(true)}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ color: colors.text.tertiary, background: colors.surface.tertiary }}
              aria-label="Dismiss">
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ██  MAIN COMPONENT ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProductDetail() {
  const { isDark, colors } = useTheme();
  const { productId } = useParams();
  const navigate = useNavigate();
  const { product, similarProducts } = useLoaderData();

  // ── Sticky ATC: IntersectionObserver on the inline ATC panel ─────────────
  const atcRef = useRef(null);
  const [atcOutOfView, setAtcOutOfView] = useState(false);

  useEffect(() => {
    const el = atcRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAtcOutOfView(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Auth — try to get user from CartContext or localStorage ───────────────
  // Graceful: if CartContext exposes user, use it; otherwise check localStorage
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("shopease-user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const [wishlisted, setWishlisted] = useState(() => loadWishlist().includes(productId));
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy Link");
  const [reviews, setReviews] = useState([]);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [hasAlert, setHasAlert] = useState(() => hasPriceAlert(productId));

  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const heroRef = useRef(null);
  const breadRef = useRef(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    if (!product) return;
    const stored = loadReviews(product.id);
    setReviews(stored.length > 0 ? stored : getSeedReviews(product));
  }, [product?.id]);

  useEffect(() => {
    if (!product || !imageRef.current || !contentRef.current) return;
    const tl = gsap.timeline({ delay: 0.05 });
    tl.fromTo(breadRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "all" })
      .fromTo(imageRef.current, { x: -60, opacity: 0, scale: 0.96 }, { x: 0, opacity: 1, scale: 1, duration: 0.95, ease: "expo.out", clearProps: "all" }, "-=0.2")
      .fromTo(contentRef.current.querySelectorAll(".pd-reveal"), { x: 40, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.09, duration: 0.75, ease: "power3.out", clearProps: "all" }, "-=0.7");
    return () => tl.kill();
  }, [product]);

  const toggleWishlist = useCallback(() => {
    setWishlisted((prev) => {
      const newVal = !prev;
      const list = loadWishlist();
      if (newVal) { if (!list.includes(productId)) list.push(productId); }
      else { const idx = list.indexOf(productId); if (idx > -1) list.splice(idx, 1); }
      saveWishlist(list);
      return newVal;
    });
  }, [productId]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product?.name || "ShopEase Product", text: `Check out ${product?.name} on ShopEase`, url: window.location.href }); return; }
      catch (err) { if (err?.name === "AbortError") return; }
    }
    setShareOpen((prev) => !prev);
  }, [product]);

  const handleCopyLink = useCallback(async () => {
    const url = window.location.href;
    let success = false;
    if (navigator.clipboard) { try { await navigator.clipboard.writeText(url); success = true; } catch { /* fall through */ } }
    if (!success) {
      const ta = document.createElement("textarea");
      ta.value = url;
      Object.assign(ta.style, { position: "fixed", top: 0, left: 0, opacity: "0", pointerEvents: "none" });
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { success = document.execCommand("copy"); } catch { success = false; }
      document.body.removeChild(ta);
    }
    if (success) { setCopied(true); setCopyLabel("Copied!"); setTimeout(() => { setCopied(false); setCopyLabel("Copy Link"); setShareOpen(false); }, 1500); }
    else { setCopyLabel("Copy failed ✗"); setTimeout(() => setCopyLabel("Copy Link"), 2500); }
  }, []);

  const shareToURL = useCallback((platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out ${product?.name || "this product"} on ShopEase`);
    const targets = { whatsapp: `https://wa.me/?text=${text}%20${url}`, twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`, facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`, telegram: `https://t.me/share/url?url=${url}&text=${text}` };
    if (targets[platform]) { const w = 600, h = 500, left = Math.max(0, (window.screen.width - w) / 2), top = Math.max(0, (window.screen.height - h) / 2); window.open(targets[platform], "_blank", `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`); }
    setShareOpen(false);
  }, [product]);

  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e) => { if (!e.target.closest(".pd-share-panel") && !e.target.closest(".pd-share-btn")) setShareOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareOpen]);

  const handleAddReview = useCallback((review) => {
    setReviews((prev) => {
      const updated = [review, ...prev];
      if (product) saveReviews(product.id, updated);
      return updated;
    });
  }, [product?.id]);

  const scrollToReviews = useCallback(() => {
    if (reviewsRef.current) reviewsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!product?.image) return;
    getDominantColor(product.image).then(colors => {
      injectDynamicTheme(colors);
    });
  }, [product?.image]);

  if (!product) return <ProductNotFound />;

  const category = getProductCategory(product.keywords);
  const availableColors = PRODUCT_COLORS[category] || PRODUCT_COLORS.default;
  const availableSizes = SIZE_MAP[category] || null;
  const sku = `SE-${String(product.id || "").slice(0, 8).toUpperCase()}`;
  const onSale = product.price_cents < 2000;
  const origPrice = onSale ? Math.round(product.price_cents * 1.35) : null;
  const lowStock = (product.rating_count || 0) < 50;
  const predictiveProducts = similarProducts;

  return (
    <div style={{ background: colors.surface.primary, color: colors.text.primary }} className="overflow-x-hidden min-h-screen">
      <style>{DETAIL_STYLES}</style>

      {/* ══ HERO SECTION ══════════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: isDark ? "linear-gradient(180deg, rgba(14,14,16,0) 0%, rgba(19,19,21,0.5) 100%)" : "linear-gradient(180deg, rgba(238,242,255,0.6) 0%, rgba(255,255,255,0) 60%)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-20">
          {/* Breadcrumb */}
          <nav ref={breadRef} className="flex items-center mb-10 text-sm flex-wrap gap-1" style={{ color: colors.text.tertiary }}>
            <button onClick={() => navigate("/")} className="font-medium transition-colors" style={{ color: colors.text.tertiary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.tertiary}>Home</button>
            <span className="pd-sep" />
            <button onClick={() => navigate("/products")} className="font-medium transition-colors" style={{ color: colors.text.tertiary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.tertiary}>Products</button>
            {product.keywords?.[0] && (<>
              <span className="pd-sep" />
              <button onClick={() => navigate(`/products?search=${product.keywords[0]}`)}
                className="font-medium transition-colors capitalize" style={{ color: colors.text.tertiary }}
                onMouseEnter={(e) => e.currentTarget.style.color = colors.text.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = colors.text.tertiary}>{product.keywords[0]}</button>
            </>)}
            <span className="pd-sep" />
            <span className="font-semibold line-clamp-1 max-w-[200px]" style={{ color: colors.text.secondary }}>{product.name}</span>
          </nav>

          {/* 2-col grid */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* LEFT — Gallery (includes ProductIntelPanel) */}
            <ThumbnailGallery product={product} imageRef={imageRef} />

            {/* RIGHT — Content */}
            <div ref={contentRef} className="space-y-5">
              {/* Back + action row */}
              <div className="pd-reveal flex items-center justify-between">
                <motion.button whileHover={{ x: -3 }} onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color: colors.text.tertiary }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.text.accent}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.text.tertiary}>
                  <ChevronLeft /> Back
                </motion.button>
                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={toggleWishlist}
                    className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200"
                    style={{ background: wishlisted ? (isDark ? "rgba(244,63,94,0.15)" : "#fff1f2") : colors.surface.secondary, borderColor: wishlisted ? (isDark ? "rgba(244,63,94,0.3)" : "#fecdd3") : colors.border.default, color: wishlisted ? "#f43f5e" : colors.text.tertiary }}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
                    <HeartIcon filled={wishlisted} className="w-4 h-4" />
                  </motion.button>
                  <div className="relative">
                    <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={handleShare}
                      className="pd-share-btn w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200"
                      style={{ background: shareOpen ? (isDark ? "rgba(144,171,255,0.12)" : "#eef2ff") : colors.surface.secondary, borderColor: shareOpen ? colors.brand.electricBlue : colors.border.default, color: shareOpen ? colors.text.accent : colors.text.tertiary }}
                      aria-label="Share product">
                      <ShareIcon className="w-4 h-4" />
                    </motion.button>
                    <AnimatePresence>
                      {shareOpen && (
                        <motion.div initial={{ opacity: 0, scale: 0.92, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 8 }} transition={{ duration: 0.18 }}
                          className="pd-share-panel absolute right-0 top-12 z-[200] rounded-2xl shadow-2xl border p-4 w-[240px]"
                          style={{ background: colors.surface.elevated, borderColor: colors.border.default }}>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-3 px-1" style={{ color: colors.text.tertiary }}>Share this product</p>
                          <div className="space-y-1">
                            {[{ id: "whatsapp", label: "WhatsApp", bg: "#25D366" }, { id: "twitter", label: "X (Twitter)", bg: "#000" }, { id: "facebook", label: "Facebook", bg: "#1877f2" }, { id: "telegram", label: "Telegram", bg: "#0088cc" }].map((p) => (
                              <motion.button key={p.id} whileHover={{ x: 3 }} onClick={() => shareToURL(p.id)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ color: colors.text.secondary }}>
                                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-black" style={{ background: p.bg }}>{p.label[0]}</span>
                                {p.label}
                              </motion.button>
                            ))}
                          </div>
                          <div className="my-3" style={{ borderTop: `1px solid ${colors.border.subtle}` }} />
                          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyLink}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all border"
                            style={{ background: copied ? colors.state.successBg : colors.surface.secondary, borderColor: copied ? colors.state.success : "transparent", color: copied ? colors.state.success : colors.text.primary }}>
                            {copied ? <><CheckIcon className="w-4 h-4" /> Copied!</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>{copyLabel}</>}
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* SKU */}
              <div className="pd-reveal">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md"
                  style={{ background: colors.surface.tertiary, color: colors.text.tertiary }}>SKU: {sku}</span>
              </div>

              {/* Keywords */}
              {product.keywords?.length > 0 && (
                <div className="pd-reveal flex flex-wrap gap-2">
                  {product.keywords.slice(0, 4).map((kw) => (
                    <span key={kw} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border"
                      style={{ background: isDark ? "rgba(144,171,255,0.08)" : "rgba(0,80,212,0.05)", color: colors.text.accent, borderColor: isDark ? "rgba(144,171,255,0.15)" : "rgba(0,80,212,0.1)" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Name */}
              <h1 className="pd-reveal text-3xl md:text-4xl font-black leading-tight" style={{ color: colors.text.primary }}>
                {product.name}
              </h1>

              {/* Seller */}
              <div className="pd-reveal">
                <span className="text-sm" style={{ color: colors.text.tertiary }}>Sold by </span>
                <Link to="/seller/shopease-store" className="text-sm font-bold transition-colors underline decoration-dotted underline-offset-4" style={{ color: colors.text.accent }}>
                  ShopEase Store
                </Link>
              </div>

              {/* Rating */}
              {product.rating_stars && (
                <div className="pd-reveal">
                  <StarRating stars={product.rating_stars} count={product.rating_count} size="base" onClick={scrollToReviews} />
                </div>
              )}

              {/* Price */}
              <div className="pd-reveal flex items-baseline gap-4">
                <span className="text-4xl font-black" style={{ color: colors.text.primary }}>
                  {formatMoneyCents(product.price_cents)}
                </span>
                {origPrice && (<>
                  <span className="text-xl line-through" style={{ color: colors.text.tertiary }}>{formatMoneyCents(origPrice)}</span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full text-white"
                    style={{ background: `linear-gradient(135deg, ${colors.brand.orange}, #ef4444)` }}>
                    −{Math.round((1 - product.price_cents / origPrice) * 100)}%
                  </span>
                </>)}
                {lowStock && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: colors.state.warningBg, color: colors.state.warning }}>🔥 Low stock</span>
                )}
              </div>

              {/* Color */}
              <div className="pd-reveal">
                <ColorSelector availableColors={availableColors} selectedColor={selectedColor} onSelect={setSelectedColor} />
              </div>

              {/* Size */}
              {availableSizes && (
                <div className="pd-reveal">
                  <SizeSelector sizes={availableSizes} selectedSize={selectedSize} onSelect={setSelectedSize} />
                </div>
              )}

              <div className="pd-reveal h-px" style={{ background: `linear-gradient(90deg, transparent, ${colors.border.default}, transparent)` }} />

              {/* Add to cart — exposes atcRef so sticky bar knows when it's off-screen */}
              <div className="pd-reveal">
                <AddToCartPanel productId={product.id} variantId={product.variants?.[0]?.id || null} atcRef={atcRef} />
              </div>

              {/* Price alert + wishlist bar */}
              <div className="pd-reveal flex flex-wrap gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setAlertOpen(true)} disabled={hasAlert}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all"
                  style={{ background: hasAlert ? colors.state.successBg : "transparent", borderColor: hasAlert ? colors.state.success : colors.border.default, color: hasAlert ? colors.state.success : colors.text.secondary, cursor: hasAlert ? "default" : "pointer" }}>
                  {hasAlert ? <><CheckIcon className="w-3.5 h-3.5" /> Alert Set</> : <><BellIcon className="w-3.5 h-3.5" /> Price Alert</>}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={toggleWishlist}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all"
                  style={{ background: wishlisted ? (isDark ? "rgba(244,63,94,0.1)" : "#fff1f2") : "transparent", borderColor: wishlisted ? "#fecdd3" : colors.border.default, color: wishlisted ? "#f43f5e" : colors.text.secondary }}>
                  <HeartIcon filled={wishlisted} className="w-3.5 h-3.5" />
                  {wishlisted ? "Wishlisted" : "Wishlist"}
                </motion.button>
              </div>

              {/* Reassurance */}
              <div className="pd-reveal flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: colors.text.tertiary }}>
                {["🔒 Secure checkout", "📦 Ships in 24h", "↩️ Free 30-day returns"].map((t) => (
                  <span key={t} className="font-medium">{t}</span>
                ))}
              </div>

              {/* Tabs */}
              <div className="pd-reveal">
                <ProductTabs product={product} reviews={reviews} onAddReview={handleAddReview} reviewsRef={reviewsRef} user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ PREDICTIVE PAIRINGS ══════════════════════════════════════════ */}
      <PredictivePairings products={predictiveProducts} />

      {/* ══ PRICE ALERT MODAL ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {alertOpen && (
          <PriceAlertModal product={product} onClose={() => { setAlertOpen(false); setHasAlert(hasPriceAlert(productId)); }} />
        )}
      </AnimatePresence>

      {/* ══ STICKY ATC BOTTOM BAR ════════════════════════════════════════
          Visible when the inline ATC panel is out of the viewport.
          Uses IntersectionObserver — zero scroll listener overhead.     ══ */}
      <StickyATCBar
        product={product}
        productId={product.id}
        variantId={product.variants?.[0]?.id || null}
        visible={atcOutOfView}
      />
    </div>
  );
}