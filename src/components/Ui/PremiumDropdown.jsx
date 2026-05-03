import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../store/useThemeStore";

export default function PremiumDropdown({ value, options, onChange, label, className = "" }) {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>{label}</p>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer transition-all duration-300 border"
        style={{
          background: colors.surface.primary,
          borderColor: isOpen ? colors.brand.electricBlue : colors.border.default,
          color: colors.text.primary,
          boxShadow: isOpen ? `0 0 0 3px ${colors.brand.electricBlue}15` : "none",
        }}
      >
        <span className="truncate font-medium">{selectedOption.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="opacity-40"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[100] left-0 right-0 rounded-xl overflow-hidden shadow-2xl border backdrop-blur-xl"
            style={{
              background: isDark ? "rgba(25, 25, 28, 0.92)" : "rgba(255, 255, 255, 0.92)",
              borderColor: colors.border.default,
            }}
          >
            <div className="py-1.5 max-h-64 overflow-y-auto pg-slim">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm pg-dropdown-item flex items-center justify-between group"
                  style={{
                    color: value === option.value ? colors.brand.electricBlue : colors.text.primary,
                    background: value === option.value ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)") : "transparent",
                  }}
                >
                  <span className={`transition-all duration-300 ${value === option.value ? "translate-x-1 font-bold" : "group-hover:translate-x-1"}`}>
                    {option.label}
                  </span>
                  {value === option.value && (
                    <motion.span layoutId="active-check" className="w-1.5 h-1.5 rounded-full" style={{ background: colors.brand.electricBlue }} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
