import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { IconFilter } from "../../../components/Icons/IconFilter";
import PremiumDropdown from "../../../components/Ui/PremiumDropdown";
import { SORT_OPTIONS } from "../Utils/constants";
import { trackEvent } from "../../../api/track_events";

export default function ProductsBreadcrumb({ 
  colors, 
  selectedCategory, 
  sort, 
  search,
  setFilters, 
  setMobileFilterOpen 
}) {
  return (
    <div
      className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col gap-4 border-b lg:flex-row lg:items-center lg:justify-between"
      style={{ borderColor: colors.border.subtle }}
    >
      <div
        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
        style={{ color: colors.text.tertiary }}
      >
        <Link
          to="/"
          className="hover:opacity-80 transition-opacity"
          style={{ color: colors.text.tertiary }}
        >
          Home
        </Link>
        <span className="opacity-40">›</span>
        <span style={{ color: colors.text.primary }}>{selectedCategory}</span>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
        <div
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full border px-4 py-2 lg:w-[360px] lg:flex-none"
          style={{
            background: colors.surface.secondary,
            borderColor: colors.border.default,
            color: colors.text.primary,
          }}
        >
          <Search className="h-4 w-4 shrink-0 opacity-55" />
          <input
            value={search || ""}
            onChange={(event) => setFilters((f) => ({ ...f, search: event.target.value }))}
            onBlur={() => {
              if (search?.trim()) {
                trackEvent({
                  eventType: "products_search_submitted",
                  metadata: { query: search.trim() },
                });
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-medium"
            placeholder="Search with intent"
            style={{ color: colors.text.primary }}
          />
          {search?.trim() && (
            <Sparkles className="h-4 w-4 shrink-0" style={{ color: colors.text.accent }} />
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
          style={{
            background: colors.cta.primary,
            color: colors.cta.primaryText,
          }}
        >
          <IconFilter className="w-3.5 h-3.5" /> Filters
        </motion.button>

        <PremiumDropdown
          value={sort}
          options={SORT_OPTIONS}
          onChange={(val) => setFilters((f) => ({ ...f, sort: val }))}
          className="w-44"
        />
      </div>
    </div>
  );
}
