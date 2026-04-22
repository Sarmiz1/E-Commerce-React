import { useEffect, useRef, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { useDashboard } from '../context/DashboardContext';
import { fmt, fmtFull, changeColor, changeLabel, getGreeting } from '../utils/format';
import { Icon } from './DashIcon';

// ─── Animated number counter ──────────────────────────────────────────────────
function CountUp({ to, duration = 1.2, prefix = '', suffix = '', isFloat = false }) {
  const nodeRef = useRef(null);
  useEffect(() => {
    const node = nodeRef.current;
    const ctrl = animate(0, to, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(val) {
        if (node) node.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val).toLocaleString()) + suffix;
      },
    });
    return () => ctrl.stop();
  }, [to, duration, prefix, suffix, isFloat]);
  return <span ref={nodeRef}>{prefix}0{suffix}</span>;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ stat, icon, delay = 0 }) {
  const { colors, isDark } = useTheme();
  const up = stat.change > 0;
  const neutral = stat.change === 0;
  const isRate = stat.label.includes('Rate');
  const isFloat = typeof stat.value === 'number' && !Number.isInteger(stat.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -3, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,80,212,0.1)' }}
      className="rounded-2xl p-5 flex flex-col gap-3 cursor-default transition-shadow"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}
    >
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.text.tertiary }}>{stat.label}</p>
        <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isDark ? 'rgba(144,171,255,0.12)' : 'rgba(0,80,212,0.07)' }}>
          <Icon name={icon} size={17} style={{ color: colors.cta.primary }} />
        </motion.div>
      </div>

      <p className="text-3xl font-black tracking-tight tabular-nums" style={{ color: colors.text.primary }}>
        {isRate
          ? <CountUp to={stat.value} duration={1.4} suffix={stat.suffix || '%'} isFloat={isFloat} />
          : <CountUp to={stat.value} duration={1.4} prefix="₦" isFloat={false} />
        }
      </p>

      <div className="flex items-center gap-1.5">
        {!neutral && (
          <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: delay + 0.4 }}>
            <Icon name={up ? 'arrow-up' : 'arrow-down'} size={12} style={{ color: changeColor(stat.change, colors) }} />
          </motion.span>
        )}
        <span className="text-xs font-semibold" style={{ color: changeColor(stat.change, colors) }}>
          {changeLabel(stat.change, stat.suffix || '%')}
        </span>
      </div>

      {/* Micro progress bar */}
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: colors.surface.tertiary }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.abs(stat.change) * 5)}%` }}
          transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: up ? colors.state.success : stat.change < 0 ? colors.state.error : colors.border.strong }}
        />
      </div>
    </motion.div>
  );
}

// ─── Animated SVG Line Chart ────────────────────────────────────────────────────
function RevenueChart({ data, key: k }) {
  const { colors } = useTheme();
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const H = 140, W = 500; // use a fixed viewBox for precision

  const coords = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((d.value - min) / range) * (H - 16) - 8,
  }));

  const linePath = `M ${coords.map(c => `${c.x},${c.y}`).join(' L ')}`;
  const areaPath = `M ${coords[0].x},${H} L ${coords.map(c => `${c.x},${c.y}`).join(' L ')} L ${coords[coords.length - 1].x},${H} Z`;
  const totalLen = coords.length > 1 ? coords.reduce((acc, c, i) => {
    if (i === 0) return 0;
    const prev = coords[i - 1];
    return acc + Math.hypot(c.x - prev.x, c.y - prev.y);
  }, 0) : 0;

  const [hovered, setHovered] = useState(null);

  return (
    <div className="w-full relative" style={{ height: 160 }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H}
        onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id={`cg-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.cta.primary} stopOpacity="0.25" />
            <stop offset="100%" stopColor={colors.cta.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={0} y1={H * f} x2={W} y2={H * f}
            stroke={colors.border.subtle} strokeWidth={0.5} strokeDasharray="4 4" />
        ))}

        {/* Area fill */}
        <motion.path d={areaPath} fill={`url(#cg-${k})`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} />

        {/* Line */}
        <motion.path d={linePath} fill="none" stroke={colors.cta.primary} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }} />

        {/* Data points + hover zones */}
        {coords.map((c, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: 'crosshair' }}>
            <rect x={c.x - 20} y={0} width={40} height={H} fill="transparent" />
            <motion.circle cx={c.x} cy={c.y} r={hovered === i ? 5 : 3}
              fill={colors.surface.elevated} stroke={colors.cta.primary} strokeWidth={2}
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 + i * 0.04 }} />
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hovered !== null && (
        <div className="absolute pointer-events-none px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg"
          style={{
            left: `${(coords[hovered].x / W) * 100}%`,
            top: `${(coords[hovered].y / H) * 100}%`,
            transform: 'translate(-50%, -130%)',
            background: colors.surface.elevated,
            border: `1px solid ${colors.border.default}`,
            color: colors.text.primary,
          }}>
          {data[hovered].label}: {fmt(data[hovered].value)}
        </div>
      )}
    </div>
  );
}

// ─── Status Badge (shared) ──────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const { colors, isDark } = useTheme();
  const map = {
    pending:      { bg: colors.state.warningBg,  color: colors.state.warning, label: 'Pending', dot: colors.state.warning },
    shipped:      { bg: isDark ? 'rgba(144,171,255,0.12)' : 'rgba(0,80,212,0.07)', color: colors.cta.primary, label: 'Shipped', dot: colors.cta.primary },
    delivered:    { bg: colors.state.successBg,  color: colors.state.success, label: 'Delivered', dot: colors.state.success },
    cancelled:    { bg: colors.state.errorBg,    color: colors.state.error,   label: 'Cancelled', dot: colors.state.error },
    processing:   { bg: isDark ? 'rgba(144,171,255,0.12)' : 'rgba(0,80,212,0.07)', color: colors.cta.primary, label: 'Processing', dot: colors.cta.primary },
    active:       { bg: colors.state.successBg,  color: colors.state.success, label: 'Active', dot: colors.state.success },
    draft:        { bg: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text.tertiary, label: 'Draft', dot: colors.text.tertiary },
    out_of_stock: { bg: colors.state.errorBg,    color: colors.state.error,   label: 'Out of Stock', dot: colors.state.error },
    settled:      { bg: colors.state.successBg,  color: colors.state.success, label: 'Settled', dot: colors.state.success },
    paid:         { bg: colors.state.successBg,  color: colors.state.success, label: 'Paid', dot: colors.state.success },
  };
  const s = map[status] || { bg: '#F3F4F6', color: '#888', label: status, dot: '#888' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

// ─── Overview Page ──────────────────────────────────────────────────────────────
export default function DashOverview() {
  const { colors, isDark } = useTheme();
  const { stats, revenueChart, orders, loading } = useDashboard();
  const [chartRange, setChartRange] = useState('7d');
  const chartData = (revenueChart || {})[chartRange] || [];
  const RANGES = [{ k: '7d', l: '7D' }, { k: '30d', l: '30D' }, { k: '90d', l: '90D' }];
  const STAT_ICONS = { totalRevenue: 'trending-up', ordersToday: 'package', totalOrders: 'box', activeProducts: 'tag', conversionRate: 'percent', pendingPayout: 'wallet' };

  const totalChartRevenue = chartData.reduce((s, d) => s + d.value, 0);
  const pendingCount = (orders || []).filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-black tracking-tight" style={{ color: colors.text.primary }}>
          {getGreeting()}, Ade 👋
        </h2>
        <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>
          Here's what's happening with your store today.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Object.entries(stats || {}).map(([key, stat], i) => (
          <div key={key} className={key === 'totalRevenue' || key === 'pendingPayout' ? 'col-span-2 xl:col-span-1' : ''}>
            <StatCard stat={stat} icon={STAT_ICONS[key]} delay={i * 0.08} />
          </div>
        ))}
      </div>

      {/* Chart + Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
          className="xl:col-span-2 rounded-2xl p-6 shadow-sm"
          style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.text.tertiary }}>Total Revenue</p>
              <p className="text-3xl font-black tabular-nums" style={{ color: colors.text.primary }}>
                <CountUp to={totalChartRevenue} duration={1.5} prefix="₦" />
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Icon name="arrow-up" size={12} style={{ color: colors.state.success }} />
                <span className="text-xs font-semibold" style={{ color: colors.state.success }}>+12.4% from last period</span>
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6' }}>
              {RANGES.map(r => (
                <motion.button key={r.k} onClick={() => setChartRange(r.k)}
                  whileTap={{ scale: 0.94 }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative"
                  style={chartRange === r.k ? { color: colors.cta.primaryText } : { color: colors.text.tertiary }}>
                  {chartRange === r.k && (
                    <motion.span layoutId="chart-range-pill" className="absolute inset-0 rounded-lg"
                      style={{ background: colors.cta.primary }} />
                  )}
                  <span className="relative z-10">{r.l}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <RevenueChart data={chartData} key={chartRange} />

          <div className="flex justify-between mt-3">
            {chartData.filter((_, i) => i % Math.ceil(chartData.length / 7) === 0).map(d => (
              <span key={d.label} className="text-[10px] font-medium" style={{ color: colors.text.tertiary }}>{d.label}</span>
            ))}
          </div>
        </motion.div>

        {/* Performance + AI */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}
          className="rounded-2xl p-6 shadow-sm flex flex-col gap-5"
          style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.text.tertiary }}>Product Performance</p>

          <div className="space-y-3">
            {[
              { label: 'Best Seller', name: 'Slim Fit Chinos', meta: '210 sales · ₦3.25M', type: 'success' },
              { label: 'Needs Attention', name: 'Linen Blazer Set', meta: '0 sales · Draft', type: 'error' },
            ].map((item, i) => (
              <motion.div key={item.type} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.1 }}
                className="p-3.5 rounded-xl"
                style={{ background: item.type === 'success' ? (isDark ? 'rgba(0,255,148,0.06)' : 'rgba(5,150,105,0.05)') : (isDark ? 'rgba(255,94,0,0.06)' : 'rgba(220,38,38,0.04)'), border: `1px solid ${item.type === 'success' ? (isDark ? 'rgba(0,255,148,0.12)' : 'rgba(5,150,105,0.12)') : (isDark ? 'rgba(255,94,0,0.12)' : 'rgba(220,38,38,0.12)')}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.type === 'success' ? colors.state.success : colors.state.error }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: item.type === 'success' ? colors.state.success : colors.state.error }}>{item.label}</span>
                </div>
                <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{item.name}</p>
                <p className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>{item.meta}</p>
              </motion.div>
            ))}
          </div>

          {/* AI Insight */}
          <motion.div className="mt-auto p-4 rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            style={{ background: isDark ? 'rgba(144,171,255,0.06)' : 'rgba(0,80,212,0.04)', border: `1px solid ${isDark ? 'rgba(144,171,255,0.15)' : 'rgba(0,80,212,0.1)'}` }}>
            <div className="flex items-center gap-2 mb-2">
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-sm">✦</motion.span>
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.cta.primary }}>AI Insight</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: colors.text.secondary }}>
              Customers buying sneakers also view hoodies 62% of the time. Consider bundling them into a combo deal.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
          <p className="font-bold text-sm" style={{ color: colors.text.primary }}>Recent Orders</p>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.07)', color: colors.cta.primary }}>
            {pendingCount} pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ background: isDark ? colors.surface.tertiary : '#FAFAFA' }}>
                {['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.border.subtle }}>
              {(orders || []).slice(0, 6).map((order, i) => (
                <motion.tr key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,80,212,0.02)' }}
                  className="transition-colors cursor-pointer">
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-mono font-bold" style={{ color: colors.cta.primary }}>{order.id}</span>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-semibold" style={{ color: colors.text.primary }}>{order.customer}</td>
                  <td className="px-6 py-3.5 text-sm max-w-[160px]" style={{ color: colors.text.secondary }}>
                    <span className="truncate block">{order.product}</span>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-bold" style={{ color: colors.text.primary }}>{fmtFull(order.amount)}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-3.5 text-xs" style={{ color: colors.text.tertiary }}>{order.date}</td>
                  <td className="px-6 py-3.5">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ color: colors.cta.primary, background: isDark ? 'rgba(144,171,255,0.08)' : 'rgba(0,80,212,0.06)' }}>
                      <Icon name="eye" size={13} /> View
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
