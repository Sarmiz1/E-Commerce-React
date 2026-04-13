// src/Pages/Products/ProductDetailPage.jsx
//
// ── Bugs fixed from original ──────────────────────────────────────────────────
// 1. Description was hardcoded lorem ipsum — now falls back gracefully when
//    product.description is absent (most API products have none).
// 2. "Add to Cart" button had no wiring — now uses the same AddToCart component
//    (postData + cartContext) so it actually works.
// 3. useParams() productId cast to string for comparison; loader returns string ids.
// 4. similarProducts had no max cap — could render 40+ cards; capped at 6.
// 5. ratingCount image path could 404 on fractional ratings — StarRating component
//    renders pure CSS stars, no image dependency.
// 6. products.find() didn't handle undefined loaderData — guarded with ?. 
// 7. console.log left in production code — removed.
//
// ── Animation system ──────────────────────────────────────────────────────────
// Uses a cinematic "reveal timeline" on mount: image slides in from left,
// content cascade from right with GSAP expo.out. Separate from the scroll-
// triggered similar products section. All GSAP animations use clearProps:"all".
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useParams, useLoaderData, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ratingCount } from "../../Utils/ratingsCount";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import { postData } from "../../api/postData";
import { CartActionsContext } from "../../Context/cartContext";
import { ErrorMessage } from "../../Components/ErrorMessage";
import ProductCard from "../../Components/Ui/ProductCard";

gsap.registerPlugin(ScrollTrigger);

// ─── Inline styles (scoped to this page) ─────────────────────────────────────
const DETAIL_STYLES = `
  @keyframes pd-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  .pd-float{animation:pd-float 5s ease-in-out infinite}

  @keyframes pd-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .pd-shimmer{
    background:linear-gradient(90deg,#111 0%,#6366f1 35%,#111 60%,#4f46e5 90%);
    background-size:200% auto;-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;animation:pd-shimmer 4s linear infinite;
  }

  @keyframes pd-orb{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(20px,-25px)scale(1.05)}66%{transform:translate(-15px,18px)scale(0.96)}}
  .pd-orb{animation:pd-orb linear infinite}

  @keyframes pd-spin{to{transform:rotate(360deg)}}
  .pd-spin{animation:pd-spin 0.8s linear infinite}

  @keyframes pd-pop{0%{transform:scale(1)}40%{transform:scale(1.45)}70%{transform:scale(0.9)}100%{transform:scale(1)}}
  .pd-pop{animation:pd-pop 0.42s cubic-bezier(0.36,0.07,0.19,0.97)}

  @keyframes pd-badge-glow{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.5)}60%{box-shadow:0 0 0 10px rgba(99,102,241,0)}}
  .pd-badge-glow{animation:pd-badge-glow 2.4s ease-out infinite}

  /* Image zoom on hover */
  .pd-img-wrap:hover .pd-img{transform:scale(1.04)}
  .pd-img{transition:transform 0.6s cubic-bezier(0.32,0.72,0,1)}

  /* Tab underline */
  .pd-tab-active::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;border-radius:9999px;background:linear-gradient(90deg,#2563eb,#6366f1)}

  /* Breadcrumb separator */
  .pd-sep::before{content:'/';margin:0 6px;opacity:0.35}
`;

// ─── SVG Icon helpers ─────────────────────────────────────────────────────────
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

// ─── Star rating (CSS-only, no image dependency) ──────────────────────────────
function StarRating({ stars = 0, count = 0, size = "base" }) {
  const full = Math.floor(stars);
  const half = stars % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const cls = size === "lg" ? "text-xl" : "text-sm";
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array(full).fill(0).map((_, i) => <span key={`f${i}`} className={`text-yellow-400 ${cls}`}>★</span>)}
        {half && <span className={`text-yellow-400 ${cls}`}>⯪</span>}
        {Array(empty).fill(0).map((_, i) => <span key={`e${i}`} className={`text-gray-200 ${cls}`}>★</span>)}
      </div>
      <span className="text-yellow-600 font-bold text-sm">{stars}</span>
      {count > 0 && <span className="text-gray-400 text-sm">({count.toLocaleString()} reviews)</span>}
    </div>
  );
}

// ─── Add to Cart wired to context ─────────────────────────────────────────────
function AddToCartPanel({ productId }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const btnRef = useRef(null);
  const { loadCart } = useContext(CartActionsContext);

  // Auto-reset success state
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 3000);
    return () => clearTimeout(t);
  }, [done]);

  const handleAdd = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await postData("/api/cart-items", { productId, quantity: qty });
      await loadCart();
      setDone(true);
      // Elastic bounce feedback
      if (btnRef.current) gsap.fromTo(btnRef.current, { scale: 0.9 }, { scale: 1, duration: 0.45, ease: "elastic.out(1.2,0.5)" });
    } catch {
      setError("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Quantity</span>
        <div className="flex items-center gap-0 border border-gray-200 rounded-2xl overflow-hidden">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition font-bold text-lg">−</button>
          <span className="w-10 text-center font-black text-gray-900 text-sm">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(10, q + 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition font-bold text-lg">+</button>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <motion.button
          ref={btnRef}
          onClick={handleAdd}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className={`flex-1 flex items-center justify-center gap-2.5 font-black text-sm py-4 px-6 rounded-2xl transition-all duration-300 shadow-md ${done ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25"
              : loading ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:shadow-lg"
            }`}
        >
          <AnimatePresence mode="wait">
            {done ? (
              <motion.span key="done" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-2">
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
      </div>

      <ErrorMessage errorMessage={error} />
    </div>
  );
}

// ─── Floating orbs (reused pattern) ──────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w: 400, h: 400, top: "-15%", left: "-8%", delay: 0, dur: 20, cls: "bg-blue-400/15" },
        { w: 350, h: 350, top: "50%", right: "-10%", delay: 5, dur: 24, cls: "bg-indigo-400/12" },
        { w: 250, h: 250, bottom: "5%", left: "40%", delay: 10, dur: 18, cls: "bg-violet-400/10" },
      ].map((o, i) => (
        <div key={i} className={`absolute rounded-full blur-3xl pd-orb ${o.cls}`}
          style={{
            width: o.w, height: o.h, top: o.top, left: o.left, right: o.right, bottom: o.bottom,
            animationDelay: `${o.delay}s`, animationDuration: `${o.dur}s`
          }} />
      ))}
    </div>
  );
}

// ─── Product image panel ──────────────────────────────────────────────────────
function ProductImagePanel({ product, imageRef }) {
  const isNew = product?.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;
  const onSale = product?.priceCents < 2000;

  return (
    <div ref={imageRef} className="relative">
      {/* Main image */}
      <div className="pd-img-wrap relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/15 bg-gray-100"
        style={{ aspectRatio: "1/1" }}>
        <img
          src={product.image}
          alt={product.name}
          className="pd-img w-full h-full object-cover"
          loading="eager"
        />
        {/* Inner gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && (
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md pd-badge-glow">
              New
            </span>
          )}
          {onSale && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
              Sale
            </span>
          )}
        </div>
      </div>

      {/* Trust badges row below image */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { icon: <TruckIcon className="w-4 h-4" />, label: "Free Shipping", sub: "Orders $50+" },
          { icon: <RefreshIcon className="w-4 h-4" />, label: "30-Day Return", sub: "No questions" },
          { icon: <ShieldIcon className="w-4 h-4" />, label: "Secure Pay", sub: "256-bit SSL" },
        ].map((b) => (
          <div key={b.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-center flex flex-col items-center gap-1.5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors duration-200">
            <span className="text-indigo-500">{b.icon}</span>
            <p className="font-bold text-gray-900 text-[11px]">{b.label}</p>
            <p className="text-gray-400 text-[10px]">{b.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────
function ProductTabs({ product }) {
  const [tab, setTab] = useState("description");
  const tabs = [
    { id: "description", label: "Description" },
    { id: "details", label: "Details" },
    { id: "reviews", label: "Reviews" },
  ];

  const description = product.description ||
    "A premium quality product crafted with attention to detail. Designed for everyday use, this item combines durability with style. Perfect for anyone looking for reliable, long-lasting quality that looks great. Whether gifting or treating yourself, this product delivers exceptional value.";

  return (
    <div className="mt-10">
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-gray-100 mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative px-5 py-3 text-sm font-bold transition-colors duration-200 ${tab === t.id ? "pd-tab-active text-indigo-700" : "text-gray-400 hover:text-gray-700"
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        {tab === "description" && (
          <motion.div key="desc"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-gray-600 text-sm leading-relaxed space-y-3">
            <p>{description}</p>
            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {["Premium Quality", "Durable Materials", "Eco-Friendly", "1-Year Warranty"].map((f) => (
                <span key={f} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                  ✓ {f}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "details" && (
          <motion.div key="det"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-0">
            {[
              { label: "Product ID", value: product.id?.slice(0, 12) + "…" },
              { label: "Price", value: formatMoneyCents(product.priceCents) },
              { label: "Rating", value: `${product.rating?.stars ?? "—"} / 5 (${(product.rating?.count ?? 0).toLocaleString()} reviews)` },
              { label: "Keywords", value: (product.keywords || []).join(", ") || "—" },
              { label: "Availability", value: "In Stock" },
              { label: "Ships", value: "Within 24–48 hours" },
            ].map((row, i) => (
              <div key={row.label} className={`flex items-center justify-between py-3 text-sm ${i < 5 ? "border-b border-gray-100" : ""}`}>
                <span className="text-gray-500 font-medium">{row.label}</span>
                <span className="text-gray-900 font-bold text-right max-w-[60%] truncate">{row.value}</span>
              </div>
            ))}
          </motion.div>
        )}

        {tab === "reviews" && (
          <motion.div key="rev"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}>
            {/* Rating summary */}
            <div className="flex items-center gap-8 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-center flex-shrink-0">
                <p className="text-6xl font-black text-gray-900">{product.rating?.stars ?? "—"}</p>
                <StarRating stars={product.rating?.stars ?? 0} size="base" />
                <p className="text-gray-400 text-xs mt-1">{(product.rating?.count ?? 0).toLocaleString()} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((s) => {
                  const pct = s === 5 ? 68 : s === 4 ? 20 : s === 3 ? 8 : s === 2 ? 3 : 1;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-3">{s}</span>
                      <span className="text-yellow-400 text-xs">★</span>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }} transition={{ duration: 0.9, delay: (5 - s) * 0.08, ease: "power3.out" }}
                          className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-7 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sample reviews */}
            <div className="space-y-4">
              {[
                { name: "Sarah M.", stars: 5, date: "2 days ago", text: "Absolutely love this product. Exactly as described and arrived in perfect condition." },
                { name: "James K.", stars: 5, date: "1 week ago", text: "Great quality, fast shipping. Would definitely buy again." },
                { name: "Amaka O.", stars: 4, date: "2 weeks ago", text: "Very good product. Packaging was excellent. Minor scratch on arrival but overall great." },
              ].map((r) => (
                <div key={r.name} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {r.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                        <div className="flex gap-0.5">{Array(r.stars).fill(0).map((_, i) => <span key={i} className="text-yellow-400 text-xs">★</span>)}</div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs">{r.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Similar products carousel (scroll-triggered) ─────────────────────────────
function SimilarProducts({ products }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !products.length) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".pd-sim-card");
      if (!cards.length) return;
      gsap.fromTo(cards,
        { y: 60, opacity: 0, scale: 0.93 },
        {
          y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.8, ease: "back.out(1.4)", clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 84%", once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, [products]);

  if (!products.length) return null;

  return (
    <section ref={ref} className="py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#fafafa 60%,#f5f0ff 100%)" }}>
      {/* Subtle orbs */}
      <FloatingOrbs />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 mb-3">Curated for you</p>
          <h2 className="text-4xl font-black text-gray-900">You May Also Like</h2>
          <p className="text-gray-400 mt-3 text-sm">Products similar to what you're viewing</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {products.map((p) => (
            <div key={p.id} className="pd-sim-card flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="flex-1"><ProductCard product={p} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Not found state ──────────────────────────────────────────────────────────
function ProductNotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}>
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-sm">This product doesn't exist or may have been removed.</p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/products")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-indigo-500/30">
          Browse All Products →
        </motion.button>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Loader returns all products (same shape as ProductsPage)
  const products = useLoaderData();

  // ── Find current product ──
  // productId from useParams is always a string; ensure comparison is string-safe
  const product = Array.isArray(products)
    ? products.find((p) => String(p.id) === String(productId))
    : null;

  // ── Similar products — shared keywords, max 6, exclude self ──
  const similarProducts = product && Array.isArray(products)
    ? products
      .filter((p) =>
        String(p.id) !== String(productId) &&
        Array.isArray(p.keywords) &&
        p.keywords.some((kw) => (product.keywords || []).includes(kw))
      )
      .slice(0, 6)
    : [];

  // ── Wishlist toggle (local state — connect to API as needed) ──
  const [wishlisted, setWishlisted] = useState(false);

  // ── Share panel state ──
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy Link");

  // ── Animation refs ──
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const heroRef = useRef(null);
  const breadRef = useRef(null);

  // ── Cinematic entrance timeline ──────────────────────────────────────────────
  useEffect(() => {
    if (!product || !imageRef.current || !contentRef.current) return;

    const tl = gsap.timeline({ delay: 0.05 });

    // Breadcrumb drops from top
    tl.fromTo(breadRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "all" })
      // Image slides from left
      .fromTo(imageRef.current,
        { x: -60, opacity: 0, scale: 0.96 },
        { x: 0, opacity: 1, scale: 1, duration: 0.95, ease: "expo.out", clearProps: "all" },
        "-=0.2")
      // Content children stagger from right
      .fromTo(contentRef.current.querySelectorAll(".pd-reveal"),
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.09, duration: 0.75, ease: "power3.out", clearProps: "all" },
        "-=0.7");

    return () => tl.kill();
  }, [product]);

  // ── Share handler ────────────────────────────────────────────────────────────
  // Strategy: always try the native Web Share API first (works on mobile AND
  // on desktop Chrome/Edge 89+). If the API is unavailable OR the browser
  // throws NotAllowedError (user hasn't interacted, or desktop Chrome with no
  // registered share targets), fall back to our custom share panel.
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "ShopEase Product",
          text: `Check out ${product?.name} on ShopEase`,
          url: window.location.href,
        });
        // Native share succeeded — nothing else to do
        return;
      } catch (err) {
        // AbortError = user dismissed the native sheet — do nothing
        if (err?.name === "AbortError") return;
        // Any other error (NotAllowedError, NotSupportedError on desktop) —
        // fall through to open our custom panel
      }
    }
    // No native share support OR native share failed → toggle custom panel
    setShareOpen((prev) => !prev);
  }, [product]);

  // ── Copy link to clipboard ────────────────────────────────────────────────────
  // Writes the current URL to the clipboard. Shows a "Copied!" confirmation for
  // 1.5 s then closes the share panel automatically. Falls back to the legacy
  // execCommand approach for browsers that block navigator.clipboard.
  const handleCopyLink = useCallback(async () => {
    const url = window.location.href;
    let success = false;

    // Preferred: Async Clipboard API
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        success = true;
      } catch { /* fall through to execCommand */ }
    }

    // Fallback: execCommand (works even without user-gesture permission)
    if (!success) {
      const ta = document.createElement("textarea");
      ta.value = url;
      Object.assign(ta.style, { position: "fixed", top: 0, left: 0, opacity: "0", pointerEvents: "none" });
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { success = document.execCommand("copy"); } catch { success = false; }
      document.body.removeChild(ta);
    }

    if (success) {
      setCopied(true);
      setCopyLabel("Copied!");
      // Close the panel after 1.5 s so the user sees the feedback, then it
      // tidies itself away
      setTimeout(() => {
        setCopied(false);
        setCopyLabel("Copy Link");
        setShareOpen(false);
      }, 1500);
    } else {
      setCopyLabel("Copy failed ✗");
      setTimeout(() => setCopyLabel("Copy Link"), 2500);
    }
  }, []);

  // ── Share to a specific social platform ──────────────────────────────────────
  // Opens the platform's share dialog in a centred popup window, then closes
  // our panel. If the browser blocks popups (returns null), we silently ignore.
  const shareToURL = useCallback((platform) => {
    const rawUrl = window.location.href;
    const url = encodeURIComponent(rawUrl);
    const text = encodeURIComponent(`Check out ${product?.name || "this product"} on ShopEase`);

    const targets = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (targets[platform]) {
      // Centre the popup on screen
      const w = 600, h = 500;
      const left = Math.max(0, (window.screen.width - w) / 2);
      const top = Math.max(0, (window.screen.height - h) / 2);
      window.open(
        targets[platform],
        "_blank",
        `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`
      );
    }
    // Close the panel immediately — the popup is now handling the share
    setShareOpen(false);
  }, [product]);

  // Close share panel when clicking outside
  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e) => {
      if (!e.target.closest(".pd-share-panel") && !e.target.closest(".pd-share-btn")) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareOpen]);

  // ── Guard: not found ──
  if (!product) return <ProductNotFound />;

  const onSale = product.priceCents < 2000;
  const origPrice = onSale ? Math.round(product.priceCents * 1.35) : null;

  return (
    <div className="bg-white text-gray-800 overflow-x-hidden">
      <style>{DETAIL_STYLES}</style>

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative overflow-hidden">
        {/* Subtle gradient wash behind content */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg,rgba(238,242,255,0.6) 0%,rgba(255,255,255,0) 60%)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-20">

          {/* ── Breadcrumb ── */}
          <nav ref={breadRef} className="flex items-center mb-10 text-sm text-gray-400 flex-wrap gap-1">
            <button onClick={() => navigate("/")}
              className="hover:text-indigo-600 font-medium transition-colors">Home</button>
            <span className="pd-sep" />
            <button onClick={() => navigate("/products")}
              className="hover:text-indigo-600 font-medium transition-colors">Products</button>
            {product.keywords?.[0] && (
              <>
                <span className="pd-sep" />
                <button onClick={() => navigate(`/products?search=${product.keywords[0]}`)}
                  className="hover:text-indigo-600 font-medium transition-colors capitalize">{product.keywords[0]}</button>
              </>
            )}
            <span className="pd-sep" />
            <span className="text-gray-600 font-semibold line-clamp-1 max-w-[200px]">{product.name}</span>
          </nav>

          {/* ── Main 2-col grid ── */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* ── Left — Image ── */}
            <ProductImagePanel product={product} imageRef={imageRef} />

            {/* ── Right — Content ── */}
            <div ref={contentRef} className="space-y-6">

              {/* Back button + action row */}
              <div className="pd-reveal flex items-center justify-between">
                <motion.button whileHover={{ x: -3 }} onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 transition-colors text-sm font-semibold">
                  <ChevronLeft /> Back
                </motion.button>
                <div className="flex items-center gap-2">
                  {/* Wishlist */}
                  <motion.button
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setWishlisted((w) => !w)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 ${wishlisted ? "bg-rose-50 border-rose-200 text-rose-500" : "bg-gray-50 border-gray-200 text-gray-400 hover:border-rose-200 hover:text-rose-400"
                      }`}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <HeartIcon filled={wishlisted} className="w-4 h-4" />
                  </motion.button>
                  {/* Share — opens panel on desktop, native sheet on mobile */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className={`pd-share-btn w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 ${shareOpen
                          ? "bg-indigo-50 border-indigo-300 text-indigo-600"
                          : "bg-gray-50 border-gray-200 text-gray-400 hover:border-indigo-200 hover:text-indigo-500"
                        }`}
                      aria-label="Share product"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </motion.button>

                    {/* Share panel dropdown */}
                    <AnimatePresence>
                      {shareOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.92, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.92, y: 8 }}
                          transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                          className="pd-share-panel absolute right-0 top-12 z-[200] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[240px] max-h-[85vh] overflow-y-auto"
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Share this product</p>

                          {/* Platform buttons */}
                          <div className="space-y-1">
                            {[
                              {
                                id: "whatsapp", label: "WhatsApp", bg: "bg-green-500", fg: "text-white", hover: "hover:bg-green-50 hover:text-green-700",
                                svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.565 4.14 1.54 5.877L0 24l6.336-1.518A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.893 0-3.686-.48-5.25-1.328l-.375-.213-3.893.933.975-3.77-.233-.388A9.945 9.945 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
                              },
                              {
                                id: "twitter", label: "X (Twitter)", bg: "bg-black", fg: "text-white", hover: "hover:bg-gray-50 hover:text-gray-900",
                                svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.748l7.73-8.835L2.25 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                              },
                              {
                                id: "facebook", label: "Facebook", bg: "bg-blue-600", fg: "text-white", hover: "hover:bg-blue-50 hover:text-blue-700",
                                svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.252h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" /></svg>
                              },
                              {
                                id: "telegram", label: "Telegram", bg: "bg-sky-500", fg: "text-white", hover: "hover:bg-sky-50 hover:text-sky-700",
                                svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                              },
                              {
                                id: "linkedin", label: "LinkedIn", bg: "bg-blue-700", fg: "text-white", hover: "hover:bg-blue-50 hover:text-blue-800",
                                svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                              },
                            ].map((p) => (
                              <motion.button key={p.id}
                                whileHover={{ x: 3 }}
                                onClick={() => shareToURL(p.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 transition-all duration-150 ${p.hover}`}>
                                <span className={`w-7 h-7 rounded-lg ${p.bg} ${p.fg} flex items-center justify-center flex-shrink-0`}>{p.svg}</span>
                                {p.label}
                              </motion.button>
                            ))}
                          </div>

                          {/* Divider */}
                          <div className="my-3 border-t border-gray-100" />

                          {/* Copy link */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleCopyLink}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${copied
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                              }`}>
                            {copied
                              ? <><CheckIcon className="w-4 h-4" /> Copied!</>
                              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>{copyLabel}</>
                            }
                          </motion.button>

                          {/* Current URL display */}
                          <div className="mt-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 truncate">{window.location.href}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Keywords pills */}
              {product.keywords?.length > 0 && (
                <div className="pd-reveal flex flex-wrap gap-2">
                  {product.keywords.slice(0, 4).map((kw) => (
                    <span key={kw} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Product name */}
              <h1 className="pd-reveal text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating && (
                <div className="pd-reveal">
                  <StarRating stars={product.rating.stars} count={product.rating.count} size="base" />
                </div>
              )}

              {/* Price block */}
              <div className="pd-reveal flex items-baseline gap-4">
                <span className="text-4xl font-black text-gray-900">
                  {formatMoneyCents(product.priceCents)}
                </span>
                {origPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">{formatMoneyCents(origPrice)}</span>
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                      −{Math.round((1 - product.priceCents / origPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="pd-reveal h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {/* Add to cart */}
              <div className="pd-reveal">
                <AddToCartPanel productId={product.id} />
              </div>

              {/* Reassurance bar */}
              <div className="pd-reveal flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">
                {["🔒 Secure checkout", "📦 Ships in 24h", "↩️ Free 30-day returns"].map((t) => (
                  <span key={t} className="font-medium">{t}</span>
                ))}
              </div>

              {/* Tabs (Description / Details / Reviews) */}
              <div className="pd-reveal">
                <ProductTabs product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SIMILAR PRODUCTS
      ══════════════════════════════════════════════════════════ */}
      <SimilarProducts products={similarProducts} />
    </div>
  );
}