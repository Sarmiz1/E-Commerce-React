const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'src/Features/Product/ProductDetails/ProductDetail.jsx');
const lines = fs.readFileSync(srcFile, 'utf8').split('\n');

const getLines = (start, end) => lines.slice(start - 1, end).join('\n');

const dirHooks = path.join(__dirname, 'src/Features/Product/ProductDetails/Hooks');
const dirUtils = path.join(__dirname, 'src/Features/Product/ProductDetails/Utils');
const dirComponents = path.join(__dirname, 'src/Features/Product/ProductDetails/Components');
const dirStyles = path.join(__dirname, 'src/Features/Product/ProductDetails/Styles');

[dirHooks, dirUtils, dirComponents, dirStyles].forEach(d => fs.mkdirSync(d, { recursive: true }));

// 1. Utils (Lines 260-370)
const utilsCode = 
'export function loadReviews(productId) { try { const r = localStorage.getItem("woosho-reviews-" + productId); return r ? JSON.parse(r) : []; } catch { return []; } }\n' +
'export function saveReviews(productId, reviews) { try { localStorage.setItem("woosho-reviews-" + productId, JSON.stringify(reviews)); } catch { } }\n' +
'export function loadWishlist() { try { const r = localStorage.getItem("woosho-wishlist"); return r ? JSON.parse(r) : []; } catch { return []; } }\n' +
'export function saveWishlist(list) { try { localStorage.setItem("woosho-wishlist", JSON.stringify(list)); } catch { } }\n' +
'export function loadPriceAlerts() { try { const r = localStorage.getItem("woosho-price-alerts"); return r ? JSON.parse(r) : []; } catch { return []; } }\n' +
'export function savePriceAlert(alert) { try { const a = loadPriceAlerts(); a.push(alert); localStorage.setItem("woosho-price-alerts", JSON.stringify(a)); } catch { } }\n' +
'export function hasPriceAlert(productId) { return loadPriceAlerts().some(a => a.productId === productId); }\n' +
'export function loadReviewerName() { try { return localStorage.getItem("woosho-reviewer-name") || ""; } catch { return ""; } }\n' +
'export function saveReviewerName(name) { try { localStorage.setItem("woosho-reviewer-name", name); } catch { } }\n\n' +
'export function getProductCategory(keywords = []) {\n' +
'  const kw = keywords.join(" ").toLowerCase();\n' +
'  if (/shoe|sneaker|footwear|heel|flat|boot/.test(kw)) return "shoes";\n' +
'  if (/apparel|shirt|sweater|pant|dress|hoodie|sock|beanie|shorts|robe/.test(kw)) return "apparel";\n' +
'  if (/kitchen|appliance|cookware|toaster|kettle|blender/.test(kw)) return "kitchen";\n' +
'  if (/bathroom|towel|bath/.test(kw)) return "home";\n' +
'  return "default";\n' +
'}\n\n' +
'export const PRODUCT_COLORS = {\n' +
'  apparel: [{ name: "Obsidian", hex: "#1a1a2e" }, { name: "Ivory", hex: "#f0f0f0" }, { name: "Navy", hex: "#1b3a5c" }, { name: "Slate", hex: "#8b8b8b" }, { name: "Teal", hex: "#008080" }],\n' +
'  shoes: [{ name: "Obsidian", hex: "#1a1a2e" }, { name: "Ivory", hex: "#f0f0f0" }, { name: "Slate", hex: "#8b8b8b" }, { name: "Cognac", hex: "#8b4513" }],\n' +
'  kitchen: [{ name: "Silver", hex: "#c0c0c0" }, { name: "Obsidian", hex: "#1a1a2e" }, { name: "Ivory", hex: "#f0f0f0" }, { name: "Crimson", hex: "#b22222" }],\n' +
'  home: [{ name: "Ivory", hex: "#f0f0f0" }, { name: "Slate", hex: "#8b8b8b" }, { name: "Sand", hex: "#d2b48c" }],\n' +
'  default: [{ name: "Gold", hex: "#C9A96E" }, { name: "Obsidian", hex: "#1a1a2e" }, { name: "Platinum", hex: "#c0c0c0" }],\n' +
'};\n\n' +
'export const SIZE_MAP = {\n' +
'  apparel: ["XS", "S", "M", "L", "XL", "XXL"],\n' +
'  shoes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],\n' +
'};\n\n' +
'export function getSeedReviews(product) {\n' +
'  const base = product.rating_stars || 4;\n' +
'  return [\n' +
'    { id: "seed-1", name: "Sarah M.", stars: Math.min(5, Math.round(base + 0.5)), text: "Absolutely love this product. Exactly as described and arrived in perfect condition. Would highly recommend!", date: "2 days ago", verified: true },\n' +
'    { id: "seed-2", name: "James K.", stars: Math.round(base), text: "Great quality and fast shipping. The product exceeded my expectations. Will definitely buy again.", date: "1 week ago", verified: true },\n' +
'    { id: "seed-3", name: "Amaka O.", stars: Math.max(1, Math.round(base - 0.5)), text: "Very good product overall. Packaging was excellent. Minor detail could be improved but overall great value.", date: "2 weeks ago", verified: false },\n' +
'  ];\n' +
'}\n\n' +
'export function computeRatingDistribution(product, reviews = []) {\n' +
'  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };\n' +
'  reviews.forEach(r => { const s = Math.min(5, Math.max(1, Math.round(r.stars))); dist[s] = (dist[s] || 0) + 1; });\n' +
'  const existing = Math.max(0, (product.rating_count || 0) - reviews.length);\n' +
'  if (existing > 0) {\n' +
'    const avg = product.rating_stars || 4;\n' +
'    const w = [1, 2, 3, 4, 5].map(s => Math.max(0.01, Math.exp(-Math.abs(s - avg) * 1.2)));\n' +
'    const ws = w.reduce((a, b) => a + b, 0);\n' +
'    w.forEach((v, i) => { dist[i + 1] += Math.round((v / ws) * existing); });\n' +
'  }\n' +
'  return dist;\n' +
'}\n\n' +
'export function getAvatarGradient(name) {\n' +
'  let hash = 0;\n' +
'  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);\n' +
'  const h = Math.abs(hash) % 360;\n' +
'  return "linear-gradient(135deg, hsl(" + h + ",45%,38%), hsl(" + ((h + 40) % 360) + ",35%,28%))";\n' +
'}\n\n' +
'export function seededRand(seed, min, max) {\n' +
'  let hash = 0;\n' +
'  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);\n' +
'  return min + (Math.abs(hash) % (max - min + 1));\n' +
'}\n\n' +
'export function computeDemandScore(product) {\n' +
'  const stars = product.rating_stars || 0;\n' +
'  const count = product.rating_count || 0;\n' +
'  return Math.min(100, Math.round((stars / 5) * 45 + Math.min(count, 2000) / 2000 * 35 + (product.price_cents < 2000 ? 20 : count > 500 ? 15 : 5)));\n' +
'}\n\n' +
'export function generateSparklinePoints(productId, W, H) {\n' +
'  const seed = String(productId || "x");\n' +
'  const N = 14;\n' +
'  const vals = Array.from({ length: N }, (_, i) => seededRand(seed + "-" + (i * 7), 30, 90));\n' +
'  const smoothed = vals.map((v, i) => vals.slice(Math.max(0, i - 2), i + 3).reduce((a, b) => a + b, 0) / Math.min(i + 3, N));\n' +
'  const min = Math.min(...smoothed), max = Math.max(...smoothed), range = max - min || 1;\n' +
'  const P = 8;\n' +
'  const pts = smoothed.map((v, i) => ({ x: P + (i / (N - 1)) * (W - P * 2), y: P + ((1 - (v - min) / range) * (H - P * 2)) }));\n' +
'  const pathD = pts.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");\n' +
'  const areaD = pathD + " L" + pts[pts.length - 1].x.toFixed(1) + "," + H + " L" + pts[0].x.toFixed(1) + "," + H + " Z";\n' +
'  const pathLen = Math.round(pts.reduce((acc, p, i) => { if (i === 0) return 0; const dx = p.x - pts[i - 1].x, dy = p.y - pts[i - 1].y; return acc + Math.sqrt(dx * dx + dy * dy); }, 0));\n' +
'  return { pts, pathD, areaD, pathLen };\n' +
'}\n';
fs.writeFileSync(path.join(dirUtils, 'productHelpers.js'), utilsCode);

// 2. Styles
const stylesCode = getLines(27, 258).replace('const FONT_LINK', 'export const FONT_LINK').replace('const DETAIL_STYLES', 'export const DETAIL_STYLES');
fs.writeFileSync(path.join(dirStyles, 'DetailStyles.js'), stylesCode);

// 3. Icons
const iconsCode = "import React from 'react';\n" + getLines(372, 385).replace(/const /g, 'export const ');
fs.writeFileSync(path.join(dirComponents, 'Icons.jsx'), iconsCode);

// 4. Hooks
const hooksCode = "import { useEffect } from 'react';\nimport gsap from 'gsap';\n\nexport " + getLines(388, 396);
fs.writeFileSync(path.join(dirHooks, 'useMagnetic.js'), hooksCode);

// We should also extract the large ProductDetail logics to useProductDetail.js hook.
const useProductDetailCode = "import { useState, useEffect, useCallback, useMemo } from 'react';\n" +
"import { useTheme } from '../../../../Context/theme/ThemeContext';\n" +
"import { getDominantColor, injectDynamicTheme } from '../../../../Utils/dynamicTheme';\n" +
"import { loadWishlist, saveWishlist, saveReviews, loadReviews, getSeedReviews, hasPriceAlert } from '../Utils/productHelpers';\n\n" +
"export function useProductDetail(product) {\n" +
"  const productId = product?.id;\n" +
"  const { isDark } = useTheme();\n\n" +
"  const user = useMemo(() => { try { const r = localStorage.getItem('woosho-user'); return r ? JSON.parse(r) : null; } catch { return null; } }, []);\n" +
"  const [wishlisted, setWishlisted] = useState(() => loadWishlist().includes(productId));\n" +
"  const [shareOpen, setShareOpen] = useState(false);\n" +
"  const [copied, setCopied] = useState(false);\n" +
"  const [copyLabel, setCopyLabel] = useState('Copy Link');\n" +
"  const [reviews, setReviews] = useState([]);\n" +
"  const [selectedColor, setSelectedColor] = useState(0);\n" +
"  const [selectedSize, setSelectedSize] = useState(null);\n" +
"  const [alertOpen, setAlertOpen] = useState(false);\n" +
"  const [hasAlert, setHasAlert] = useState(() => hasPriceAlert(productId));\n\n" +
"  useEffect(() => { if (!product) return; const s = loadReviews(product.id); setReviews(s.length > 0 ? s : getSeedReviews(product)); }, [product?.id]);\n\n" +
"  const toggleWishlist = useCallback(() => {\n" +
"    setWishlisted(p => { const nv = !p; const l = loadWishlist(); if (nv) { if (!l.includes(productId)) l.push(productId); } else { const i = l.indexOf(productId); if (i > -1) l.splice(i, 1); } saveWishlist(l); return nv; });\n" +
"  }, [productId]);\n\n" +
"  const handleShare = useCallback(async () => {\n" +
"    if (navigator.share) { try { await navigator.share({ title: product?.name, text: 'Check out ' + product?.name + ' on woosho', url: window.location.href }); return; } catch (e) { if (e?.name === 'AbortError') return; } }\n" +
"    setShareOpen(p => !p);\n" +
"  }, [product]);\n\n" +
"  const handleCopyLink = useCallback(async () => {\n" +
"    const url = window.location.href; let ok = false;\n" +
"    if (navigator.clipboard) { try { await navigator.clipboard.writeText(url); ok = true; } catch { } }\n" +
"    if (!ok) { const ta = document.createElement('textarea'); ta.value = url; Object.assign(ta.style, { position: 'fixed', top: 0, left: 0, opacity: '0' }); document.body.appendChild(ta); ta.focus(); ta.select(); try { ok = document.execCommand('copy'); } catch { } document.body.removeChild(ta); }\n" +
"    if (ok) { setCopied(true); setCopyLabel('Copied!'); setTimeout(() => { setCopied(false); setCopyLabel('Copy Link'); setShareOpen(false); }, 1500); }\n" +
"    else { setCopyLabel('Failed ✗'); setTimeout(() => setCopyLabel('Copy Link'), 2500); }\n" +
"  }, []);\n\n" +
"  const shareToURL = useCallback(platform => {\n" +
"    const url = encodeURIComponent(window.location.href), text = encodeURIComponent('Check out ' + (product?.name || 'this product') + ' on woosho');\n" +
"    const targets = { whatsapp: 'https://wa.me/?text=' + text + '%20' + url, twitter: 'https://twitter.com/intent/tweet?text=' + text + '&url=' + url, facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url, telegram: 'https://t.me/share/url?url=' + url + '&text=' + text };\n" +
"    if (targets[platform]) { const w = 600, h = 500, l = Math.max(0, (window.screen.width - w) / 2), t = Math.max(0, (window.screen.height - h) / 2); window.open(targets[platform], '_blank', 'noopener,noreferrer,width=' + w + ',height=' + h + ',left=' + l + ',top=' + t); }\n" +
"    setShareOpen(false);\n" +
"  }, [product]);\n\n" +
"  useEffect(() => { if (!shareOpen) return; const h = e => { if (!e.target.closest('.pd-share-panel') && !e.target.closest('.pd-share-btn')) setShareOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [shareOpen]);\n\n" +
"  const handleAddReview = useCallback(review => {\n" +
"    setReviews(prev => { const updated = [review, ...prev]; if (product) saveReviews(product.id, updated); return updated; });\n" +
"  }, [product?.id]);\n\n" +
"  useEffect(() => { if (!product?.image) return; getDominantColor(product.image).then(c => injectDynamicTheme(c)); }, [product?.image]);\n\n" +
"  return {\n" +
"    isDark,\n" +
"    user,\n" +
"    wishlisted,\n" +
"    shareOpen,\n" +
"    copied,\n" +
"    copyLabel,\n" +
"    reviews,\n" +
"    selectedColor,\n" +
"    setSelectedColor,\n" +
"    selectedSize,\n" +
"    setSelectedSize,\n" +
"    alertOpen,\n" +
"    setAlertOpen,\n" +
"    hasAlert,\n" +
"    setHasAlert,\n" +
"    toggleWishlist,\n" +
"    handleShare,\n" +
"    handleCopyLink,\n" +
"    shareToURL,\n" +
"    handleAddReview,\n" +
"  };\n" +
"}\n";
fs.writeFileSync(path.join(dirHooks, 'useProductDetail.js'), useProductDetailCode);

console.log("Extraction complete");
