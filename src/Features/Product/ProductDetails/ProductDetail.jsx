// src/Features/Product/ProductDetails/ProductDetail.jsx
//
// ── Obsidian Maison — Premium Product Detail ──────────────────────────────────
//
// Changes:
//   • Sticky right column — fixed by using overflow-x: clip on root (not hidden)
//   • Magnifier — rebuilt with ResizeObserver for pixel-perfect tracking
//   • Light/dark mode — CSS variable system driven by useTheme context

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

// ─── Google Fonts injection ──────────────────────────────────────────────────
const FONT_LINK = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap');
`;

// ─── Dual-mode CSS ────────────────────────────────────────────────────────────
const DETAIL_STYLES = `
  ${FONT_LINK}

  /* ── Gold / accent — unchanged in both modes ── */
  :root {
    --gold: #C9A96E;
    --gold-light: #E2C99A;
    --gold-dim: rgba(201,169,110,0.15);
  }

  /* ── DARK mode (default) ── */
  .pd-root {
    --obsidian: #0A0A0B;
    --ink:      #111114;
    --smoke:    #1C1C20;
    --ash:      #2A2A30;
    --mist:     #3D3D45;
    --silver:   #8A8A95;
    --platinum: #C8C8D0;
    --cream:    #F2EDE6;
    --paper:    #FAF8F4;
    --white:    #FFFFFF;

    /* semantic */
    --pd-page:          #0A0A0B;
    --pd-section:       #111114;
    --pd-overlay:       #141416;
    --pd-overlay-2:     #0e0e10;
    --pd-hero-grad:     linear-gradient(180deg,#0f0f11 0%,#0A0A0B 100%);
    --pd-intel-grad:    linear-gradient(160deg,#141416 0%,#0e0e10 100%);

    /* surfaces */
    --pd-s1: rgba(255,255,255,0.025);
    --pd-s2: rgba(255,255,255,0.04);
    --pd-s3: rgba(255,255,255,0.06);
    --pd-s4: rgba(255,255,255,0.03);

    /* borders */
    --pd-b1: rgba(255,255,255,0.05);
    --pd-b2: rgba(255,255,255,0.07);
    --pd-b3: rgba(255,255,255,0.08);
    --pd-b4: rgba(255,255,255,0.10);
    --pd-b5: rgba(255,255,255,0.12);

    /* input */
    --pd-input-bg:  rgba(255,255,255,0.04);
    --pd-input-bdr: rgba(255,255,255,0.08);
    --pd-input-fcs: rgba(201,169,110,0.5);

    /* text via semantic vars */
    --pd-heading: #F2EDE6;
    --pd-body:    #8A8A95;
    --pd-body-2:  #C8C8D0;
    --pd-muted:   #3D3D45;

    /* grain */
    --pd-grain-op: 0.35;

    /* thumb strip scrollbar */
    --pd-thumb-clr: rgba(201,169,110,0.3);

    /* pairings section */
    --pd-pair-bg: #111114;
    --pd-pair-bdr: rgba(255,255,255,0.05);
  }

  /* ── LIGHT mode ── */
  .pd-root[data-theme="light"] {
    --obsidian: #FAF8F4;
    --ink:      #F2EDE6;
    --smoke:    #EEEAE3;
    --ash:      #D4D0C8;
    --mist:     #9A9A9A;
    --silver:   #6A6A72;
    --platinum: #3A3A44;
    --cream:    #111114;
    --paper:    #FAF8F4;
    --white:    #FFFFFF;

    --pd-page:       #FAF8F4;
    --pd-section:    #F2EDE6;
    --pd-overlay:    #FFFFFF;
    --pd-overlay-2:  #F8F5F0;
    --pd-hero-grad:  linear-gradient(180deg,#EEEBE5 0%,#FAF8F4 100%);
    --pd-intel-grad: linear-gradient(160deg,#FFFFFF 0%,#F8F5F0 100%);

    --pd-s1: rgba(0,0,0,0.025);
    --pd-s2: rgba(0,0,0,0.04);
    --pd-s3: rgba(0,0,0,0.06);
    --pd-s4: rgba(0,0,0,0.02);

    --pd-b1: rgba(0,0,0,0.07);
    --pd-b2: rgba(0,0,0,0.09);
    --pd-b3: rgba(0,0,0,0.11);
    --pd-b4: rgba(0,0,0,0.13);
    --pd-b5: rgba(0,0,0,0.15);

    --pd-input-bg:  rgba(0,0,0,0.04);
    --pd-input-bdr: rgba(0,0,0,0.12);
    --pd-input-fcs: rgba(201,169,110,0.6);

    --pd-heading: #111114;
    --pd-body:    #6A6A72;
    --pd-body-2:  #3A3A44;
    --pd-muted:   #9A9A9A;

    --pd-grain-op: 0.08;

    --pd-thumb-clr: rgba(201,169,110,0.4);

    --pd-pair-bg:  #F2EDE6;
    --pd-pair-bdr: rgba(0,0,0,0.07);
  }

  .pd-root { font-family: 'Jost', sans-serif; }
  .pd-display { font-family: 'Cormorant Garamond', serif; }

  /* ── IMPORTANT: use clip not hidden so position:sticky works ── */
  .pd-root { overflow-x: clip; }

  /* ── Grain overlay ── */
  .pd-grain::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: var(--pd-grain-op, 0.35);
    mix-blend-mode: overlay;
  }

  /* ── Reveal animations ── */
  @keyframes pd-rise { from { transform: translateY(28px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes pd-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pd-draw-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes pd-spin { to { transform: rotate(360deg); } }
  @keyframes pd-pulse-gold {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,169,110,0.4); }
    50% { box-shadow: 0 0 0 8px rgba(201,169,110,0); }
  }
  @keyframes pd-live-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
    55% { box-shadow: 0 0 0 6px rgba(74,222,128,0); }
  }
  @keyframes pd-gauge { from { stroke-dashoffset: var(--pd-start); } to { stroke-dashoffset: var(--pd-end); } }
  @keyframes pd-spark { from { stroke-dashoffset: var(--pd-len); } to { stroke-dashoffset: 0; } }
  @keyframes pd-atc-rise { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .pd-rise-1 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .pd-rise-2 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
  .pd-rise-3 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.19s both; }
  .pd-rise-4 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.26s both; }
  .pd-rise-5 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.33s both; }
  .pd-rise-6 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.40s both; }
  .pd-rise-7 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.47s both; }

  .pd-fade-in { animation: pd-fade 0.9s ease 0.1s both; }
  .pd-spin-anim { animation: pd-spin 0.8s linear infinite; }

  .pd-gauge-arc { animation: pd-gauge 1.3s cubic-bezier(0.22,1,0.36,1) 0.4s forwards; }
  .pd-sparkline { animation: pd-spark 1.5s ease-out 0.7s forwards; stroke-dasharray: var(--pd-len); stroke-dashoffset: var(--pd-len); }
  .pd-live-dot { animation: pd-live-dot 2s ease-out infinite; }
  .pd-pulse-gold { animation: pd-pulse-gold 2.5s ease-out infinite; }

  /* ── Image zoom ── */
  .pd-img-zoom { transition: transform 0.8s cubic-bezier(0.32,0.72,0,1); }
  .pd-img-wrap:hover .pd-img-zoom { transform: scale(1.04); }

  /* ── Hairline divider ── */
  .pd-rule {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity: 0.3;
  }

  /* ── Gold underline for active tab ── */
  .pd-tab-on::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0; right: 0;
    height: 1px;
    background: var(--gold);
    transform-origin: left;
    animation: pd-draw-line 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* ── ATC bar entrance ── */
  .pd-atc-bar { animation: pd-atc-rise 0.38s cubic-bezier(0.22,1,0.36,1) forwards; }

  /* ── Thumb strip ── */
  .pd-thumbs::-webkit-scrollbar { width: 2px; }
  .pd-thumbs::-webkit-scrollbar-thumb { background: var(--pd-thumb-clr); border-radius: 9999px; }

  /* ── Number chip ── */
  .pd-chip {
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  /* ── Premium range input ── */
  input[type=range].pd-range { -webkit-appearance: none; appearance: none; height: 1px; background: var(--ash); outline: none; }
  input[type=range].pd-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--gold); cursor: pointer; }

  /* ── Hover reveal underline ── */
  .pd-link-hover { position: relative; }
  .pd-link-hover::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 0; height: 1px; background: var(--gold); transition: width 0.3s ease; }
  .pd-link-hover:hover::after { width: 100%; }

  /* ── Magnifier lens cursor ── */
  .pd-img-wrap { cursor: crosshair; }

  /* ── Lens circle ── */
  .pd-lens {
    position: absolute;
    pointer-events: none;
    border-radius: 50%;
    overflow: hidden;
    z-index: 50;
    border: 1.5px solid rgba(201,169,110,0.55);
    box-shadow: 0 8px 32px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.08);
  }
`;

// ─── LocalStorage helpers ───────────────────────────────────────────────────
function loadReviews(productId) { try { const r = localStorage.getItem(`shopease-reviews-${productId}`); return r ? JSON.parse(r) : []; } catch { return []; } }
function saveReviews(productId, reviews) { try { localStorage.setItem(`shopease-reviews-${productId}`, JSON.stringify(reviews)); } catch { } }
function loadWishlist() { try { const r = localStorage.getItem("shopease-wishlist"); return r ? JSON.parse(r) : []; } catch { return []; } }
function saveWishlist(list) { try { localStorage.setItem("shopease-wishlist", JSON.stringify(list)); } catch { } }
function loadPriceAlerts() { try { const r = localStorage.getItem("shopease-price-alerts"); return r ? JSON.parse(r) : []; } catch { return []; } }
function savePriceAlert(alert) { try { const a = loadPriceAlerts(); a.push(alert); localStorage.setItem("shopease-price-alerts", JSON.stringify(a)); } catch { } }
function hasPriceAlert(productId) { return loadPriceAlerts().some(a => a.productId === productId); }
function loadReviewerName() { try { return localStorage.getItem("shopease-reviewer-name") || ""; } catch { return ""; } }
function saveReviewerName(name) { try { localStorage.setItem("shopease-reviewer-name", name); } catch { } }

// ─── Product data helpers ────────────────────────────────────────────────────
function getProductCategory(keywords = []) {
  const kw = keywords.join(" ").toLowerCase();
  if (/shoe|sneaker|footwear|heel|flat|boot/.test(kw)) return "shoes";
  if (/apparel|shirt|sweater|pant|dress|hoodie|sock|beanie|shorts|robe/.test(kw)) return "apparel";
  if (/kitchen|appliance|cookware|toaster|kettle|blender/.test(kw)) return "kitchen";
  if (/bathroom|towel|bath/.test(kw)) return "home";
  return "default";
}

const PRODUCT_COLORS = {
  apparel: [{ name: "Obsidian", hex: "#1a1a2e" }, { name: "Ivory", hex: "#f0f0f0" }, { name: "Navy", hex: "#1b3a5c" }, { name: "Slate", hex: "#8b8b8b" }, { name: "Teal", hex: "#008080" }],
  shoes: [{ name: "Obsidian", hex: "#1a1a2e" }, { name: "Ivory", hex: "#f0f0f0" }, { name: "Slate", hex: "#8b8b8b" }, { name: "Cognac", hex: "#8b4513" }],
  kitchen: [{ name: "Silver", hex: "#c0c0c0" }, { name: "Obsidian", hex: "#1a1a2e" }, { name: "Ivory", hex: "#f0f0f0" }, { name: "Crimson", hex: "#b22222" }],
  home: [{ name: "Ivory", hex: "#f0f0f0" }, { name: "Slate", hex: "#8b8b8b" }, { name: "Sand", hex: "#d2b48c" }],
  default: [{ name: "Gold", hex: "#C9A96E" }, { name: "Obsidian", hex: "#1a1a2e" }, { name: "Platinum", hex: "#c0c0c0" }],
};
const SIZE_MAP = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  shoes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
};

function getSeedReviews(product) {
  const base = product.rating_stars || 4;
  return [
    { id: "seed-1", name: "Sarah M.", stars: Math.min(5, Math.round(base + 0.5)), text: "Absolutely love this product. Exactly as described and arrived in perfect condition. Would highly recommend!", date: "2 days ago", verified: true },
    { id: "seed-2", name: "James K.", stars: Math.round(base), text: "Great quality and fast shipping. The product exceeded my expectations. Will definitely buy again.", date: "1 week ago", verified: true },
    { id: "seed-3", name: "Amaka O.", stars: Math.max(1, Math.round(base - 0.5)), text: "Very good product overall. Packaging was excellent. Minor detail could be improved but overall great value.", date: "2 weeks ago", verified: false },
  ];
}

function computeRatingDistribution(product, reviews = []) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { const s = Math.min(5, Math.max(1, Math.round(r.stars))); dist[s] = (dist[s] || 0) + 1; });
  const existing = Math.max(0, (product.rating_count || 0) - reviews.length);
  if (existing > 0) {
    const avg = product.rating_stars || 4;
    const w = [1, 2, 3, 4, 5].map(s => Math.max(0.01, Math.exp(-Math.abs(s - avg) * 1.2)));
    const ws = w.reduce((a, b) => a + b, 0);
    w.forEach((v, i) => { dist[i + 1] += Math.round((v / ws) * existing); });
  }
  return dist;
}

function computePredictiveProducts(product, allProducts) {
  if (!product || !Array.isArray(allProducts)) return [];
  const targetKW = new Set(product.keywords || []);
  return allProducts
    .filter(p => String(p.id) !== String(product.id))
    .map(p => {
      const shared = (p.keywords || []).filter(k => targetKW.has(k)).length;
      let score = (shared / Math.max(targetKW.size, 1)) * 70;
      const pr = Math.min(p.price_cents, product.price_cents) / Math.max(p.price_cents, product.price_cents);
      score += pr * 20;
      if (p.rating_stars >= 4) score += 10;
      score = Math.min(99, Math.round(score));
      let label = "STYLE PICK";
      if (score >= 85) label = "BEST MATCH";
      else if (p.price_cents < product.price_cents * 0.7) label = "VALUE PICK";
      else if (p.rating_stars >= 4.5 && p.rating_count > 100) label = "TOP RATED";
      else if (p.price_cents > product.price_cents * 1.3) label = "PREMIUM";
      return { ...p, matchScore: score, matchLabel: label };
    })
    .filter(p => p.matchScore > 20)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}

function getAvatarGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h},45%,38%), hsl(${(h + 40) % 360},35%,28%))`;
}

function seededRand(seed, min, max) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  return min + (Math.abs(hash) % (max - min + 1));
}

function computeDemandScore(product) {
  const stars = product.rating_stars || 0;
  const count = product.rating_count || 0;
  return Math.min(100, Math.round((stars / 5) * 45 + Math.min(count, 2000) / 2000 * 35 + (product.price_cents < 2000 ? 20 : count > 500 ? 15 : 5)));
}

function generateSparklinePoints(productId, W, H) {
  const seed = String(productId || "x");
  const N = 14;
  const vals = Array.from({ length: N }, (_, i) => seededRand(`${seed}-${i * 7}`, 30, 90));
  const smoothed = vals.map((v, i) => vals.slice(Math.max(0, i - 2), i + 3).reduce((a, b) => a + b, 0) / Math.min(i + 3, N));
  const min = Math.min(...smoothed), max = Math.max(...smoothed), range = max - min || 1;
  const P = 8;
  const pts = smoothed.map((v, i) => ({ x: P + (i / (N - 1)) * (W - P * 2), y: P + ((1 - (v - min) / range) * (H - P * 2)) }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;
  const pathLen = Math.round(pts.reduce((acc, p, i) => { if (i === 0) return 0; const dx = p.x - pts[i - 1].x, dy = p.y - pts[i - 1].y; return acc + Math.sqrt(dx * dx + dy * dy); }, 0));
  return { pts, pathD, areaD, pathLen };
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const BagIcon = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>;
const HeartIcon = ({ filled, className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
const ShareIcon = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
const ChevronLeft = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>;
const ChevronRight = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>;
const CheckIcon = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>;
const SpinnerIcon = ({ className = "w-4 h-4" }) => <svg className={`${className} pd-spin-anim`} viewBox="0 0 24 24" fill="none"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>;
const ShieldIcon = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const TruckIcon = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
const RefreshIcon = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>;
const BellIcon = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>;
const CloseIcon = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>;
const LockIcon = ({ className = "w-3 h-3" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;

// ─── useMagnetic ─────────────────────────────────────────────────────────────
function useMagnetic(ref, strength = 0.35) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const move = e => { const { left, top, width, height } = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - (left + width / 2)) * strength, y: (e.clientY - (top + height / 2)) * strength, duration: 0.5, ease: "power2.out" }); };
    const reset = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.5)" });
    el.addEventListener("mousemove", move); el.addEventListener("mouseleave", reset);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", reset); };
  }, [ref, strength]);
}

// ─── StarRating ───────────────────────────────────────────────────────────────
function StarRating({ stars = 0, count = 0, size = "sm", onClick }) {
  const full = Math.floor(stars), half = stars % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  const starCls = size === "lg" ? "text-lg" : "text-xs";
  return (
    <div className={`flex items-center gap-2 ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      <div className="flex items-center gap-px">
        {Array(full).fill(0).map((_, i) => <span key={`f${i}`} className={starCls} style={{ color: "#C9A96E" }}>★</span>)}
        {half && <span className={starCls} style={{ color: "#C9A96E" }}>⯪</span>}
        {Array(empty).fill(0).map((_, i) => <span key={`e${i}`} className={starCls} style={{ color: "rgba(201,169,110,0.25)" }}>★</span>)}
      </div>
      <span className="text-xs font-semibold" style={{ color: "#C9A96E", fontFamily: "Jost,sans-serif" }}>{stars}</span>
      {count > 0 && <span className="text-xs" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>({count.toLocaleString()})</span>}
    </div>
  );
}

function InteractiveStarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          className="text-xl transition-transform duration-150 hover:scale-110"
          style={{ color: s <= (hover || value) ? "#C9A96E" : "rgba(201,169,110,0.2)" }}>★</button>
      ))}
      {value > 0 && <span className="text-xs ml-1" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>{value}/5</span>}
    </div>
  );
}

// ─── ProductIntelPanel ────────────────────────────────────────────────────────
function ProductIntelPanel({ product }) {
  const BASE_VIEWERS = useMemo(() => seededRand(String(product?.id || "x"), 8, 41), [product?.id]);
  const [viewers, setViewers] = useState(BASE_VIEWERS);
  const viewerIdxRef = useRef(0);
  const VIEWER_DELTAS = useMemo(() => {
    const seed = String(product?.id || "x");
    return Array.from({ length: 20 }, (_, i) => { const r = seededRand(`${seed}-d${i}`, 0, 4); return r < 2 ? -1 : r > 3 ? 2 : 1; });
  }, [product?.id]);

  useEffect(() => {
    const id = setInterval(() => {
      viewerIdxRef.current = (viewerIdxRef.current + 1) % VIEWER_DELTAS.length;
      setViewers(v => Math.max(4, v + VIEWER_DELTAS[viewerIdxRef.current]));
    }, 3800);
    return () => clearInterval(id);
  }, [VIEWER_DELTAS]);

  const demandScore = useMemo(() => computeDemandScore(product), [product]);
  const GAUGE_R = 36, GAUGE_CX = 50, GAUGE_CY = 50;
  const circumference = Math.PI * GAUGE_R;
  const dashEnd = circumference * (1 - demandScore / 100);
  const W = 200, H = 52;
  const { pathD, areaD, pathLen } = useMemo(() => generateSparklinePoints(product?.id, W, H), [product?.id]);

  const demandColor = demandScore >= 75 ? "#4ade80" : demandScore >= 45 ? "#C9A96E" : "#94a3b8";

  const buySignal = useMemo(() => {
    if (demandScore >= 80) return { icon: "◆", label: "High Demand", sub: `${viewers} connoisseurs viewing` };
    if (demandScore >= 55) return { icon: "◈", label: "Trending", sub: `${viewers} viewing right now` };
    if (product?.price_cents < 2000) return { icon: "◇", label: "Exceptional Value", sub: "Finest price for this calibre" };
    return { icon: "◉", label: "Curated Selection", sub: "Handpicked for discerning taste" };
  }, [demandScore, viewers, product?.price_cents]);

  if (!product) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 rounded-2xl overflow-hidden"
      style={{ background: "var(--pd-intel-grad)", border: "1px solid var(--pd-b5)" }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--pd-b1)" }}>
        <span className="pd-chip" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>Intelligence</span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 pd-live-dot" />
          <span className="pd-chip" style={{ color: "var(--mist)" }}>Live</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Gauge row */}
        <div className="flex items-center gap-5">
          <svg width={GAUGE_CX * 2} height={GAUGE_CY + 12} viewBox={`0 0 ${GAUGE_CX * 2} ${GAUGE_CY + 12}`}>
            <path d={`M ${GAUGE_CX - GAUGE_R},${GAUGE_CY} A ${GAUGE_R},${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`}
              fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth="6" strokeLinecap="round" />
            <path className="pd-gauge-arc"
              d={`M ${GAUGE_CX - GAUGE_R},${GAUGE_CY} A ${GAUGE_R},${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`}
              fill="none" stroke={demandColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              style={{ "--pd-start": circumference, "--pd-end": dashEnd, strokeDashoffset: circumference, filter: `drop-shadow(0 0 5px ${demandColor}88)` }} />
            <text x={GAUGE_CX} y={GAUGE_CY + 1} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--cream)" fontFamily="Cormorant Garamond, serif">{demandScore}</text>
            <text x={GAUGE_CX} y={GAUGE_CY + 12} textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--mist)" letterSpacing="2" fontFamily="Jost, sans-serif">DEMAND</text>
          </svg>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 pd-live-dot" />
              <span className="text-sm font-semibold" style={{ color: "var(--cream)", fontFamily: "Cormorant Garamond,serif" }}>{viewers}</span>
              <span className="text-xs" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>viewing now</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[{ label: "Rating", value: product.rating_stars ? `${product.rating_stars}★` : "—" }, { label: "Reviews", value: (product.rating_count || 0).toLocaleString() }].map(s => (
                <div key={s.label} className="rounded-xl px-2.5 py-2 text-center" style={{ background: "var(--pd-s2)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--cream)", fontFamily: "Cormorant Garamond,serif" }}>{s.value}</p>
                  <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="pd-chip" style={{ color: "var(--mist)" }}>Price Trend</span>
            <span className="pd-chip px-2 py-0.5 rounded-full" style={{ background: "rgba(201,169,110,0.1)", color: "var(--gold)" }}>
              {seededRand(String(product.id || "x") + "trend", 0, 1) === 0 ? "↓" : "↑"}{seededRand(String(product.id || "x") + "pct", 3, 18)}% this month
            </span>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--pd-s4)" }}>
            <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="intel-spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaD} fill="url(#intel-spark-fill)" />
              <path className="pd-sparkline" d={pathD} fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ "--pd-len": pathLen, filter: "drop-shadow(0 1px 4px rgba(201,169,110,0.5))" }} />
            </svg>
          </div>
          <div className="flex justify-between mt-1" style={{ fontFamily: "Jost,sans-serif", fontSize: 9, color: "var(--mist)" }}>
            <span>14 days ago</span><span>Today</span>
          </div>
        </div>

        {/* Buy signal */}
        <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.12)" }}>
          <span className="text-lg flex-shrink-0" style={{ color: "var(--gold)" }}>{buySignal.icon}</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--cream)", fontFamily: "Cormorant Garamond,serif", fontSize: 13 }}>{buySignal.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>{buySignal.sub}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ThumbnailGallery — with fixed magnifier ─────────────────────────────────
const ZOOM_FACTOR = 2.8;
const LENS_SIZE = 150;

function ThumbnailGallery({ product, imageRef }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track container actual dimensions so zoom calc is always accurate
  const mainImageRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 500, h: 500 });

  useEffect(() => {
    const el = mainImageRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0) setContainerSize({ w: width, h: height });
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const views = useMemo(() => {
    if (product.product_images?.length > 0) return product.product_images.map((img, i) => ({ src: img.image_url, label: `View ${i + 1}` }));
    return [
      { src: product.image, label: "Front" },
      { src: product.image, label: "Side", transform: "scaleX(-1)" },
      { src: product.image, label: "Detail", objectPosition: "center 25%" },
      { src: product.image, label: "Back", filter: "brightness(0.9) saturate(1.1)" },
    ];
  }, [product.image, product.product_images]);

  useEffect(() => {
    const h = e => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setDirection(1); setActiveIndex(p => (p + 1) % views.length); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setDirection(-1); setActiveIndex(p => (p - 1 + views.length) % views.length); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [views.length]);

  const cv = views[activeIndex];
  const slideV = {
    enter: dir => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: dir => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
  };

  const handleMouseMove = useCallback((e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Clamp so lens stays fully inside container
    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
      setMousePos({ x, y });
      setZoomActive(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => setZoomActive(false), []);

  // Lens clamped position — keeps lens bubble inside the image div
  const lensLeft = Math.min(Math.max(mousePos.x - LENS_SIZE / 2, 0), containerSize.w - LENS_SIZE);
  const lensTop  = Math.min(Math.max(mousePos.y - LENS_SIZE / 2, 0), containerSize.h - LENS_SIZE);

  // The zoomed image is positioned so the point under the cursor appears at lens center
  const zoomedW = containerSize.w * ZOOM_FACTOR;
  const zoomedH = containerSize.h * ZOOM_FACTOR;
  const zoomedLeft = -(mousePos.x * ZOOM_FACTOR - LENS_SIZE / 2);
  const zoomedTop  = -(mousePos.y * ZOOM_FACTOR - LENS_SIZE / 2);

  return (
    <div ref={imageRef} className="pd-fade-in">
      <div className="flex gap-4">
        {/* Thumb strip */}
        <div className="flex flex-col gap-2.5 pd-thumbs overflow-y-auto" style={{ maxHeight: 520 }}>
          {views.map((v, i) => (
            <motion.button key={i} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
              className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300"
              style={{
                border: i === activeIndex ? "1px solid var(--gold)" : "1px solid var(--pd-b2)",
                opacity: i === activeIndex ? 1 : 0.5,
                background: "var(--smoke)",
              }}>
              <img src={v.src} alt={v.label} className="w-full h-full object-cover"
                style={{ transform: v.transform || "none", objectPosition: v.objectPosition || "center", filter: v.filter || "none" }}
                onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200?text=?"; }} />
            </motion.button>
          ))}
        </div>

        {/* Main image */}
        <div className="flex-1">
          <div
            ref={mainImageRef}
            className="pd-img-wrap relative rounded-2xl overflow-hidden"
            style={{ aspectRatio: "1/1", background: "var(--smoke)" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <AnimatePresence custom={direction} mode="wait">
              <motion.img key={activeIndex} custom={direction} variants={slideV} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                src={cv.src} alt={product.name}
                onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/600x600?text=No+Image"; }}
                className="pd-img-zoom absolute inset-0 w-full h-full object-cover"
                style={{ transform: cv.transform || "none", objectPosition: cv.objectPosition || "center", filter: cv.filter || "none" }} />
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product?.created_at && (Date.now() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 && (
                <span className="pd-chip px-3 py-1.5 rounded-full text-white" style={{ background: "rgba(10,10,11,0.7)", backdropFilter: "blur(8px)", border: "1px solid var(--gold)", color: "var(--gold-light)" }}>Nouveau</span>
              )}
              {product.price_cents < 2000 && (
                <span className="pd-chip px-3 py-1.5 rounded-full" style={{ background: "rgba(10,10,11,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(244,63,94,0.5)", color: "#f87171" }}>Sale</span>
              )}
            </div>

            {/* Position indicator */}
            <div className="absolute bottom-4 right-4 z-10">
              <span className="pd-chip px-2.5 py-1.5 rounded-full" style={{ background: "rgba(10,10,11,0.65)", backdropFilter: "blur(8px)", color: "var(--platinum)" }}>
                {activeIndex + 1} / {views.length}
              </span>
            </div>

            {/* ── Magnifier lens — rebuilt ── */}
            {zoomActive && containerSize.w > 0 && (
              <div
                className="pd-lens"
                style={{
                  width: LENS_SIZE,
                  height: LENS_SIZE,
                  left: lensLeft,
                  top: lensTop,
                }}
              >
                <img
                  src={cv.src}
                  alt=""
                  draggable={false}
                  onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/600x600?text=?"; }}
                  style={{
                    position: "absolute",
                    width: zoomedW,
                    height: zoomedH,
                    left: zoomedLeft,
                    top: zoomedTop,
                    transform: cv.transform || "none",
                    objectFit: "cover",
                    maxWidth: "none",
                    userSelect: "none",
                  }}
                />
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { icon: <TruckIcon className="w-3.5 h-3.5" />, label: "Free Delivery", sub: "Orders $50+" },
              { icon: <RefreshIcon className="w-3.5 h-3.5" />, label: "30-Day Return", sub: "Effortless" },
              { icon: <ShieldIcon className="w-3.5 h-3.5" />, label: "Secure Pay", sub: "256-bit SSL" },
            ].map(b => (
              <div key={b.label} className="rounded-xl p-3 text-center flex flex-col items-center gap-1.5"
                style={{ background: "var(--pd-s4)", border: "1px solid var(--pd-b2)" }}>
                <span style={{ color: "var(--gold)" }}>{b.icon}</span>
                <p className="font-medium text-[11px]" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>{b.label}</p>
                <p className="text-[10px]" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductIntelPanel product={product} />
    </div>
  );
}

// ─── ColorSelector ────────────────────────────────────────────────────────────
function ColorSelector({ availableColors, selectedColor, onSelect }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="pd-chip" style={{ color: "var(--silver)" }}>Colourway</span>
        <span className="text-xs font-medium" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>{availableColors[selectedColor]?.name}</span>
      </div>
      <div className="flex items-center gap-2.5">
        {availableColors.map((c, i) => (
          <motion.button key={c.name} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(i)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: c.hex,
              boxShadow: i === selectedColor ? `0 0 0 2px var(--obsidian), 0 0 0 3.5px var(--gold)` : "none",
            }} title={c.name}>
            {i === selectedColor && <CheckIcon className="w-3 h-3" style={{ color: c.hex === "#f0f0f0" || c.hex === "#c0c0c0" ? "#333" : "#fff" }} />}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── SizeSelector ─────────────────────────────────────────────────────────────
function SizeSelector({ sizes, selectedSize, onSelect }) {
  if (!sizes) return null;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="pd-chip" style={{ color: "var(--silver)" }}>{sizes[0]?.startsWith("US") ? "Calibre" : "Size"}</span>
        <button className="text-xs font-medium pd-link-hover" style={{ color: "var(--gold)", fontFamily: "Jost,sans-serif" }}>Size Guide</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map(s => (
          <motion.button key={s} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(s)}
            className="min-w-[52px] py-2 px-3 rounded-lg text-xs font-medium transition-all duration-250"
            style={{
              fontFamily: "Jost,sans-serif",
              background: selectedSize === s ? "var(--gold)" : "var(--pd-s2)",
              border: `1px solid ${selectedSize === s ? "var(--gold)" : "var(--pd-b3)"}`,
              color: selectedSize === s ? "var(--obsidian)" : "var(--platinum)",
              fontWeight: selectedSize === s ? "600" : "400",
            }}>
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── AddToCartPanel ───────────────────────────────────────────────────────────
function AddToCartPanel({ productId, variantId, atcRef }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const btnRef = useRef(null);
  const { addItem } = useCartActions();

  useEffect(() => { if (!done) return; const t = setTimeout(() => setDone(false), 3000); return () => clearTimeout(t); }, [done]);
  useMagnetic(btnRef, 0.3);

  const handleAdd = async () => {
    if (loading) return; setError(""); setLoading(true);
    try { await addItem(productId, variantId, qty); setDone(true); if (btnRef.current) gsap.fromTo(btnRef.current, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.1,0.5)" }); }
    catch { setError("Unable to add item. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4" ref={atcRef}>
      <div className="flex items-center gap-4">
        <span className="pd-chip" style={{ color: "var(--silver)" }}>Quantity</span>
        <div className="flex items-center" style={{ border: "1px solid var(--pd-b4)", borderRadius: 10 }}>
          <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-sm transition-colors hover:text-white"
            style={{ color: "var(--silver)" }}>−</button>
          <span className="w-8 text-center text-sm font-semibold" style={{ color: "var(--cream)", fontFamily: "Cormorant Garamond,serif" }}>{qty}</span>
          <button onClick={() => setQty(q => Math.min(10, q + 1))}
            className="w-9 h-9 flex items-center justify-center text-sm transition-colors hover:text-white"
            style={{ color: "var(--silver)" }}>+</button>
        </div>
      </div>

      <motion.button ref={btnRef} onClick={handleAdd} disabled={loading} whileTap={{ scale: 0.97 }}
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
        }}>
        <AnimatePresence mode="wait">
          {done ? <motion.span key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex items-center gap-2"><CheckIcon />Added to Bag</motion.span>
            : loading ? <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><SpinnerIcon />Adding…</motion.span>
              : <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 uppercase text-xs"><BagIcon />Add to Bag</motion.span>}
        </AnimatePresence>
      </motion.button>

      <ErrorMessage errorMessage={error} />
    </div>
  );
}

// ─── ReviewForm ───────────────────────────────────────────────────────────────
function ReviewForm({ onSubmit, user }) {
  const isAuth = Boolean(user?.name || user?.email);
  const initName = isAuth ? (user.name || user.email?.split("@")[0] || "") : loadReviewerName();
  const [name, setName] = useState(initName);
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim() || stars === 0 || !text.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    if (!isAuth) saveReviewerName(name.trim());
    onSubmit({ id: `user-${Date.now()}`, name: name.trim(), stars, text: text.trim(), date: "Just now", verified: isAuth });
    setStars(0); setText("");
    setSubmitting(false); setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const inputStyle = {
    background: "var(--pd-input-bg)",
    border: "1px solid var(--pd-input-bdr)",
    color: "var(--cream)",
    fontFamily: "Jost,sans-serif",
    fontSize: 13,
    borderRadius: 10,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl p-5"
      style={{ background: "var(--pd-s1)", border: "1px solid var(--pd-b2)" }}>
      <p className="text-sm font-medium" style={{ color: "var(--platinum)", fontFamily: "Cormorant Garamond,serif", fontSize: 16 }}>Share Your Experience</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <input type="text" placeholder="Your name" value={name}
            onChange={e => !isAuth && setName(e.target.value)} readOnly={isAuth} maxLength={40}
            className="w-full px-4 py-2.5" style={{ ...inputStyle, paddingRight: isAuth ? "2.5rem" : undefined, cursor: isAuth ? "default" : "text" }}
            onFocus={e => e.target.style.borderColor = "var(--pd-input-fcs)"}
            onBlur={e => e.target.style.borderColor = "var(--pd-input-bdr)"} />
          {isAuth && <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#4ade80" }}><LockIcon /></div>}
        </div>
        <div className="flex items-center"><InteractiveStarPicker value={stars} onChange={setStars} /></div>
      </div>

      {isAuth && (
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(74,222,128,0.06)", color: "#4ade80" }}>
          <CheckIcon className="w-3 h-3" />
          Reviewing as <strong>{name}</strong> · Verified
        </div>
      )}

      <textarea placeholder="Describe your experience in detail…" value={text} onChange={e => setText(e.target.value)}
        rows={3} maxLength={500} className="w-full px-4 py-2.5 resize-none" style={inputStyle}
        onFocus={e => e.target.style.borderColor = "var(--pd-input-fcs)"}
        onBlur={e => e.target.style.borderColor = "var(--pd-input-bdr)"} />

      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{text.length}/500</span>
        <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={!(name.trim() && stars > 0 && text.trim() && !submitting)}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 uppercase tracking-wider"
          style={{
            fontFamily: "Jost,sans-serif",
            background: submitted ? "linear-gradient(135deg,#059669,#047857)"
              : !(name.trim() && stars > 0 && text.trim()) ? "var(--pd-s2)"
                : "linear-gradient(135deg,#C9A96E,#A8834A)",
            color: submitted ? "#fff" : !(name.trim() && stars > 0 && text.trim()) ? "var(--mist)" : "var(--obsidian)",
            cursor: !(name.trim() && stars > 0 && text.trim()) ? "not-allowed" : "pointer",
          }}>
          {submitting ? <><SpinnerIcon />Submitting…</>
            : submitted ? <><CheckIcon />Submitted!</>
              : "Submit Review"}
        </motion.button>
      </div>
    </form>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────
function ReviewCard({ review }) {
  const grad = getAvatarGradient(review.name);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl p-4" style={{ background: "var(--pd-s1)", border: "1px solid var(--pd-b1)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: grad }}>{review.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>{review.name}</p>
              {review.verified && <span className="pd-chip px-1.5 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80" }}>Verified</span>}
            </div>
            <div className="flex gap-px mt-0.5">
              {Array(5).fill(0).map((_, i) => <span key={i} className="text-xs" style={{ color: i < review.stars ? "#C9A96E" : "rgba(201,169,110,0.2)" }}>★</span>)}
            </div>
          </div>
        </div>
        <span className="text-[10px]" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{review.date}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>{review.text}</p>
    </motion.div>
  );
}

// ─── RatingBreakdown ──────────────────────────────────────────────────────────
function RatingBreakdown({ product, reviews }) {
  const dist = useMemo(() => computeRatingDistribution(product, reviews), [product, reviews]);
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  return (
    <div className="flex items-start gap-8 mb-6 p-5 rounded-2xl"
      style={{ background: "var(--pd-s1)", border: "1px solid var(--pd-b1)" }}>
      <div className="text-center flex-shrink-0">
        <p className="pd-display text-5xl font-light" style={{ color: "var(--cream)", lineHeight: 1 }}>{product.rating_stars ?? "—"}</p>
        <div className="mt-2"><StarRating stars={product.rating_stars ?? 0} /></div>
        <p className="text-[10px] mt-1.5" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{total.toLocaleString()} reviews</p>
      </div>
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map(s => {
          const cnt = dist[s] || 0, pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
          return (
            <div key={s} className="flex items-center gap-2.5">
              <span className="text-[10px] w-2.5" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{s}</span>
              <span className="text-[10px]" style={{ color: "#C9A96E" }}>★</span>
              <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ background: "var(--pd-s3)" }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
                  transition={{ duration: 1, delay: (5 - s) * 0.07, ease: "easeOut" }}
                  className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#C9A96E,#A8834A)" }} />
              </div>
              <span className="text-[10px] w-6 text-right" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ReviewsSection ───────────────────────────────────────────────────────────
function ReviewsSection({ product, reviews, onAddReview, user }) {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(3);
  const [loadCount, setLoadCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await new Promise(r => setTimeout(r, 700));
    setVisibleCount(p => p + 3); setLoadCount(c => c + 1); setLoadingMore(false);
  };

  const hasMore = visibleCount < reviews.length;
  const showViewAll = hasMore && loadCount >= 2;

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between mb-1">
        <h2 className="pd-display text-3xl font-light" style={{ color: "var(--cream)", letterSpacing: "-0.01em" }}>
          Reviews
          <span className="text-lg ml-3 font-light" style={{ color: "var(--gold)" }}>{reviews.length}</span>
        </h2>
        <span className="pd-chip" style={{ color: "var(--gold)" }}>{product.rating_stars ?? 0}★ avg</span>
      </div>
      <div className="pd-rule mb-6" />

      <RatingBreakdown product={product} reviews={reviews} />

      <div className="mb-6">
        <ReviewForm onSubmit={onAddReview} user={user} />
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {reviews.slice(0, visibleCount).map(r => <ReviewCard key={r.id} review={r} />)}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-2 mt-6">
          {showViewAll ? (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/reviews")}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest"
              style={{ fontFamily: "Jost,sans-serif", background: "linear-gradient(135deg,#C9A96E,#A8834A)", color: "var(--obsidian)", boxShadow: "0 6px 20px rgba(201,169,110,0.2)" }}>
              View All {reviews.length} Reviews <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleLoadMore} disabled={loadingMore}
              className="px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center gap-2"
              style={{ fontFamily: "Jost,sans-serif", background: "var(--pd-s2)", border: "1px solid var(--pd-b4)", color: "var(--platinum)", cursor: loadingMore ? "not-allowed" : "pointer" }}>
              {loadingMore ? <><SpinnerIcon />Loading…</> : `Load More (${reviews.length - visibleCount} remaining)`}
            </motion.button>
          )}
          <p className="text-[10px]" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>Showing {Math.min(visibleCount, reviews.length)} of {reviews.length}</p>
        </div>
      )}
    </section>
  );
}

// ─── ProductTabs ──────────────────────────────────────────────────────────────
function ProductTabs({ product }) {
  const [tab, setTab] = useState("description");
  const tabs = [{ id: "description", label: "Description" }, { id: "details", label: "Details" }];

  const description = product.description || "A premium quality product crafted with meticulous attention to detail. Designed for everyday use, this piece combines enduring durability with refined style. Perfect for those who seek reliable, long-lasting quality.";

  return (
    <div className="mt-6">
      <div className="flex gap-0 border-b" style={{ borderColor: "var(--pd-b2)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors ${tab === t.id ? "pd-tab-on" : ""}`}
            style={{ fontFamily: "Jost,sans-serif", color: tab === t.id ? "var(--gold)" : "var(--mist)" }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "description" && (
          <motion.div key="desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
            className="pt-5 space-y-4">
            <p className="text-sm leading-relaxed" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>{description}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["Premium Quality", "Durable Materials", "Eco-Conscious", "1-Year Warranty"].map(f => (
                <span key={f} className="px-3 py-1.5 text-[10px] font-medium rounded-full uppercase tracking-wider"
                  style={{ fontFamily: "Jost,sans-serif", background: "rgba(201,169,110,0.08)", color: "var(--gold)", border: "1px solid rgba(201,169,110,0.15)" }}>
                  ✓ {f}
                </span>
              ))}
            </div>
          </motion.div>
        )}
        {tab === "details" && (
          <motion.div key="det" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
            className="pt-5">
            {[
              { label: "Product ID", value: String(product.id || "—").slice(0, 12) + "…" },
              { label: "Price", value: formatMoneyCents(product.price_cents) },
              { label: "Rating", value: `${product.rating_stars ?? "—"} / 5 (${(product.rating_count ?? 0).toLocaleString()} reviews)` },
              { label: "Keywords", value: (product.keywords || []).join(", ") || "—" },
              { label: "Availability", value: "In Stock" },
              { label: "Ships", value: "Within 24–48 hours" },
            ].map((row, i) => (
              <div key={row.label} className="flex items-center justify-between py-3"
                style={{ borderBottom: i < 5 ? "1px solid var(--pd-b1)" : "none" }}>
                <span className="text-xs" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{row.label}</span>
                <span className="text-xs font-medium text-right max-w-[55%] truncate" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>{row.value}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PriceAlertModal ──────────────────────────────────────────────────────────
function PriceAlertModal({ product, onClose }) {
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState(Math.round(product.priceCents * 0.8));
  const [alertType, setAlertType] = useState("price_drop");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async e => {
    e.preventDefault(); if (!email.trim()) return;
    setSaving(true); await new Promise(r => setTimeout(r, 600));
    savePriceAlert({ productId: product.id, productName: product.name, email: email.trim(), targetPriceCents: targetPrice, type: alertType, createdAt: new Date().toISOString() });
    setSaving(false); setSaved(true); setTimeout(() => onClose(), 1800);
  };

  const inputStyle = { background: "var(--pd-input-bg)", border: "1px solid var(--pd-input-bdr)", color: "var(--cream)", fontFamily: "Jost,sans-serif", fontSize: 13, borderRadius: 10, outline: "none", transition: "border-color 0.2s", padding: "12px 16px", width: "100%" };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }} />
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }} onClick={e => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "var(--pd-overlay)", border: "1px solid var(--pd-b5)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 transition-colors" style={{ color: "var(--mist)" }}><CloseIcon className="w-4 h-4" /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,169,110,0.1)" }}>
            <BellIcon className="w-5 h-5" style={{ color: "var(--gold)" }} />
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: "var(--cream)", fontFamily: "Cormorant Garamond,serif", fontSize: 15 }}>Price Alert</p>
            <p className="text-xs" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>We'll notify you when the price drops</p>
          </div>
        </div>
        {saved ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">◆</div>
            <p className="font-medium" style={{ color: "var(--gold)", fontFamily: "Cormorant Garamond,serif", fontSize: 18 }}>Alert set.</p>
            <p className="text-xs mt-1" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>We'll email {email}</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--pd-s4)", border: "1px solid var(--pd-b2)" }}>
              <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=?"; }} />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>{product.name}</p>
                <p className="text-xs font-semibold" style={{ color: "var(--gold)", fontFamily: "Cormorant Garamond,serif", fontSize: 13 }}>Current: {formatMoneyCents(product.priceCents)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[{ id: "price_drop", label: "Price Drop" }, { id: "back_in_stock", label: "Back in Stock" }].map(opt => (
                <button key={opt.id} type="button" onClick={() => setAlertType(opt.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all"
                  style={{ fontFamily: "Jost,sans-serif", background: alertType === opt.id ? "rgba(201,169,110,0.1)" : "transparent", border: `1px solid ${alertType === opt.id ? "var(--gold)" : "var(--pd-b3)"}`, color: alertType === opt.id ? "var(--gold)" : "var(--silver)" }}>
                  {opt.label}
                </button>
              ))}
            </div>
            <input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--pd-input-fcs)"} onBlur={e => e.target.style.borderColor = "var(--pd-input-bdr)"} />
            {alertType === "price_drop" && (
              <div>
                <label className="text-xs mb-2 block" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>Alert at: {formatMoneyCents(targetPrice)}</label>
                <input type="range" className="pd-range w-full" min={Math.round(product.priceCents * 0.3)} max={product.priceCents} value={targetPrice} onChange={e => setTargetPrice(Number(e.target.value))} />
              </div>
            )}
            <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={!email.trim() || saving}
              className="w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2"
              style={{ fontFamily: "Jost,sans-serif", background: !email.trim() ? "var(--pd-s2)" : "linear-gradient(135deg,#C9A96E,#A8834A)", color: !email.trim() ? "var(--mist)" : "var(--obsidian)" }}>
              {saving ? <><SpinnerIcon />Saving…</> : <><BellIcon className="w-3.5 h-3.5" />Set Alert</>}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ─── PredictivePairings ───────────────────────────────────────────────────────
function PredictivePairings({ products }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current; if (!el || !products.length) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".pd-pair-card");
      if (!cards.length) return;
      gsap.fromTo(cards, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    }, 100);
    return () => clearTimeout(t);
  }, [products]);

  if (!products.length) return null;

  return (
    <section ref={ref} className="py-20" style={{ background: "var(--pd-pair-bg)", borderTop: "1px solid var(--pd-pair-bdr)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="pd-chip mb-3" style={{ color: "var(--gold)" }}>Curated Pairings</p>
          <h2 className="pd-display text-4xl font-light" style={{ color: "var(--cream)" }}>You May Also Desire</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>Matched by style and sensibility</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map(p => (
            <div key={p.id} className="pd-pair-card rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1"
              style={{ background: "var(--pd-s1)", border: "1px solid var(--pd-b2)" }}>
              <div className="relative">
                <ProductCard product={p} />
                <div className="absolute top-2 right-2">
                  <span className="pd-chip px-2 py-0.5 rounded-full" style={{ background: "rgba(10,10,11,0.75)", backdropFilter: "blur(6px)", color: "var(--gold)", border: "1px solid rgba(201,169,110,0.3)" }}>
                    {p.matchScore}%
                  </span>
                </div>
              </div>
              <div className="px-3 pb-3 -mt-0.5">
                <span className="pd-chip" style={{ color: "var(--mist)" }}>{p.matchLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── StickyATCBar ─────────────────────────────────────────────────────────────
function StickyATCBar({ product, productId, variantId, visible }) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { addItem } = useCartActions();

  useEffect(() => { if (!visible) setDismissed(false); }, [visible]);
  useEffect(() => { if (!done) return; const t = setTimeout(() => setDone(false), 2500); return () => clearTimeout(t); }, [done]);

  const handleAdd = async () => {
    if (loading) return; setLoading(true);
    try { await addItem(productId, variantId, 1); setDone(true); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  };

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

// ─── ProductNotFound ──────────────────────────────────────────────────────────
function ProductNotFound() {
  const navigate = useNavigate();
  return (
    <div className="pd-root min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "var(--pd-page)" }}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180 }}>
        <p className="pd-display text-7xl font-light mb-6" style={{ color: "var(--gold)" }}>◇</p>
        <h1 className="pd-display text-4xl font-light mb-4" style={{ color: "var(--cream)" }}>Not Found</h1>
        <p className="mb-8 text-sm" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>This item doesn't exist or may have been removed.</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/products")}
          className="font-semibold px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest"
          style={{ fontFamily: "Jost,sans-serif", background: "linear-gradient(135deg,#C9A96E,#A8834A)", color: "var(--obsidian)" }}>
          Browse Collection →
        </motion.button>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ██  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { product, similarProducts } = useLoaderData();

  // ── Theme ──
  const { isDark } = useTheme();

  const atcRef = useRef(null);
  const [atcOutOfView, setAtcOutOfView] = useState(false);
  useEffect(() => {
    const el = atcRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => setAtcOutOfView(!e.isIntersecting), { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const user = useMemo(() => { try { const r = localStorage.getItem("shopease-user"); return r ? JSON.parse(r) : null; } catch { return null; } }, []);
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
  const rightRef = useRef(null);

  useEffect(() => { if (!product) return; const s = loadReviews(product.id); setReviews(s.length > 0 ? s : getSeedReviews(product)); }, [product?.id]);

  useEffect(() => {
    if (!product || !imageRef.current || !rightRef.current) return;
    const tl = gsap.timeline({ delay: 0.05 });
    tl.fromTo(imageRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.85, ease: "expo.out", clearProps: "all" })
      .fromTo(rightRef.current.querySelectorAll(".pd-r"), { x: 30, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: "power3.out", clearProps: "all" }, "-=0.6");
    return () => tl.kill();
  }, [product]);

  const toggleWishlist = useCallback(() => {
    setWishlisted(p => { const nv = !p; const l = loadWishlist(); if (nv) { if (!l.includes(productId)) l.push(productId); } else { const i = l.indexOf(productId); if (i > -1) l.splice(i, 1); } saveWishlist(l); return nv; });
  }, [productId]);

  const handleShare = useCallback(async () => {
    if (navigator.share) { try { await navigator.share({ title: product?.name, text: `Check out ${product?.name} on ShopEase`, url: window.location.href }); return; } catch (e) { if (e?.name === "AbortError") return; } }
    setShareOpen(p => !p);
  }, [product]);

  const handleCopyLink = useCallback(async () => {
    const url = window.location.href; let ok = false;
    if (navigator.clipboard) { try { await navigator.clipboard.writeText(url); ok = true; } catch { } }
    if (!ok) { const ta = document.createElement("textarea"); ta.value = url; Object.assign(ta.style, { position: "fixed", top: 0, left: 0, opacity: "0" }); document.body.appendChild(ta); ta.focus(); ta.select(); try { ok = document.execCommand("copy"); } catch { } document.body.removeChild(ta); }
    if (ok) { setCopied(true); setCopyLabel("Copied!"); setTimeout(() => { setCopied(false); setCopyLabel("Copy Link"); setShareOpen(false); }, 1500); }
    else { setCopyLabel("Failed ✗"); setTimeout(() => setCopyLabel("Copy Link"), 2500); }
  }, []);

  const shareToURL = useCallback(platform => {
    const url = encodeURIComponent(window.location.href), text = encodeURIComponent(`Check out ${product?.name || "this product"} on ShopEase`);
    const targets = { whatsapp: `https://wa.me/?text=${text}%20${url}`, twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`, facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`, telegram: `https://t.me/share/url?url=${url}&text=${text}` };
    if (targets[platform]) { const w = 600, h = 500, l = Math.max(0, (window.screen.width - w) / 2), t = Math.max(0, (window.screen.height - h) / 2); window.open(targets[platform], "_blank", `noopener,noreferrer,width=${w},height=${h},left=${l},top=${t}`); }
    setShareOpen(false);
  }, [product]);

  useEffect(() => { if (!shareOpen) return; const h = e => { if (!e.target.closest(".pd-share-panel") && !e.target.closest(".pd-share-btn")) setShareOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [shareOpen]);

  const handleAddReview = useCallback(review => {
    setReviews(prev => { const updated = [review, ...prev]; if (product) saveReviews(product.id, updated); return updated; });
  }, [product?.id]);

  useEffect(() => { if (!product?.image) return; getDominantColor(product.image).then(c => injectDynamicTheme(c)); }, [product?.image]);

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
    // ── data-theme drives light/dark CSS var switching ──
    <div
      className="pd-root pd-grain min-h-screen"
      data-theme={isDark ? "dark" : "light"}
      style={{ background: "var(--pd-page)", color: "var(--cream)" }}
    >
      <style>{DETAIL_STYLES}</style>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative pt-20" style={{ background: "var(--pd-hero-grad)" }}>
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-10 text-xs pd-rise-1" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>
            <button onClick={() => navigate("/")} className="pd-link-hover transition-colors" style={{ color: "var(--mist)" }}>Home</button>
            <span style={{ color: "var(--ash)" }}>·</span>
            <button onClick={() => navigate("/products")} className="pd-link-hover transition-colors" style={{ color: "var(--mist)" }}>Products</button>
            {product.keywords?.[0] && (<>
              <span style={{ color: "var(--ash)" }}>·</span>
              <button onClick={() => navigate(`/products?search=${product.keywords[0]}`)} className="pd-link-hover transition-colors capitalize" style={{ color: "var(--mist)" }}>{product.keywords[0]}</button>
            </>)}
            <span style={{ color: "var(--ash)" }}>·</span>
            <span className="line-clamp-1 max-w-[180px]" style={{ color: "var(--silver)" }}>{product.name}</span>
          </nav>

          {/* ── TWO-COLUMN GRID ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* LEFT: Gallery + Intel + Reviews (scrolls with page) */}
            <div className="lg:col-span-7">
              <ThumbnailGallery product={product} imageRef={imageRef} />
              <ReviewsSection product={product} reviews={reviews} onAddReview={handleAddReview} user={user} />
            </div>

            {/* RIGHT: Sticky info + ATC panel */}
            <div className="lg:col-span-5">
              {/*
               * lg:sticky lg:top-[88px] — sticks to 88px below viewport top.
               * Added max-h and overflow-y-auto so the right side has its own scroll.
               */}
              <div ref={rightRef} className="lg:sticky lg:top-[88px] max-h-[calc(100vh-100px)] overflow-y-auto space-y-5 pd-thumbs pr-2 pb-8">

                {/* Top action row */}
                <div className="pd-r flex items-center justify-between">
                  <motion.button whileHover={{ x: -3 }} onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs transition-colors pd-link-hover" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </motion.button>
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleWishlist}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={{ background: wishlisted ? "rgba(244,63,94,0.1)" : "var(--pd-s2)", border: `1px solid ${wishlisted ? "rgba(244,63,94,0.3)" : "var(--pd-b3)"}`, color: wishlisted ? "#f43f5e" : "var(--mist)" }}>
                      <HeartIcon filled={wishlisted} className="w-3.5 h-3.5" />
                    </motion.button>
                    <div className="relative">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleShare}
                        className="pd-share-btn w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{ background: shareOpen ? "rgba(201,169,110,0.1)" : "var(--pd-s2)", border: `1px solid ${shareOpen ? "rgba(201,169,110,0.3)" : "var(--pd-b3)"}`, color: shareOpen ? "var(--gold)" : "var(--mist)" }}>
                        <ShareIcon className="w-3.5 h-3.5" />
                      </motion.button>
                      <AnimatePresence>
                        {shareOpen && (
                          <motion.div initial={{ opacity: 0, scale: 0.93, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 6 }} transition={{ duration: 0.18 }}
                            className="pd-share-panel absolute right-0 top-11 z-[200] rounded-2xl shadow-2xl p-4 w-[220px]"
                            style={{ background: "var(--pd-overlay)", border: "1px solid var(--pd-b5)" }}>
                            <p className="pd-chip mb-3 px-1" style={{ color: "var(--mist)" }}>Share this item</p>
                            <div className="space-y-0.5">
                              {[{ id: "whatsapp", label: "WhatsApp", bg: "#25D366" }, { id: "twitter", label: "X (Twitter)", bg: "#000" }, { id: "facebook", label: "Facebook", bg: "#1877f2" }, { id: "telegram", label: "Telegram", bg: "#0088cc" }].map(p => (
                                <motion.button key={p.id} whileHover={{ x: 3 }} onClick={() => shareToURL(p.id)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>
                                  <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold" style={{ background: p.bg }}>{p.label[0]}</span>
                                  {p.label}
                                </motion.button>
                              ))}
                            </div>
                            <div className="my-3" style={{ borderTop: "1px solid var(--pd-b2)" }} />
                            <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyLink}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all"
                              style={{ background: copied ? "rgba(74,222,128,0.06)" : "transparent", borderColor: copied ? "rgba(74,222,128,0.2)" : "var(--pd-b3)", color: copied ? "#4ade80" : "var(--silver)", fontFamily: "Jost,sans-serif" }}>
                              {copied ? <><CheckIcon className="w-3.5 h-3.5" />Copied!</> : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>{copyLabel}</>}
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* SKU + keywords */}
                <div className="pd-r flex flex-wrap items-center gap-2">
                  <span className="pd-chip px-2.5 py-1 rounded-md" style={{ background: "var(--pd-s2)", color: "var(--mist)" }}>SKU: {sku}</span>
                  {product.keywords?.slice(0, 3).map(kw => (
                    <span key={kw} className="pd-chip px-2.5 py-1 rounded-md capitalize" style={{ background: "rgba(201,169,110,0.08)", color: "var(--gold)", border: "1px solid rgba(201,169,110,0.15)" }}>{kw}</span>
                  ))}
                </div>

                {/* Name */}
                <div className="pd-r">
                  <h1 className="pd-display font-light leading-tight" style={{ color: "var(--cream)", fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.015em" }}>
                    {product.name}
                  </h1>
                </div>

                {/* Seller */}
                <div className="pd-r">
                  <span className="text-xs" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>Sold by </span>
                  <Link to="/seller/shopease-store" className="text-xs font-medium pd-link-hover" style={{ color: "var(--gold)", fontFamily: "Jost,sans-serif" }}>ShopEase Atelier</Link>
                </div>

                {/* Rating */}
                {product.rating_stars && (
                  <div className="pd-r"><StarRating stars={product.rating_stars} count={product.rating_count} /></div>
                )}

                {/* Price */}
                <div className="pd-r flex items-baseline gap-4">
                  <span className="pd-display font-light" style={{ fontSize: "clamp(32px,4vw,44px)", color: "var(--cream)", letterSpacing: "-0.02em" }}>
                    {formatMoneyCents(product.price_cents)}
                  </span>
                  {origPrice && (<>
                    <span className="text-lg line-through" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{formatMoneyCents(origPrice)}</span>
                    <span className="pd-chip px-2.5 py-1 rounded-full" style={{ background: "rgba(244,63,94,0.1)", color: "#f87171", border: "1px solid rgba(244,63,94,0.2)" }}>
                      −{Math.round((1 - product.price_cents / origPrice) * 100)}%
                    </span>
                  </>)}
                  {lowStock && <span className="pd-chip px-2.5 py-1 rounded-full" style={{ background: "rgba(251,146,60,0.1)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)" }}>Low Stock</span>}
                </div>

                <div className="pd-r pd-rule" />

                {/* Color */}
                <div className="pd-r">
                  <ColorSelector availableColors={availableColors} selectedColor={selectedColor} onSelect={setSelectedColor} />
                </div>

                {/* Size */}
                {availableSizes && (
                  <div className="pd-r">
                    <SizeSelector sizes={availableSizes} selectedSize={selectedSize} onSelect={setSelectedSize} />
                  </div>
                )}

                {/* ATC */}
                <div className="pd-r">
                  <AddToCartPanel productId={product.id} variantId={product.variants?.[0]?.id || null} atcRef={atcRef} />
                </div>

                {/* Secondary actions */}
                <div className="pd-r flex flex-wrap gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setAlertOpen(true)} disabled={hasAlert}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{ fontFamily: "Jost,sans-serif", background: hasAlert ? "rgba(74,222,128,0.06)" : "var(--pd-s2)", border: `1px solid ${hasAlert ? "rgba(74,222,128,0.2)" : "var(--pd-b3)"}`, color: hasAlert ? "#4ade80" : "var(--silver)", cursor: hasAlert ? "default" : "pointer" }}>
                    {hasAlert ? <><CheckIcon className="w-3 h-3" />Alert Set</> : <><BellIcon className="w-3 h-3" />Price Alert</>}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={toggleWishlist}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{ fontFamily: "Jost,sans-serif", background: wishlisted ? "rgba(244,63,94,0.06)" : "var(--pd-s2)", border: `1px solid ${wishlisted ? "rgba(244,63,94,0.2)" : "var(--pd-b3)"}`, color: wishlisted ? "#f87171" : "var(--silver)" }}>
                    <HeartIcon filled={wishlisted} className="w-3 h-3" />
                    {wishlisted ? "Saved" : "Save"}
                  </motion.button>
                </div>

                {/* Reassurance */}
                <div className="pd-r flex flex-wrap gap-x-4 gap-y-1.5">
                  {["🔒 Secure checkout", "📦 Ships in 24h", "↩️ Free 30-day returns"].map(t => (
                    <span key={t} className="text-xs" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{t}</span>
                  ))}
                </div>

                <div className="pd-r pd-rule" />

                {/* Tabs */}
                <div className="pd-r">
                  <ProductTabs product={product} />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PREDICTIVE PAIRINGS ──────────────────────────────────────── */}
      <PredictivePairings products={predictiveProducts} />

      {/* ── PRICE ALERT MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {alertOpen && <PriceAlertModal product={product} onClose={() => { setAlertOpen(false); setHasAlert(hasPriceAlert(productId)); }} />}
      </AnimatePresence>

      {/* ── STICKY ATC BAR ───────────────────────────────────────────── */}
      {/* <StickyATCBar product={product} productId={product.id} variantId={product.variants?.[0]?.id || null} visible={atcOutOfView} /> */}
    </div>
  );
}
