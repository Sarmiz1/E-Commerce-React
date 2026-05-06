import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Link, useNavigate } from 'react-router-dom';

import { IconSpinner } from '../../../../components/Icons/IconSpinner';
import ProductCard from '../../../../components/Ui/ProductCard';
import { ErrorMessage } from '../../../../components/ErrorMessage';
import { 
  BagIcon, HeartIcon, ShareIcon, ChevronLeft, ChevronRight, 
  CheckIcon, SpinnerIcon, ShieldIcon, TruckIcon, RefreshIcon, 
  BellIcon, CloseIcon, LockIcon 
} from './Icons';


import { ReviewForm } from './ReviewForm';
import { ReviewCard } from './ReviewCard';
import { RatingBreakdown } from './RatingBreakdown';

// ─── ReviewsSection ───────────────────────────────────────────────────────────
export function ReviewsSection({ product, reviews, onAddReview, user }) {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(3);
  const [loadCount, setLoadCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await new Promise(r => setTimeout(r, 700));
    setVisibleCount(p => p + 3); setLoadCount(c => c + 1); setLoadingMore(false);
  };

  const hasMore = visibleCount < reviews.length;
  const showViewAll = hasMore && loadCount >= 2;

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between mb-1">
        <h2 className="pd-display text-3xl font-light" style={{ color: "var(--cream)", letterSpacing: "-0.01em" }}>
          Reviews
          <span className="text-lg ml-3 font-light" style={{ color: "var(--gold)" }}>{reviews.length}</span>
        </h2>
        <span className="pd-chip" style={{ color: "var(--gold)" }}>{product.rating_stars ?? 0}★ avg</span>
      </div>
      <div className="pd-rule mb-6" />

      <RatingBreakdown product={product} reviews={reviews} />

      <div className="mb-6">
        <ReviewForm onSubmit={onAddReview} user={user} />
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {reviews.slice(0, visibleCount).map(r => <ReviewCard key={r.id} review={r} />)}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-2 mt-6">
          {showViewAll ? (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/reviews")}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest"
              style={{ fontFamily: "Jost,sans-serif", background: "linear-gradient(135deg,#C9A96E,#A8834A)", color: "var(--obsidian)", boxShadow: "0 6px 20px rgba(201,169,110,0.2)" }}>
              View All {reviews.length} Reviews <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleLoadMore} disabled={loadingMore}
              className="px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center gap-2"
              style={{ fontFamily: "Jost,sans-serif", background: "var(--pd-s2)", border: "1px solid var(--pd-b4)", color: "var(--platinum)", cursor: loadingMore ? "not-allowed" : "pointer" }}>
              {loadingMore ? <><SpinnerIcon />Loading…</> : `Load More (${reviews.length - visibleCount} remaining)`}
            </motion.button>
          )}
          <p className="text-[10px]" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>Showing {Math.min(visibleCount, reviews.length)} of {reviews.length}</p>
        </div>
      )}
    </section>
  );
}