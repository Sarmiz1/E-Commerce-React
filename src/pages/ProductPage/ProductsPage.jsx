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
import useShowErrorBoundary from "../../Hooks/useShowErrorBoundary";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";


gsap.registerPlugin(ScrollTrigger);

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Electronics", "Kitchen", "Fashion", "Beauty", "Sports", "Toys"];

const CATEGORY_META = {
  All:         { emoji: "🛍️", color: "from-indigo-500 to-blue-600" },
  Electronics: { emoji: "📱", color: "from-blue-500 to-cyan-600" },
  Kitchen:     { emoji: "🍳", color: "from-amber-500 to-orange-600" },
  Fashion:     { emoji: "👗", color: "from-rose-400 to-pink-600" },
  Beauty:      { emoji: "💄", color: "from-fuchsia-400 to-purple-600" },
  Sports:      { emoji: "🏀", color: "from-lime-500 to-green-600" },
  Toys:        { emoji: "🧸", color: "from-yellow-400 to-orange-500" },
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
`;

// ─── Floating orb background ──────────────────────────────────────────────────
function FloatingOrbs({ dark = false }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w:500, h:500, top:"-10%", left:"-8%",   delay:0,  dur:20 },
        { w:350, h:350, top:"40%",  right:"-6%",  delay:4,  dur:24 },
        { w:280, h:280, bottom:"-5%", left:"35%", delay:8,  dur:18 },
      ].map((o,i) => (
        <div key={i}
          style={{ width:o.w, height:o.h, top:o.top, left:o.left, right:o.right, bottom:o.bottom,
            animationDelay:`${o.delay}s`, animationDuration:`${o.dur}s` }}
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
  const heroRef  = useRef(null);
  const titleRef = useRef(null);
  const subRef   = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(titleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", clearProps: "all" })
      .fromTo(subRef.current,   { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", clearProps: "all" }, "-=0.5");
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
        const meta  = CATEGORY_META[cat] || CATEGORY_META.All;
        const isAct = selected === cat;
        return (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${
              isAct
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
      const left  = el.querySelectorAll(".pp-fd-left");
      const right = el.querySelector(".pp-fd-right");
      if (left.length)
        gsap.fromTo(left, { x: -50, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: "power3.out", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      if (right)
        gsap.fromTo(right, { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, ease: "power3.out", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 85%", once: true } });
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
function ProductSection({ label, title, products, isLoading, skeletonCount = 8, dark = false, searchTerm, onReset }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".pp-reveal");
      if (!cards.length) return;
      gsap.fromTo(cards,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: "power3.out", clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 85%", once: true } });
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
  const [email, setEmail]         = useState("");
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
  const searchTerm     = searchParams.get("search") || "";

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

  // BUG FIX: flexible matching — checks name AND keywords (case-insensitive substring)
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    if (selectedCategory === "All") return products;
    const q = selectedCategory.toLowerCase();
    return products.filter((p) => {
      const nameMatch    = p.name?.toLowerCase().includes(q);
      const keywordMatch = Array.isArray(p.keywords) && p.keywords.some((k) => k.toLowerCase().includes(q));
      return nameMatch || keywordMatch;
    });
  }, [products, selectedCategory]);

  // Product slices for sections
  // BUG FIX: flash deals use raw products (not filtered) so they always show
  const flashDeals   = products.slice(0, 4);
  const bestSellers  = filteredProducts.slice(0, 10);
  const allProducts  = filteredProducts;

  const resetFilter = () => setSelectedCategory("All");

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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 mb-12 mt-12">
      <style>{PAGE_STYLES}</style>

      {/* Hero */}
      <HeroBanner searchTerm={searchTerm} resultCount={filteredProducts.length} />

      {/* Category filter */}
      <section>
        <CategoryBar selected={selectedCategory} onChange={setSelectedCategory} />
      </section>

      {/* Flash Deals — always from raw products so never empty when filtered */}
      {!searchTerm && (
        <FlashDealsBanner products={flashDeals} isLoading={isLoading} />
      )}

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

      {/* All Products — dark section */}
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
