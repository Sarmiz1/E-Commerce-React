import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { useDashboard } from '../context/DashboardContext';
import { Icon } from './DashIcon';

function StarRating({ rating, interactive = false, onRate }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(null);
  return (
    <div className="flex items-center gap-0.5">
      {Array(5).fill(0).map((_, i) => {
        const filled = i < (hovered !== null ? hovered + 1 : rating);
        return (
          <motion.button key={i}
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(i + 1)}
            onMouseEnter={() => interactive && setHovered(i)}
            onMouseLeave={() => interactive && setHovered(null)}
            whileHover={interactive ? { scale: 1.2 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            style={{ cursor: interactive ? 'pointer' : 'default' }}>
            <svg width={14} height={14} viewBox="0 0 24 24"
              fill={filled ? '#f59e0b' : 'none'}
              stroke={filled ? '#f59e0b' : colors.border.strong}
              strokeWidth={2}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </motion.button>
        );
      })}
    </div>
  );
}

export default function DashReviews() {
  const { colors, isDark } = useTheme();
  const { reviews: liveReviews, updateReviewStatus } = useDashboard();
  const [localReviews, setLocalReviews] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replyOpen, setReplyOpen] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [filterRating, setFilterRating] = useState(0);

  const reviews = localReviews ?? liveReviews ?? [];

  const approve = useCallback(async (id) => {
    setLocalReviews(prev => (prev ?? liveReviews ?? []).map(r => r.id === id ? { ...r, status: 'approved' } : r));
    await updateReviewStatus(id, 'approved');
  }, [updateReviewStatus, liveReviews]);

  const submitReply = useCallback(async (id) => {
    if (!replyText[id]?.trim()) return;
    await new Promise(r => setTimeout(r, 600));
    setSubmitted(s => ({ ...s, [id]: true }));
    setReplyOpen(o => ({ ...o, [id]: false }));
  }, [replyText]);

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const filtered = filterRating === 0 ? reviews : reviews.filter(r => r.rating === filterRating);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Reviews</h2>

      {/* Summary card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 p-6 rounded-2xl shadow-sm"
        style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        {/* Big score */}
        <div className="text-center flex flex-col items-center justify-center min-w-[100px]">
          <motion.p initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl font-black" style={{ color: colors.text.primary }}>{avgRating}</motion.p>
          <StarRating rating={Math.round(parseFloat(avgRating))} />
          <p className="text-xs mt-1.5 font-semibold" style={{ color: colors.text.tertiary }}>{reviews.length} reviews</p>
        </div>

        <div className="w-px" style={{ background: colors.border.subtle }} />

        {/* Rating breakdown */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map(r => {
            const count = reviews.filter(rv => rv.rating === r).length;
            const pct = (count / reviews.length) * 100;
            return (
              <div key={r} className="flex items-center gap-3">
                <button onClick={() => setFilterRating(filterRating === r ? 0 : r)}
                  className="flex items-center gap-1 text-xs font-bold w-12 shrink-0 hover:opacity-70 transition-opacity"
                  style={{ color: filterRating === r ? colors.cta.primary : colors.text.tertiary }}>
                  {r} <span style={{ color: '#f59e0b' }}>★</span>
                </button>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: colors.surface.tertiary }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 * (6 - r) }}
                    className="h-full rounded-full" style={{ background: '#f59e0b', opacity: filterRating === r || filterRating === 0 ? 1 : 0.3 }} />
                </div>
                <span className="text-xs w-6 text-right font-semibold" style={{ color: colors.text.tertiary }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Filter reset */}
        <AnimatePresence>
          {filterRating > 0 && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setFilterRating(0)}
              className="self-center px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
              Clear filter
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Review cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((r, i) => (
            <motion.div key={r.id} layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              className="rounded-2xl p-5 shadow-sm"
              style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                    {r.customer.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{r.customer}</p>
                      <StarRating rating={r.rating} />
                      <span className="text-[10px]" style={{ color: colors.text.tertiary }}>{r.date}</span>
                    </div>
                    <p className="text-[11px] mt-0.5 font-semibold" style={{ color: colors.cta.primary }}>{r.product}</p>
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: colors.text.secondary }}>{r.comment}</p>

                    {submitted[r.id] && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-3 pl-3 border-l-2 text-xs py-1" style={{ borderColor: colors.cta.primary, color: colors.text.tertiary }}>
                        ✓ Your reply was posted.
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.status === 'pending' && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => approve(r.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: colors.state.successBg, color: colors.state.success }}
                      title="Approve">
                      <Icon name="check" size={14} />
                    </motion.button>
                  )}
                  {r.status === 'approved' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: colors.state.successBg, color: colors.state.success }}>✓ Approved</span>
                  )}
                  {!submitted[r.id] && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setReplyOpen(o => ({ ...o, [r.id]: !o[r.id] }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: isDark ? 'rgba(144,171,255,0.08)' : 'rgba(0,80,212,0.06)', color: colors.cta.primary }}>
                      <Icon name="message-square" size={12} /> Reply
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Reply box */}
              <AnimatePresence>
                {replyOpen[r.id] && !submitted[r.id] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
                    <textarea rows={3} placeholder="Write your reply..."
                      value={replyText[r.id] || ''}
                      onChange={e => setReplyText(t => ({ ...t, [r.id]: e.target.value }))}
                      className="w-full p-3 rounded-xl text-sm resize-none outline-none"
                      style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setReplyOpen(o => ({ ...o, [r.id]: false }))}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-70"
                        style={{ color: colors.text.secondary }}>Cancel</button>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                        onClick={() => submitReply(r.id)}
                        disabled={!replyText[r.id]?.trim()}
                        className="px-4 py-2 rounded-xl text-sm font-bold"
                        style={{ background: replyText[r.id]?.trim() ? colors.cta.primary : (isDark ? colors.surface.tertiary : '#F3F4F6'), color: replyText[r.id]?.trim() ? colors.cta.primaryText : colors.text.tertiary }}>
                        Post Reply
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
