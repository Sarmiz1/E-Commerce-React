import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

import { IconSpinner } from '../../../../Components/Icons/IconSpinner';
import ProductCard from '../../../../Components/Ui/ProductCard';
import { ErrorMessage } from '../../../../Components/ErrorMessage';
import { 
  BagIcon, HeartIcon, ShareIcon, ChevronLeft, ChevronRight, 
  CheckIcon, SpinnerIcon, ShieldIcon, TruckIcon, RefreshIcon, 
  BellIcon, CloseIcon, LockIcon 
} from './Icons';
// import { 
//   loadReviewerName, saveReviewerName, getAvatarGradient, 
//   computeRatingDistribution, computeDemandScore, generateSparklinePoints, 
//   seededRand, savePriceAlert, hasPriceAlert
// } from '../Utils/productHelpers';
// import { useMagnetic } from '../Hooks/useMagnetic';

import { ProductIntelPanel } from './ProductIntelPanel';

const playHapticClick = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {}
};

// ─── ThumbnailGallery — with fixed magnifier ─────────────────────────────────
const ZOOM_FACTOR = 2.8;
const LENS_SIZE = 150;

export function ThumbnailGallery({ product, imageRef }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track container actual dimensions so zoom calc is always accurate
  const mainImageRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 500, h: 500 });

  useEffect(() => {
    const el = mainImageRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0) setContainerSize({ w: width, h: height });
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const views = useMemo(() => {
    if (product.product_images?.length > 0) return product.product_images.map((img, i) => ({ src: img.image_url, label: `View ${i + 1}` }));
    return [
      { src: product.image, label: "Front" },
      { src: product.image, label: "Side", transform: "scaleX(-1)" },
      { src: product.image, label: "Detail", objectPosition: "center 25%" },
      { src: product.image, label: "Back", filter: "brightness(0.9) saturate(1.1)" },
    ];
  }, [product.image, product.product_images]);

  useEffect(() => {
    const h = e => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setDirection(1); setActiveIndex(p => (p + 1) % views.length); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setDirection(-1); setActiveIndex(p => (p - 1 + views.length) % views.length); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [views.length]);

  const cv = views[activeIndex];
  const slideV = {
    enter: dir => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: dir => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
  };

  const handleMouseMove = useCallback((e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Clamp so lens stays fully inside container
    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
      setMousePos({ x, y });
      setZoomActive(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => setZoomActive(false), []);

  // Lens clamped position — keeps lens bubble inside the image div
  const lensLeft = Math.min(Math.max(mousePos.x - LENS_SIZE / 2, 0), containerSize.w - LENS_SIZE);
  const lensTop = Math.min(Math.max(mousePos.y - LENS_SIZE / 2, 0), containerSize.h - LENS_SIZE);

  // The zoomed image is positioned so the point under the cursor appears at lens center
  const zoomedW = containerSize.w * ZOOM_FACTOR;
  const zoomedH = containerSize.h * ZOOM_FACTOR;
  const zoomedLeft = -(mousePos.x * ZOOM_FACTOR - LENS_SIZE / 2);
  const zoomedTop = -(mousePos.y * ZOOM_FACTOR - LENS_SIZE / 2);

  return (
    <div ref={imageRef} className="pd-fade-in">
      <div className="flex gap-4">
        {/* Thumb strip */}
        <div className="flex flex-col gap-2.5 pd-thumbs overflow-y-auto" style={{ maxHeight: 520 }}>
          {views.map((v, i) => (
            <motion.button key={i} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => { 
                playHapticClick();
                setDirection(i > activeIndex ? 1 : -1); 
                setActiveIndex(i); 
              }}
              className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300"
              style={{
                border: i === activeIndex ? "1px solid var(--gold)" : "1px solid var(--pd-b2)",
                opacity: i === activeIndex ? 1 : 0.5,
                background: "var(--smoke)",
              }}>
              <img src={v.src} alt={v.label} className="w-full h-full object-cover"
                style={{ transform: v.transform || "none", objectPosition: v.objectPosition || "center", filter: v.filter || "none" }}
                onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200?text=?"; }} />
            </motion.button>
          ))}
        </div>

        {/* Main image */}
        <div className="flex-1">
          <div
            ref={mainImageRef}
            className="pd-img-wrap relative rounded-2xl overflow-hidden"
            style={{ aspectRatio: "1/1", background: "var(--smoke)" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <AnimatePresence custom={direction} mode="wait">
              <motion.img key={activeIndex} custom={direction} variants={slideV} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                src={cv.src} alt={product.name}
                onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/600x600?text=No+Image"; }}
                className="pd-img-zoom absolute inset-0 w-full h-full object-cover"
                style={{ transform: cv.transform || "none", objectPosition: cv.objectPosition || "center", filter: cv.filter || "none" }} />
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product?.created_at && (Date.now() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 && (
                <span className="pd-chip px-3 py-1.5 rounded-full text-white" style={{ background: "rgba(10,10,11,0.7)", backdropFilter: "blur(8px)", border: "1px solid var(--gold)", color: "var(--gold-light)" }}>Nouveau</span>
              )}
              {product.price_cents < 2000 && (
                <span className="pd-chip px-3 py-1.5 rounded-full" style={{ background: "rgba(10,10,11,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(244,63,94,0.5)", color: "#f87171" }}>Sale</span>
              )}
            </div>

            {/* Position indicator */}
            <div className="absolute bottom-4 right-4 z-10">
              <span className="pd-chip px-2.5 py-1.5 rounded-full" style={{ background: "rgba(10,10,11,0.65)", backdropFilter: "blur(8px)", color: "var(--platinum)" }}>
                {activeIndex + 1} / {views.length}
              </span>
            </div>

            {/* ── Magnifier lens — High-Fidelity Refinement ── */}
            <AnimatePresence>
              {zoomActive && containerSize.w > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="pd-lens group"
                  style={{
                    width: LENS_SIZE,
                    height: LENS_SIZE,
                    left: lensLeft,
                    top: lensTop,
                    position: "absolute",
                    pointerEvents: "none",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid var(--gold)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 0 15px rgba(255,255,255,0.1)",
                    zIndex: 20,
                    background: "var(--pd-page)"
                  }}
                >
                  <motion.img
                    src={cv.src}
                    alt=""
                    draggable={false}
                    onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/600x600?text=?"; }}
                    initial={false}
                    animate={{
                      left: zoomedLeft,
                      top: zoomedTop,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}
                    style={{
                      position: "absolute",
                      width: zoomedW,
                      height: zoomedH,
                      transform: cv.transform || "none",
                      objectFit: "cover",
                      maxWidth: "none",
                      userSelect: "none",
                      display: "block"
                    }}
                  />
                  {/* Glass reflection overlay */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trust badges */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { icon: <TruckIcon className="w-3.5 h-3.5" />, label: "Free Delivery", sub: "Orders $50+" },
              { icon: <RefreshIcon className="w-3.5 h-3.5" />, label: "30-Day Return", sub: "Effortless" },
              { icon: <ShieldIcon className="w-3.5 h-3.5" />, label: "Secure Pay", sub: "256-bit SSL" },
            ].map(b => (
              <div key={b.label} className="rounded-xl p-3 text-center flex flex-col items-center gap-1.5"
                style={{ background: "var(--pd-s4)", border: "1px solid var(--pd-b2)" }}>
                <span style={{ color: "var(--gold)" }}>{b.icon}</span>
                <p className="font-medium text-[11px]" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>{b.label}</p>
                <p className="text-[10px]" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductIntelPanel product={product} />
    </div>
  );
}