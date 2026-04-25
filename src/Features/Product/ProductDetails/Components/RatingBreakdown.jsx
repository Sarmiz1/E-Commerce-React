import React, { useMemo } from 'react';
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
import { computeRatingDistribution } from '../Utils/productHelpers';

import { StarRating } from './StarRating';

// ─── RatingBreakdown ──────────────────────────────────────────────────────────
export function RatingBreakdown({ product, reviews }) {
  const dist = useMemo(() => computeRatingDistribution(product, reviews), [product, reviews]);
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  return (
    <div className="flex items-start gap-8 mb-6 p-5 rounded-2xl"
      style={{ background: "var(--pd-s1)", border: "1px solid var(--pd-b1)" }}>
      <div className="text-center flex-shrink-0">
        <p className="pd-display text-5xl font-light" style={{ color: "var(--cream)", lineHeight: 1 }}>{product.rating_stars ?? "—"}</p>
        <div className="mt-2"><StarRating stars={product.rating_stars ?? 0} /></div>
        <p className="text-[10px] mt-1.5" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{total.toLocaleString()} reviews</p>
      </div>
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map(s => {
          const cnt = dist[s] || 0, pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
          return (
            <div key={s} className="flex items-center gap-2.5">
              <span className="text-[10px] w-2.5" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{s}</span>
              <span className="text-[10px]" style={{ color: "#C9A96E" }}>★</span>
              <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ background: "var(--pd-s3)" }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
                  transition={{ duration: 1, delay: (5 - s) * 0.07, ease: "easeOut" }}
                  className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#C9A96E,#A8834A)" }} />
              </div>
              <span className="text-[10px] w-6 text-right" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}