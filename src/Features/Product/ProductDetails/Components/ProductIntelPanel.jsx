import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { computeDemandScore, generateSparklinePoints, seededRand } from '../Utils/productHelpers';

// ─── ProductIntelPanel ────────────────────────────────────────────────────────
export function ProductIntelPanel({ product }) {
  const BASE_VIEWERS = useMemo(() => seededRand(String(product?.id || "x"), 8, 41), [product?.id]);
  const [viewers, setViewers] = useState(BASE_VIEWERS);
  const viewerIdxRef = useRef(0);
  const VIEWER_DELTAS = useMemo(() => {
    const seed = String(product?.id || "x");
    return Array.from({ length: 20 }, (_, i) => { const r = seededRand(`${seed}-d${i}`, 0, 4); return r < 2 ? -1 : r > 3 ? 2 : 1; });
  }, [product?.id]);

  useEffect(() => {
    const id = setInterval(() => {
      viewerIdxRef.current = (viewerIdxRef.current + 1) % VIEWER_DELTAS.length;
      setViewers(v => Math.max(4, v + VIEWER_DELTAS[viewerIdxRef.current]));
    }, 3800);
    return () => clearInterval(id);
  }, [VIEWER_DELTAS]);

  const demandScore = useMemo(() => computeDemandScore(product), [product]);
  const GAUGE_R = 36, GAUGE_CX = 50, GAUGE_CY = 50;
  const circumference = Math.PI * GAUGE_R;
  const dashEnd = circumference * (1 - demandScore / 100);
  const W = 200, H = 52;
  const { pathD, areaD, pathLen } = useMemo(() => generateSparklinePoints(product?.id, W, H), [product?.id]);

  const demandColor = demandScore >= 75 ? "#4ade80" : demandScore >= 45 ? "#C9A96E" : "#94a3b8";

  const buySignal = useMemo(() => {
    if (demandScore >= 80) return { icon: "◆", label: "High Demand", sub: `${viewers} connoisseurs viewing` };
    if (demandScore >= 55) return { icon: "◈", label: "Trending", sub: `${viewers} viewing right now` };
    if (product?.price_cents < 2000) return { icon: "◇", label: "Exceptional Value", sub: "Finest price for this calibre" };
    return { icon: "◉", label: "Curated Selection", sub: "Handpicked for discerning taste" };
  }, [demandScore, viewers, product?.price_cents]);

  if (!product) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 rounded-2xl overflow-hidden"
      style={{ background: "var(--pd-intel-grad)", border: "1px solid var(--pd-b5)" }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--pd-b1)" }}>
        <span className="pd-chip" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>Intelligence</span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 pd-live-dot" />
          <span className="pd-chip" style={{ color: "var(--mist)" }}>Live</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Gauge row */}
        <div className="flex items-center gap-5">
          <svg width={GAUGE_CX * 2} height={GAUGE_CY + 12} viewBox={`0 0 ${GAUGE_CX * 2} ${GAUGE_CY + 12}`}>
            <path d={`M ${GAUGE_CX - GAUGE_R},${GAUGE_CY} A ${GAUGE_R},${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`}
              fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth="6" strokeLinecap="round" />
            <path className="pd-gauge-arc"
              d={`M ${GAUGE_CX - GAUGE_R},${GAUGE_CY} A ${GAUGE_R},${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`}
              fill="none" stroke={demandColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              style={{ "--pd-start": circumference, "--pd-end": dashEnd, strokeDashoffset: circumference, filter: `drop-shadow(0 0 5px ${demandColor}88)` }} />
            <text x={GAUGE_CX} y={GAUGE_CY + 1} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--cream)" fontFamily="Cormorant Garamond, serif">{demandScore}</text>
            <text x={GAUGE_CX} y={GAUGE_CY + 12} textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--mist)" letterSpacing="2" fontFamily="Jost, sans-serif">DEMAND</text>
          </svg>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 pd-live-dot" />
              <span className="text-sm font-semibold" style={{ color: "var(--cream)", fontFamily: "Cormorant Garamond,serif" }}>{viewers}</span>
              <span className="text-xs" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>viewing now</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[{ label: "Rating", value: product.rating_stars ? `${product.rating_stars}★` : "—" }, { label: "Reviews", value: (product.rating_count || 0).toLocaleString() }].map(s => (
                <div key={s.label} className="rounded-xl px-2.5 py-2 text-center" style={{ background: "var(--pd-s2)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--cream)", fontFamily: "Cormorant Garamond,serif" }}>{s.value}</p>
                  <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="pd-chip" style={{ color: "var(--mist)" }}>Price Trend</span>
            <span className="pd-chip px-2 py-0.5 rounded-full" style={{ background: "rgba(201,169,110,0.1)", color: "var(--gold)" }}>
              {seededRand(String(product.id || "x") + "trend", 0, 1) === 0 ? "↓" : "↑"}{seededRand(String(product.id || "x") + "pct", 3, 18)}% this month
            </span>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--pd-s4)" }}>
            <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="intel-spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaD} fill="url(#intel-spark-fill)" />
              <path className="pd-sparkline" d={pathD} fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ "--pd-len": pathLen, filter: "drop-shadow(0 1px 4px rgba(201,169,110,0.5))" }} />
            </svg>
          </div>
          <div className="flex justify-between mt-1" style={{ fontFamily: "Jost,sans-serif", fontSize: 9, color: "var(--mist)" }}>
            <span>14 days ago</span><span>Today</span>
          </div>
        </div>

        {/* Buy signal */}
        <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.12)" }}>
          <span className="text-lg flex-shrink-0" style={{ color: "var(--gold)" }}>{buySignal.icon}</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--cream)", fontFamily: "Cormorant Garamond,serif", fontSize: 13 }}>{buySignal.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>{buySignal.sub}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}