import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Store, ChevronDown, Check } from "lucide-react";

export default function FloatingSelect({ label, value, onChange, options, colors, isDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  const active = focused || value.length > 0 || isOpen;
  const selectedOption = options.find(o => o.value === value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    // Simulate native event structure for the onChange handler
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", marginBottom: 13, zIndex: isOpen ? 50 : 1 }}>
      {/* Floating label */}
      <label
        style={{
          position: "absolute",
          left: 46,
          zIndex: 2,
          top: active ? 8 : "50%",
          transform: active ? "translateY(0)" : "translateY(-50%)",
          fontSize: active ? 9.5 : 13.5,
          fontWeight: active ? 700 : 400,
          color: focused || isOpen ? colors.cta.primary : colors.text.tertiary,
          letterSpacing: active ? "0.08em" : "-0.01em",
          textTransform: active ? "uppercase" : "none",
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {label}
      </label>

      {/* Left icon */}
      <div
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          color: focused || isOpen ? colors.cta.primary : colors.text.tertiary,
          transition: "color 0.2s",
        }}
      >
        <Store size={16} />
      </div>

      {/* The Fake Input Button */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setFocused(true);
        }}
        style={{
          width: "100%",
          height: 56,
          borderRadius: 14,
          boxSizing: "border-box",
          border: `1.5px solid ${focused || isOpen ? colors.cta.primary : colors.border.default}`,
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : colors.surface.secondary,
          color: value ? colors.text.primary : "transparent",
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "inherit",
          paddingTop: active ? 18 : 0,
          paddingBottom: active ? 4 : 0,
          paddingLeft: 46,
          paddingRight: 36,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused || isOpen ? `0 0 0 3px ${colors.cta.primary}20` : "none",
        }}
      >
        {selectedOption ? selectedOption.label : ""}
      </div>

      {/* Right chevron */}
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          marginTop: -8, // Half of height to perfectly center
          zIndex: 2,
          color: colors.text.tertiary,
          pointerEvents: "none",
        }}
      >
        <ChevronDown size={16} />
      </motion.div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: isDark ? "#131315" : "#ffffff",
              border: `1px solid ${colors.border.default}`,
              borderRadius: 14,
              boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
              overflow: "hidden",
              zIndex: 100,
            }}
          >
            <div
              style={{
                maxHeight: 220,
                overflowY: "auto",
                padding: "8px 0",
              }}
              className="woo-form-scroll" // Re-using scrollbar hide class
            >
              {options.map((o) => (
                <div
                  key={o.value}
                  onClick={() => handleSelect(o.value)}
                  style={{
                    padding: "12px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    background: value === o.value ? (isDark ? `${colors.cta.primary}1a` : `${colors.cta.primary}10`) : "transparent",
                    color: value === o.value ? colors.cta.primary : colors.text.primary,
                    fontSize: 14,
                    fontWeight: value === o.value ? 700 : 500,
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (value !== o.value) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (value !== o.value) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {o.label}
                  {value === o.value && <Check size={16} color={colors.cta.primary} />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
