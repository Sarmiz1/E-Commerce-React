import React, { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getProductImages(product) {
  const supabaseImages = product?.product_images?.map(img => img.image_url) || [];
  const all = [product?.image, ...supabaseImages, ...(product?.images || product?.imageList || [])].filter(Boolean);
  return [...new Set(all)];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
export function IconCart({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

export function IconStar({ filled, className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function IconPlus({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

const ProductCard = React.memo(function ProductCard({ product, onQuickView, isCompared, onToggleCompare, canAdd }) {
  const { isDark, colors } = useTheme();
  const images = useMemo(() => getProductImages(product), [product]);
  const [showVid, setShowVid] = useState(false);
  const videoRef = useRef(null);
  
  // Parallax shadow state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = useCallback(() => {
    if (product.video && videoRef.current) {
      setShowVid(true);
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
    }
  }, [product.video]);

  const handleMouseLeave = useCallback(() => {
    if (product.video && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setShowVid(false);
    }
    setMousePos({ x: 0, y: 0 });
  }, [product.video]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const onSale = product.price_cents < 2000;
  const isNew = product.created_at &&
    Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000;

  const handleComparePointerUp = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onToggleCompare === 'function') {
      onToggleCompare(product);
    }
  }, [onToggleCompare, product]);

  return (
    <motion.div
      layout
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className="rounded-xl overflow-hidden transition-all duration-300 flex flex-col group cursor-pointer relative"
      style={{
        background: colors.surface.secondary,
        border: `1px solid ${colors.border.subtle}`,
        // Parallax shadow: shifts slightly away from mouse
        boxShadow: mousePos.x !== 0 
          ? `${-mousePos.x * 15}px ${-mousePos.y * 15}px 30px rgba(0,0,0,${isDark ? 0.4 : 0.1})` 
          : "none",
        transform: mousePos.x !== 0 
          ? `perspective(1000px) rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg) translateY(-4px)` 
          : "none"
      }}
    >
      {/* Image area */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden" style={{ paddingTop: "128%", background: colors.surface.tertiary }}>
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={i === 0 ? product.name : ""}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 transform origin-center ${showVid
              ? "opacity-0"
              : i === 0
                ? "opacity-100"
                : (i === 1 ? "opacity-0 group-hover:opacity-100" : "opacity-0 hidden")
              }`}
          />
        ))}

        {product.video && (
          <video
            ref={videoRef}
            src={product.video}
            muted loop playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 transform origin-center ${showVid ? "opacity-100 z-10" : "opacity-0 pointer-events-none"}`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isNew && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ background: colors.brand.electricBlue, color: colors.text.inverse }}>
              New
            </span>
          )}
          {onSale && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ background: colors.brand.orange, color: "#fff" }}>
              Sale
            </span>
          )}
        </div>

        {/* Image dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {images.slice(0, 5).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === 0 ? "w-3 bg-white group-hover:w-1 group-hover:bg-white/50" :
                  i === 1 ? "w-1 bg-white/50 group-hover:w-3 group-hover:bg-white" :
                    "w-1 bg-white/50"
                  }`}
              />
            ))}
          </div>
        )}

        {/* Compare button — only render when compare feature is enabled */}
        {typeof onToggleCompare === 'function' && (
          <button
            type="button"
            onPointerUp={handleComparePointerUp}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            disabled={!isCompared && !canAdd}
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{
              background: isCompared ? colors.brand.electricBlue : "rgba(255,255,255,0.92)",
              borderColor: isCompared ? colors.brand.electricBlue : "rgba(0,0,0,0.12)",
              color: isCompared ? (isDark ? colors.text.inverse : "#fff") : colors.text.secondary,
            }}
            title={isCompared ? "Remove from compare" : canAdd ? "Compare" : "Max 2"}
          >≡</button>
        )}
      </Link>

      {/* Product info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <Link to={`/products/${product.id}`}>
          <p className="text-xs line-clamp-2 leading-snug transition-colors font-medium"
            style={{ color: colors.text.primary }}
          >{product.name}</p>
        </Link>

        {/* Stars */}
        {product.rating_stars > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex" style={{ color: colors.brand.gold || "#f59e0b" }}>
              {Array(5).fill(0).map((_, i) => (
                <IconStar key={i} filled={i < Math.floor(product.rating_stars)} className="w-2.5 h-2.5" />
              ))}
            </div>
            <span className="text-[10px]" style={{ color: colors.text.tertiary }}>({product.rating_count || 0})</span>
          </div>
        )}

        {/* Price + Cart+ */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-bold text-sm" style={{ color: colors.text.primary }}>
              {formatMoneyCents(product.price_cents)}
            </span>
            {onSale && (
              <span className="text-[10px] line-through opacity-50" style={{ color: colors.text.tertiary }}>
                {formatMoneyCents(Math.round(product.price_cents * 1.35))}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="pg-cart-btn flex-shrink-0"
            title="Quick add"
            aria-label="Quick add to cart"
          >
            <IconCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
