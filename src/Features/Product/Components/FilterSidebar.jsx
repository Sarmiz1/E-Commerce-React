import React, { useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import PremiumDropdown from "../../../Components/Ui/PremiumDropdown";
import { SORT_OPTIONS, CATEGORIES } from "../Utils/constants";

const CAT_ICONS = {
  All: "🛍️",
  Electronics: "💻",
  Fashion: "👕",
  Sports: "🎾",
  Home: "🏠",
  Beauty: "💄",
  Toys: "🧸",
  Books: "📚",
};

export function AnimatedCount({ value }) {
  const [key, setKey] = useState(0);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) { setKey((k) => k + 1); prev.current = value; }
  }, [value]);
  return (
    <span className="inline-block overflow-hidden align-middle" style={{ height: "1.2em" }}>
      <span key={key} className="pg-count inline-block tabular-nums">{value}</span>
    </span>
  );
}

export function ActiveFilterChips({ filters, selectedCategory, setFilters, setSelectedCategory, maxBudget }) {
  const { colors, isDark } = useTheme();
  const chips = [];
  if (selectedCategory !== "All") chips.push({ id: "cat", label: selectedCategory });
  if (filters.sort !== "default") chips.push({ id: "sort", label: SORT_OPTIONS.find(o => o.value === filters.sort)?.label || "" });
  if (filters.rating !== null) chips.push({ id: "rating", label: `${filters.rating}+★` });
  if (filters.inStock) chips.push({ id: "stock", label: "In Stock" });
  if (filters.onSale) chips.push({ id: "sale", label: "On Sale" });
  if (filters.budget < maxBudget) chips.push({ id: "budget", label: `< ${formatMoneyCents(filters.budget)}` });
  
  if (!chips.length) return null;

  const remove = (id) => {
    if (id === "cat") setSelectedCategory("All");
    if (id === "sort") setFilters((f) => ({ ...f, sort: "default" }));
    if (id === "rating") setFilters((f) => ({ ...f, rating: null }));
    if (id === "stock") setFilters((f) => ({ ...f, inStock: false }));
    if (id === "sale") setFilters((f) => ({ ...f, onSale: false }));
    if (id === "budget") setFilters((f) => ({ ...f, budget: maxBudget }));
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span key={c.id} className="inline-flex items-center gap-1 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full border" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)', color: colors.text.secondary, borderColor: colors.border.default }}>
          {c.label}
          <button onClick={() => remove(c.id)} className="hover:text-red-500 transition-colors ml-0.5 flex-shrink-0">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </span>
      ))}
    </div>
  );
}

const CategoryGrid = React.memo(({ selectedCategory, setSelectedCategory, colors }) => {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: colors.text.tertiary }}>Category</p>
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((cat) => (
          <motion.button 
            key={cat}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedCategory(cat)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 gap-2"
            style={
              selectedCategory === cat
                ? { background: colors.cta.primary, color: colors.cta.primaryText, borderColor: colors.cta.primary, boxShadow: `0 4px 12px ${colors.cta.primary}40` }
                : { background: colors.surface.secondary, color: colors.text.secondary, borderColor: colors.border.subtle }
            }
          >
            <span className="text-xl">{CAT_ICONS[cat] || "🏷️"}</span>
            <span className="text-[11px] font-bold whitespace-nowrap">{cat}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
});

const BudgetSlider = React.memo(({ filters, setFilters, maxBudget, colors }) => {
  const [localBudget, setLocalBudget] = useState(filters.budget);

  useEffect(() => {
    setLocalBudget(filters.budget);
  }, [filters.budget]);

  const commitBudget = () => {
    if (localBudget !== filters.budget) {
      setFilters(f => ({ ...f, budget: localBudget }));
    }
  };

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.text.tertiary }}>Max Price</p>
        <span className="text-sm font-bold" style={{ color: colors.text.primary }}>{formatMoneyCents(localBudget)}</span>
      </div>
      <div className="relative pt-2">
        <div className="h-[3px] rounded-full w-full" style={{ background: colors.border.default }}>
          <div className="h-full rounded-full transition-colors" style={{ width: `${maxBudget > 0 ? (localBudget / maxBudget) * 100 : 100}%`, background: `linear-gradient(to right, ${colors.cta.primary}, ${colors.brand?.electricBlue || colors.cta.primary})` }} />
        </div>
        <input type="range" min={0} max={maxBudget} step={100}
          value={localBudget}
          onChange={(e) => setLocalBudget(Number(e.target.value))}
          onPointerUp={commitBudget}
          onKeyUp={(e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") commitBudget(); }}
          className="pg-range absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '20px', top: '-8px', touchAction: 'none' }}
        />
        {/* Thumb indicator */}
        <div className="absolute top-[-5px] w-4 h-4 rounded-full shadow-lg border-2 pointer-events-none transition-colors" style={{ left: `calc(${maxBudget > 0 ? (localBudget / maxBudget) * 100 : 100}% - 8px)`, background: colors.surface.primary, borderColor: colors.cta.primary }} />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {[
          { label: "< $10", max: 1000 },
          { label: "< $25", max: 2500 },
          { label: "< $50", max: 5000 },
          { label: "All", max: maxBudget },
        ].map((b) => (
          <motion.button 
            key={b.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilters((f) => ({ ...f, budget: b.max }))}
            className="px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-300"
            style={
              filters.budget === b.max
                ? { background: colors.cta.primary, color: colors.cta.primaryText, borderColor: colors.cta.primary, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
                : { background: colors.surface.secondary, color: colors.text.secondary, borderColor: colors.border.default }
            }
          >{b.label}</motion.button>
        ))}
      </div>
    </div>
  );
});

const FilterSidebar = React.memo(function FilterSidebar({ filters, setFilters, maxBudget, selectedCategory, setSelectedCategory, matchingCount }) {
  const { colors, isDark } = useTheme();

  const resetAll = useCallback(() => {
    setFilters({ sort: "default", rating: null, inStock: false, onSale: false, budget: maxBudget });
    setSelectedCategory("All");
  }, [maxBudget, setFilters, setSelectedCategory]);

  const activeCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (filters.rating !== null ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.sort !== "default" ? 1 : 0) +
    (filters.budget < maxBudget ? 1 : 0);

  return (
    <div className="space-y-8 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-serif font-bold tracking-tight" style={{ color: colors.text.primary }}>
          Filters
          {activeCount > 0 && (
            <span className="ml-2 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full"
              style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>{activeCount}</span>
          )}
        </span>
        {activeCount > 0 && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetAll} 
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full border transition-all shadow-sm hover:shadow-md"
            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: colors.border.default, color: colors.text.secondary }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Reset
          </motion.button>
        )}
      </div>

      {/* Sort */}
      <PremiumDropdown
        label="Sort by"
        value={filters.sort}
        options={SORT_OPTIONS}
        onChange={(val) => setFilters((f) => ({ ...f, sort: val }))}
      />

      {/* Category - Visual Layout */}
      <CategoryGrid selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} colors={colors} />

      {/* Budget */}
      <BudgetSlider filters={filters} setFilters={setFilters} maxBudget={maxBudget} colors={colors} />

      {/* Min rating */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: colors.text.tertiary }}>Min Rating</p>
        <div className="grid grid-cols-4 gap-1.5">
          {[null, 3, 4, 4.5].map((r) => (
            <motion.button 
              key={String(r)}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilters((f) => ({ ...f, rating: r }))}
              className="py-2 text-xs font-bold rounded-lg border transition-all duration-300"
              style={
                filters.rating === r
                  ? { background: colors.brand.gold || "#d97706", color: "#fff", borderColor: colors.brand.gold || "#d97706" }
                  : { background: colors.surface.secondary, color: colors.text.tertiary, borderColor: colors.border.subtle }
              }
            >{r === null ? "Any" : `${r}+★`}</motion.button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
        {[{ key: "inStock", label: "In Stock Only" }, { key: "onSale", label: "On Sale" }].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-medium transition-colors" style={{ color: colors.text.secondary }}>{label}</span>
            <div
              className="relative w-10 h-[22px] rounded-full transition-all duration-500 ease-in-out border shadow-inner"
              style={{ 
                background: filters[key] ? colors.cta.primary : colors.surface.tertiary,
                borderColor: filters[key] ? colors.cta.primary : colors.border.default,
              }}
              onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
              role="switch" aria-checked={filters[key]}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-[2.5px] w-4 h-4 rounded-full bg-white shadow-lg pg-toggle-knob"
                style={{ 
                  left: filters[key] ? "auto" : "3px",
                  right: filters[key] ? "3px" : "auto",
                }}
              />
            </div>
          </label>
        ))}
      </div>

      {/* Live result count */}
      <div className="rounded-2xl p-5 text-center mt-6 shadow-sm" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${colors.border.subtle}` }}>
        <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: colors.text.tertiary }}>Matching Items</p>
        <p className="text-2xl font-black" style={{ color: colors.text.primary }}><AnimatedCount value={matchingCount} /></p>
      </div>
    </div>
  );
});

export default FilterSidebar;
