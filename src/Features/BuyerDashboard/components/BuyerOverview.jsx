import { useEffect, useRef, useState } from 'react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../store/useThemeStore";
import { useBuyer } from '../context/BuyerContext';
import { fmtFull, fmtNaira, getGreeting } from '../utils/fmt';
import { BIcon } from './BuyerIcon';

// ─── CountUp ──────────────────────────────────────────────────────────────────
function CountUp({ to, duration = 1.2, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctrl = animate(0, to, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(v) { if (ref.current) ref.current.textContent = prefix + Math.round(v).toLocaleString() + suffix; },
    });
    return () => ctrl.stop();
  }, [to]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
export function OrderStatusBadge({ status }) {
  const { colors } = useTheme();
  const MAP = {
    pending:   { label: 'Pending',   bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
    shipped:   { label: 'Shipped',   bg: 'rgba(102,126,234,0.1)', color: '#667eea' },
    delivered: { label: 'Delivered', bg: 'rgba(5,150,105,0.1)',   color: '#059669' },
    cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
    in_transit:{ label: 'In Transit',bg: 'rgba(102,126,234,0.1)', color: '#667eea' },
  };
  const s = MAP[status] || { label: status, bg: '#F3F4F6', color: '#888' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

// ─── Order Timeline ──────────────────────────────────────────────────────────
export function OrderTimeline({ steps = [], currentStep }) {
  const STEP_LABELS = {
    ordered: 'Order Placed', confirmed: 'Confirmed', dispatched: 'Dispatched',
    in_transit: 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled',
  };
  if (!steps.length) return null;

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = i <= currentStep;
        const isLast = i === steps.length - 1;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.12, type: 'spring', stiffness: 300 }}
                className="w-7 h-7 rounded-full flex items-center justify-center border-2"
                style={{
                  background: done ? (step === 'cancelled' ? '#ef4444' : '#667eea') : 'transparent',
                  borderColor: done ? (step === 'cancelled' ? '#ef4444' : '#667eea') : '#d1d5db',
                }}>
                {done && <BIcon name="check" size={12} style={{ color: '#fff' }} />}
              </motion.div>
              <p className="text-[9px] font-bold mt-1 text-center whitespace-nowrap" style={{ color: done ? '#667eea' : '#9ca3af' }}>
                {STEP_LABELS[step] || step}
              </p>
            </div>
            {!isLast && (
              <motion.div className="h-0.5 flex-1 mx-1 mb-4" initial={{ scaleX: 0 }} animate={{ scaleX: done && i < currentStep ? 1 : 0 }}
                transition={{ delay: i * 0.12 + 0.1, duration: 0.4 }}
                style={{ background: '#667eea', transformOrigin: 'left' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Quick stat card ─────────────────────────────────────────────────────────
function StatCard({ label, value, icon, suffix = '', prefix = '', color, delay = 0 }) {
  const { colors, isDark } = useTheme();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.45 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl p-5 shadow-sm flex flex-col gap-2"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}12` }}>
        <BIcon name={icon} size={17} style={{ color }} />
      </div>
      <p className="text-2xl font-black tabular-nums" style={{ color: colors.text.primary }}>
        <CountUp to={typeof value === 'string' ? parseFloat(value) || 0 : value} prefix={prefix} suffix={suffix} duration={1.4} />
      </p>
      <p className="text-[11px] font-semibold" style={{ color: colors.text.tertiary }}>{label}</p>
    </motion.div>
  );
}

// ─── Insight card ────────────────────────────────────────────────────────────
function InsightCard({ insight, index }) {
  const { colors, isDark } = useTheme();
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 p-4 rounded-2xl cursor-default"
      style={{ background: isDark ? `${insight.color}08` : `${insight.color}06`, border: `1px solid ${insight.color}20` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${insight.color}15` }}>
        <BIcon name={insight.icon} size={18} style={{ color: insight.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug" style={{ color: colors.text.primary }}>{insight.text}</p>
        <p className="text-[11px] mt-0.5" style={{ color: insight.color }}>{insight.sub}</p>
      </div>
    </motion.div>
  );
}

// ─── Recommendation Card ─────────────────────────────────────────────────────
function RecCard({ item, index }) {
  const { colors, isDark } = useTheme();
  const [added, setAdded] = useState(false);
  const hue = item.name.charCodeAt(0) * 7 % 360;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.08 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl overflow-hidden shadow-sm flex flex-col"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
      {/* Product visual */}
      <div className="h-32 flex items-center justify-center relative overflow-hidden" style={{ background: `hsl(${hue}, 45%, ${isDark ? '15%' : '96%'})` }}>
        {(item.products?.image || item.image) ? (
          <img src={item.products?.image || item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl select-none">
            {item.category === 'Footwear' ? '👟' : item.category === 'Tech' ? '🎧' : '👕'}
          </span>
        )}
        {item.budgetFit && (
          <span className="absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(5,150,105,0.12)', color: '#059669' }}>✓ Budget fit</span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-sm font-bold" style={{ color: colors.text.primary }}>{item.name}</p>
        <p className="text-[10px] leading-snug" style={{ color: colors.text.tertiary }}>{item.reason}</p>
        {item.fit && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full self-start"
            style={{ background: isDark ? 'rgba(102,126,234,0.12)' : 'rgba(102,126,234,0.08)', color: '#667eea' }}>
            Size: {item.fit}
          </span>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="font-black text-base" style={{ color: colors.text.primary }}>{fmtFull(item.price)}</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
            onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1800); }}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
            style={{
              background: added ? 'rgba(5,150,105,0.12)' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: added ? '#059669' : '#fff',
            }}>
            {added ? <><BIcon name="check" size={12} /> Added!</> : <><BIcon name="cart" size={12} /> Quick Add</>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
export default function BuyerOverview() {
  const { colors, isDark } = useTheme();
  const { profile, setPage, stats, snapshot, orders, recommendations, insights } = useBuyer();
  const activeOrders = (orders || []).filter(o => o.status === 'shipped' || o.status === 'pending');

  return (
    <div className="space-y-8">
      {/* ── Welcome hero ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        {/* Soft glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20" style={{ background: '#fff' }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ background: '#fff' }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[11px] font-bold text-white/70">AI Assistant Active</span>
            </div>
            <h2 className="text-2xl font-black text-white">{getGreeting()}, {profile?.firstName} 👋</h2>
            <p className="text-white/70 text-sm mt-1">Ready to shop smarter today?</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-white"><CountUp to={(stats || {}).rewardPoints || 0} duration={1.6} /></p>
              <p className="text-[11px] text-white/60">Reward Points</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setPage('ai')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' }}>
              <BIcon name="sparkle" size={16} /> Ask AI
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders"      value={(stats || {}).totalOrders   || 0}   icon="package"    color="#667eea" delay={0.05} />
        <StatCard label="Wishlist Items"    value={(stats || {}).wishlistItems  || 0}   icon="heart"      color="#ec4899" delay={0.1} />
        <StatCard label="Reward Points"     value={(stats || {}).rewardPoints   || 0}   icon="star"       color="#f59e0b" delay={0.15} />
        <StatCard label="Total Saved"       value={(stats || {}).savedAmount    || 0}   icon="save"       color="#059669" delay={0.2} prefix="₦" />
      </div>

      {/* ── Order status snapshot ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.text.tertiary }}>Order Status</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(snapshot || {}).map(([status, count], i) => {
            const META = {
              pending:   { icon: 'refresh',  color: '#f59e0b', label: 'Pending'   },
              shipped:   { icon: 'truck',    color: '#667eea', label: 'Shipped'   },
              delivered: { icon: 'check',    color: '#059669', label: 'Delivered' },
              cancelled: { icon: 'x',        color: '#ef4444', label: 'Cancelled' },
            };
            const m = META[status] || { icon: 'package', color: '#9ca3af', label: status };
            return (
              <motion.button key={status} onClick={() => setPage('orders')}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.07, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl transition-all text-center"
                style={{ background: `${m.color}10`, border: `1px solid ${m.color}20` }}>
                <BIcon name={m.icon} size={22} style={{ color: m.color }} />
                <span className="text-2xl font-black" style={{ color: colors.text.primary }}>{count}</span>
                <span className="text-[11px] font-bold capitalize" style={{ color: m.color }}>{m.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Smart Insights ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <motion.span animate={{ rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-sm">✦</motion.span>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.text.tertiary }}>Smart Insights</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(insights || []).map((ins, i) => <InsightCard key={i} insight={ins} index={i} />)}
        </div>
      </div>

      {/* ── Active order tracking ── */}
      {activeOrders.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.text.tertiary }}>Live Tracking</p>
          {activeOrders.slice(0, 1).map(order => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="rounded-2xl p-6 shadow-sm"
              style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="font-mono text-xs font-bold mb-0.5" style={{ color: '#667eea' }}>{order.id}</p>
                  <p className="font-bold text-base" style={{ color: colors.text.primary }}>{order.product}</p>
                  {order.eta && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <BIcon name="truck" size={14} style={{ color: '#667eea' }} />
                      <p className="text-sm" style={{ color: colors.text.secondary }}>
                        <span className="font-bold" style={{ color: '#667eea' }}>Arriving {order.eta}</span>
                      </p>
                    </div>
                  )}
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <OrderTimeline steps={order.timeline} currentStep={order.currentStep} />
              <div className="flex items-center gap-3 mt-5">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setPage('orders')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff' }}>
                  <BIcon name="truck" size={13} /> Track Live
                </motion.button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
                  <BIcon name="user" size={13} /> Contact Seller
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── AI Recommendations ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">✦</span>
            <p className="font-bold text-base" style={{ color: colors.text.primary }}>Picked For You</p>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff' }}>AI</span>
          </div>
          <button className="text-xs font-semibold" style={{ color: '#667eea' }}>Based on your taste & size →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {(recommendations || []).map((r, i) => <RecCard key={r.id} item={r} index={i} />)}
        </div>
      </div>
    </div>
  );
}
