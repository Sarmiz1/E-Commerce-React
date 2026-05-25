import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../Store/useThemeStore";
import { useDashboard } from '../context/DashboardContext';
import { useAuthStore } from '../../../Store/useAuthStore';
import { fmt, getGreeting } from '../utils/format';

// ─── Scoped styles ────────────────────────────────────────────────────────────
function formatMoneyCents(cents) {
  return `₦${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ data, color, width = 120, height = 36 }) {
  if (!data || data.length === 0) data = [0,0,0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const PAD = 2;
  const pts = data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * (width - PAD * 2),
    y: PAD + (1 - (v - min) / range) * (height - PAD * 2),
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = `${d} L${pts[pts.length - 1].x},${height} L${pts[0].x},${height} Z`;
  const len = Math.round(pts.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const dx = p.x - pts[i - 1].x, dy = p.y - pts[i - 1].y;
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace("#","")})`} />
      <path className="sh-spark" d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ "--len": len }} />
    </svg>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function CountUp({ target, prefix = "", suffix = "", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target === undefined || target === null) return;
    const start = performance.now();
    const tick = (now) => {
      const pct = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - pct, 3);
      setDisplay(Math.round(target * ease));
      if (pct < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

// ─── Animated SVG Line Chart ────────────────────────────────────────────────────
function RevenueChart({ data, k }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="w-full relative flex items-center justify-center" style={{ height: 160, color: colors.text.tertiary }}>
        <span className="text-sm font-semibold">No revenue data available</span>
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const H = 140, W = 500;

  const coords = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * W : W / 2,
    y: H - ((d.value - min) / range) * (H - 16) - 8,
  }));

  const linePath = `M ${coords.map(c => `${c.x},${c.y}`).join(' L ')}`;
  const areaPath = `M ${coords[0].x},${H} L ${coords.map(c => `${c.x},${c.y}`).join(' L ')} L ${coords[coords.length - 1].x},${H} Z`;

  return (
    <div className="w-full relative" style={{ height: 160 }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id={`cg-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.cta.primary} stopOpacity="0.25" />
            <stop offset="100%" stopColor={colors.cta.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={0} y1={H * f} x2={W} y2={H * f} stroke={colors.border.subtle} strokeWidth={0.5} strokeDasharray="4 4" />
        ))}

        <motion.path d={areaPath} fill={`url(#cg-${k})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} />
        <motion.path d={linePath} fill="none" stroke={colors.cta.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }} />

        {coords.map((c, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: 'crosshair' }}>
            <rect x={c.x - 20} y={0} width={40} height={H} fill="transparent" />
            <motion.circle cx={c.x} cy={c.y} r={hovered === i ? 5 : 3} fill={colors.surface.elevated} stroke={colors.cta.primary} strokeWidth={2} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 + i * 0.04 }} />
          </g>
        ))}
      </svg>

      {hovered !== null && (
        <div className="absolute pointer-events-none px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg"
          style={{ left: `${(coords[hovered].x / W) * 100}%`, top: `${(coords[hovered].y / H) * 100}%`, transform: 'translate(-50%, -130%)', background: colors.surface.elevated, border: `1px solid ${colors.border.default}`, color: colors.text.primary }}>
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
  const s = map[status?.toLowerCase()] || { bg: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text.tertiary, label: status, dot: colors.text.tertiary };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, trend, trendVal, sparkData, accentColor, icon, delay, colors }) {
  const isUp = trend === "up";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{ background: colors?.surface.secondary, border: `1px solid ${colors?.border.subtle}` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{ background: `${accentColor}18`, transform: "translate(30%,-30%)" }} />
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: colors?.text.tertiary }}>{label}</p>
          <p className="text-2xl xl:text-3xl font-black sh-mono leading-none" style={{ color: colors?.text.primary }}>{value}</p>
          {sub && <p className="text-xs mt-1" style={{ color: colors?.text.tertiary }}>{sub}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: `${accentColor}18` }}>{icon}</div>
          {trendVal !== undefined && (
            <span className="sh-badge sh-trend" style={{ background: isUp ? "rgba(0,255,148,0.12)" : "rgba(239,68,68,0.12)", color: isUp ? "#059669" : "#dc2626" }}>
              {isUp ? "↑" : "↓"} {trendVal}%
            </span>
          )}
        </div>
      </div>
      {sparkData && (
        <div className="relative z-10">
          <Sparkline data={sparkData} color={accentColor} width={180} height={40} />
        </div>
      )}
    </motion.div>
  );
}

// ─── Quick action card ────────────────────────────────────────────────────────
function QuickAction({ icon, label, sub, to, accentColor, delay, colors, isDark, badge, setActivePage }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      whileHover={{ y: -3, boxShadow: isDark ? `0 12px 40px rgba(0,0,0,0.4)` : `0 12px 32px rgba(0,80,212,0.1)` }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setActivePage(to)}
      className="rounded-2xl p-4 text-left w-full flex items-center gap-4 relative overflow-hidden group transition-all"
      style={{ background: colors?.surface.secondary, border: `1px solid ${colors?.border.subtle}` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${accentColor}08, transparent)` }} />
      <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{ background: accentColor }} />
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{ background: `${accentColor}18` }}>{icon}</div>
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm" style={{ color: colors?.text.primary }}>{label}</p>
          {badge && <span className="sh-badge" style={{ background: "rgba(239,68,68,0.15)", color: "#dc2626" }}>{badge}</span>}
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: colors?.text.tertiary }}>{sub}</p>
      </div>
      <svg className="w-4 h-4 flex-shrink-0 opacity-30 group-hover:opacity-70 transition-all group-hover:translate-x-1 duration-200 relative z-10"
        style={{ color: colors?.text.secondary }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.button>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ title, sub, action, actionLabel, colors, setActivePage }) {
  return (
    <div className="flex items-end justify-between mb-5 gap-3">
      <div>
        <h2 className="font-black text-base" style={{ color: colors?.text.primary }}>{title}</h2>
        {sub && <p className="text-xs mt-0.5" style={{ color: colors?.text.tertiary }}>{sub}</p>}
      </div>
      {action && (
        <button onClick={() => setActivePage(action)} className="text-xs font-bold transition-colors flex-shrink-0"
          style={{ color: colors?.text.accent }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"} onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
          {actionLabel} →
        </button>
      )}
    </div>
  );
}

// ─── Main Overview Component ──────────────────────────────────────────────────
export default function DashOverview() {
  const { colors, isDark } = useTheme();
  const { profile, stats, revenueChart, analytics, orders, products, notifications, setActivePage } = useDashboard();
  const { user } = useAuthStore();
  const [chartRange, setChartRange] = useState('7d');
  
  const chartData = (revenueChart || {})[chartRange] || [];
  const RANGES = [{ k: '7d', l: '7D' }, { k: '30d', l: '30D' }, { k: '90d', l: '90D' }];
  const totalChartRevenue = chartData.reduce((s, d) => s + d.value, 0);
  
  const displayStoreName = profile?.storeName || user?.user_metadata?.full_name?.split(' ')[0] || 'Seller';
  
  const todayDate = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  
  const monthRevenue = stats?.revenue || 0;
  const todayRevenue = 0; 
  const totalOrders = stats?.totalOrders || 0;
  const pendingOrders = (orders || []).filter(o => o.status === 'pending').length;
  const totalViews = stats?.customers || 0; 
  
  const topProducts = [...(products || [])].sort((a,b) => (b.sales || 0) - (a.sales || 0)).slice(0, 7);
  const lowStockItems = (products || []).filter(p => p.stock < 5).length;
  
  let sparkData = ((revenueChart || {})['30d'] || []).map(d => d.value);
  if (!sparkData || sparkData.length === 0) sparkData = [0, 0, 0, 0, 0];
  
  const activity = (notifications || []).slice(0, 8).map(n => ({
    id: n.id,
    icon: n.type === 'order' ? '📦' : n.type === 'system' ? '⚙️' : '🔔',
    text: n.message || n.title,
    time: n.time || 'recently'
  }));

  const statuscolors = {
    pending:    { bg: "rgba(250,204,21,0.15)",  text: "#ca8a04"  },
    processing: { bg: "rgba(59,130,246,0.15)",  text: "#2563eb"  },
    shipped:    { bg: "rgba(144,171,255,0.15)", text: "#818cf8"  },
    delivered:  { bg: "rgba(0,255,148,0.15)",   text: "#059669"  },
    cancelled:  { bg: "rgba(239,68,68,0.15)",   text: "#dc2626"  },
    active:     { bg: "rgba(0,255,148,0.15)",   text: "#059669"  },
    draft:      { bg: "rgba(128,128,128,0.12)", text: "#6b7280"  },
  };

  const alerts = [
    pendingOrders > 0 && { id: "a1", icon: "📋", color: "#f59e0b", text: `${pendingOrders} orders awaiting fulfilment`, to: "orders" },
    lowStockItems > 0 && { id: "a2", icon: "⚠️", color: "#ef4444", text: `${lowStockItems} products running low on stock`, to: "products" },
  ].filter(Boolean);

  const ELECTRIC = colors?.brand?.electricBlue || "#0050d4";
  const NEON     = colors?.brand?.neonGreen     || "#00FF94";
  const GOLD     = "#f59e0b";
  const VIOLET   = "#8b5cf6";

  return (
    <div className="w-full" style={{ color: colors?.text.primary }}>
      
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
        className="mb-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-1" style={{ color: colors?.text.tertiary }}>{todayDate}</p>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: colors?.text.primary }}>
            {getGreeting()},{" "}
            <span style={{ color: ELECTRIC }}>{displayStoreName}</span>
          </h1>
          <p className="text-sm mt-1.5" style={{ color: colors?.text.tertiary }}>Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5" style={{ background: colors?.surface.secondary, border: `1px solid ${colors?.border.subtle}` }}>
          <span className="w-2 h-2 rounded-full bg-green-500 sh-dot flex-shrink-0" />
          <div>
            <p className="text-xs font-black" style={{ color: colors?.text.primary }}>Store Online</p>
            <p className="text-[10px]" style={{ color: colors?.text.tertiary }}>All systems normal</p>
          </div>
        </div>
      </motion.div>

      {/* ── Alerts ── */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mb-8 space-y-2">
            {alerts.map((a) => (
              <button key={a.id} onClick={() => setActivePage(a.to)} className="w-full text-left">
                <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: `${a.color}12`, border: `1px solid ${a.color}30` }}>
                  <span className="text-base flex-shrink-0">{a.icon}</span>
                  <p className="text-sm font-semibold flex-1" style={{ color: colors?.text.primary }}>{a.text}</p>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: a.color }}>Take action →</span>
                </motion.div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Revenue" value={<>₦<CountUp target={monthRevenue} duration={1400} /></>} sub={`All time`} sparkData={sparkData} accentColor={ELECTRIC} icon="💵" delay={0.1} colors={colors} isDark={isDark} />
        <KpiCard label="Orders" value={<><CountUp target={totalOrders} duration={900} /></>} sub={`${pendingOrders} pending action`} accentColor={NEON} icon="📦" delay={0.18} colors={colors} isDark={isDark} />
        <KpiCard label="Customers" value={<><CountUp target={totalViews} duration={1100} /></>} sub="All time" accentColor={GOLD} icon="👁️" delay={0.25} colors={colors} isDark={isDark} />
        <KpiCard label="Active Products" value={<><CountUp target={products?.length || 0} duration={700} /></>} sub={`${lowStockItems} low stock`} accentColor={VIOLET} icon="🏷️" delay={0.32} colors={colors} isDark={isDark} />
      </div>

      {/* ── Chart + Performance ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Main Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
          className="xl:col-span-2 rounded-2xl p-6 shadow-sm"
          style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.text.tertiary }}>Total Revenue</p>
              <p className="text-3xl font-black tabular-nums" style={{ color: colors.text.primary }}>
                <CountUp target={totalChartRevenue} duration={1500} prefix="₦" />
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6' }}>
              {RANGES.map(r => (
                <motion.button key={r.k} onClick={() => setChartRange(r.k)} whileTap={{ scale: 0.94 }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative"
                  style={chartRange === r.k ? { color: colors.cta.primaryText } : { color: colors.text.tertiary }}>
                  {chartRange === r.k && (
                    <motion.span layoutId="chart-range-pill" className="absolute inset-0 rounded-lg" style={{ background: colors.cta.primary }} />
                  )}
                  <span className="relative z-10">{r.l}</span>
                </motion.button>
              ))}
            </div>
          </div>
          <RevenueChart data={chartData} k={chartRange} />
          <div className="flex justify-between mt-3">
            {chartData.filter((_, i) => i % Math.ceil(chartData.length / 7) === 0).map(d => (
              <span key={d.label} className="text-[10px] font-medium" style={{ color: colors.text.tertiary }}>{d.label}</span>
            ))}
          </div>
        </motion.div>

        {/* Product Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
          className="rounded-2xl p-6 shadow-sm flex flex-col gap-5"
          style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.text.tertiary }}>Product Performance</p>
          <div className="space-y-3">
            {(() => {
              const perf = analytics?.performance;
              if (!perf || (!perf.bestSeller && !perf.needsAttention)) {
                return <p className="text-xs" style={{ color: colors.text.tertiary }}>No product data available yet.</p>;
              }
              const top = perf.bestSeller;
              const bottom = perf.needsAttention;
              const performanceItems = [];
              if (top) performanceItems.push({ label: 'Best Seller', name: top.name, meta: `${top.sales || 0} sales · ₦${formatMoneyCents(top.revenue || 0).replace('₦₦','₦')}`, type: 'success' });
              if (bottom && (!top || bottom.name !== top.name)) performanceItems.push({ label: 'Needs Attention', name: bottom.name, meta: `${bottom.sales || 0} sales · ${bottom.status}`, type: 'error' });
              return performanceItems.map((item, i) => (
                <motion.div key={item.type} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.1 }}
                  className="p-3.5 rounded-xl"
                  style={{ background: item.type === 'success' ? (isDark ? 'rgba(0,255,148,0.06)' : 'rgba(5,150,105,0.05)') : (isDark ? 'rgba(255,94,0,0.06)' : 'rgba(220,38,38,0.04)'), border: `1px solid ${item.type === 'success' ? (isDark ? 'rgba(0,255,148,0.12)' : 'rgba(5,150,105,0.12)') : (isDark ? 'rgba(255,94,0,0.12)' : 'rgba(220,38,38,0.12)')}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.type === 'success' ? colors.state.success : colors.state.error }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: item.type === 'success' ? colors.state.success : colors.state.error }}>{item.label}</span>
                  </div>
                  <p className="font-bold text-sm truncate" style={{ color: colors.text.primary }}>{item.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: colors.text.tertiary }}>{item.meta}</p>
                </motion.div>
              ));
            })()}
          </div>
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

      {/* ── Quick Actions + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}>
          <SectionHead title="Quick Actions" sub="Your most-used tools, one tap away" colors={colors} setActivePage={setActivePage} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "➕", label: "Add New Product", sub: "Upload, set price, go live", to: "products", color: ELECTRIC, delay: 0.4 },
              { icon: "📋", label: "View Orders", sub: "Manage and fulfil customer orders", to: "orders", color: NEON, badge: pendingOrders > 0 ? `${pendingOrders} new` : null, delay: 0.46 },
              { icon: "💰", label: "Payouts", sub: "Track payments and withdrawals", to: "wallet", color: VIOLET, delay: 0.54 },
              { icon: "📊", label: "Analytics", sub: "Views, conversions, revenue", to: "analytics", color: "#f43f5e", delay: 0.62 },
              { icon: "⚙️", label: "Store Settings", sub: "Profile, policies, shipping", to: "settings", color: colors?.text.tertiary, delay: 0.66 },
            ].map((a) => (
              <QuickAction key={a.to} icon={a.icon} label={a.label} sub={a.sub} to={a.to} accentColor={a.color} badge={a.badge} delay={a.delay} colors={colors} isDark={isDark} setActivePage={setActivePage} />
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}>
          <SectionHead title="Recent Activity" sub="Live feed" colors={colors} setActivePage={setActivePage} />
          <div className="rounded-2xl overflow-hidden" style={{ background: colors?.surface.secondary, border: `1px solid ${colors?.border.subtle}` }}>
            {activity.length > 0 ? activity.map((item, i) => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3.5 sh-tr" style={{ borderBottom: i < activity.length - 1 ? `1px solid ${colors?.border.subtle}` : "none" }} onMouseEnter={(e) => e.currentTarget.style.background = colors?.surface.tertiary} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-snug" style={{ color: colors?.text.secondary }}>{item.text}</p>
                </div>
                <span className="text-[10px] flex-shrink-0 sh-mono" style={{ color: colors?.text.tertiary }}>{item.time}</span>
              </div>
            )) : (
              <div className="px-4 py-6 text-center text-xs" style={{ color: colors.text.tertiary }}>No recent activity.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Orders ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5, ease: [0.32, 0.72, 0, 1] }} className="mb-8">
        <SectionHead title="Recent Orders" sub={`${(orders || []).length} total orders`} action="orders" actionLabel="View all" colors={colors} setActivePage={setActivePage} />
        <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ border: `1px solid ${colors?.border.subtle}` }}>
          <div className="grid text-[10px] font-black uppercase tracking-widest px-5 py-3 min-w-[600px]" style={{ gridTemplateColumns: "1fr 2fr 2fr 90px 100px", gap: 12, background: colors?.surface.tertiary, color: colors?.text.tertiary, borderBottom: `1px solid ${colors?.border.subtle}` }}>
            <span>Order</span>
            <span>Customer</span>
            <span>Product</span>
            <span className="text-right">Total</span>
            <span className="text-right">Status</span>
          </div>
          {(orders || []).slice(0, 8).map((order, i) => (
            <button key={order.id} onClick={() => setActivePage('orders')} className="w-full text-left grid items-center px-5 py-3.5 sh-tr min-w-[600px]" style={{ gridTemplateColumns: "1fr 2fr 2fr 90px 100px", gap: 12, borderBottom: i < 7 ? `1px solid ${colors?.border.subtle}` : "none", background: "transparent" }} onMouseEnter={(e) => e.currentTarget.style.background = colors?.surface.secondary} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <span className="sh-mono text-xs font-bold" style={{ color: ELECTRIC }}>{order.order_number || order.id}</span>
              <span className="text-xs font-medium truncate" style={{ color: colors?.text.primary }}>{order.customer}</span>
              <span className="text-xs truncate" style={{ color: colors?.text.secondary }}>{order.product}</span>
              <span className="text-xs font-bold text-right sh-mono" style={{ color: colors?.text.primary }}>{fmt(order.amount)}</span>
              <div className="flex justify-end"><StatusBadge status={order.status?.toLowerCase()} /></div>
            </button>
          ))}
          {(!orders || orders.length === 0) && (
            <div className="px-5 py-6 text-center text-xs" style={{ color: colors.text.tertiary }}>No orders found.</div>
          )}
        </div>
      </motion.div>

      {/* ── Top Products ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}>
        <SectionHead title="Top Performing Products" sub="Ranked by sales" action="products" actionLabel="Manage products" colors={colors} setActivePage={setActivePage} />
        <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ border: `1px solid ${colors?.border.subtle}` }}>
          <div className="grid text-[10px] font-black uppercase tracking-widest px-5 py-3 min-w-[600px]" style={{ gridTemplateColumns: "28px 3fr 100px 80px 80px", gap: 12, background: colors?.surface.tertiary, color: colors?.text.tertiary, borderBottom: `1px solid ${colors?.border.subtle}` }}>
            <span>#</span>
            <span>Product</span>
            <span className="text-right">Price</span>
            <span className="text-right">Sold</span>
            <span className="text-right">Stock</span>
          </div>
          {topProducts.map((p, i) => {
            const isLow = p.stock < 5;
            return (
              <button key={p.id} onClick={() => setActivePage('products')} className="w-full text-left grid items-center px-5 py-4 sh-tr min-w-[600px]" style={{ gridTemplateColumns: "28px 3fr 100px 80px 80px", gap: 12, borderBottom: i < topProducts.length - 1 ? `1px solid ${colors?.border.subtle}` : "none", background: "transparent" }} onMouseEnter={(e) => e.currentTarget.style.background = colors?.surface.secondary} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <span className="text-[11px] font-black sh-mono" style={{ color: i < 3 ? ELECTRIC : colors?.text.tertiary }}>{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: colors?.text.primary }}>{p.name}</p>
                </div>
                <span className="text-sm font-black text-right sh-mono" style={{ color: colors?.text.primary }}>{fmt(p.price)}</span>
                <span className="text-xs text-right sh-mono" style={{ color: colors?.text.secondary }}>{p.sales || 0}</span>
                <div className="flex justify-end">
                  <span className="sh-badge" style={{ background: isLow ? "rgba(239,68,68,0.12)" : "rgba(0,255,148,0.10)", color: isLow ? "#dc2626" : "#059669" }}>
                    {p.stock === 0 ? "Out" : `${p.stock} left`}
                  </span>
                </div>
              </button>
            );
          })}
          {(!topProducts || topProducts.length === 0) && (
            <div className="px-5 py-6 text-center text-xs" style={{ color: colors.text.tertiary }}>No products found.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
