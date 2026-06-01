import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../../Store/useThemeStore';
import { formatMoneyMinor } from '../../../utils/formatMoneyMinor';
import { useBuyer } from '../context/BuyerContext';
import { BIcon } from './BuyerIcon';

const CAT_COLORS = ['#667eea', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];
const RANGE_OPTIONS = [
  { id: 'daily', label: 'Days' },
  { id: 'weekly', label: 'Weeks' },
  { id: 'monthly', label: 'Months' },
  { id: 'yearly', label: 'Years' },
];

function AnimBar({ pct, color, delay = 0 }) {
  return (
    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ delay, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        className="h-full rounded-full" style={{ background: color }} />
    </div>
  );
}
function NoAvailableData({ colors, loading = false, onRetry }) {
  return (
    <div className="rounded-xl border border-dashed px-4 py-7 text-center" style={{ borderColor: colors.border.default }}>
      <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>
        {loading ? 'Loading available data...' : 'No available data'}
      </p>
      {onRetry && !loading && (
        <button type="button" onClick={onRetry} className="mt-2 text-xs font-bold" style={{ color: '#667eea' }}>
          Try again
        </button>
      )}
    </div>
  );
}

export default function BuyerAnalytics() {
  const { colors, isDark } = useTheme();
  const { spending, spendingLoading, spendingError, refreshSpending } = useBuyer();
  const safeSpending = spending || { categories: [], trends: {} };
  const [activeCategory, setActiveCategory] = useState(null);
  const [range, setRange] = useState('monthly');

  const categories = safeSpending.categories || [];
  const chartData = safeSpending.trends?.[range] || [];
  const totalSpend = safeSpending.totalSpend || categories.reduce((sum, category) => sum + category.spend, 0);
  const barMax = chartData.length ? Math.max(...chartData.map(period => period.spend), 1) : 1;
  const topCategory = categories[0]?.label;
  const peakPeriod = chartData.reduce(
    (peak, period) => period.spend > (peak?.spend || 0) ? period : peak,
    null,
  );
  const hasChartData = chartData.some(period => period.spend > 0);
  const retrySpending = spendingError ? () => refreshSpending?.() : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Spending Analytics</h2>
        <div className="flex items-center gap-2 mt-1">
          <BIcon name="sparkle" size={14} style={{ color: '#667eea' }} />
          <p className="text-sm" style={{ color: '#667eea' }}>
            {topCategory ? `Your highest spend is currently ${topCategory}.` : 'Paid orders will appear here as spending data.'}
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white opacity-[0.07]" />
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Total Lifetime Spend</p>
        <p className="text-4xl font-black text-white">{formatMoneyMinor(totalSpend)}</p>
        <p className="text-white/60 text-xs mt-2">
          {spendingLoading ? 'Loading available data...' : totalSpend > 0 ? `Across ${categories.length} categories` : 'No available data'}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-6 shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <p className="font-bold text-sm mb-5" style={{ color: colors.text.primary }}>By Category</p>
        <div className="space-y-4">
          {spendingLoading ? (
            <NoAvailableData colors={colors} loading />
          ) : categories.length === 0 ? (
            <NoAvailableData colors={colors} onRetry={retrySpending} />
          ) : categories.map((category, index) => (
            <motion.div key={category.label} layout
              className="cursor-pointer" onClick={() => setActiveCategory(activeCategory === category.label ? null : category.label)}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CAT_COLORS[index % CAT_COLORS.length] }} />
                  <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>{category.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black" style={{ color: CAT_COLORS[index % CAT_COLORS.length] }}>{category.pct}%</span>
                  <span className="text-xs" style={{ color: colors.text.tertiary }}>{formatMoneyMinor(category.spend)}</span>
                </div>
              </div>
              <AnimBar pct={category.pct} color={CAT_COLORS[index % CAT_COLORS.length]} delay={index * 0.1 + 0.1} />
              <AnimatePresence>
                {activeCategory === category.label && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="text-xs mt-1.5 font-semibold" style={{ color: CAT_COLORS[index % CAT_COLORS.length] }}>
                    {formatMoneyMinor(category.spend)} spent on {category.label.toLowerCase()} items total.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl p-6 shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <p className="font-bold text-sm" style={{ color: colors.text.primary }}>Spending Trend</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {RANGE_OPTIONS.map(option => (
              <button type="button" key={option.id} onClick={() => setRange(option.id)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap"
                style={range === option.id
                  ? { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }
                  : { background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {spendingLoading ? (
          <NoAvailableData colors={colors} loading />
        ) : !hasChartData ? (
          <NoAvailableData colors={colors} onRetry={retrySpending} />
        ) : (
          <div className="flex items-end gap-2 sm:gap-3 h-40">
            {chartData.map((period, index) => {
              const height = (period.spend / barMax) * 100;
              return (
                <div key={period.periodStart || period.label} className="flex-1 min-w-0 flex flex-col items-center gap-2 group">
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + index * 0.08 }}
                    className="text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#667eea' }}>
                    {formatMoneyMinor(period.spend)}
                  </motion.p>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }}
                    transition={{ delay: 0.2 + index * 0.08, duration: 0.7, ease: 'easeOut' }}
                    whileHover={{ scaleX: 1.1 }}
                    className="w-full rounded-t-xl cursor-pointer"
                    style={{ background: index === chartData.length - 1 ? 'linear-gradient(180deg,#667eea,#764ba2)' : (isDark ? 'rgba(102,126,234,0.3)' : 'rgba(102,126,234,0.15)') }} />
                  <span className="max-w-full truncate text-[10px] font-bold" style={{ color: colors.text.tertiary }}>{period.label}</span>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs mt-4 text-center font-semibold" style={{ color: '#667eea' }}>
          {peakPeriod?.spend > 0 ? `Your highest recorded period is ${peakPeriod.label} at ${formatMoneyMinor(peakPeriod.spend)}.` : 'Complete a paid order to start your spending history.'}
        </p>
      </motion.div>
    </div>
  );
}
