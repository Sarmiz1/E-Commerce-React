import { motion } from 'framer-motion';
import {  getAvatarGradient  } from '../Utils/productHelpers';

// ─── ReviewCard ───────────────────────────────────────────────────────────────
export function ReviewCard({ review }) {
  const grad = getAvatarGradient(review.name);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl p-4" style={{ background: "var(--pd-s1)", border: "1px solid var(--pd-b1)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: grad }}>{review.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>{review.name}</p>
              {review.verified && <span className="pd-chip px-1.5 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80" }}>Verified</span>}
            </div>
            <div className="flex gap-px mt-0.5">
              {Array(5).fill(0).map((_, i) => <span key={i} className="text-xs" style={{ color: i < review.stars ? "#C9A96E" : "rgba(201,169,110,0.2)" }}>★</span>)}
            </div>
          </div>
        </div>
        <span className="text-[10px]" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{review.date}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>{review.text}</p>
      {(review.fit || review.quality) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.fit && <span className="pd-chip px-2 py-1 rounded" style={{ color: "var(--gold)" }}>Fit: {review.fit}</span>}
          {review.quality && <span className="pd-chip px-2 py-1 rounded" style={{ color: "var(--gold)" }}>Quality: {review.quality}</span>}
        </div>
      )}
      {review.photos?.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.photos.slice(0, 3).map((src) => (
            <img key={src} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ))}
        </div>
      )}
      {review.sellerReply && (
        <div className="mt-3 rounded-lg border border-white/5 bg-black/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--gold)" }}>Seller reply</p>
          <p className="mt-1 text-sm leading-6" style={{ color: "var(--silver)" }}>{review.sellerReply}</p>
        </div>
      )}
    </motion.div>
  );
}
