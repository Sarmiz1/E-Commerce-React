import React from "react";
import { motion } from "framer-motion";

/**
 * QuickView button component
 * Triggers a global 'open-quickview' event that the HomePage or ProductPage listens to.
 */
const QuickView = ({ 
  product, 
  className = "top-3 right-3",
  variant = "default" 
}) => {
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    
    // Dispatch custom event for the global listener
    window.dispatchEvent(new CustomEvent('open-quickview', { 
      detail: product 
    }));
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleQuickView}
      className={`absolute z-20 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-md text-gray-600 hover:text-indigo-600 transition-all duration-300 pointer-events-auto opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 ${className}`}
      title="Quick View"
    >
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
        />
      </svg>
    </motion.button>
  );
};

export default QuickView;
