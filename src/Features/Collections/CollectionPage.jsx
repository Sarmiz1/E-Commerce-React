import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Link, useLoaderData, useNavigation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { useTheme } from "../../Store/useThemeStore";
import ProductCard from "../Product/Components/ProductCard";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import { useCompare } from "../Product/Hooks/useCompare";

// ─── Utility ──────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

function seededNumber(seed, offset = 0) {
  const source = `${seed}:${offset}`;
  const hash = [...source].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (Math.sin(hash) + 1) / 2;
}

const normalizeFilterValue = (value = "") =>
  String(value).trim().toLowerCase()
    .replace(/[_-]+/g, " ").replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ").trim();

function sortProducts(products, sort) {
  const p = [...products];
  if (sort === "price-asc") return p.sort((a, b) => a.price_minor - b.price_minor);
  if (sort === "price-desc") return p.sort((a, b) => b.price_minor - a.price_minor);
  if (sort === "rating") return p.sort((a, b) => (b.rating_stars || 0) - (a.rating_stars || 0));
  if (sort === "newest") return p.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return p;
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

// ─── Grain Overlay ────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
    />
  );
}

// ─── Orbital Rings ────────────────────────────────────────────────────────────
function OrbitalDecor({ accent }) {
  return (
    <div className="absolute right-0 top-0 w-[520px] h-[520px] pointer-events-none overflow-hidden opacity-20">
      {[1, 0.65, 0.38].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${520 * scale}px`,
            height: `${520 * scale}px`,
            borderColor: `${accent}`,
            right: `${-260 * scale * 0.5}px`,
            top: `${-260 * scale * 0.5}px`,
            borderWidth: i === 0 ? "1px" : "0.5px",
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 30 + i * 15, repeat: Infinity, ease: "linear" }}
        />
      ))}
      <motion.div
        className="absolute w-3 h-3 rounded-full"
        style={{ background: accent, right: "80px", top: "120px", filter: `blur(1px)` }}
        animate={{ x: [0, 30, 0, -20, 0], y: [0, -20, 30, 10, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function CollectionHero({ config, count, isDark, colors }) {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 280], [1, 0]);
  const accent = config.accent;

  useEffect(() => {
    gsap.fromTo(".ch-eyebrow", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out" });
    gsap.fromTo(".ch-title-word", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.1, stagger: 0.07, ease: "expo.out" });
    gsap.fromTo(".ch-desc", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.4, ease: "expo.out" });
    gsap.fromTo(".ch-stat", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, delay: 0.55, stagger: 0.08, ease: "back.out(1.6)" });
    gsap.fromTo(".ch-divider", { scaleX: 0 }, { scaleX: 1, duration: 0.8, delay: 0.3, ease: "expo.out" });
  }, []);

  const words = config.title.split(" ");

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ minHeight: 420, background: "#080809" }}
    >
      <GrainOverlay />
      <OrbitalDecor accent={accent} />

      {/* Radial spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 55% at 30% 50%, ${accent}14 0%, transparent 65%)` }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${isDark ? "#0a0a0c" : "#fafafa"}, transparent)` }}
      />

      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(to right, transparent 0%, ${accent}80 50%, transparent 100%)` }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-20 max-w-screen-xl mx-auto px-8 md:px-12 pt-24 pb-20 grid md:grid-cols-[1fr_auto] gap-10 items-end"
      >
        {/* Left: Text */}
        <div>
          {/* Eyebrow */}
          <div className="ch-eyebrow flex items-center gap-3 mb-6">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-sm"
              style={{ background: `${accent}22`, border: `1px solid ${accent}50` }}
            >
              {config.icon}
            </div>
            <span
              className="text-[10px] font-black uppercase tracking-[0.25em]"
              style={{ color: accent }}
            >
              {config.badge || config.label}
            </span>
            <div className="ch-divider flex-1 h-px origin-left" style={{ background: `${accent}30` }} />
          </div>

          {/* Title */}
          <h1
            className="overflow-hidden mb-5"
            style={{
              fontSize: "clamp(2.6rem, 6.5vw, 5.5rem)",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            {words.map((word, i) => (
              <span
                key={i}
                className="ch-title-word inline-block mr-[0.2em]"
                style={{ color: i === config.accentWordIndex ? accent : "#ffffff" }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Description */}
          <p
            className="ch-desc text-sm md:text-[15px] max-w-md leading-relaxed"
            style={{ color: "rgba(255,255,255,0.42)", fontFamily: "'DM Sans', sans-serif" }}
          >
            {config.subtitle}
          </p>
        </div>

        {/* Right: Stats panel */}
        <div
          className="ch-stat flex flex-col gap-px rounded-2xl overflow-hidden border shrink-0"
          style={{ borderColor: `${accent}20`, background: `${accent}08`, minWidth: 200 }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: `${accent}15` }}>
            <div
              className="text-3xl font-black text-white tabular-nums"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              <AnimatedCount value={count} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] mt-0.5" style={{ color: accent }}>
              Products
            </div>
          </div>

          {config.stats?.map((s, i) => (
            <div
              key={i}
              className="ch-stat px-6 py-4 border-b last:border-b-0"
              style={{ borderColor: `${accent}15` }}
            >
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Subcategory Filter Bar ───────────────────────────────────────────────────
function SubcategoryBar({ subcategories, active, accent, colors, onSelect, totalCount }) {
  const scrollRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 10);
    setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkFades();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkFades, { passive: true });
    return () => el?.removeEventListener("scroll", checkFades);
  }, [checkFades, subcategories]);

  const allItems = [
    { slug: "all", name: "All", count: totalCount },
    ...subcategories,
  ];

  return (
    <div className="relative border-b" style={{ borderColor: colors.border.subtle, background: colors.surface.primary }}>
      {/* Left fade */}
      <AnimatePresence>
        {showLeftFade && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to right, ${colors.surface.primary}, transparent)` }}
          />
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        className="max-w-screen-xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allItems.map((item) => {
          const isActive = active === normalizeFilterValue(item.slug);
          return (
            <motion.button
              key={item.slug}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(item.slug)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors duration-200 outline-none"
              style={{
                background: isActive ? accent : "transparent",
                color: isActive ? "#fff" : colors.text.secondary,
                border: `1px solid ${isActive ? accent : colors.border.default}`,
              }}
            >
              {item.name}
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-black"
                style={{
                  background: isActive ? "rgba(255,255,255,0.2)" : `${accent}18`,
                  color: isActive ? "#fff" : accent,
                }}
              >
                {item.count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Right fade */}
      <AnimatePresence>
        {showRightFade && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to left, ${colors.surface.primary}, transparent)` }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sort / Toolbar ───────────────────────────────────────────────────────────
const SORTS = [
  { value: "default", label: "Best Match" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

function Toolbar({ sort, setSort, count, total, accent, colors, label, configLabel }) {
  return (
    <div
      className="sticky top-16 z-40 border-b backdrop-blur-2xl"
      style={{
        background: colors.surface.primary === "#ffffff" || colors.surface.primary === "#fafafa"
          ? "rgba(255,255,255,0.9)"
          : "rgba(9,9,11,0.88)",
        borderColor: colors.border.subtle,
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] mr-2">
          <Link to="/" className="hover:opacity-60 transition-opacity" style={{ color: colors.text.tertiary }}>Home</Link>
          <span style={{ color: colors.text.tertiary }}>/</span>
          <span style={{ color: accent }}>{configLabel}</span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-4 shrink-0" style={{ background: colors.border.default }} />

        {/* Sort pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className="px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-200 outline-none"
              style={{
                background: sort === s.value ? accent : "transparent",
                color: sort === s.value ? "#fff" : colors.text.secondary,
                border: `1px solid ${sort === s.value ? accent : colors.border.default}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Count */}
        <p className="text-[10px] font-medium hidden sm:block" style={{ color: colors.text.tertiary }}>
          <span className="font-bold" style={{ color: colors.text.primary }}>{count}</span>
          {count !== total && <span> of {total}</span>} items
        </p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, accent, colors, onReset, onBrowseAll }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-36 text-center"
    >
      <div className="text-6xl mb-5 grayscale">{icon || "🔍"}</div>
      <h2 className="text-xl font-bold mb-2" style={{ color: colors.text.primary, fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem" }}>
        Nothing here yet
      </h2>
      <p className="text-sm mb-8 max-w-xs leading-relaxed" style={{ color: colors.text.tertiary }}>
        Try a different filter or explore our full catalog.
      </p>
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="px-6 py-2.5 rounded-full text-sm font-bold border-2 transition-colors"
          style={{ borderColor: accent, color: accent, background: "transparent" }}
        >
          Reset Filters
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={onBrowseAll}
          className="px-6 py-2.5 rounded-full text-sm font-bold"
          style={{ background: accent, color: "#fff" }}
        >
          Browse All
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Skeleton Grid ────────────────────────────────────────────────────────────
function SkeletonGrid({ isDark, colors }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: colors.surface.secondary }}
        >
          <div className="animate-pulse" style={{ paddingTop: "130%", background: isDark ? "#1a1a1e" : "#e5e7eb" }} />
          <div className="p-4 space-y-2.5">
            <div className="h-2.5 rounded-full w-3/4 animate-pulse" style={{ background: isDark ? "#222226" : "#d1d5db" }} />
            <div className="h-2.5 rounded-full w-1/2 animate-pulse" style={{ background: isDark ? "#222226" : "#d1d5db" }} />
            <div className="h-3 rounded-full w-1/3 animate-pulse mt-3" style={{ background: isDark ? "#2a2a2e" : "#c4c9d4" }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Compare Float Bar ────────────────────────────────────────────────────────
function CompareBar({ compareList, setShowCompare, clearCompare, accent, colors, isDark }) {
  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-2xl"
          style={{
            background: isDark ? "rgba(18,18,22,0.97)" : "rgba(255,255,255,0.97)",
            borderColor: colors.border.default,
          }}
        >
          <div
            className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg"
            style={{ background: `${accent}18`, color: accent }}
          >
            {compareList.length}/2
          </div>
          {compareList.map((p) => (
            <div
              key={p.id}
              className="w-9 h-9 rounded-xl overflow-hidden border-2"
              style={{ borderColor: accent }}
            >
              <img src={p.image} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <button
            onClick={() => setShowCompare(true)}
            disabled={compareList.length < 2}
            className="px-5 py-2 rounded-xl text-xs font-black disabled:opacity-30 transition-opacity"
            style={{ background: accent, color: "#fff" }}
          >
            Compare
          </button>
          <button
            onClick={clearCompare}
            className="text-[11px] font-bold px-2 transition-opacity hover:opacity-60"
            style={{ color: colors.text.tertiary }}
          >
            Clear
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CollectionPage({ config }) {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const allProducts = useLoaderData();
  const isLoading = navigation.state === "loading";

  const [sort, setSort] = useState("default");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [activeSubcat, setActiveSubcat] = useState("all");
  const { compareList, setShowCompare, toggleCompare, clearCompare } = useCompare();

  const gridRef = useRef(null);
  const accent = config.accent || colors.brand.electricBlue;

  // ── Derive data ──────────────────────────────────────────────────────────
  const backendProducts = useMemo(() => Array.isArray(allProducts) ? allProducts : [], [allProducts]);

  const subcategories = useMemo(() => {
    const bySlug = new Map();
    backendProducts.forEach((product) => {
      const name = product.subcategory?.name || product.subcategory_name || product.subcategoryName;
      const slug = product.subcategory?.slug || product.subcategory_slug || product.subcategorySlug;
      if (!name || !slug) return;
      const key = normalizeFilterValue(slug);
      bySlug.set(key, { name, slug, count: (bySlug.get(key)?.count || 0) + 1 });
    });
    return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [backendProducts]);

  // Initialise from config once
  useEffect(() => {
    const fromConfig = normalizeFilterValue(config.subcategorySlug || config.subcategoryLabel || "");
    const valid = subcategories.some((s) => normalizeFilterValue(s.slug) === fromConfig);
    setActiveSubcat(valid && fromConfig ? fromConfig : "all");
  }, [config.subcategorySlug, config.subcategoryLabel, subcategories]);

  const filtered = useMemo(() => {
    if (activeSubcat === "all") return backendProducts;
    return backendProducts.filter((p) => {
      const slug = p.subcategory?.slug || p.subcategory_slug || p.subcategorySlug || "";
      return normalizeFilterValue(slug) === activeSubcat;
    });
  }, [backendProducts, activeSubcat]);

  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);
  const visible = sorted.slice(0, visibleCount);

  // ── GSAP stagger ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gridRef.current || isLoading) return;
    const cards = gridRef.current.querySelectorAll(".col-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 24, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.035, ease: "expo.out", overwrite: "auto" }
    );
  }, [sorted, isLoading]);

  const handleSubcatSelect = useCallback((slug) => {
    const key = normalizeFilterValue(slug);
    setActiveSubcat(key === "all" ? "all" : key);
    setVisibleCount(PAGE_SIZE);
    // Sync URL if category slug is available
    if (config.categorySlug) {
      if (key === "all") {
        navigate(`/products/categories/${encodeURIComponent(config.categorySlug)}`);
      } else {
        const orig = subcategories.find((s) => normalizeFilterValue(s.slug) === key);
        if (orig) navigate(`/products/categories/${encodeURIComponent(config.categorySlug)}/${encodeURIComponent(orig.slug)}`);
      }
    }
  }, [config.categorySlug, navigate, subcategories]);

  const handleSortChange = useCallback((v) => { setSort(v); setVisibleCount(PAGE_SIZE); }, []);

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => { setVisibleCount((v) => v + PAGE_SIZE); setLoadingMore(false); }, 480);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background: colors.surface.primary,
        color: colors.text.primary,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Hero ── */}
      <CollectionHero config={config} count={backendProducts.length} isDark={isDark} colors={colors} />

      {/* ── Toolbar (sticky) ── */}
      <Toolbar
        sort={sort}
        setSort={handleSortChange}
        count={sorted.length}
        total={backendProducts.length}
        accent={accent}
        colors={colors}
        configLabel={config.label}
      />

      {/* ── Subcategory filter (only if > 1) ── */}
      {subcategories.length > 0 && (
        <SubcategoryBar
          subcategories={subcategories}
          active={activeSubcat}
          accent={accent}
          colors={colors}
          totalCount={backendProducts.length}
          onSelect={handleSubcatSelect}
        />
      )}

      {/* ── Product Grid ── */}
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        {isLoading ? (
          <SkeletonGrid isDark={isDark} colors={colors} />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={config.emptyIcon}
            accent={accent}
            colors={colors}
            onReset={() => { setActiveSubcat("all"); setSort("default"); }}
            onBrowseAll={() => navigate("/products")}
          />
        ) : (
          <>
            {/* Result meta line */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeSubcat + sort}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-[11px] font-semibold mb-7 uppercase tracking-[0.15em]"
                style={{ color: colors.text.tertiary }}
              >
                {activeSubcat !== "all" && (
                  <span style={{ color: accent }}>
                    {subcategories.find((s) => normalizeFilterValue(s.slug) === activeSubcat)?.name}
                    {" · "}
                  </span>
                )}
                {sorted.length} result{sorted.length !== 1 ? "s" : ""}
              </motion.p>
            </AnimatePresence>

            <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              {visible.map((product) => (
                <div key={product.id} className="col-card">
                  <ProductCard
                    product={product}
                    onQuickView={setQuickView}
                    onToggleCompare={toggleCompare}
                    isCompared={compareList.some((c) => c.id === product.id)}
                    canAdd={compareList.length < 2}
                  />
                </div>
              ))}
            </div>

            {/* ── Load More ── */}
            <div className="flex flex-col items-center mt-16 gap-3">
              {visibleCount >= sorted.length ? (
                <div className="flex items-center gap-4">
                  <div className="h-px w-16" style={{ background: colors.border.default }} />
                  <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.text.tertiary }}>
                    All {sorted.length} shown
                  </p>
                  <div className="h-px w-16" style={{ background: colors.border.default }} />
                </div>
              ) : (
                <>
                  {/* Progress bar */}
                  <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: colors.border.subtle }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: accent }}
                      animate={{ width: `${(visibleCount / sorted.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="text-[10px] font-medium" style={{ color: colors.text.tertiary }}>
                    {visibleCount} of {sorted.length}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: `0 0 28px ${accent}35` }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="mt-2 px-10 py-3.5 rounded-full font-black text-sm border-2 transition-all duration-200 disabled:opacity-50"
                    style={{ borderColor: accent, color: accent, background: "transparent", letterSpacing: "0.05em" }}
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-3.5 h-3.5 border-2 rounded-full"
                          style={{ borderColor: `${accent}40`, borderTopColor: accent }}
                        />
                        Loading…
                      </span>
                    ) : (
                      `Load ${Math.min(PAGE_SIZE, sorted.length - visibleCount)} More`
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Compare Float Bar ── */}
      <CompareBar
        compareList={compareList}
        setShowCompare={setShowCompare}
        clearCompare={clearCompare}
        accent={accent}
        colors={colors}
        isDark={isDark}
      />

      {/* ── Quick View Modal ── */}
      <AnimatePresence>
        {quickView && <ProductDetailModal product={quickView} onClose={() => setQuickView(null)} />}
      </AnimatePresence>
    </div>
  );
}