// src/Pages/Products/ProductsPage.jsx
//
// Bugs fixed from original:
//  1. "No products" timer was separate from isLoading, could flash before data arrived —
//     now we only show the empty state when !isLoading AND products.length === 0
//     AND a 2-second grace period has passed (reduced from 3 to feel snappier).
//  2. blackFridayProducts was a function called inline, but also sliced filteredProducts
//     (post-filter) — if the filter had 0 results the deals section showed nothing with
//     no explanation. Now deals use raw products so they always have content.
//  3. Category filter keywords comparison was case-sensitive AND relied on `.keywords`
//     array which may not always match the displayed category name. Now uses flexible
//     substring matching across name + keywords arrays.
//  4. isLoading guard returned early before the grid rendered — skeleton cards now show
//     inline so layout doesn't jump.

import { useState, useMemo, useEffect, useRef } from "react";
import { useFetchData } from "../../Hooks/useFetch";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductsContainer from "./Components/ProuductsContainer";
import ProductCard from "../../Components/Ui/ProductCard";
import AddToCart from "./Components/AddToCart";
import useShowErrorBoundary from "../../Hooks/useShowErrorBoundary";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";

gsap.registerPlugin(ScrollTrigger);

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Electronics", "Kitchen", "Fashion", "Beauty", "Sports", "Toys"];

const CATEGORY_META = {
  All: { emoji: "🛍️", color: "from-indigo-500 to-blue-600" },
  Electronics: { emoji: "📱", color: "from-blue-500 to-cyan-600" },
  Kitchen: { emoji: "🍳", color: "from-amber-500 to-orange-600" },
  Fashion: { emoji: "👗", color: "from-rose-400 to-pink-600" },
  Beauty: { emoji: "💄", color: "from-fuchsia-400 to-purple-600" },
  Sports: { emoji: "🏀", color: "from-lime-500 to-green-600" },
  Toys: { emoji: "🧸", color: "from-yellow-400 to-orange-500" },
};

// Inline page styles (same keyframe names as homepage to stay consistent)
const PAGE_STYLES = `
  @keyframes pp-float-orb{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(20px,-25px)scale(1.04)}66%{transform:translate(-15px,18px)scale(0.97)}}
  .pp-float-orb{animation:pp-float-orb linear infinite}

  @keyframes pp-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .pp-shimmer{
    background:linear-gradient(90deg,#fff 0%,#a5b4fc 30%,#fff 60%,#818cf8 90%);
    background-size:200% auto;-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;animation:pp-shimmer 4s linear infinite;
  }

  @keyframes pp-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .pp-marquee{animation:pp-marquee 28s linear infinite}

  @keyframes pp-pulse-badge{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}70%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
  .pp-pulse-badge{animation:pp-pulse-badge 2s ease-out infinite}

  .pp-card-grid{
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:1.25rem;
  }
  @media(min-width:640px){.pp-card-grid{grid-template-columns:repeat(3,1fr)}}
  @media(min-width:1024px){.pp-card-grid{grid-template-columns:repeat(4,1fr)}}
  @media(min-width:1280px){.pp-card-grid{grid-template-columns:repeat(5,1fr)}}

  /* Horizontal auto-scroll strip */
  @keyframes pp-strip{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .pp-strip{animation:pp-strip 32s linear infinite}
  .pp-strip:hover{animation-play-state:paused}

  /* Spotlight sweep on ad banner */
  @keyframes pp-sweep{0%{left:-80%}100%{left:130%}}
  .pp-sweep::after{content:'';position:absolute;top:0;bottom:0;width:60px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
    animation:pp-sweep 2.8s ease-in-out infinite;pointer-events:none}

  /* Float-up for deal cards */
  @keyframes pp-rise{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}

  /* Glow pulse for ad CTA */
  @keyframes pp-glow{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.5)}60%{box-shadow:0 0 0 14px rgba(99,102,241,0)}}
  .pp-glow{animation:pp-glow 2.4s ease-out infinite}

  /* Ticker */
  @keyframes pp-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .pp-ticker{animation:pp-ticker 20s linear infinite}
  .pp-ticker:hover{animation-play-state:paused}

  /* Slide-in filter drawer */
  @keyframes pp-slide-in{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}
  .pp-filter-open{animation:pp-slide-in .32s cubic-bezier(.32,.72,0,1) forwards}

  /* Blink dot */
  @keyframes pp-blink{0%,100%{opacity:1}50%{opacity:0.3}}
  .pp-blink{animation:pp-blink 1.2s ease-in-out infinite}
`;

// ─── Floating orb background ──────────────────────────────────────────────────
function FloatingOrbs({ dark = false }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w: 500, h: 500, top: "-10%", left: "-8%", delay: 0, dur: 20 },
        { w: 350, h: 350, top: "40%", right: "-6%", delay: 4, dur: 24 },
        { w: 280, h: 280, bottom: "-5%", left: "35%", delay: 8, dur: 18 },
      ].map((o, i) => (
        <div key={i}
          style={{
            width: o.w, height: o.h, top: o.top, left: o.left, right: o.right, bottom: o.bottom,
            animationDelay: `${o.delay}s`, animationDuration: `${o.dur}s`
          }}
          className={`absolute rounded-full blur-3xl pp-float-orb ${dark ? "bg-indigo-900/40" : "bg-gradient-to-br from-blue-400/20 to-indigo-500/20"}`}
        />
      ))}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ label, title, light = false }) {
  return (
    <div className="mb-10">
      <p className={`text-xs font-bold uppercase tracking-[0.3em] mb-2 ${light ? "text-indigo-300" : "text-indigo-500"}`}>{label}</p>
      <h2 className={`text-3xl font-black ${light ? "text-white" : "text-gray-900"}`}>{title}</h2>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ searchTerm, category, onReset }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-5xl mb-6 shadow-lg">
        🔍
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-3">No products found</h3>
      <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
        {searchTerm
          ? `No results for "${searchTerm}"${category !== "All" ? ` in ${category}` : ""}. Try a different search.`
          : `No products in ${category} right now. Try a different category.`}
      </p>
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onReset}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/30">
        Browse All Products
      </motion.button>
    </motion.div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer() {
  const [time, setTime] = useState({ h: 5, m: 48, s: 31 });
  const pad = (n) => String(n).padStart(2, "0");
  useEffect(() => {
    const id = setInterval(() => setTime((p) => {
      let { h, m, s } = p; s--;
      if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 5; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-2">
      {[{ v: time.h, l: "h" }, { v: time.m, l: "m" }, { v: time.s, l: "s" }].map((t, i) => (
        <div key={t.l} className="flex items-center gap-1">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl w-12 h-12 flex items-center justify-center text-white font-black text-xl border border-white/30 shadow-lg">
            {pad(t.v)}
          </div>
          {i < 2 && <span className="text-white/60 font-black text-lg">:</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Hero banner ──────────────────────────────────────────────────────────────
function HeroBanner({ searchTerm, resultCount }) {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(titleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", clearProps: "all" })
      .fromTo(subRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", clearProps: "all" }, "-=0.5");
    return () => tl.kill();
  }, [searchTerm]);

  return (
    <section ref={heroRef} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 text-white py-16 md:py-20 px-8 mb-8">
      <FloatingOrbs />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {searchTerm ? (
          <>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.3em] mb-4">Search Results</p>
            <h1 ref={titleRef} className="text-4xl md:text-5xl font-black mb-3">
              "{searchTerm}"
            </h1>
            <p ref={subRef} className="text-blue-200 text-base">
              {resultCount > 0
                ? <><span className="font-black text-white">{resultCount}</span> products found</>
                : "No products matched your search"
              }
            </p>
          </>
        ) : (
          <>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.3em] mb-4">Curated · Premium · Delivered</p>
            <h1 ref={titleRef} className="text-4xl md:text-6xl font-black mb-3 leading-none">
              <span className="pp-shimmer">Everything</span><br />
              <span className="text-white">You Need,</span><br />
              <span className="pp-shimmer">All in One Place</span>
            </h1>
            <p ref={subRef} className="text-blue-100 text-base mt-4">
              {resultCount.toLocaleString()} premium products · Free shipping over $50
            </p>
          </>
        )}
      </div>

      {/* Social proof pills */}
      <div className="relative z-10 flex flex-wrap gap-2 justify-center mt-8">
        {["⭐ 4.9 Rating", "🚀 Free Shipping", "🔒 Secure Pay", "↩️ Easy Returns"].map((pill) => (
          <span key={pill} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-blue-100 backdrop-blur-sm font-medium">
            {pill}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── Category Filter Bar ──────────────────────────────────────────────────────
function CategoryBar({ selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
      {CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat] || CATEGORY_META.All;
        const isAct = selected === cat;
        return (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${isAct
                ? `bg-gradient-to-r ${meta.color} text-white border-transparent shadow-lg`
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
          >
            <span className="text-base leading-none">{meta.emoji}</span>
            {cat}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Flash Deals Banner ───────────────────────────────────────────────────────
function FlashDealsBanner({ products, isLoading }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => {
      const left = el.querySelectorAll(".pp-fd-left");
      const right = el.querySelector(".pp-fd-right");
      if (left.length)
        gsap.fromTo(left, { x: -50, opacity: 0 },
          {
            x: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: "power3.out", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          });
      if (right)
        gsap.fromTo(right, { x: 50, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.9, ease: "power3.out", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const deals = products.slice(0, 4);

  return (
    <section ref={ref} className="py-12 md:py-16">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 p-8 md:p-12 mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "18px 18px" }} />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="pp-pulse-badge bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full">
                🔥 Live Now
              </span>
            </div>
            <h2 className="pp-fd-left text-4xl md:text-5xl font-black leading-tight">
              Flash Deals<br />
              <span className="text-yellow-300">Up to 70% OFF</span>
            </h2>
            <p className="pp-fd-left mt-3 text-orange-100 max-w-xs text-sm">
              Limited time offers. Grab them before they're gone.
            </p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="pp-fd-left mt-6 bg-white text-red-600 font-black px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition text-sm">
              Shop All Deals →
            </motion.button>
          </div>

          <div className="pp-fd-right flex flex-col items-center gap-2">
            <p className="text-orange-100 text-xs font-bold uppercase tracking-widest">Ends in</p>
            <CountdownTimer />
          </div>
        </div>
      </div>

      {/* Deal product cards */}
      <div className="pp-card-grid">
        <ProductsContainer products={deals} isLoading={isLoading} skeletonCount={4} />
      </div>
    </section>
  );
}

// ─── Products section ─────────────────────────────────────────────────────────
const ProductSection = ({ label, title, products, isLoading, skeletonCount = 8, dark = false, searchTerm, onReset }) => {
  console.log('rerender')
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".pp-reveal");
      if (!cards.length) return;
      gsap.fromTo(cards,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: "power3.out", clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 85%", once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, [isLoading, products]);

  const isEmpty = !isLoading && products.length === 0;

  return (
    <section ref={ref} className={`py-12 md:py-16 relative overflow-hidden rounded-3xl ${dark ? "px-8 md:px-12" : ""}`}
      style={dark ? { background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#1e40af 100%)" } : {}}>
      {dark && <FloatingOrbs dark />}
      <div className="relative z-10">
        <div className="flex items-end justify-between mb-10">
          <SectionHeading label={label} title={title} light={dark} />
          {!isEmpty && (
            <motion.button whileHover={{ x: 4 }}
              className={`text-sm font-bold hidden md:flex items-center gap-1 ${dark ? "text-indigo-300" : "text-indigo-600"}`}>
              View All <span>→</span>
            </motion.button>
          )}
        </div>

        <div className="pp-card-grid">
          {isEmpty ? (
            <EmptyState searchTerm={searchTerm} category="this section" onReset={onReset} />
          ) : (
            <ProductsContainer products={products} isLoading={isLoading} skeletonCount={skeletonCount} />
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <section className="relative overflow-hidden rounded-3xl py-16 px-8 md:px-14"
      style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 50%,#8b5cf6 100%)" }}>
      <FloatingOrbs />
      <div className="absolute w-80 h-80 rounded-full bg-white/5 blur-3xl -top-20 -right-20" />

      <div className="relative z-10 text-center max-w-xl mx-auto">
        <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.3em] mb-3">Exclusive Access</p>
        <h2 className="text-4xl font-black text-white mb-4">Get Deals Before Anyone Else</h2>
        <p className="text-blue-100 mb-8 text-sm leading-relaxed">
          Early access to sales, new arrivals, and member-only offers. No spam, ever.
        </p>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row gap-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/15 border border-white/25 text-white placeholder-white/50 px-5 py-3.5 rounded-2xl text-sm focus:outline-none focus:border-white/60 backdrop-blur-sm transition" />
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => email && setSubmitted(true)}
                className="bg-white text-indigo-700 font-black px-8 py-3.5 rounded-2xl text-sm shadow-lg whitespace-nowrap">
                Subscribe →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">✅</div>
              <p className="font-black text-white text-lg">You're in! Welcome to the club.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}


// ─── Live ticker bar ──────────────────────────────────────────────────────────
function TickerBar() {
  const items = [
    "🔥 Flash Sale — 70% OFF selected items",
    "🚀 Free shipping on orders over $50",
    "⭐ 2 million happy customers and counting",
    "🎁 Gift wrapping available at checkout",
    "💎 Members save an extra 15% — join free",
    "⚡ Same-day dispatch on orders before 2pm",
    "🌍 Shipping to 180+ countries",
    "🔒 Secure, encrypted checkout always",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-900 py-2.5 rounded-2xl">
      <div className="flex whitespace-nowrap pp-ticker gap-0">
        {doubled.map((item, i) => (
          <span key={i} className="text-white/80 text-xs font-semibold tracking-wide px-10 flex items-center gap-2 flex-shrink-0">
            <span className="w-1 h-1 rounded-full bg-indigo-400 inline-block pp-blink" style={{ animationDelay: `${i * 0.1}s` }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Advanced filter panel ────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, products, onClose }) {
  const priceRanges = [
    { label: "Under $10", min: 0, max: 1000 },
    { label: "$10 – $25", min: 1000, max: 2500 },
    { label: "$25 – $50", min: 2500, max: 5000 },
    { label: "$50 – $100", min: 5000, max: 10000 },
    { label: "$100+", min: 10000, max: Infinity },
  ];
  const sortOptions = [
    { value: "default", label: "Relevance" },
    { value: "price-asc", label: "Price: Low → High" },
    { value: "price-desc", label: "Price: High → Low" },
    { value: "rating", label: "Top Rated" },
    { value: "newest", label: "Newest First" },
  ];
  const ratingOptions = [5, 4, 3];

  const activeCount =
    (filters.priceRange !== null ? 1 : 0) +
    (filters.rating !== null ? 1 : 0) +
    (filters.sort !== "default" ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0);

  return (
    <motion.aside
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      className="fixed top-0 left-0 bottom-0 z-[999999999999999999999999999999999999999999999999999999999999999] w-[min(340px,88vw)] bg-white shadow-2xl flex flex-col overflow-hidden "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h3 className="font-black text-gray-900 text-lg">Filters</h3>
          {activeCount > 0 && (
            <p className="text-xs text-indigo-600 font-bold mt-0.5">{activeCount} active</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => onChange({ priceRange: null, rating: null, sort: "default", inStock: false, onSale: false })}
              className="text-xs text-red-500 font-bold hover:text-red-700 transition">
              Clear all
            </motion.button>
          )}
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
        {/* Sort */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Sort By</p>
          <div className="space-y-1.5">
            {sortOptions.map((opt) => (
              <button key={opt.value} onClick={() => onChange({ ...filters, sort: opt.value })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${filters.sort === opt.value
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}>
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${filters.sort === opt.value ? "border-indigo-600" : "border-gray-300"
                  }`}>
                  {filters.sort === opt.value && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Price Range</p>
          <div className="space-y-1.5">
            {priceRanges.map((r, i) => {
              const isAct = filters.priceRange === i;
              return (
                <button key={r.label} onClick={() => onChange({ ...filters, priceRange: isAct ? null : i })}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${isAct ? "bg-blue-50 text-blue-700 font-bold border border-blue-200" : "text-gray-600 hover:bg-gray-50 border border-transparent"
                    }`}>
                  {r.label}
                  {isAct && <span className="text-blue-500 text-xs font-black">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Min. Rating</p>
          <div className="space-y-1.5">
            {ratingOptions.map((r) => (
              <button key={r} onClick={() => onChange({ ...filters, rating: filters.rating === r ? null : r })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${filters.rating === r ? "bg-amber-50 text-amber-700 font-bold border border-amber-200" : "text-gray-600 hover:bg-gray-50 border border-transparent"
                  }`}>
                <span className="flex gap-0.5">
                  {Array(r).fill(0).map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                  {Array(5 - r).fill(0).map((_, i) => <span key={i} className="text-gray-200 text-sm">★</span>)}
                </span>
                {r}+ stars
                {filters.rating === r && <span className="ml-auto text-amber-500 text-xs font-black">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Availability</p>
          <div className="space-y-3">
            {[
              { key: "inStock", label: "In Stock Only", emoji: "📦" },
              { key: "onSale", label: "On Sale", emoji: "🔥" },
            ].map((t) => (
              <div key={t.key} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span>{t.emoji}</span> {t.label}
                </span>
                <button
                  onClick={() => onChange({ ...filters, [t.key]: !filters[t.key] })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${filters[t.key] ? "bg-indigo-600" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${filters[t.key] ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-gray-100">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onClose}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl text-sm shadow-lg shadow-indigo-500/25">
          Show Results
        </motion.button>
      </div>
    </motion.aside>
  );
}

// ─── Filter backdrop ──────────────────────────────────────────────────────────
function FilterBackdrop({ onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[89] bg-black/40 backdrop-blur-sm" />
  );
}

// ─── Active filters bar ───────────────────────────────────────────────────────
function ActiveFiltersBar({ filters, category, onClear, onClearOne }) {
  const PRICE_LABELS = ["Under $10", "$10–$25", "$25–$50", "$50–$100", "$100+"];
  const SORT_LABELS = { "price-asc": "Price ↑", "price-desc": "Price ↓", "rating": "Top Rated", "newest": "Newest", "default": null };
  const chips = [];
  if (category !== "All") chips.push({ id: "cat", label: category });
  if (filters.priceRange !== null) chips.push({ id: "price", label: PRICE_LABELS[filters.priceRange] });
  if (filters.rating !== null) chips.push({ id: "rating", label: `${filters.rating}★+` });
  if (SORT_LABELS[filters.sort]) chips.push({ id: "sort", label: SORT_LABELS[filters.sort] });
  if (filters.inStock) chips.push({ id: "stock", label: "In Stock" });
  if (filters.onSale) chips.push({ id: "sale", label: "On Sale" });

  if (!chips.length) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="flex flex-wrap gap-2 items-center">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active:</span>
      {chips.map((chip) => (
        <motion.button key={chip.id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          whileHover={{ scale: 1.05 }} onClick={() => onClearOne(chip.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
          {chip.label}
          <span className="text-current opacity-60 font-black">×</span>
        </motion.button>
      ))}
      <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-500 font-bold transition-colors ml-1">
        Clear all
      </button>
    </motion.div>
  );
}

// ─── Ad Banner 1 — full bleed spotlight ──────────────────────────────────────
function AdBannerSpotlight() {
  const ref = useRef(null);
  const textRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });
      tl.fromTo(textRef.current, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "expo.out", clearProps: "all" })
        .fromTo(imgRef.current, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "expo.out", clearProps: "all" }, "-=0.8");
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden rounded-3xl pp-sweep"
      style={{ background: "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#1a0533 100%)", minHeight: 320 }}>

      {/* Animated dot grid bg */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }} />

      {/* Orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative z-10 grid md:grid-cols-2 gap-0 items-center min-h-[320px]">
        {/* Left */}
        <div ref={textRef} className="p-10 md:p-14 flex flex-col justify-center">
          <span className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full w-fit mb-6">
            <span className="pp-blink w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
            Member Exclusive
          </span>
          <h3 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Members Save<br />
            <span className="text-transparent bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text">
              Extra 15%
            </span><br />
            on Everything
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
            Join ShopEase Premium for free and unlock exclusive pricing, early access to drops, and same-day delivery.
          </p>
          <div className="flex flex-wrap gap-3">
            <motion.button whileHover={{ scale: 1.06, boxShadow: "0 0 40px rgba(251,191,36,0.4)" }} whileTap={{ scale: 0.97 }}
              className="pp-glow bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black px-8 py-3.5 rounded-2xl text-sm shadow-xl">
              Join Free Now ✦
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="border border-white/20 text-white/80 px-8 py-3.5 rounded-2xl text-sm font-semibold hover:bg-white/8 transition backdrop-blur-sm">
              Learn More
            </motion.button>
          </div>
        </div>

        {/* Right — animated benefit cards */}
        <div ref={imgRef} className="hidden md:flex flex-col gap-3 p-10 justify-center">
          {[
            { icon: "💎", title: "15% off everything", sub: "Every single product, every day" },
            { icon: "⚡", title: "Same-day delivery", sub: "Order before 2pm — arrives today" },
            { icon: "🎁", title: "Exclusive drops first", sub: "48h early access to new arrivals" },
            { icon: "🔄", title: "Free returns forever", sub: "No time limit, no questions asked" },
          ].map((b, i) => (
            <motion.div key={b.title}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.55, ease: "power3.out" }}
              className="flex items-center gap-4 bg-white/8 border border-white/12 backdrop-blur-sm rounded-2xl px-5 py-3.5 hover:bg-white/12 transition-colors group">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{b.icon}</span>
              <div>
                <p className="text-white font-bold text-sm">{b.title}</p>
                <p className="text-gray-400 text-xs">{b.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Ad Banner 2 — horizontal scroll promo strip ──────────────────────────────
// ─── Shared draggable strip hook ─────────────────────────────────────────────
// Drives BOTH AdBannerStrip and MarqueeProductStrip.
// Auto-scrolls via rAF; dragging pauses auto-scroll and applies momentum on release.
function useDraggableStrip() {
  const trackRef = useRef(null);
  const wrapperRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);       // pointer X at drag start
  const scrollStart = useRef(0);       // currentX at drag start
  const currentX = useRef(0);       // current translate X (px)
  const velocity = useRef(0);       // px/frame for momentum
  const lastX = useRef(0);

  const getMax = () => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    if (!track || !wrapper) return 0;
    return -(track.scrollWidth / 2); // half because we doubled items
  };

  // Auto-scroll loop
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf;
    const SPEED = 0.7; // px / frame

    const step = () => {
      if (!isDragging.current) {
        currentX.current -= SPEED;
        // Seamless loop: when we've scrolled one full copy, reset to 0
        if (currentX.current <= getMax()) currentX.current = 0;
        gsap.set(track, { x: currentX.current });
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Drag (mouse + touch)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const clamp = (v) => Math.min(0, Math.max(getMax() * 2, v));

    const onDown = (e) => {
      isDragging.current = true;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      startX.current = cx;
      scrollStart.current = currentX.current;
      lastX.current = cx;
      velocity.current = 0;
      track.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (!isDragging.current) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      velocity.current = cx - lastX.current;
      lastX.current = cx;
      const delta = cx - startX.current;
      currentX.current = clamp(scrollStart.current + delta);
      gsap.set(track, { x: currentX.current });
    };
    const onUp = (e) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      track.style.cursor = "grab";
      // Momentum coast
      const coast = velocity.current * 5;
      const target = clamp(currentX.current + coast);
      currentX.current = target;
      gsap.to(track, { x: target, duration: 0.55, ease: "power3.out" });
    };

    track.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    track.addEventListener("touchstart", onDown, { passive: true });
    track.addEventListener("touchmove", onMove, { passive: true });
    track.addEventListener("touchend", onUp);
    track.addEventListener("dragstart", (e) => e.preventDefault());

    return () => {
      track.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      track.removeEventListener("touchstart", onDown);
      track.removeEventListener("touchmove", onMove);
      track.removeEventListener("touchend", onUp);
    };
  }, []);

  return { trackRef, wrapperRef };
}

// ─── Ad Banner 2 — draggable scrolling promo strip ───────────────────────────
function AdBannerStrip() {
  const { trackRef, wrapperRef } = useDraggableStrip();

  const promos = [
    { tag: "NEW", label: "Summer Collection '25", emoji: "☀️", gradient: "from-amber-400 to-orange-500" },
    { tag: "HOT", label: "Sneaker Drop — Limited", emoji: "👟", gradient: "from-rose-400 to-pink-600" },
    { tag: "DEAL", label: "Tech Clearance Sale", emoji: "📱", gradient: "from-blue-500 to-cyan-500" },
    { tag: "NEW", label: "Kitchen Essentials Pack", emoji: "🍳", gradient: "from-emerald-400 to-teal-500" },
    { tag: "HOT", label: "Beauty Bestsellers Box", emoji: "💄", gradient: "from-fuchsia-400 to-purple-600" },
    { tag: "DEAL", label: "Sports & Fitness Bundle", emoji: "🏋️", gradient: "from-lime-400 to-green-500" },
  ];
  const doubled = [...promos, ...promos];

  return (
    <section className="overflow-hidden" ref={wrapperRef}>
      <div
        ref={trackRef}
        className="flex gap-4 will-change-transform select-none"
        style={{ width: "max-content", cursor: "grab" }}
      >
        {doubled.map((p, i) => (
          <div key={i}
            className={`flex-shrink-0 w-52 h-48 bg-gradient-to-br ${p.gradient} rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-3xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-widest bg-black/20 text-white px-2.5 py-1 rounded-full">{p.tag}</span>
            </div>
            <div className="relative z-10 pointer-events-none">
              <span className="text-5xl block mb-2">{p.emoji}</span>
              <p className="text-white font-black text-sm leading-tight">{p.label}</p>
              <p className="text-white/70 text-xs mt-1">Shop now →</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Ad Banner 3 — split urgent deal ─────────────────────────────────────────
function AdBannerUrgent({ featuredProduct }) {
  const ref = useRef(null);
  const [time, setTime] = useState({ h: 2, m: 17, s: 44 });
  const pad = (n) => String(n).padStart(2, "0");

  useEffect(() => {
    const id = setInterval(() => setTime((p) => {
      let { h, m, s } = p; s--;
      if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 2; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll(".pp-urgent-item");
      if (!items.length) return;
      gsap.fromTo(items,
        { y: 40, opacity: 0, scale: 0.94 },
        {
          y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.75, ease: "back.out(1.6)", clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 84%", once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg,#dc2626 0%,#ea580c 50%,#d97706 100%)" }}>
      {/* Hatching texture */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "16px 16px" }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-0">
        {/* Left */}
        <div className="flex-1 p-10 md:p-14 text-white">
          <div className="pp-urgent-item flex items-center gap-3 mb-5">
            <span className="pp-pulse-badge bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30">
              🔴 LIVE DEAL
            </span>
            <div className="flex gap-1.5 items-center">
              {[{ v: time.h, l: "h" }, { v: time.m, l: "m" }, { v: time.s, l: "s" }].map((t, i) => (
                <div key={t.l} className="flex items-center gap-1">
                  <span className="bg-black/30 backdrop-blur-sm text-white font-black text-lg px-2.5 py-1 rounded-lg min-w-[42px] text-center border border-white/20">
                    {pad(t.v)}
                  </span>
                  {i < 2 && <span className="text-white/60 font-black">:</span>}
                </div>
              ))}
            </div>
          </div>

          <h3 className="pp-urgent-item text-5xl font-black leading-tight mb-4">
            Today Only<br />
            <span className="text-yellow-300">70% OFF</span>
          </h3>
          <p className="pp-urgent-item text-orange-100 text-sm leading-relaxed mb-2">
            Our biggest single-day sale. Hundreds of products slashed to their lowest prices ever.
          </p>

          {/* Stock bar */}
          <div className="pp-urgent-item mt-6">
            <div className="flex justify-between text-xs text-orange-200 mb-1.5">
              <span>🔥 Selling fast</span><span>68 sold · 32 left</span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "68%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "power3.out" }}
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full"
              />
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
            className="pp-urgent-item mt-8 bg-white text-red-600 font-black px-10 py-4 rounded-2xl text-sm shadow-2xl hover:shadow-white/20 transition">
            Grab the Deal →
          </motion.button>
        </div>

        {/* Right — product or gradient visual */}
        <div className="md:w-72 md:self-stretch relative overflow-hidden hidden md:block">
          {featuredProduct?.image ? (
            <img src={featuredProduct.image} alt={featuredProduct?.name}
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500 hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[120px] select-none" style={{ minHeight: 320 }}>
              🛍️
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            {featuredProduct && (
              <>
                <p className="font-black text-xl">{formatMoneyCents(featuredProduct.priceCents)}</p>
                <p className="text-white/70 text-xs line-through">{formatMoneyCents(Math.round(featuredProduct.priceCents * 1.7))}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Under budget section (price-segmented cards) ─────────────────────────────
function UnderBudgetSection({ products, isLoading }) {
  const tiers = [
    { label: "Under $10", max: 1000, gradient: "from-emerald-400 to-teal-500", emoji: "💚" },
    { label: "Under $25", max: 2500, gradient: "from-blue-400 to-indigo-500", emoji: "💙" },
    { label: "Under $50", max: 5000, gradient: "from-violet-400 to-purple-500", emoji: "💜" },
  ];
  const [activeTier, setActiveTier] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".pp-budget-card");
      if (!cards.length) return;
      gsap.fromTo(cards,
        { y: 35, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.65, ease: "back.out(1.5)", clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 84%", once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, [isLoading, activeTier]);

  const tier = tiers[activeTier];
  const tierProducts = isLoading ? [] : products.filter((p) => p.priceCents <= tier.max).slice(0, 4);

  return (
    <section ref={ref} className="py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500 mb-1">Shop Smart</p>
          <h2 className="text-3xl font-black text-gray-900">Deals Within Your Budget</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tiers.map((t, i) => (
            <motion.button key={t.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTier(i)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${activeTier === i
                  ? `bg-gradient-to-r ${t.gradient} text-white shadow-md`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
              {t.emoji} {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTier}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="pp-card-grid">
          {isLoading
            ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-md animate-pulse">
                <div className="bg-gray-200" style={{ aspectRatio: "4/3" }} />
                <div className="p-4 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-8 bg-gray-100 rounded-2xl mt-2" /></div>
              </div>
            ))
            : tierProducts.length > 0
              ? tierProducts.map((p) => (
                <div key={p.id} className="pp-budget-card flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 transition-shadow duration-300">
                  <div className="flex-1"><ProductCard product={p} /></div>
                  <div className="px-4 pb-4"><AddToCart productId={p.id} /></div>
                </div>
              ))
              : (
                <div className="col-span-full text-center py-16 text-gray-400">
                  <div className="text-4xl mb-3">{tier.emoji}</div>
                  <p className="font-semibold">No products {tier.label.toLowerCase()} right now</p>
                </div>
              )
          }
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ─── Trending tags cloud ──────────────────────────────────────────────────────
function TrendingTagsSection({ onCategoryChange }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => {
      const tags = el.querySelectorAll(".pp-tag");
      if (!tags.length) return;
      gsap.fromTo(tags,
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, stagger: { amount: 0.6, from: "random" }, duration: 0.55, ease: "back.out(2)", clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 86%", once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const tags = [
    { label: "#WatchOfTheYear", cat: "Electronics", hot: true },
    { label: "#SummerDrop", cat: "Fashion", hot: false },
    { label: "#KitchenUpgrade", cat: "Kitchen", hot: false },
    { label: "#BeautyEssentials", cat: "Beauty", hot: true },
    { label: "#SportsLife", cat: "Sports", hot: false },
    { label: "#TechDeals", cat: "Electronics", hot: true },
    { label: "#FashionForward", cat: "Fashion", hot: false },
    { label: "#GiftIdeas", cat: "All", hot: false },
    { label: "#ToyTime", cat: "Toys", hot: false },
    { label: "#HomeGlow", cat: "Kitchen", hot: true },
    { label: "#NewArrivals", cat: "All", hot: false },
    { label: "#TopRated", cat: "All", hot: true },
  ];

  return (
    <section ref={ref} className="py-10 bg-gray-50 rounded-3xl px-8">
      <div className="flex items-center gap-3 mb-6">
        <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Trending Now</p>
        <span className="pp-blink w-2 h-2 rounded-full bg-red-500 inline-block" />
      </div>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <motion.button key={tag.label} whileHover={{ scale: 1.08, y: -3 }} whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(tag.cat)}
            className={`pp-tag px-4 py-2.5 rounded-full text-sm font-bold border transition-all duration-200 ${tag.hot
                ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border-indigo-200 hover:border-indigo-400"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}>
            {tag.hot && <span className="text-orange-400 mr-1 text-xs">🔥</span>}
            {tag.label}
          </motion.button>
        ))}
      </div>
    </section>
  );
}

// ─── Marquee product strip (continuous scroll) ────────────────────────────────
function MarqueeProductStrip({ products, title, label }) {
  const { trackRef, wrapperRef } = useDraggableStrip();
  const doubled = [...products, ...products];
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500 mb-1">{label}</p>
        <h2 className="text-3xl font-black text-gray-900">{title}</h2>
        <p className="text-sm text-gray-400 mt-1">← Drag to browse →</p>
      </div>
      <div ref={wrapperRef} className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-4 will-change-transform select-none"
          style={{ width: "max-content", cursor: "grab" }}
        >
          {doubled.map((p, i) => (
            <div key={i} className="flex-shrink-0 w-52 flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="flex-1"><ProductCard product={p} /></div>
              <div className="px-3 pb-3"><AddToCart productId={p.id} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Bento product grid section ───────────────────────────────────────────────
function BentoProductSection({ products, isLoading }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading) return;
    const t = setTimeout(() => {
      const cells = el.querySelectorAll(".pp-bento-cell");
      if (!cells.length) return;
      gsap.fromTo(cells,
        { scale: 0.88, opacity: 0 },
        {
          scale: 1, opacity: 1, stagger: { amount: 0.7, from: "start" }, duration: 0.8,
          ease: "power3.out", clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 83%", once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, [isLoading, products]);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-3 grid-rows-2 gap-4" style={{ gridTemplateRows: "220px 220px" }}>
          {Array(5).fill(0).map((_, i) => <div key={i} className="bg-gray-100 rounded-3xl animate-pulse" style={i === 0 ? { gridColumn: "span 2", gridRow: "span 2" } : {}} />)}
        </div>
      </section>
    );
  }

  const [p0, p1, p2, p3, p4] = products;

  const BentoCard = ({ product, className = "" }) => {
    if (!product) return <div className={`${className} bg-gray-100 rounded-3xl`} />;
    return (
      <motion.div whileHover={{ scale: 1.02 }}
        className={`pp-bento-cell relative group overflow-hidden rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 ${className}`}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600 px-2.5 py-1 rounded-full">New</div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <p className="font-bold text-sm line-clamp-1 mb-1">{product.name}</p>
          <div className="flex items-center justify-between">
            <p className="font-black text-lg">{formatMoneyCents(product.priceCents)}</p>
            <motion.button whileTap={{ scale: 0.9 }}
              className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              + Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section ref={ref} className="py-12">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500 mb-1">Curated</p>
          <h2 className="text-3xl font-black text-gray-900">Top Picks for You</h2>
        </div>
        <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">
          View All →
        </motion.button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4" style={{ gridTemplateRows: "220px 220px" }}>
        <BentoCard product={p0} className="col-span-2 row-span-2" />
        <BentoCard product={p1} />
        <BentoCard product={p2} />
        <BentoCard product={p3} />
        <BentoCard product={p4} />
      </div>
    </section>
  );
}

// ─── Recently added ribbon ────────────────────────────────────────────────────
function RecentlyAddedSection({ products, isLoading }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".pp-recent-card");
      if (!cards.length) return;
      gsap.fromTo(cards,
        { x: 40, opacity: 0 },
        {
          x: 0, opacity: 1, stagger: 0.09, duration: 0.7, ease: "power3.out", clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 84%", once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, [isLoading, products]);

  return (
    <section ref={ref} className="py-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 px-8 md:px-12">
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <FloatingOrbs dark />

      <div className="relative z-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pp-blink w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Just Landed</p>
            </div>
            <h2 className="text-3xl font-black text-white">New Arrivals</h2>
          </div>
          <motion.button whileHover={{ x: 4 }} className="text-indigo-300 font-bold text-sm hidden md:flex items-center gap-1">
            See All →
          </motion.button>
        </div>

        <div className="pp-card-grid">
          {isLoading
            ? Array(4).fill(0).map((_, i) => <div key={i} className="h-72 bg-white/10 rounded-3xl animate-pulse" />)
            : products.map((p) => (
              <div key={p.id} className="pp-recent-card flex flex-col bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300 group">
                <div className="flex-1">
                  <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-emerald-400 text-gray-900 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">New</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{p.name}</h3>
                    <p className="font-black text-white text-lg">{formatMoneyCents(p.priceCents)}</p>
                  </div>
                </div>
                <div className="px-4 pb-4"><AddToCart productId={p.id} /></div>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
}

// Need ProductCard and AddToCart available in scope — import at top of file

// ─── Loading skeleton page ────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="rounded-3xl bg-gradient-to-br from-blue-200 to-indigo-200 h-52" />
      <div className="flex gap-2">
        {Array(7).fill(0).map((_, i) => <div key={i} className="h-10 w-24 bg-gray-200 rounded-full flex-shrink-0" />)}
      </div>
      <div className="pp-card-grid">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-md">
            <div className="bg-gray-200" style={{ aspectRatio: "4/3" }} />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded-full w-3/4" />
              <div className="h-3 bg-gray-100 rounded-full w-1/2" />
              <div className="h-10 bg-gray-100 rounded-2xl mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  console.log('rerender')


  const url = searchTerm ? `/api/products?search=${searchTerm}` : "/api/products";
  const { fetchedData, isLoading, error } = useFetchData(url);
  useShowErrorBoundary(error);

  const products = useMemo(() => fetchedData || [], [fetchedData]);

  // ── Grace period before showing empty state ──
  const [showEmpty, setShowEmpty] = useState(false);
  useEffect(() => {
    let t;
    if (!isLoading && products.length === 0) {
      t = setTimeout(() => setShowEmpty(true), 2000);
    } else {
      setShowEmpty(false);
    }
    return () => clearTimeout(t);
  }, [isLoading, products]);

  // ── Category filter ──
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ── Advanced filters state ──
  const PRICE_RANGES = [
    { min: 0, max: 1000 }, { min: 1000, max: 2500 }, { min: 2500, max: 5000 },
    { min: 5000, max: 10000 }, { min: 10000, max: Infinity },
  ];
  const [filters, setFilters] = useState({ priceRange: null, rating: null, sort: "default", inStock: false, onSale: false });
  const [filterOpen, setFilterOpen] = useState(false);

  // Close filter panel on route change
  useEffect(() => { setFilterOpen(false); }, [searchTerm]);

  // Flexible matching across name + keywords
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    let result = [...products];

    // Category
    if (selectedCategory !== "All") {
      const q = selectedCategory.toLowerCase();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        (Array.isArray(p.keywords) && p.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    }

    // Price range
    if (filters.priceRange !== null) {
      const range = PRICE_RANGES[filters.priceRange];
      result = result.filter((p) => p.priceCents >= range.min && p.priceCents < range.max);
    }

    // Rating
    if (filters.rating !== null) {
      result = result.filter((p) => (p.rating?.stars || 0) >= filters.rating);
    }

    // In stock (mock — all products assumed in stock, filter by priceCents > 0)
    if (filters.inStock) {
      result = result.filter((p) => p.priceCents > 0);
    }

    // On sale (mock — items under $20 treated as "on sale")
    if (filters.onSale) {
      result = result.filter((p) => p.priceCents < 2000);
    }

    // Sort
    if (filters.sort === "price-asc") result.sort((a, b) => a.priceCents - b.priceCents);
    if (filters.sort === "price-desc") result.sort((a, b) => b.priceCents - a.priceCents);
    if (filters.sort === "rating") result.sort((a, b) => (b.rating?.stars || 0) - (a.rating?.stars || 0));
    if (filters.sort === "newest") result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return result;
  }, [products, selectedCategory, filters]);

  // Product slices — flash deals always use raw products
  const flashDeals = products.slice(0, 4);
  const bestSellers = filteredProducts.slice(0, 10);
  const allProducts = filteredProducts;
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 6);
  const marqueeProducts = products.slice(0, 8);
  const bentoProducts = filteredProducts.slice(0, 5);
  const featuredDeal = products[2] || null;

  const resetFilter = () => { setSelectedCategory("All"); setFilters({ priceRange: null, rating: null, sort: "default", inStock: false, onSale: false }); };

  const clearOneFilter = (id) => {
    if (id === "cat") setSelectedCategory("All");
    if (id === "price") setFilters((f) => ({ ...f, priceRange: null }));
    if (id === "rating") setFilters((f) => ({ ...f, rating: null }));
    if (id === "sort") setFilters((f) => ({ ...f, sort: "default" }));
    if (id === "stock") setFilters((f) => ({ ...f, inStock: false }));
    if (id === "sale") setFilters((f) => ({ ...f, onSale: false }));
  };

  const activeFilterCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (filters.priceRange !== null ? 1 : 0) +
    (filters.rating !== null ? 1 : 0) +
    (filters.sort !== "default" ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0);

  // Full-page loading skeleton
  if (isLoading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <style>{PAGE_STYLES}</style>
        <PageSkeleton />
      </div>
    );
  }

  // Empty state (after grace period)
  if (!isLoading && products.length === 0 && showEmpty) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <style>{PAGE_STYLES}</style>
        <div className="text-6xl mb-6">📦</div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">No products available</h1>
        <p className="text-gray-400">Check back soon — we're restocking!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 mb-12 overflow-x-hidden mt-12">
      <style>{PAGE_STYLES}</style>

      {/* Filter panel + backdrop */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <FilterBackdrop onClose={() => setFilterOpen(false)} />
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              products={products}
              onClose={() => setFilterOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Ticker */}
      <TickerBar />

      {/* Hero */}
      <HeroBanner searchTerm={searchTerm} resultCount={filteredProducts.length} />

      {/* Category bar + filter trigger */}
      <section className="space-y-3">
        <div className="flex gap-3 items-center">
          {/* Filter button */}
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setFilterOpen(true)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border transition-all duration-200 ${activeFilterCount > 0
                ? "bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/25"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-indigo-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </motion.button>
          {/* Category scroll */}
          <div className="flex-1 overflow-x-auto">
            <CategoryBar selected={selectedCategory} onChange={setSelectedCategory} />
          </div>
        </div>

        {/* Active filter chips */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <ActiveFiltersBar
              filters={filters}
              category={selectedCategory}
              onClear={resetFilter}
              onClearOne={clearOneFilter}
            />
          )}
        </AnimatePresence>
      </section>

      {/* Trending tags */}
      {!searchTerm && <TrendingTagsSection onCategoryChange={setSelectedCategory} />}

      {/* Flash Deals */}
      {!searchTerm && <FlashDealsBanner products={flashDeals} isLoading={isLoading} />}

      {/* Ad — Spotlight */}
      {!searchTerm && <AdBannerSpotlight />}

      {/* Best Sellers */}
      <ProductSection
        label="Fan Favourites"
        title="Best Sellers"
        products={bestSellers}
        isLoading={isLoading}
        skeletonCount={8}
        searchTerm={searchTerm}
        onReset={resetFilter}
      />

      {/* Under budget picks */}
      {!searchTerm && <UnderBudgetSection products={products} isLoading={isLoading} />}

      {/* Ad — Urgent deal */}
      {!searchTerm && <AdBannerUrgent featuredProduct={featuredDeal} />}

      {/* Bento grid picks */}
      {!searchTerm && <BentoProductSection products={bentoProducts} isLoading={isLoading} />}

      {/* Ad — Scrolling promo strip */}
      {!searchTerm && <AdBannerStrip />}

      {/* Continuous-scroll marquee strip */}
      {!isLoading && marqueeProducts.length > 0 && (
        <MarqueeProductStrip
          products={marqueeProducts}
          title="You Might Also Like"
          label="Recommendations"
        />
      )}

      {/* New Arrivals — dark */}
      <RecentlyAddedSection products={newArrivals} isLoading={isLoading} />

      {/* All Products */}
      <ProductSection
        label={selectedCategory === "All" ? "Browse Everything" : `Showing: ${selectedCategory}`}
        title={selectedCategory === "All" ? "All Products" : selectedCategory}
        products={allProducts}
        isLoading={isLoading}
        skeletonCount={10}
        dark
        searchTerm={searchTerm}
        onReset={resetFilter}
      />

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}