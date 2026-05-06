import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "../../hooks/useWishlist";

const WishlistHeart = ({ 
  productId,
  isLiked: initialLiked = false, 
  onToggle, 
  className = "absolute top-2.5 right-2.5",
  showOnHover = true 
}) => {
  const [fallbackLiked, setFallbackLiked] = useState(initialLiked);
  const {
    isWishlisted,
    toggleWishlist,
    isPending,
  } = useWishlist(productId, { initialLiked });

  useEffect(() => {
    setFallbackLiked(initialLiked);
  }, [initialLiked]);

  const isLiked = productId ? isWishlisted : fallbackLiked;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = !isLiked;

    if (productId) {
      toggleWishlist();
    } else {
      setFallbackLiked(newStatus);
    }

    if (onToggle) onToggle(newStatus);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 backdrop-blur-md shadow-sm ${showOnHover ? "opacity-0 group-hover:opacity-100" : "opacity-100"} ${className}`}
      style={{
        background: isLiked ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.8)",
        border: `1px solid ${isLiked ? "rgba(239, 68, 68, 0.2)" : "rgba(0, 0, 0, 0.05)"}`,
        opacity: isPending ? 0.7 : undefined,
      }}
      title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isLiked}
      aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Heart Icon */}
        <svg
          className={`w-full h-full transition-colors duration-300 ${isLiked ? "text-red-500 fill-current" : "text-gray-600 hover:text-red-500"}`}
          fill={isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>

        {/* Burst effect on click (optional premium touch) */}
        <AnimatePresence>
          {isLiked && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-red-500 rounded-full pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>
    </button>
  );
};

export default WishlistHeart;
