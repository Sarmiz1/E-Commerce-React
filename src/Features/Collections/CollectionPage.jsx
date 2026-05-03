import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Link, useLoaderData, useNavigation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { useTheme } from "../../store/useThemeStore";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import ProductCard from "../Product/Components/ProductCard";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import { useCompare } from "../Product/Hooks/useCompare";

// ─── Utility ──────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

function filterProducts(products, config) {
  if (!products?.length) return [];
  let filtered = [...products];

  // Category keyword match
  if (config.keywords?.length) {
    filtered = filtered.filter((p) =>
      config.keywords.some((kw) =>
        (p.keywords || []).some((pk) => pk.toLowerCase().includes(kw.toLowerCase())) ||
        (p.category || "").toLowerCase().includes(kw.toLowerCase()) ||
        (p.name || "").toLowerCase().includes(kw.toLowerCase())
      )
    );
  }

  // Special filters
  if (config.onSale) filtered = filtered.filter((p) => p.compare_at_price_cents && p.compare_at_price_cents > p.price_cents);
  if (config.inStock) filtered = filtered.filter((p) => p.stock_quantity > 0);
  if (config.sortByNew) filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (config.sortByRating) filtered = [...filtered].sort((a, b) => (b.rating_stars || 0) - (a.rating_stars || 0));
  if (config.minRating) filtered = filtered.filter((p) => (p.rating_stars || 0) >= config.minRating);
  if (config.maxPrice) filtered = filtered.filter((p) => p.price_cents <= config.maxPrice * 100);

  // Fallback: if too few, loosen to show at least something
  if (filtered.length < 4 && config.keywords?.length) {
    const loose = products.filter((p) =>
      config.keywords.some((kw) => JSON.stringify(p).toLowerCase().includes(kw.toLowerCase()))
    );
    if (loose.length > filtered.length) filtered = loose;
  }

  // Final fallback — just show all
  if (filtered.length === 0) filtered = products.slice(0, PAGE_SIZE);

  return filtered;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 40);
    const id = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

// ─── Particle Burst ───────────────────────────────────────────────────────────
function Particles({ accent }) {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 3,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: accent, opacity: 0.3 }}
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.5, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function CollectionHero({ config, count, isDark, colors }) {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(".col-hero-badge", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.4)" });
    gsap.fromTo(".col-hero-title", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, delay: 0.2, ease: "expo.out" });
    gsap.fromTo(".col-hero-sub", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.45, ease: "expo.out" });
    gsap.fromTo(".col-hero-stats", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.65, stagger: 0.1, ease: "expo.out" });
  }, []);

  return (
    <div ref={heroRef} className="relative overflow-hidden" style={{ minHeight: 360, background: config.heroBg || (isDark ? "#0E0E10" : "#0E0E10") }}>
      <Particles accent={config.accent} />

      {/* Gradient overlays */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${config.accent}22 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: `linear-gradient(to top, ${isDark ? colors.surface.primary : colors.surface.primary}, transparent)` }} />

      {/* Animated accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(to right, transparent, ${config.accent}, transparent)` }}
        animate={{ scaleX: [0, 1, 0], x: ["-100%", "0%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-screen-xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          className="col-hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-6 border"
          style={{ background: `${config.accent}18`, color: config.accent, borderColor: `${config.accent}40` }}
        >
          <span className="text-base">{config.icon}</span>
          {config.badge || config.label}
        </motion.div>

        {/* Title */}
        <h1 className="col-hero-title font-black leading-tight text-white mb-4" style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)", letterSpacing: "-0.03em" }}>
          {config.title.split(" ").map((word, i) => (
            <span key={i} style={{ color: i === config.accentWordIndex ? config.accent : "white" }}>{word} </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="col-hero-sub text-sm md:text-base max-w-lg mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          {config.subtitle}
        </p>

        {/* Stats Row */}
        <div className="col-hero-stats flex items-center gap-8 flex-wrap justify-center">
          <div className="text-center">
            <div className="text-2xl font-black text-white"><AnimatedCount value={count} /></div>
            <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: config.accent }}>Products</div>
          </div>
          {config.stats?.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sort Bar ────────────────────────────────────────────────────────────────
const SORTS = [
  { value: "default", label: "Best Match" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

function sortProducts(products, sort) {
  const p = [...products];
  if (sort === "price-asc") return p.sort((a, b) => a.price_cents - b.price_cents);
  if (sort === "price-desc") return p.sort((a, b) => b.price_cents - a.price_cents);
  if (sort === "rating") return p.sort((a, b) => (b.rating_stars || 0) - (a.rating_stars || 0));
  if (sort === "newest") return p.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return p;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CollectionPage({ config }) {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const allProducts = useLoaderData() || [];
  const isLoading = navigation.state === "loading";

  const [sort, setSort] = useState("default");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const { compareList, showCompare, setShowCompare, toggleCompare, removeCompare, clearCompare } = useCompare();

  const gridRef = useRef(null);

  const baseFiltered = useMemo(() => filterProducts(Array.isArray(allProducts) ? allProducts : [], config), [allProducts, config]);
  const sorted = useMemo(() => sortProducts(baseFiltered, sort), [baseFiltered, sort]);
  const visible = sorted.slice(0, visibleCount);

  // GSAP stagger on mount / sort change
  useEffect(() => {
    if (!gridRef.current || isLoading) return;
    const cards = gridRef.current.querySelectorAll(".col-card");
    gsap.fromTo(cards,
      { opacity: 0, y: 28, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.04, ease: "expo.out", overwrite: "auto" }
    );
  }, [sorted, isLoading]);

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => { setVisibleCount(v => v + PAGE_SIZE); setLoadingMore(false); }, 500);
  }, []);

  const accent = config.accent || colors.brand.electricBlue;

  return (
    <div className="min-h-screen" style={{ background: colors.surface.primary, color: colors.text.primary }}>
      {/* Hero */}
      <CollectionHero config={config} count={baseFiltered.length} isDark={isDark} colors={colors} />

      {/* Sort + Breadcrumb Bar */}
      <div className="sticky top-16 z-40 border-b backdrop-blur-xl" style={{ background: isDark ? "rgba(14,14,16,0.9)" : "rgba(255,255,255,0.9)", borderColor: colors.border.subtle }}>
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.text.tertiary }}>
            <Link to="/" style={{ color: colors.text.tertiary }} className="hover:opacity-70 transition-opacity">Home</Link>
            <span>/</span>
            <span style={{ color: accent }}>{config.label}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {SORTS.map(s => (
              <button
                key={s.value}
                onClick={() => { setSort(s.value); setVisibleCount(PAGE_SIZE); }}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: sort === s.value ? accent : "transparent",
                  color: sort === s.value ? "#fff" : colors.text.secondary,
                  border: `1.5px solid ${sort === s.value ? accent : colors.border.default}`,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] font-medium shrink-0 hidden sm:block" style={{ color: colors.text.tertiary }}>
            <span className="font-bold" style={{ color: colors.text.primary }}>{baseFiltered.length}</span> items
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: colors.surface.secondary }}>
                <div style={{ paddingTop: "130%", background: isDark ? "#1a1a1e" : "#e5e7eb" }} />
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded-full w-3/4" style={{ background: isDark ? "#2a2a2e" : "#d1d5db" }} />
                  <div className="h-3 rounded-full w-1/2" style={{ background: isDark ? "#2a2a2e" : "#d1d5db" }} />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-center">
            <div className="text-7xl mb-6">{config.emptyIcon || "🔍"}</div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: colors.text.primary }}>Nothing here yet</h2>
            <p className="text-sm mb-8 max-w-xs" style={{ color: colors.text.tertiary }}>Check back soon or explore our full catalog.</p>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate("/products")}
              className="px-8 py-3 rounded-full font-bold text-sm" style={{ background: accent, color: "#fff" }}>
              Browse All Products
            </motion.button>
          </div>
        ) : (
          <>
            <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
              {visible.map((product) => (
                <div key={product.id} className="col-card">
                  <ProductCard
                    product={product}
                    onQuickView={setQuickView}
                    onToggleCompare={toggleCompare}
                    isCompared={compareList.some(c => c.id === product.id)}
                    canAdd={compareList.length < 2}
                  />
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center mt-14">
              {visibleCount >= sorted.length ? (
                <p className="text-sm font-medium" style={{ color: colors.text.tertiary }}>All {sorted.length} products shown</p>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${accent}44` }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-12 py-4 rounded-full font-black text-sm border-2 transition-all"
                  style={{ borderColor: accent, color: accent, background: "transparent" }}
                >
                  {loadingMore ? "Loading…" : `Load More · ${sorted.length - visibleCount} remaining`}
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Compare float bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl"
            style={{ background: isDark ? "rgba(30,30,34,0.95)" : "rgba(255,255,255,0.95)", borderColor: colors.border.default }}
          >
            <span className="text-xs font-bold" style={{ color: colors.text.secondary }}>{compareList.length}/2</span>
            {compareList.map(p => (
              <div key={p.id} className="w-9 h-9 rounded-lg overflow-hidden border" style={{ borderColor: colors.border.default }}>
                <img src={p.image} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <button onClick={() => setShowCompare(true)} disabled={compareList.length < 2}
              className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40" style={{ background: accent, color: "#fff" }}>
              Compare
            </button>
            <button onClick={clearCompare} className="text-xs font-bold" style={{ color: colors.text.tertiary }}>Clear</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickView && <ProductDetailModal product={quickView} onClose={() => setQuickView(null)} />}
      </AnimatePresence>
    </div>
  );
}
