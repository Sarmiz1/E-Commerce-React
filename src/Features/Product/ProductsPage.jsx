import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useNavigation, useLoaderData } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useTheme } from "../../Context/theme/ThemeContext"; 
import { formatMoneyCents } from "../../Utils/formatMoneyCents"; 

// Components
import PremiumDropdown from "../../Components/Ui/PremiumDropdown";
import LiveTicker from "./Components/LiveTicker";
import ProductCard from "./Components/ProductCard";
import FilterSidebar, { ActiveFilterChips } from "./Components/FilterSidebar";
import ProductDetailModal from "./Components/ProductDetailModal";

// Constants
import { PAGE_SIZE, AD_INTERVAL, SORT_OPTIONS, CATEGORIES } from "./constants";

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconFilter({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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

function IconSpinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PG_STYLES = `
  /* ── Global custom scrollbar ── */
  html { scrollbar-width: thin; scrollbar-color: var(--woo-border-default, #d1d5db) transparent; }
  *::-webkit-scrollbar { width: 6px; height: 6px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: var(--woo-border-default, #d1d5db); border-radius: 9999px; }
  *::-webkit-scrollbar-thumb:hover { background: var(--woo-border-strong, #9ca3af); }

  /* ── Animations ── */
  @keyframes pg-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .pg-ticker { animation: pg-ticker 35s linear infinite; }
  .pg-ticker:hover { animation-play-state: paused; }

  @keyframes pg-dot { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)} 55%{box-shadow:0 0 0 6px rgba(34,197,94,0)} }
  .pg-dot { animation: pg-dot 2s ease-out infinite; }

  @keyframes pg-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .pg-skeleton { animation: pg-shimmer 1.4s ease-in-out infinite; background-size: 800px 100%; }
  .pg-skeleton-light { background-image: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); }
  .pg-skeleton-dark { background-image: linear-gradient(90deg, #19191C 25%, #2C2C30 50%, #19191C 75%); }

  .pg-range { -webkit-appearance:none; appearance:none; background:transparent; cursor:pointer; width:100%; }
  .pg-range::-webkit-slider-runnable-track { height:3px; border-radius:9999px; background:var(--woo-border-default, #e5e7eb); }
  .pg-range::-webkit-slider-thumb {
    -webkit-appearance:none; width:16px; height:16px; border-radius:50%;
    background:var(--woo-brand-electric-blue, #111827); margin-top:-6.5px;
    border:2px solid var(--woo-surface-primary, #fff);
    box-shadow:0 1px 4px rgba(0,0,0,.35);
  }

  .pg-cart-btn {
    display:flex; align-items:center; justify-content:center;
    width:32px; height:32px; border-radius:8px;
    border:1.5px solid var(--woo-border-default, #e5e7eb);
    background:var(--woo-surface-primary, #fff);
    color:var(--woo-text-secondary, #6b7280);
    cursor:pointer; transition:all 0.2s;
  }
  .pg-cart-btn:hover { background:var(--woo-brand-electric-blue, #0050d4); border-color:var(--woo-brand-electric-blue, #0050d4); color:var(--woo-text-inverse, #fff); transform: translateY(-2px); }

  @keyframes pg-ad-slide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .pg-ad-strip { animation: pg-ad-slide 22s linear infinite; }
  .pg-ad-strip:hover { animation-play-state: paused; }

  .pg-slim::-webkit-scrollbar { width:4px; height:4px; }
  .pg-slim::-webkit-scrollbar-thumb { background:var(--woo-border-default,#e5e7eb); border-radius:9999px; }
`;

// ─── Sub-components ──────────────────────────────────────────────────────────
function InlineAd({ product, type, allProducts }) {
  const { isDark, colors } = useTheme();
  if (!product) return null;

  const adImages = useMemo(() => {
    const base = [product.image].filter(Boolean);
    if (allProducts?.length) {
      const extras = allProducts.filter((p) => p.id !== product.id && p.image).slice(0, 4).map((p) => p.image);
      return [...base, ...extras].slice(0, 5);
    }
    return base;
  }, [product, allProducts]);


  if (type === "featured") {
    return (
      <div className="col-span-full sm:col-span-2">
        <Link to={`/products/${product.id}`} className="block group h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover="hover"
            className="relative rounded-2xl overflow-hidden flex items-center justify-between gap-4 cursor-pointer h-full border border-white/5"
            variants={{
              hover: { 
                scale: 1.01,
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                borderColor: "rgba(255,255,255,0.15)"
              }
            }}
            style={{
              background: isDark
                ? `linear-gradient(120deg, ${colors.surface.tertiary} 0%, #1e1b4b 100%)`
                : "linear-gradient(120deg, #111827 0%, #1e1b4b 100%)",
            }}
          >
            {/* Background Image with Zoom Animation */}
            <div className="absolute inset-0 z-0 overflow-hidden">
               <motion.img 
                 variants={{ hover: { scale: 1.15, filter: "brightness(0.9)" } }}
                 transition={{ duration: 1.2, ease: "easeOut" }}
                 src={product.image} alt="" className="w-full h-full object-cover opacity-70" />
               <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${isDark ? '#000' : '#111'} 50%, transparent 95%)` }} />
               
               {/* Animated Sheen Sweep */}
               <motion.div 
                 variants={{ hover: { x: ["-100%", "200%"] } }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
                 className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] pointer-events-none"
               />
            </div>

            <div className="relative z-10 flex items-center gap-4 pl-6 py-4">
              <motion.span variants={{ hover: { scale: 1.2, rotate: 15 } }} className="text-3xl text-white/40 font-serif italic">✦</motion.span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.brand.electricBlue }}>Featured Drop</p>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10 uppercase font-bold tracking-tighter">Limited</span>
                </div>
                <motion.p variants={{ hover: { x: 5 } }} className="text-sm font-bold text-white line-clamp-1">{product.name}</motion.p>
                <p className="text-[10px] text-white/50 italic line-clamp-1">Exclusively curated for the season</p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-4 pr-6 py-4">
               <div className="text-right">
                  <p className="font-black text-xl text-white">{formatMoneyCents(product.price_cents)}</p>
                  <p className="text-[11px] line-through opacity-40 text-white">{formatMoneyCents(Math.round(product.price_cents * 1.6))}</p>
               </div>
               <motion.span 
                 whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,1)", color: "#000" }}
                 className="text-[11px] font-bold px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 transition-all duration-300">
                 Shop Now
               </motion.span>
            </div>
          </motion.div>
        </Link>
      </div>
    );
  }

  return (
    <div className="col-span-full sm:col-span-2">
      <Link to={`/products/${product.id}`} className="block h-full group">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover="hover"
          className="relative rounded-2xl overflow-hidden flex items-center justify-between gap-4 cursor-pointer h-full border border-amber-500/10"
          variants={{
            hover: { 
              scale: 1.01,
              boxShadow: "0 15px 30px rgba(180,83,9,0.15)",
              borderColor: "rgba(217,119,6,0.3)"
            }
          }}
          style={{ background: isDark ? "rgba(180,83,9,0.05)" : "#fffbeb" }}
        >
          {/* Background Image Overlay for Flash Deal */}
          <div className="absolute inset-0 z-0 overflow-hidden">
             <motion.img 
               variants={{ hover: { scale: 1.2 } }}
               transition={{ duration: 1.2, ease: "easeOut" }}
               src={product.image} alt="" className="w-full h-full object-cover opacity-15 grayscale" />
             <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${isDark ? '#1a1a1a' : '#fffbeb'} 40%, transparent 100%)` }} />
             
             {/* Animated Sheen Sweep */}
             <motion.div 
               variants={{ hover: { x: ["-100%", "200%"] } }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent skew-x-[-25deg] pointer-events-none"
             />
          </div>

          <div className="relative z-10 flex items-center gap-4 pl-6 py-4">
            <motion.span variants={{ hover: { scale: 1.2, rotate: -15 } }} className="text-3xl">⚡</motion.span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.brand.gold }}>Flash Deal</p>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/10 uppercase font-bold tracking-tighter">Live</span>
              </div>
              <motion.p variants={{ hover: { x: 5 } }} className="text-sm font-bold line-clamp-1" style={{ color: colors.text.primary }}>{product.name}</motion.p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 pr-6 py-4">
             <div className="text-right">
                 <p className="font-black text-xl" style={{ color: colors.brand.gold }}>{formatMoneyCents(product.price_cents)}</p>
                 <p className="text-[11px] line-through" style={{ color: colors.text.tertiary }}>{formatMoneyCents(Math.round(product.price_cents * 1.4))}</p>
             </div>
             <motion.span 
               whileHover={{ scale: 1.05, backgroundColor: "#d97706" }}
               className="text-[11px] font-bold px-5 py-2.5 rounded-xl bg-amber-600 text-white transition-all duration-300">
               Shop →
             </motion.span>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}

function ViewMoreBtn({ onClick, loading, allLoaded, count }) {
  const { colors } = useTheme();
  if (allLoaded && count === 0) return null;
  if (allLoaded) return <div className="col-span-full text-center py-10 text-xs font-medium" style={{ color: colors.text.tertiary }}>Showing all {count} products</div>;
  return (
    <div className="col-span-full flex justify-center py-10">
      <button onClick={onClick} disabled={loading} className="flex items-center gap-3 font-bold text-sm px-10 py-3.5 rounded-full border transition-all active:scale-95 disabled:opacity-50" style={{ borderColor: colors.border.default, color: colors.text.primary }}>
        {loading ? <IconSpinner /> : "Explore More Products"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARISON MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function CompareModal({ items, onClose, onRemove }) {
  const { colors, isDark } = useTheme();
  if (items.length < 2) return null;
  const [a, b] = items;
  const rows = [
    { label: "Price", render: (p) => formatMoneyCents(p.price_cents) },
    { label: "Rating", render: (p) => `${p.rating_stars || 0} ★` },
    { label: "Reviews", render: (p) => (p.rating_count || 0).toLocaleString() },
    { label: "Category", render: (p) => (p.keywords || []).slice(0, 2).join(", ") || "—" },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1200] flex items-end md:items-center justify-center" style={{ pointerEvents: "none" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto" />
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[85vh]" style={{ background: colors.surface.elevated }}>
        <div className="flex items-center justify-between p-4 md:p-5 border-b shrink-0" style={{ borderColor: colors.border.subtle }}>
          <h3 className="text-lg font-bold" style={{ color: colors.text.primary }}>Compare Products</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: colors.surface.tertiary }}><IconClose /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-2 md:gap-4 p-4 md:p-5">
            {[a, b].map((p) => (
              <div key={p.id} className="text-center">
                <div className="rounded-xl overflow-hidden mb-2 md:mb-3 aspect-square" style={{ background: colors.surface.tertiary }}>
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs md:text-sm font-bold line-clamp-2" style={{ color: colors.text.primary }}>{p.name}</p>
                <p className="text-base md:text-lg font-black mt-1" style={{ color: colors.text.primary }}>{formatMoneyCents(p.price_cents)}</p>
              </div>
            ))}
          </div>
          <div className="px-4 md:px-5 pb-4 md:pb-5">
            {rows.map(({ label, render }) => (
              <div key={label} className="grid grid-cols-[1fr_1fr] gap-2 md:gap-4 py-2.5 border-t text-center" style={{ borderColor: colors.border.subtle }}>
                {[a, b].map((p) => (
                  <div key={p.id}>
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: colors.text.tertiary }}>{label}</p>
                    <p className="text-xs md:text-sm font-bold" style={{ color: colors.text.primary }}>{render(p)}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 p-4 md:p-5 border-t shrink-0" style={{ borderColor: colors.border.subtle }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>Done</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductsPage() {
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();

  const navigation = useNavigation();
  const productsFromLoader = useLoaderData();
  const allProducts = useMemo(() => Array.isArray(productsFromLoader) ? productsFromLoader : [], [productsFromLoader]);
  const isLoading = navigation.state === "loading";
  const maxBudget = useMemo(() => allProducts.length ? Math.max(...allProducts.map((p) => p.price_cents || 0), 1000) : 10000, [allProducts]);

  const [filters, setFilters] = useState({ sort: "default", rating: null, inStock: false, onSale: false, budget: maxBudget });

  useEffect(() => {
    setFilters((f) => {
      if (f.budget === 10000 || f.budget === 0) return { ...f, budget: maxBudget };
      return f;
    });
  }, [maxBudget]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  // Hide body scrollbar when any modal is open
  useEffect(() => {
    if (mobileFilterOpen || showCompare || quickViewProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileFilterOpen, showCompare, quickViewProduct]);

  const gridRef = useRef(null);

  // Stable callbacks
  const handleQuickView = useCallback((p) => setQuickViewProduct(p), []);
  const handleToggleCompare = useCallback((product) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= 2) return prev;
      return [...prev, product];
    });
  }, []);
  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => { setVisibleCount((v) => v + PAGE_SIZE); setLoadingMore(false); }, 600);
  }, []);

  // GSAP Entrance Animation
  useEffect(() => {
    if (!isLoading && gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.05, 
          ease: "expo.out",
          overwrite: "auto"
        }
      );
    }
  }, [isLoading, selectedCategory, filters.sort]);

  const filteredProducts = useMemo(() => {
    let r = [...allProducts];
    if (selectedCategory !== "All") {
      const q = selectedCategory.toLowerCase();
      r = r.filter((p) => p.name?.toLowerCase().includes(q) || (Array.isArray(p.keywords) && p.keywords.some((k) => k.toLowerCase().includes(q))));
    }
    r = r.filter((p) => (p.price_cents || 0) <= filters.budget);
    if (filters.rating !== null) r = r.filter((p) => (p.rating_stars || 0) >= filters.rating);
    if (filters.inStock) r = r.filter((p) => (p.price_cents || 0) > 0);
    if (filters.onSale) r = r.filter((p) => (p.price_cents || 0) < 2000);
    const s = filters.sort;
    if (s === "price-asc") r.sort((a, b) => (a.price_cents || 0) - (b.price_cents || 0));
    else if (s === "price-desc") r.sort((a, b) => (b.price_cents || 0) - (a.price_cents || 0));
    else if (s === "rating") r.sort((a, b) => (b.rating_stars || 0) - (a.rating_stars || 0));
    else if (s === "newest") r.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return r;
  }, [allProducts, selectedCategory, filters]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const gridItems = useMemo(() => {
    const items = [];
    visibleProducts.forEach((product, i) => {
      items.push({ type: "product", product, idx: i });
      if ((i + 1) % AD_INTERVAL === 0 && i < visibleProducts.length - 1) {
        items.push({ type: "ad", adType: Math.floor(i / AD_INTERVAL) % 2 === 0 ? "featured" : "deal", adProduct: allProducts[(i + 5) % allProducts.length], idx: i });
      }
    });
    return items;
  }, [visibleProducts, allProducts]);

  return (
    <div className="min-h-screen pt-20" style={{ background: colors.surface.primary, color: colors.text.primary }}>
      <style>{PG_STYLES}</style>

      {!isLoading && allProducts.length > 0 && <LiveTicker products={allProducts} />}

      <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: colors.border.subtle }}>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.text.tertiary }}>
          <Link to="/" className="hover:opacity-80 transition-opacity" style={{ color: colors.text.tertiary }}>Home</Link>
          <span>/</span>
          <span style={{ color: colors.text.primary }}>{selectedCategory}</span>
        </div>

        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
            style={{ background: colors.cta.primary, color: colors.cta.primaryText }}
          >
            <IconFilter className="w-3.5 h-3.5" /> Filters
          </motion.button>
          
          <PremiumDropdown
            value={filters.sort}
            options={SORT_OPTIONS}
            onChange={(val) => setFilters((f) => ({ ...f, sort: val }))}
            className="w-44"
          />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-fit">
            <FilterSidebar 
              filters={filters} 
              setFilters={setFilters} 
              maxBudget={maxBudget} 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory}
              matchingCount={filteredProducts.length}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-4">
              <ActiveFilterChips 
                filters={filters} 
                selectedCategory={selectedCategory} 
                setFilters={setFilters} 
                setSelectedCategory={setSelectedCategory} 
                maxBudget={maxBudget} 
              />
              <p className="text-sm font-medium italic" style={{ color: colors.text.tertiary }}>
                Discovering <span className="font-bold" style={{ color: colors.text.primary }}>{filteredProducts.length}</span> curated items for you.
              </p>
            </div>

            {/* Loading skeleton */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden" style={{ background: colors.surface.secondary, border: `1px solid ${colors.border.subtle}` }}>
                    <div className={`pg-skeleton ${isDark ? 'pg-skeleton-dark' : 'pg-skeleton-light'}`} style={{ paddingTop: '128%' }} />
                    <div className="p-3 space-y-2">
                      <div className={`pg-skeleton ${isDark ? 'pg-skeleton-dark' : 'pg-skeleton-light'} h-3 rounded-full w-3/4`} />
                      <div className={`pg-skeleton ${isDark ? 'pg-skeleton-dark' : 'pg-skeleton-light'} h-3 rounded-full w-1/2`} />
                      <div className={`pg-skeleton ${isDark ? 'pg-skeleton-dark' : 'pg-skeleton-light'} h-4 rounded-full w-1/3 mt-2`} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="text-6xl mb-5">🔍</div>
                <h2 className="text-xl font-bold mb-2" style={{ color: colors.text.primary }}>No products found</h2>
                <p className="text-sm mb-6 max-w-xs" style={{ color: colors.text.tertiary }}>Try adjusting your filters or search term to find what you're looking for.</p>
                <button onClick={() => { setFilters({ sort: "default", rating: null, inStock: false, onSale: false, budget: maxBudget }); setSelectedCategory("All"); }} className="text-sm font-bold underline" style={{ color: colors.text.accent }}>Clear all filters</button>
              </div>
            )}

            <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
              {gridItems.map((item) => (
                item.type === "ad" 
                  ? <InlineAd key={`ad-${item.idx}`} product={item.adProduct} type={item.adType} allProducts={allProducts} />
                  : <ProductCard key={item.product.id} product={item.product} onQuickView={handleQuickView} onToggleCompare={handleToggleCompare} isCompared={compareList.some((c) => c.id === item.product.id)} canAdd={compareList.length < 2} />
              ))}
              
              <ViewMoreBtn 
                onClick={handleLoadMore} 
                loading={loadingMore} 
                allLoaded={visibleCount >= filteredProducts.length} 
                count={filteredProducts.length} 
              />
            </div>

            {/* Comparison floating bar */}
            <AnimatePresence>
              {compareList.length > 0 && (
                <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center justify-center gap-2 sm:gap-3 w-fit max-w-[95vw] px-3 sm:px-5 py-2 sm:py-3 rounded-2xl shadow-2xl border backdrop-blur-xl" style={{ background: isDark ? 'rgba(30,30,34,0.95)' : 'rgba(255,255,255,0.95)', borderColor: colors.border.default }}>
                  <span className="text-[10px] sm:text-xs font-bold shrink-0" style={{ color: colors.text.secondary }}>{compareList.length}/2<span className="hidden sm:inline"> selected</span></span>
                  <div className="flex items-center gap-2">
                    {compareList.map((p) => (
                      <div key={p.id} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border shrink-0" style={{ borderColor: colors.border.default }}>
                        <img src={p.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCompare(true)} disabled={compareList.length < 2} className="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all disabled:opacity-40 shrink-0" style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>Compare</motion.button>
                  <button onClick={() => setCompareList([])} className="text-[10px] sm:text-xs font-bold shrink-0" style={{ color: colors.text.tertiary }}>Clear</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Filter */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFilterOpen(false)} className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }} className="fixed bottom-0 left-0 right-0 z-[2001] rounded-t-[32px] p-8 lg:hidden max-h-[90vh] overflow-y-auto shadow-[0_-20px_40px_rgba(0,0,0,0.2)]" style={{ background: colors.surface.primary }}>
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-serif font-bold" style={{ color: colors.text.primary }}>Filters</h2>
                  <button onClick={() => setMobileFilterOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: colors.surface.tertiary, color: colors.text.primary }}><IconClose /></button>
               </div>
               <FilterSidebar filters={filters} setFilters={setFilters} maxBudget={maxBudget} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} matchingCount={filteredProducts.length} />
               <button onClick={() => setMobileFilterOpen(false)} className="w-full mt-8 py-4 rounded-2xl font-bold" style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>Apply Filters</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickViewProduct && (
          <ProductDetailModal 
            product={quickViewProduct} 
            onClose={() => setQuickViewProduct(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompare && <CompareModal items={compareList} onClose={() => setShowCompare(false)} onRemove={(id) => setCompareList((p) => p.filter((x) => x.id !== id))} />}
      </AnimatePresence>
    </div>
  );
}
