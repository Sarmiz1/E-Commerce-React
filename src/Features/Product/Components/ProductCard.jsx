import React, { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { IconCart } from "../../../Components/Icons/IconCart"; 
import { IconStar } from "../../../Components/Icons/IconStar"; 
import { getProductImages } from "../../../Utils/getProductImages"; 
import WishlistHeart from "../../../Components/Ui/WishlistHeart";
import CompareButton from "../../../Components/Ui/CompareButton";

const checkDate = (product) => Date.now() - new Date(product?.created_at).getTime() < 30 * 24 * 60 * 60 * 1000;

const ProductCard = React.memo(function ProductCard({ product, onQuickView, isCompared, onToggleCompare, canAdd }) {
  const { isDark, colors } = useTheme();
  const images = useMemo(() => getProductImages(product), [product]);
  const [showVid, setShowVid] = useState(false);
  const videoRef = useRef(null);
  
  // ── Image hover carousel ──
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const maxImages = Math.min(images.length, 5);

  const handleImageMouseMove = useCallback((e) => {
    if (maxImages <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const idx = Math.min(Math.floor(x * maxImages), maxImages - 1);
    setActiveImgIdx(idx);
  }, [maxImages]);

  // ── Parallax shadow ──
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
    setActiveImgIdx(0);
  }, [product.video]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const onSale = product.price_cents < 2000;
  const isNew = product.created_at && checkDate(product);

  return (
    <motion.div
      layout
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className="pg-card-enter rounded-2xl overflow-hidden transition-all duration-300 flex flex-col group cursor-pointer relative"
      style={{
        background: colors.surface.secondary,
        border: `1px solid ${colors.border.subtle}`,
        boxShadow: mousePos.x !== 0 
          ? `${-mousePos.x * 15}px ${-mousePos.y * 15}px 30px rgba(0,0,0,${isDark ? 0.4 : 0.1})` 
          : isDark ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: mousePos.x !== 0 
          ? `perspective(1000px) rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg) translateY(-4px)` 
          : "none"
      }}
    >
      {/* Image area with hover carousel */}
      <Link 
        to={`/products/${product.slug || product.id}`} 
        className="relative block overflow-hidden" 
        style={{ paddingTop: "133%", background: colors.surface.tertiary }}
        onMouseMove={handleImageMouseMove}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={i === 0 ? product.name : ""}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105 transform origin-center ${showVid
              ? "opacity-0"
              : i === activeImgIdx
                ? "opacity-100"
                : "opacity-0"
              }`}
          />
        ))}

        {product.video && (
          <video
            ref={videoRef}
            src={product.video}
            muted loop playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 transform origin-center ${showVid ? "opacity-100 z-10" : "opacity-0 pointer-events-none"}`}
          />
        )}

        {/* Hover zone indicators (invisible, shows which zone you're in) */}
        {maxImages > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-8 flex justify-center items-end pb-2 gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {images.slice(0, maxImages).map((_, i) => (
              <div
                key={i}
                className="h-[3px] rounded-full transition-all duration-300"
                style={{
                  width: i === activeImgIdx ? 16 : 6,
                  background: i === activeImgIdx ? "#fff" : "rgba(255,255,255,0.45)",
                  boxShadow: i === activeImgIdx ? "0 0 6px rgba(255,255,255,0.5)" : "none",
                }}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isNew && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-md"
              style={{ background: colors.brand.electricBlue, color: colors.text.inverse }}>
              New
            </span>
          )}
          {onSale && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-md"
              style={{ background: colors.brand.orange, color: "#fff" }}>
              Sale
            </span>
          )}
        </div>

        {/* Wishlist heart */}
        <WishlistHeart 
          onToggle={(status) => console.log(`Product ${product.id} liked: ${status}`)}
        />

        {/* Compare button */}
        <CompareButton 
          product={product}
          isCompared={isCompared}
          onToggleCompare={onToggleCompare}
          canAdd={canAdd}
        />

        {/* Bottom gradient for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-[1]" />
      </Link>

      {/* Product info */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <Link to={`/products/${product.slug || product.id}`}>
          <p className="text-[13px] line-clamp-2 leading-[1.35] transition-colors font-medium group-hover:text-indigo-600"
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

        {/* Price + Cart */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1.5">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-black text-[15px]" style={{ color: colors.text.primary }}>
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
            title="Quick view"
            aria-label="Quick view product"
          >
            <IconCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
