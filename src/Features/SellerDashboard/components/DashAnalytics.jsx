import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../Store/useThemeStore";
import { useDashboard } from '../context/DashboardContext';
import { Icon } from './DashIcon';

// ─── Animated Horizontal Bar ──────────────────────────────────────────────────
function HorizBar({ label, pct, color, value, isActive, onClick }) {
  const { colors } = useTheme();
  return (
    <motion.div layout className="space-y-1.5 cursor-pointer group" onClick={onClick}>
      <div className="flex justify-between text-xs">
        <span className="font-semibold transition-colors" style={{ color: isActive ? color : colors.text.secondary }}>{label}</span>
        <span className="font-black tabular-nums transition-colors" style={{ color: isActive ? color : colors.text.tertiary }}>{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: colors.surface.tertiary }}>
        <motion.div
          initial={{ width: 0, opacity: 0.5 }}
          animate={{ width: `${pct}%`, opacity: isActive ? 1 : 0.5 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      {value && isActive && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="text-[10px] font-bold" style={{ color }}>
          ₦{value.toLocaleString()} revenue
        </motion.p>
      )}
    </motion.div>
  );
}

// ─── Peak Hours Heatmap ───────────────────────────────────────────────────────
function PeakHours({ data }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-[3px] h-24 w-full" onMouseLeave={() => setHovered(null)}>
        {data.map(d => {
          const h = (d.value / max) * 100;
          const isHigh = d.hour >= 12 && d.hour <= 21;
          const isHov = hovered === d.hour;
          return (
            <div key={d.hour} className="flex-1 flex items-end relative" onMouseEnter={() => setHovered(d.hour)}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                whileHover={{ scaleY: 1.06 }}
                transition={{ delay: d.hour * 0.015, duration: 0.5 }}
                className="w-full rounded-t-sm cursor-pointer"
                style={{ background: isHov ? colors.cta.primary : (isHigh ? `${colors.cta.primary}90` : `${colors.cta.primary}25`), minHeight: 3 }}
              />
              {isHov && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[9px] font-black whitespace-nowrap z-10 shadow-lg"
                  style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}`, color: colors.text.primary }}>
                  {d.hour === 0 ? '12AM' : d.hour < 12 ? `${d.hour}AM` : d.hour === 12 ? '12PM' : `${d.hour - 12}PM`}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {[0, 6, 12, 18, 23].map(h => (
          <span key={h} className="text-[10px]" style={{ color: colors.text.tertiary }}>
            {h === 0 ? '12AM' : h === 12 ? '12PM' : h < 12 ? `${h}AM` : `${h - 12}PM`}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data, colors: colorSet }) {
  const { colors } = useTheme();
  const total = data.reduce((s, d) => s + d.pct, 0);
  let cumulative = 0;
  const R = 40, cx = 50, cy = 50, strokeW = 14;
  const circumference = 2 * Math.PI * R;
  const [hovered, setHovered] = useState(null);

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" width={110} height={110}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={colors.surface.tertiary} strokeWidth={strokeW} />

        {data.map((d, i) => {
          const offset = (cumulative / total) * circumference;
          const dash = (d.pct / total) * circumference;
          cumulative += d.pct;
          const isHov = hovered === i;
          return (
            <motion.circle key={d.label}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={colorSet[i]}
              strokeWidth={isHov ? strokeW + 3 : strokeW}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${dash} ${circumference}`, opacity: hovered === null || isHov ? 1 : 0.4 }}
              transition={{ duration: 1, ease: 'easeOut', delay: i * 0.15 }}
              style={{ transformOrigin: '50px 50px', transform: 'rotate(-90deg)', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill={colors.text.tertiary}>Total</text>
        <text x={cx} y={cy + 7} textAnchor="middle" fontSize="11" fontWeight="900" fill={colors.text.primary}>100%</text>
      </svg>

      <div className="space-y-2 flex-1">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colorSet[i], opacity: hovered === null || hovered === i ? 1 : 0.3 }} />
            <span className="text-xs font-semibold flex-1 transition-opacity" style={{ color: colors.text.secondary, opacity: hovered === null || hovered === i ? 1 : 0.4 }}>{d.label}</span>
            <span className="text-xs font-black tabular-nums" style={{ color: hovered === i ? colorSet[i] : colors.text.tertiary }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Metrics Pill ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, change, icon, delay }) {
  const { colors, isDark } = useTheme();
  const up = change?.startsWith('+');
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl p-5 shadow-sm flex flex-col gap-2"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1" style={{ background: isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.07)' }}>
        <Icon name={icon} size={17} style={{ color: colors.cta.primary }} />
      </div>
      <p className="text-2xl font-black" style={{ color: colors.text.primary }}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>{label}</p>
      {change && (
        <div className="flex items-center gap-1">
          <Icon name={up ? 'arrow-up' : 'arrow-down'} size={11} style={{ color: up ? colors.state.success : colors.state.error }} />
          <span className="text-[11px] font-bold" style={{ color: up ? colors.state.success : colors.state.error }}>{change} vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Analytics Page ────────────────────────────────────────────────────────────
export default function DashAnalytics() {
  const { colors, isDark } = useTheme();
  const { analytics } = useDashboard();
  const ANALYTICS = analytics || { categoryRevenue: [], trafficSources: [], peakHours: [] };
  const categoryRevenue = ANALYTICS.categoryRevenue || [];
  const trafficSources  = ANALYTICS.trafficSources  || [];
  const peakHours       = ANALYTICS.peakHours       || [];
  const [activeCategory, setActiveCategory] = useState(null);
  const catColors = [colors.cta.primary, '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const srcColors = [colors.cta.primary, '#10b981', '#f59e0b', '#8b5cf6'];

  const METRICS = [
    { label: 'Conversion Rate',      value: '3.8%',  change: '+0.4%',  icon: 'percent' },
    { label: 'Cart Abandonment',     value: '68.2%', change: '-3.1%',  icon: 'x' },
    { label: 'Returning Customers',  value: '41%',   change: '+5%',    icon: 'users' },
    { label: 'Avg. Order Value',     value: '₦38.7K',change: '+8%',    icon: 'trending-up' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Analytics</h2>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => <MetricCard key={m.label} {...m} delay={i * 0.08} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl p-6 shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <p className="font-bold text-sm mb-5" style={{ color: colors.text.primary }}>Revenue by Category</p>
          <div className="space-y-4">
            {categoryRevenue.map((c, i) => (
              <HorizBar key={c.label} label={c.label} pct={c.pct} value={c.value} color={catColors[i % catColors.length]}
                isActive={activeCategory === null || activeCategory === c.label}
                onClick={() => setActiveCategory(activeCategory === c.label ? null : c.label)} />
            ))}
          </div>
        </motion.div>

        {/* Traffic Sources donut */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          className="rounded-2xl p-6 shadow-sm flex flex-col gap-5" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <p className="font-bold text-sm" style={{ color: colors.text.primary }}>Traffic Sources</p>
          <DonutChart data={trafficSources} colors={srcColors} />

          {/* AI Insight */}
          <motion.div className="p-4 rounded-xl mt-auto" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 4 }}
            style={{ background: isDark ? 'rgba(144,171,255,0.06)' : 'rgba(0,80,212,0.04)', border: `1px solid ${isDark ? 'rgba(144,171,255,0.12)' : 'rgba(0,80,212,0.08)'}` }}>
            <div className="flex items-center gap-2 mb-1.5">
              <motion.span animate={{ rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }}>✦</motion.span>
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.cta.primary }}>AI Insight</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: colors.text.secondary }}>
              Most customers come from organic search. Investing in SEO could increase revenue by 18–25%.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Peak hours */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-2xl p-6 shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <div className="flex items-center justify-between mb-6">
          <p className="font-bold text-sm" style={{ color: colors.text.primary }}>Peak Shopping Hours</p>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: isDark ? 'rgba(0,255,148,0.1)' : 'rgba(5,150,105,0.08)', color: colors.state.success }}>
            Peak: 6PM–9PM
          </span>
        </div>
        <PeakHours data={peakHours} />
      </motion.div>
    </div>
  );
}
