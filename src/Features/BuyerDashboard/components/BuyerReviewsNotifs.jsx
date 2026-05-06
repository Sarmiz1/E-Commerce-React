import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../Store/useThemeStore";
import { useBuyer } from '../context/BuyerContext';
import { BIcon } from './BuyerIcon';

// ─── Reviews ─────────────────────────────────────────────────────────────────
export function BuyerReviews() {
  const { colors, isDark } = useTheme();
  const { reviews: liveReviews, submitReview } = useBuyer();
  const [localReviews, setLocalReviews] = useState(null);
  const reviews = localReviews ?? liveReviews ?? [];
  const [drafts, setDrafts] = useState({});
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState({});

  const submit = async (id) => {
    if (!ratings[id] || !drafts[id]?.trim()) return;
    setSubmitted(s => ({ ...s, [id]: 'loading' }));
    const review = reviews.find(r => r.id === id);
    const result = await submitReview(id, review?.product || '', ratings[id], drafts[id]);
    if (result?.success !== false) {
      setLocalReviews(prev => (prev ?? liveReviews ?? []).map(r =>
        r.id === id ? { ...r, submitted: true, rating: ratings[id], review_text: drafts[id] } : r
      ));
    }
    setSubmitted(s => ({ ...s, [id]: 'done' }));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>My Reviews</h2>

      <div className="space-y-4">
        {reviews.map((r, i) => {
          const hovered = ratings[r.id] || r.rating;
          const isLoading = submitted[r.id] === 'loading';
          const isDone = r.submitted;

          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.09 }}
              className="rounded-2xl p-5 shadow-sm"
              style={{ background: colors.surface.elevated, border: `1.5px solid ${isDone ? 'rgba(5,150,105,0.3)' : colors.border.subtle}` }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{r.product}</p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: colors.text.tertiary }}>{r.orderId}</p>
                </div>
                {isDone
                  ? <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>✓ Review Posted</span>
                  : <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>Pending Review</span>}
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <motion.button key={s}
                    disabled={isDone}
                    onClick={() => !isDone && setRatings(ra => ({ ...ra, [r.id]: s }))}
                    whileHover={isDone ? {} : { scale: 1.25 }} whileTap={isDone ? {} : { scale: 0.9 }}>
                    <svg width={22} height={22} viewBox="0 0 24 24"
                      fill={s <= (ratings[r.id] || r.rating) ? '#f59e0b' : 'none'}
                      stroke={s <= (ratings[r.id] || r.rating) ? '#f59e0b' : colors.border.strong}
                      strokeWidth={1.5}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </motion.button>
                ))}
              </div>

              {isDone ? (
                <p className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>{r.review_text}</p>
              ) : (
                <>
                  <textarea rows={3} placeholder="Share your experience with this product…"
                    value={drafts[r.id] || ''}
                    onChange={e => setDrafts(d => ({ ...d, [r.id]: e.target.value }))}
                    className="w-full p-3 rounded-xl text-sm resize-none outline-none"
                    style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }} />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => submit(r.id)}
                    disabled={!ratings[r.id] || !drafts[r.id]?.trim() || isLoading}
                    className="mt-3 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                    style={{ background: ratings[r.id] && drafts[r.id]?.trim() ? 'linear-gradient(135deg,#667eea,#764ba2)' : (isDark ? colors.surface.tertiary : '#F3F4F6'), color: ratings[r.id] && drafts[r.id]?.trim() ? '#fff' : colors.text.tertiary }}>
                    {isLoading
                      ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" /> Posting…</>
                      : 'Post Review'}
                  </motion.button>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
const NOTIF_META = {
  shipping:  { icon: 'truck',   color: '#667eea', label: 'Shipping' },
  deal:      { icon: 'save',    color: '#059669', label: 'Deal'     },
  stock:     { icon: 'bell',    color: '#f59e0b', label: 'Stock'    },
  brand:     { icon: 'sparkle', color: '#8b5cf6', label: 'Brand'    },
  delivered: { icon: 'check',   color: '#059669', label: 'Delivery' },
};

export function BuyerNotifications() {
  const { colors, isDark } = useTheme();
  const { notifs: liveNotifs, markAllNotifsRead } = useBuyer();
  const [notifs, setNotifs] = useState(null);
  const allNotifs = notifs ?? liveNotifs ?? [];

  const markAllRead = async () => {
    setNotifs(n => (n ?? liveNotifs ?? []).map(no => ({ ...no, unread: false })));
    await markAllNotifsRead();
  };
  const dismiss = (id) => setNotifs(n => (n ?? liveNotifs ?? []).filter(no => no.id !== id));
  const markRead = (id) => setNotifs(n => (n ?? liveNotifs ?? []).map(no => no.id === id ? { ...no, unread: false } : no));

  const unread = allNotifs.filter(n => n.unread).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Notifications</h2>
          {unread > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{unread} unread</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: '#667eea' }}>
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {allNotifs.map((n, i) => {
            const m = NOTIF_META[n.type] || NOTIF_META.shipping;
            return (
              <motion.div key={n.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer"
                style={{ background: n.unread ? (isDark ? `${m.color}08` : `${m.color}05`) : colors.surface.elevated, border: `1px solid ${n.unread ? `${m.color}25` : colors.border.subtle}` }}
                onClick={() => markRead(n.id)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${m.color}15` }}>
                  <BIcon name={m.icon} size={17} style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug" style={{ color: colors.text.primary, fontWeight: n.unread ? 700 : 500 }}>{n.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>{n.sub}</p>
                  <p className="text-[10px] mt-1 font-semibold" style={{ color: m.color }}>{n.time}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {n.unread && <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                    style={{ color: colors.text.tertiary }}>
                    <BIcon name="x" size={13} />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {allNotifs.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3">
            <BIcon name="bell" size={32} style={{ color: colors.text.tertiary, opacity: 0.35 }} />
            <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
