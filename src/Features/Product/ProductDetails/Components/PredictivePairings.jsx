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


// ─── PredictivePairings ───────────────────────────────────────────────────────
export function PredictivePairings({ products, isFetching }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current; if (!el || !products.length) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".pd-pair-card");
      if (!cards.length) return;
      gsap.fromTo(cards, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    }, 100);
    return () => clearTimeout(t);
  }, [products]);

  if (!products?.length) return null;

  return (
    <section ref={ref} className="py-20" style={{ background: "var(--pd-pair-bg)", borderTop: "1px solid var(--pd-pair-bdr)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="pd-chip mb-3" style={{ color: "var(--gold)" }}>Artisan Selection</p>
          <h2 className="pd-display text-4xl font-light" style={{ color: "var(--cream)" }}>Complete the Look</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>
            Handpicked pairings to elevate your signature style
          </p>
          {isFetching && <div className="flex justify-center mt-4"><IconSpinner /></div>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map(p => (
            <div key={p.id} className="pd-pair-card rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1"
              style={{ background: "var(--pd-s1)", border: "1px solid var(--pd-b2)" }}>
              <div className="relative">
                <ProductCard product={p} />
                <div className="absolute top-2 right-2">
                  <span className="pd-chip px-2 py-0.5 rounded-full" style={{ background: "rgba(10,10,11,0.75)", backdropFilter: "blur(6px)", color: "var(--gold)", border: "1px solid rgba(201,169,110,0.3)" }}>
                    {p.matchScore}%
                  </span>
                </div>
              </div>
              <div className="px-3 pb-3 -mt-0.5">
                <span className="pd-chip" style={{ color: "var(--mist)" }}>{p.matchLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}