import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useCartActions } from "../../../Context/cart/CartContext";
import { SIZE_TABLES } from "../constants";
import { getProductImages, IconStar, IconPlus } from "./ProductCard";

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconClose({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function IconChevRight({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function IconSpinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// Helper local to this component for now
function deriveProductOptions(product) {
  if (!product) return { sizes: null, colors: null, sizeType: "Standard", productType: null };
  const text = [product.name || "", ...(product.keywords || [])].join(" ").toLowerCase();
  
  let productType = null;
  if (text.match(/shoe|boot|sneaker|footwear|heel|sandal/)) productType = "footwear";
  else if (text.match(/shirt|dress|top|pant|jacket|hoodie|clothing|apparel/)) productType = "apparel";

  let sizeType = "Standard";
  const sizes = product.sizes || null;
  const colors = product.colors || null;

  return { sizes, colors, sizeType, productType };
}

const ProductDetailModal = React.forwardRef(({ product, onClose, onCartAdded }, ref) => {
  const navigate = useNavigate();
  const { addItem } = useCartActions();
  const images = useMemo(() => getProductImages(product).slice(0, 4), [product]);
  const { sizes, colors, sizeType: detectedSizeType, productType } = useMemo(
    () => deriveProductOptions(product), [product]
  );
  const { colors: themeColors, isDark } = useTheme();

  // ── Image state ────────────────────────────────────────────────────────────
  const [selectedImg, setSelectedImg] = useState(0);
  const [imgDirection, setImgDirection] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  // ── Selection state ────────────────────────────────────────────────────────
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizeSystem, setSizeSystem] = useState("Standard");
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addState, setAddState] = useState("idle");
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const availableSystems = useMemo(() => {
    if (!productType || !SIZE_TABLES[productType]) return null;
    return Object.keys(SIZE_TABLES[productType]);
  }, [productType]);

  const displaySizes = useMemo(() => {
    if (!sizes || !sizes.length) return null;
    if (!productType || !availableSystems) return sizes;
    const table = SIZE_TABLES[productType];
    if (!table || !table[sizeSystem]) return sizes;
    const systems = Object.entries(table);
    for (const [sys, vals] of systems) {
      const matches = sizes.filter((s) => vals.includes(String(s)));
      if (matches.length >= Math.ceil(sizes.length * 0.5)) {
        return sizes.map((s) => {
          const idx = vals.indexOf(String(s));
          return idx !== -1 ? table[sizeSystem][idx] || s : s;
        });
      }
    }
    return table[sizeSystem] || sizes;
  }, [sizes, sizeSystem, productType, availableSystems]);

  const goToImage = useCallback((newIdx, forceDir) => {
    setImgDirection(forceDir !== undefined ? forceDir : newIdx > selectedImg ? 1 : -1);
    setSelectedImg(newIdx);
  }, [selectedImg]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx < -30) goToImage((selectedImg + 1) % images.length, 1);
      else if (dx > 30) goToImage((selectedImg - 1 + images.length) % images.length, -1);
    }
  }, [selectedImg, images.length, goToImage]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goToImage((selectedImg + 1) % images.length, 1);
      if (e.key === "ArrowLeft") goToImage((selectedImg - 1 + images.length) % images.length, -1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, selectedImg, images.length, goToImage]);

  const handleAddToCart = useCallback(async () => {
    if (addState !== "idle") return;
    setAddState("loading");
    try {
      // Find matching variant if product_variants exists
      let variantId = null;
      if (product.product_variants && product.product_variants.length > 0) {
        const match = product.product_variants.find(v => {
          const sizeMatch = !selectedSize || String(v.size) === String(selectedSize);
          const colorMatch = !selectedColor || v.color === (typeof selectedColor === "object" ? selectedColor.label : selectedColor);
          return sizeMatch && colorMatch;
        });
        variantId = match?.id || product.product_variants[0].id;
      }

      await addItem(product.id, variantId, qty);
      
      setAddState("success");
      setTimeout(() => {
        setAddState("idle");
        onCartAdded?.();
      }, 1600);
    } catch {
      setAddState("error");
      setTimeout(() => setAddState("idle"), 2500);
    }
  }, [addState, product.id, product.product_variants, qty, selectedSize, selectedColor, addItem, onCartAdded]);

  const handleViewDetails = useCallback((e) => {
    e.preventDefault();
    navigate(`/products/${product.slug || product.id}`);
    setTimeout(onClose, 120);
  }, [navigate, product, onClose]);

  const onSale = product.price_cents < 2000;
  const currentColorLabel = selectedColor
    ? (typeof selectedColor === "object" ? selectedColor.label : selectedColor)
    : null;

  const imgVariants = {
    enter: (dir) => ({ x: dir > 0 ? "25%" : "-25%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
    exit: (dir) => ({ x: dir > 0 ? "-10%" : "10%", opacity: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }),
  };

  return (
    <motion.div ref={ref} className="fixed inset-0 z-[1100]" style={{ pointerEvents: 'none' }}>
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
          transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto shadow-2xl overflow-hidden flex flex-col w-full h-[100dvh] max-h-[100dvh] rounded-none md:h-auto md:max-h-[92dvh] md:rounded-3xl md:w-[min(960px,96vw)]"
          style={{ background: themeColors.surface.elevated }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full backdrop-blur-sm shadow-md flex items-center justify-center transition-all duration-200 border"
            style={{ background: isDark ? 'rgba(30,30,34,0.9)' : 'rgba(255,255,255,0.9)', borderColor: themeColors.border.default, color: themeColors.text.secondary }}
          >
            <IconClose className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-y-hidden" style={{ minHeight: 0 }}>
            {/* Gallery */}
            <div className="md:w-[60%] flex flex-col-reverse justify-end lg:block relative overflow-hidden flex-shrink-0" style={{ background: themeColors.surface.tertiary }}>
              <div className="flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden p-3 lg:py-8 lg:px-3 lg:w-[96px] lg:absolute lg:left-0 lg:top-0 lg:bottom-0 z-10 pg-slim" style={{ background: isDark ? 'rgba(20,20,22,0.6)' : 'rgba(243,244,246,0.6)' }}>
                {images.map((src, i) => (
                  <button key={i} onClick={() => goToImage(i, i > selectedImg ? 1 : -1)} className={`flex-shrink-0 rounded-[10px] overflow-hidden border-[2.5px] transition-all duration-200 w-[72px] h-[72px] lg:w-full lg:h-auto ${selectedImg === i ? "opacity-100" : "opacity-55 hover:opacity-80"}`} style={{ aspectRatio: "1/1", borderColor: selectedImg === i ? themeColors.text.primary : 'transparent' }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {/* Bottom fade for thumbnail overflow */}
                <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{ background: `linear-gradient(to top, ${isDark ? 'rgba(20,20,22,0.6)' : 'rgba(243,244,246,0.6)'}, transparent)` }} />
              </div>

              <div className="relative overflow-hidden flex items-center justify-center w-full h-[55dvh] md:h-auto md:aspect-square lg:aspect-auto lg:h-full lg:w-[calc(100%-96px)] lg:ml-[96px]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onClick={() => setIsZoomed(!isZoomed)}>
                <AnimatePresence custom={imgDirection}>
                  <motion.div key={selectedImg} custom={imgDirection} variants={imgVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0">
                    <img src={images[selectedImg]} alt="" className={`w-full h-full object-cover transition-transform duration-500 ${isZoomed ? "scale-[1.8] cursor-zoom-out" : "scale-100 cursor-zoom-in"}`} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Info */}
            <div className="md:w-[40%] flex flex-col relative md:overflow-hidden pb-32 md:pb-0">
              <div className="flex-1 md:overflow-y-auto space-y-4 pg-slim p-6">
                <div>
                   <p className="text-[10px] mb-1 font-mono uppercase tracking-widest" style={{ color: themeColors.text.tertiary }}>SKU: {String(product.id).slice(0, 8)}</p>
                   <h2 className="text-2xl font-serif font-bold leading-tight" style={{ color: themeColors.text.primary }}>{product.name}</h2>
                </div>

                <p className="text-sm leading-relaxed" style={{ color: themeColors.text.secondary }}>{product.description || "Premium quality product with exceptional craftsmanship."}</p>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium" style={{ color: themeColors.text.tertiary }}>Sold by</span>
                  <Link to={`/sellers/${product.seller_id}`} onClick={handleViewDetails} className="font-bold hover:underline" style={{ color: themeColors.text.accent }}>{product.seller_name || "Premium Store"}</Link>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex" style={{ color: themeColors.brand.gold }}>
                    {Array(5).fill(0).map((_, i) => <IconStar key={i} filled={i < Math.round(product.rating_stars || 0)} className="w-3.5 h-3.5" />)}
                  </div>
                  <span className="text-xs font-medium" style={{ color: themeColors.text.secondary }}>({(product.rating_count || 0).toLocaleString()} reviews)</span>
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black" style={{ color: themeColors.text.primary }}>{formatMoneyCents(product.price_cents)}</span>
                  {onSale && <span className="text-sm line-through" style={{ color: themeColors.text.tertiary }}>{formatMoneyCents(Math.round(product.price_cents * 1.35))}</span>}
                </div>

                <div style={{ height: 1, background: themeColors.border.subtle }} />

                {/* Variants */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Colour {currentColorLabel && <span className="ml-1 font-normal" style={{ color: themeColors.text.tertiary }}>· {currentColorLabel}</span>}</p>
                    <div className="flex flex-wrap gap-3">
                      {(colors || [{ hex: "#1a1a2e", label: "Midnight" }, { hex: "#f8fafc", label: "Silver" }]).map((col) => (
                        <button 
                          key={col.label} 
                          type="button" 
                          onClick={() => setSelectedColor(col)} 
                          className={`w-8 h-8 rounded-full transition-all ${selectedColor === col ? "scale-110 shadow-lg" : "hover:scale-105 opacity-80 hover:opacity-100"}`} 
                          style={{ 
                            background: col.hex, 
                            border: `1px solid ${themeColors.border.subtle}`,
                            boxShadow: selectedColor === col ? `0 0 0 2px ${themeColors.surface.elevated}, 0 0 0 4px ${themeColors.text.primary}` : undefined 
                          }} 
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Size {selectedSize && <span className="ml-1 font-normal" style={{ color: themeColors.text.tertiary }}>· {selectedSize}</span>}</p>
                      <button onClick={() => setShowSizeGuide(!showSizeGuide)} className="text-[11px] font-bold hover:underline" style={{ color: themeColors.text.accent }}>Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(displaySizes || ["S", "M", "L", "XL"]).map((sz) => (
                        <button key={sz} type="button" onClick={() => setSelectedSize(sz)} className="min-w-[44px] px-3 py-2 text-xs font-bold rounded-xl border transition-all" style={selectedSize === sz ? { background: themeColors.text.primary, color: themeColors.text.inverse, borderColor: themeColors.text.primary } : { background: themeColors.surface.primary, color: themeColors.text.secondary, borderColor: themeColors.border.default }}>{sz}</button>
                      ))}
                    </div>

                    {/* Size Guide Table */}
                    <AnimatePresence>
                      {showSizeGuide && productType && SIZE_TABLES[productType] && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-3 rounded-xl overflow-hidden border" style={{ borderColor: themeColors.border.subtle }}>
                            <div className="flex gap-1 p-2" style={{ background: themeColors.surface.tertiary }}>
                              {availableSystems?.map((sys) => (
                                <button key={sys} onClick={() => setSizeSystem(sys)} className="px-3 py-1 text-[10px] font-bold rounded-lg transition-all" style={sizeSystem === sys ? { background: themeColors.cta.primary, color: themeColors.cta.primaryText } : { color: themeColors.text.tertiary }}>{sys}</button>
                              ))}
                            </div>
                            <div className="grid grid-cols-4 gap-px p-2">
                              {(SIZE_TABLES[productType][sizeSystem] || []).map((sz) => (
                                <div key={sz} className="text-center py-1.5 text-[11px] font-medium rounded" style={{ color: themeColors.text.secondary }}>{sz}</div>
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
              <div className="fixed bottom-0 left-0 right-0 md:static p-6 pt-4 space-y-3 z-50 md:z-auto transition-all" style={{ background: themeColors.surface.elevated, borderTop: `1px solid ${themeColors.border.subtle}`, boxShadow: isDark ? '0 -10px 30px rgba(0,0,0,0.5)' : '0 -10px 30px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center justify-between">
                   <p className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Quantity</p>
                   <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${themeColors.border.default}`, background: isDark ? themeColors.surface.tertiary : 'rgba(249,250,251,0.5)' }}>
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center font-bold transition-colors" style={{ color: themeColors.text.primary }}>−</button>
                      <span className="w-10 text-center font-black text-sm tabular-nums" style={{ color: themeColors.text.primary }}>{qty}</span>
                      <button onClick={() => setQty(Math.min(20, qty + 1))} className="w-10 h-10 flex items-center justify-center font-bold transition-colors" style={{ color: themeColors.text.primary }}><IconPlus /></button>
                   </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleAddToCart}
                    disabled={addState === "loading"}
                    className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all relative overflow-hidden"
                    style={addState === "success" ? { background: themeColors.state.success, color: '#fff' } : addState === "error" ? { background: '#ef4444', color: '#fff' } : { background: themeColors.cta.primary, color: themeColors.cta.primaryText }}
                  >
                    <AnimatePresence mode="wait">
                      {addState === "loading" ? (
                        <motion.span key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center justify-center">
                          <IconSpinner className="w-5 h-5" />
                        </motion.span>
                      ) : addState === "success" ? (
                        <motion.span key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="flex items-center justify-center gap-2">
                          <motion.span initial={{ rotate: -180 }} animate={{ rotate: 0 }} transition={{ type: "spring", stiffness: 300 }}>✓</motion.span> Added to Cart
                        </motion.span>
                      ) : addState === "error" ? (
                        <motion.span key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Failed — Retry</motion.span>
                      ) : (
                        <motion.span key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Add to Cart</motion.span>
                      )}
                    </AnimatePresence>
                    {/* Sparkle burst on success */}
                    {addState === "success" && (
                      <>
                        {[...Array(6)].map((_, i) => (
                          <motion.span key={i} initial={{ opacity: 1, scale: 0, x: 0, y: 0 }} animate={{ opacity: 0, scale: 1, x: (i % 2 ? 1 : -1) * (20 + i * 10), y: -(15 + i * 8) }} transition={{ duration: 0.6, delay: i * 0.05 }} className="absolute text-[10px] pointer-events-none" style={{ left: '50%', top: '50%' }}>
                            ✦
                          </motion.span>
                        ))}
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setWishlisted(!wishlisted)}
                    className="w-14 rounded-2xl border flex items-center justify-center transition-all"
                    style={wishlisted ? { background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#fecaca', color: '#ef4444' } : { borderColor: themeColors.border.default, color: themeColors.text.tertiary }}
                  >
                    <svg className="w-6 h-6" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

export default ProductDetailModal;
