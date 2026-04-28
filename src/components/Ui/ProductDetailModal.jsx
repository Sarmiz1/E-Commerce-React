import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../Context/theme/ThemeContext";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import { SIZE_TABLES, COLOR_KEYWORDS } from "../../Features/Product/Utils/constants";
import { IconStar } from "../Icons/IconStar";
import { IconPlus } from "../Icons/IconPlus";
import { IconClose } from "../Icons/IconClose";
import { IconSpinner } from "../Icons/IconSpinner";
import { IconHeart } from "../Icons/IconHeart";
import { getProductImages } from "../../Utils/getProductImages";
import WishlistHeart from "./WishlistHeart";
import { useAddToCart } from "../../Hooks/cart/useAddToCart";
import { useProductInventory } from "../../Hooks/useProductInventory";
import { getStoreInfo } from "../../Utils/getStoreInfo";
import { StoreHeader } from "./StoreHeader";
import { prefetchProductOnHover } from "../../Utils/prefetchProductOnHover";
import { getProductCategory } from "../../Features/Product/ProductDetails/Utils/productHelpers";

const ProductDetailModal = React.forwardRef(({ product, onClose }, ref) => {
  const {
    mutate: triggerAdd,
    isPending: loading,
    isSuccess: success,
    error,
  } = useAddToCart(product?.id);

  console.log(product, "product");

  const navigate = useNavigate();
  const images = useMemo(
    () => getProductImages(product).slice(0, 4),
    [product],
  );
  const { colors, isDark } = useTheme();

  // ── Image state ────────────────────────────────────────────────────────────
  const [selectedImg, setSelectedImg] = useState(0);
  const [imgDirection, setImgDirection] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  // ── Selection state ────────────────────────────────────────────────────────
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // ── Size Guide Logic ────────────────────────────────────────────────────────
  const {
    displaySizes,
    productType,
    sizeSystem,
    setSizeSystem,
    availableSystems,
    hasSizes,
    availableColors
  } = useProductInventory(product);

  const goToImage = useCallback(
    (newIdx, forceDir) => {
      setImgDirection(
        forceDir !== undefined ? forceDir : newIdx > selectedImg ? 1 : -1,
      );
      setSelectedImg(newIdx);
    },
    [selectedImg],
  );

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
      if (Math.abs(dx) >= Math.abs(dy)) {
        if (dx < -30) goToImage((selectedImg + 1) % images.length, 1);
        else if (dx > 30)
          goToImage((selectedImg - 1 + images.length) % images.length, -1);
      }
    },
    [selectedImg, images.length, goToImage],
  );

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        goToImage((selectedImg + 1) % images.length, 1);
      if (e.key === "ArrowLeft")
        goToImage((selectedImg - 1 + images.length) % images.length, -1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, selectedImg, images.length, goToImage]);

  const handleViewDetails = useCallback(
    (e) => {
      e.preventDefault();
      navigate(`/products/${product.slug || product.id}`);
      setTimeout(onClose, 120);
    },
    [navigate, product, onClose],
  );

  const onSale = (product?.price_cents || 0) < 2000;
  const currentColorLabel = selectedColor
    ? typeof selectedColor === "object"
      ? selectedColor.label
      : selectedColor
    : null;

  const imgVariants = {
    enter: (dir) => ({ x: dir > 0 ? "25%" : "-25%", opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-10%" : "10%",
      opacity: 0,
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    }),
  };

  // STORE INFO
  const storeInfo = getStoreInfo(product);

  return (
    <motion.div
      ref={ref}
      className="fixed inset-0 z-[1100]"
      style={{ pointerEvents: "none" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
      />

      <div className="absolute inset-0 flex items-end md:items-center justify-center pointer-events-none">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 200,
            mass: 0.8,
          }}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto shadow-2xl overflow-hidden flex flex-col w-full h-[100dvh] max-h-[100dvh] rounded-none md:h-auto md:max-h-[92dvh] md:rounded-3xl md:w-[min(960px,96vw)]"
          style={{ background: colors.surface.elevated }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full backdrop-blur-sm shadow-md flex items-center justify-center transition-all duration-200 border"
            style={{
              background: isDark
                ? "rgba(30,30,34,0.9)"
                : "rgba(255,255,255,0.9)",
              borderColor: colors.border.default,
              color: colors.text.secondary,
            }}
          >
            <IconClose className="w-4 h-4" />
          </button>

          <div
            className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-y-hidden"
            style={{ minHeight: 0 }}
          >
            {/* Gallery */}
            <div
              className="md:w-[60%] flex flex-col-reverse justify-end lg:block relative overflow-hidden flex-shrink-0"
              style={{ background: colors.surface.tertiary }}
            >
              <div
                className="flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden p-3 lg:py-8 lg:px-3 lg:w-[96px] lg:absolute lg:left-0 lg:top-0 lg:bottom-0 z-10 pg-slim"
                style={{
                  background: isDark
                    ? "rgba(20,20,22,0.6)"
                    : "rgba(243,244,246,0.6)",
                }}
              >
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => goToImage(i, i > selectedImg ? 1 : -1)}
                    className={`flex-shrink-0 rounded-[10px] overflow-hidden border-[2.5px] transition-all duration-200 w-[72px] h-[72px] lg:w-full lg:h-auto ${selectedImg === i ? "opacity-100" : "opacity-55 hover:opacity-80"}`}
                    style={{
                      aspectRatio: "1/1",
                      borderColor:
                        selectedImg === i ? colors.text.primary : "transparent",
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {/* Bottom fade for thumbnail overflow */}
                <div
                  className="hidden lg:block absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                  style={{
                    background: `linear-gradient(to top, ${isDark ? "rgba(20,20,22,0.6)" : "rgba(243,244,246,0.6)"}, transparent)`,
                  }}
                />
              </div>

              <div
                className="relative overflow-hidden flex items-center justify-center w-full h-[55dvh] md:h-auto md:aspect-square lg:aspect-auto lg:h-full lg:w-[calc(100%-96px)] lg:ml-[96px]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <AnimatePresence custom={imgDirection}>
                  <motion.div
                    key={selectedImg}
                    custom={imgDirection}
                    variants={imgVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    <img
                      src={images[selectedImg]}
                      alt=""
                      className={`w-full h-full object-cover transition-transform duration-500 ${isZoomed ? "scale-[1.8] cursor-zoom-out" : "scale-100 cursor-zoom-in"}`}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Info */}
            <div className="md:w-[40%] flex flex-col relative md:overflow-hidden pb-32 md:pb-0">
              <div className="flex-1 md:overflow-y-auto space-y-4 pg-slim p-6">
                <div>
                  <p
                    className="text-[10px] mb-1 font-mono uppercase tracking-widest"
                    style={{ color: colors.text.tertiary }}
                  >
                    SKU: {String(product?.id || "").slice(0, 8)}
                  </p>
                  <h2
                    className="text-2xl font-serif font-bold leading-tight"
                    style={{ color: colors.text.primary }}
                  >
                    {product?.name}
                  </h2>
                </div>

                <div
                  className="text-sm leading-relaxed"
                  style={{ color: colors.text.secondary }}
                  onMouseEnter={() => {
                    if (!product?.slug) return;
                    prefetchProductOnHover(product.slug);
                  }}
                >
                  <p className="mb-2">
                    {product?.description ||
                      "Premium quality product with exceptional craftsmanship."}
                  </p>

                  <button
                    onClick={handleViewDetails}
                    className="flex items-center gap-1 text-sm font-semibold text-white-50 hover:text-white-70 transition group"
                  >
                    See more details
                    <span className="transform group-hover:translate-x-1 transition">
                      →
                    </span>
                  </button>
                </div>

                {/* STORE INFORMATION  */}
                <StoreHeader storeInfo={storeInfo} colors={colors} />

                <div className="flex items-center gap-2">
                  <div className="flex" style={{ color: colors.brand.gold }}>
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <IconStar
                          key={i}
                          filled={i < Math.round(product?.rating_stars || 0)}
                          className="w-3.5 h-3.5"
                        />
                      ))}
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    ({(product?.rating_count || 0).toLocaleString()} reviews)
                  </span>
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span
                    className="text-3xl font-black"
                    style={{ color: colors.text.primary }}
                  >
                    {formatMoneyCents(product?.price_cents || 0)}
                  </span>
                  {onSale && (
                    <span
                      className="text-sm line-through"
                      style={{ color: colors.text.tertiary }}
                    >
                      {formatMoneyCents(Math.round(product.price_cents * 1.35))}
                    </span>
                  )}
                </div>

                <div style={{ height: 1, background: colors.border.subtle }} />

                {/* Variants */}
                <div className="space-y-4">
                  <div>
                    <p
                      className="text-xs font-bold mb-2 uppercase tracking-wider"
                      style={{ color: colors.text.secondary }}
                    >
                      Colour{" "}
                      {currentColorLabel && (
                        <span
                          className="ml-1 font-normal"
                          style={{ color: colors.text.tertiary }}
                        >
                          · {currentColorLabel}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {availableColors.map((col) => (
                        <button
                          key={col.label}
                          type="button"
                          onClick={() => setSelectedColor(col.name)}
                          className={`w-8 h-8 rounded-full transition-all ${selectedColor === col.name ? "scale-110 shadow-lg" : "hover:scale-105 opacity-80 hover:opacity-100"}`}
                          style={{
                            background: col.hex,
                            border: `1px solid ${colors.border.subtle}`,
                            boxShadow:
                              selectedColor === col.name
                                ? `0 0 0 2px ${colors.surface.elevated}, 0 0 0 4px ${colors.text.primary}`
                                : undefined,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.text.secondary }}
                      >
                        Size{" "}
                        {selectedSize && (
                          <span
                            className="ml-1 font-normal"
                            style={{ color: colors.text.tertiary }}
                          >
                            · {displaySizes?.find(s => s.raw === selectedSize)?.display || selectedSize}
                          </span>
                        )}
                      </p>
                      {hasSizes && productType && (
                        <button
                          onClick={() => setShowSizeGuide(!showSizeGuide)}
                          className="text-[11px] font-bold hover:underline"
                          style={{ color: colors.text.accent }}
                        >
                          Size Guide
                        </button>
                      )}
                    </div>
                    {hasSizes && (
                      <div className="flex flex-wrap gap-2">
                        {displaySizes?.map((sz) => (
                          <button
                            key={sz.raw}
                            type="button"
                            onClick={() => setSelectedSize(sz.raw)}
                            className="min-w-[44px] px-3 py-2 text-xs font-bold rounded-xl border transition-all"
                            style={
                              selectedSize === sz.raw
                                ? {
                                    background: colors.text.primary,
                                    color: colors.text.inverse,
                                    borderColor: colors.text.primary,
                                  }
                                : {
                                    background: colors.surface.primary,
                                    color: colors.text.secondary,
                                    borderColor: colors.border.default,
                                  }
                            }
                          >
                            {sz.display}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Size Guide Table */}
                    <AnimatePresence>
                      {showSizeGuide &&
                        productType &&
                        SIZE_TABLES[productType] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="mt-3 rounded-xl overflow-hidden border"
                              style={{ borderColor: colors.border.subtle }}
                            >
                              <div
                                className="flex gap-1 p-2"
                                style={{
                                  background: colors.surface.tertiary,
                                }}
                              >
                                {availableSystems?.map((sys) => (
                                  <button
                                    key={sys}
                                    onClick={() => setSizeSystem(sys)}
                                    className="px-3 py-1 text-[10px] font-bold rounded-lg transition-all"
                                    style={
                                      sizeSystem === sys
                                        ? {
                                            background: colors.cta.primary,
                                            color: colors.cta.primaryText,
                                          }
                                        : { color: colors.text.tertiary }
                                    }
                                  >
                                    {sys}
                                  </button>
                                ))}
                              </div>
                              <div className="grid grid-cols-4 gap-px p-2">
                                {(productType && SIZE_TABLES[productType] && SIZE_TABLES[productType][sizeSystem]
                                  ? SIZE_TABLES[productType][sizeSystem]
                                  : []
                                ).map((sz) => (
                                  <div
                                    key={sz}
                                    className="text-center py-1.5 text-[11px] font-medium rounded"
                                    style={{
                                      color: colors.text.secondary,
                                    }}
                                  >
                                    {sz}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div
                className="fixed bottom-0 left-0 right-0 md:static p-6 pt-4 space-y-3 z-50 md:z-auto transition-all"
                style={{
                  background: colors.surface.elevated,
                  borderTop: `1px solid ${colors.border.subtle}`,
                  boxShadow: isDark
                    ? "0 -10px 30px rgba(0,0,0,0.5)"
                    : "0 -10px 30px rgba(0,0,0,0.05)",
                }}
              >
                <div className="flex items-center justify-between">
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: colors.text.secondary }}
                  >
                    Quantity
                  </p>
                  <div
                    className="flex items-center rounded-xl overflow-hidden"
                    style={{
                      border: `1px solid ${colors.border.default}`,
                      background: isDark
                        ? colors.surface.tertiary
                        : "rgba(249,250,251,0.5)",
                    }}
                  >
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-10 h-10 flex items-center justify-center font-bold transition-colors"
                      style={{ color: colors.text.primary }}
                    >
                      −
                    </button>
                    <span
                      className="w-10 text-center font-black text-sm tabular-nums"
                      style={{ color: colors.text.primary }}
                    >
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(Math.min(20, qty + 1))}
                      className="w-10 h-10 flex items-center justify-center font-bold transition-colors"
                      style={{ color: colors.text.primary }}
                    >
                      <IconPlus />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => {
                      const matchedVariant = product?.product_variants?.find(
                        (v) =>
                          (!selectedColor || v.color === selectedColor) &&
                          (!selectedSize || v.size === selectedSize),
                      );
                      triggerAdd(e, {
                        variantId: matchedVariant?.id,
                        quantity: qty,
                      });
                    }}
                    disabled={loading}
                    className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all relative overflow-hidden"
                    style={
                      success
                        ? {
                            background: colors.state.success,
                            color: "#fff",
                          }
                        : error
                          ? { background: "#ef4444", color: "#fff" }
                          : {
                              background: colors.cta.primary,
                              color: colors.cta.primaryText,
                            }
                    }
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center justify-center"
                        >
                          <IconSpinner className="w-5 h-5" />
                        </motion.span>
                      ) : success ? (
                        <motion.span
                          key="success"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <motion.span
                            initial={{ rotate: -180 }}
                            animate={{ rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            ✓
                          </motion.span>{" "}
                          Added to Cart
                        </motion.span>
                      ) : error ? (
                        <motion.span
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Failed — Retry
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          Add to Cart
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {/* Sparkle burst on success */}
                    {success && (
                      <>
                        {[...Array(6)].map((_, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                            animate={{
                              opacity: 0,
                              scale: 1,
                              x: (i % 2 ? 1 : -1) * (20 + i * 10),
                              y: -(15 + i * 8),
                            }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                            className="absolute text-[10px] pointer-events-none"
                            style={{ left: "50%", top: "50%" }}
                          >
                            ✦
                          </motion.span>
                        ))}
                      </>
                    )}
                  </motion.button>

                  <WishlistHeart 
                    className="w-14 !h-[unset] aspect-square rounded-2xl border flex items-center justify-center transition-all"
                    showOnHover={false}
                    isLiked={wishlisted}
                    onToggle={setWishlisted}
                  />
                </div>
                {/* Error Message */}
                {error && (
                  <div
                    className="text-xs font-medium mt-1 italic ml-4"
                    style={{ color: "#ef4444" }}
                  >
                    {error.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

export default ProductDetailModal;
