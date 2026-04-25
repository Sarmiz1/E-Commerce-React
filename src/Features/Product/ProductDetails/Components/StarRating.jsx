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


// ─── StarRating ───────────────────────────────────────────────────────────────
export function StarRating({ stars = 0, count = 0, size = "sm", onClick }) {
  const full = Math.floor(stars), half = stars % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  const starCls = size === "lg" ? "text-lg" : "text-xs";
  return (
    <div className={`flex items-center gap-2 ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      <div className="flex items-center gap-px">
        {Array(full).fill(0).map((_, i) => <span key={`f${i}`} className={starCls} style={{ color: "#C9A96E" }}>★</span>)}
        {half && <span className={starCls} style={{ color: "#C9A96E" }}>⯪</span>}
        {Array(empty).fill(0).map((_, i) => <span key={`e${i}`} className={starCls} style={{ color: "rgba(201,169,110,0.25)" }}>★</span>)}
      </div>
      <span className="text-xs font-semibold" style={{ color: "#C9A96E", fontFamily: "Jost,sans-serif" }}>{stars}</span>
      {count > 0 && <span className="text-xs" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>({count.toLocaleString()})</span>}
    </div>
  );
}

export function InteractiveStarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          className="text-xl transition-transform duration-150 hover:scale-110"
          style={{ color: s <= (hover || value) ? "#C9A96E" : "rgba(201,169,110,0.2)" }}>★</button>
      ))}
      {value > 0 && <span className="text-xs ml-1" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>{value}/5</span>}
    </div>
  );
}