export function loadReviews(productId) { try { const r = localStorage.getItem("WooSho-reviews-" + productId); return r ? JSON.parse(r) : []; } catch { return []; } }
export function saveReviews(productId, reviews) { try { localStorage.setItem("WooSho-reviews-" + productId, JSON.stringify(reviews)); } catch { } }
export function loadWishlist() { try { const r = localStorage.getItem("WooSho-wishlist"); return r ? JSON.parse(r) : []; } catch { return []; } }
export function saveWishlist(list) { try { localStorage.setItem("WooSho-wishlist", JSON.stringify(list)); } catch { } }
export function loadPriceAlerts() { try { const r = localStorage.getItem("WooSho-price-alerts"); return r ? JSON.parse(r) : []; } catch { return []; } }
export function savePriceAlert(alert) { try { const a = loadPriceAlerts(); a.push(alert); localStorage.setItem("WooSho-price-alerts", JSON.stringify(a)); } catch { } }
export function hasPriceAlert(productId) { return loadPriceAlerts().some(a => a.productId === productId); }
export function loadReviewerName() { try { return localStorage.getItem("WooSho-reviewer-name") || ""; } catch { return ""; } }
export function saveReviewerName(name) { try { localStorage.setItem("WooSho-reviewer-name", name); } catch { } }

export function getProductCategory(keywords = []) {
  const kw = keywords.join(" ").toLowerCase();
  if (/shoe|sneaker|footwear|heel|flat|boot/.test(kw)) return "shoes";
  if (/apparel|shirt|sweater|pant|dress|hoodie|sock|beanie|shorts|robe/.test(kw)) return "apparel";
  if (/kitchen|appliance|cookware|toaster|kettle|blender/.test(kw)) return "kitchen";
  if (/bathroom|towel|bath/.test(kw)) return "home";
  return "default";
}

export const PRODUCT_COLORS = {
  apparel: [{ name: "Obsidian", hex: "#1a1a2e" }, { name: "Ivory", hex: "#f0f0f0" }, { name: "Navy", hex: "#1b3a5c" }, { name: "Slate", hex: "#8b8b8b" }, { name: "Teal", hex: "#008080" }],
  shoes: [{ name: "Obsidian", hex: "#1a1a2e" }, { name: "Ivory", hex: "#f0f0f0" }, { name: "Slate", hex: "#8b8b8b" }, { name: "Cognac", hex: "#8b4513" }],
  kitchen: [{ name: "Silver", hex: "#c0c0c0" }, { name: "Obsidian", hex: "#1a1a2e" }, { name: "Ivory", hex: "#f0f0f0" }, { name: "Crimson", hex: "#b22222" }],
  home: [{ name: "Ivory", hex: "#f0f0f0" }, { name: "Slate", hex: "#8b8b8b" }, { name: "Sand", hex: "#d2b48c" }],
  default: [{ name: "Gold", hex: "#C9A96E" }, { name: "Obsidian", hex: "#1a1a2e" }, { name: "Platinum", hex: "#c0c0c0" }],
};

export const SIZE_MAP = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  shoes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
};

export function getSeedReviews(product) {
  const base = product.rating_stars || 4;
  return [
    { id: "seed-1", name: "Sarah M.", stars: Math.min(5, Math.round(base + 0.5)), text: "Absolutely love this product. Exactly as described and arrived in perfect condition. Would highly recommend!", date: "2 days ago", verified: true },
    { id: "seed-2", name: "James K.", stars: Math.round(base), text: "Great quality and fast shipping. The product exceeded my expectations. Will definitely buy again.", date: "1 week ago", verified: true },
    { id: "seed-3", name: "Amaka O.", stars: Math.max(1, Math.round(base - 0.5)), text: "Very good product overall. Packaging was excellent. Minor detail could be improved but overall great value.", date: "2 weeks ago", verified: false },
  ];
}

export function computeRatingDistribution(product, reviews = []) {
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

export function getAvatarGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return "linear-gradient(135deg, hsl(" + h + ",45%,38%), hsl(" + ((h + 40) % 360) + ",35%,28%))";
}

export function seededRand(seed, min, max) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  return min + (Math.abs(hash) % (max - min + 1));
}

export function computeDemandScore(product) {
  const stars = product.rating_stars || 0;
  const count = product.rating_count || 0;
  return Math.min(100, Math.round((stars / 5) * 45 + Math.min(count, 2000) / 2000 * 35 + (product.price_cents < 2000 ? 20 : count > 500 ? 15 : 5)));
}

export function generateSparklinePoints(productId, W, H) {
  const seed = String(productId || "x");
  const N = 14;
  const vals = Array.from({ length: N }, (_, i) => seededRand(seed + "-" + (i * 7), 30, 90));
  const smoothed = vals.map((v, i) => vals.slice(Math.max(0, i - 2), i + 3).reduce((a, b) => a + b, 0) / Math.min(i + 3, N));
  const min = Math.min(...smoothed), max = Math.max(...smoothed), range = max - min || 1;
  const P = 8;
  const pts = smoothed.map((v, i) => ({ x: P + (i / (N - 1)) * (W - P * 2), y: P + ((1 - (v - min) / range) * (H - P * 2)) }));
  const pathD = pts.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");
  const areaD = pathD + " L" + pts[pts.length - 1].x.toFixed(1) + "," + H + " L" + pts[0].x.toFixed(1) + "," + H + " Z";
  const pathLen = Math.round(pts.reduce((acc, p, i) => { if (i === 0) return 0; const dx = p.x - pts[i - 1].x, dy = p.y - pts[i - 1].y; return acc + Math.sqrt(dx * dx + dy * dy); }, 0));
  return { pts, pathD, areaD, pathLen };
}
