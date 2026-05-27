import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../Store/useThemeStore";

/**
 * CompareButton component
 * Handles the logic for adding/removing a product from the comparison list.
 */
const CompareButton = ({ 
  product, 
  isCompared, 
  onToggleCompare, 
  canAdd,
  className = "bottom-10 right-2.5" 
}) => {
  const { isDark, colors } = useTheme();

  if (typeof onToggleCompare !== 'function') return null;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleCompare(product);
  };

  const isDisabled = !isCompared && !canAdd;

  return (
    <motion.button
      type="button"
      whileHover={!isDisabled ? { scale: 1.1 } : {}}
      whileTap={!isDisabled ? { scale: 0.9 } : {}}
      onPointerUp={handleToggle}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      disabled={isDisabled}
      className={`absolute z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto ${className} ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
      style={{
        background: isCompared ? colors.brand.electricBlue : "rgba(255,255,255,0.92)",
        borderColor: isCompared ? colors.brand.electricBlue : "rgba(0,0,0,0.12)",
        color: isCompared ? (isDark ? colors.text.inverse : "#fff") : colors.text.secondary,
      }}
      title={isCompared ? "Remove from compare" : canAdd ? "Compare" : "Max 2"}
    >
      <svg 
        className="w-3.5 h-3.5" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    </motion.button>
  );
};

export default CompareButton;
