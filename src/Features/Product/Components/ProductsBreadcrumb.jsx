import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconFilter } from "../../../Components/Icons/IconFilter";
import PremiumDropdown from "../../../Components/Ui/PremiumDropdown";
import { SORT_OPTIONS } from "../Utils/constants";

export default function ProductsBreadcrumb({ 
  colors, 
  selectedCategory, 
  sort, 
  setFilters, 
  setMobileFilterOpen 
}) {
  return (
    <div
      className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between border-b"
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

      <div className="flex items-center gap-4">
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
