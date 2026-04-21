import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { SPENDING_DATA } from '../data/buyerData';
import { fmtFull, fmtNaira } from '../utils/fmt';
import { BIcon } from './BuyerIcon';

function AnimBar({ pct, color, delay = 0 }) {
  return (
    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ delay, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        className="h-full rounded-full" style={{ background: color }} />
    </div>
  );
}

const CAT_COLORS = ['#667eea', '#ec4899', '#f59e0b', '#10b981'];

export default function BuyerAnalytics() {
  const { colors, isDark } = useTheme();
  const [active, setActive] = useState(null);

  const totalSpend = SPENDING_DATA.categories.reduce((s, c) => s + c.spend, 0);
  const barMax = Math.max(...SPENDING_DATA.monthly.map(m => m.spend));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Spending Analytics</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm">✦</span>
          <p className="text-sm" style={{ color: '#667eea' }}>You spend mostly on fashion & footwear</p>
        </div>
      </div>

      {/* Total spend hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white opacity-[0.07]" />
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Total Lifetime Spend</p>
        <p className="text-4xl font-black text-white">{fmtFull(totalSpend)}</p>
        <p className="text-white/60 text-xs mt-2">Across {SPENDING_DATA.categories.length} categories</p>
      </motion.div>

      {/* Category breakdown */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-6 shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <p className="font-bold text-sm mb-5" style={{ color: colors.text.primary }}>By Category</p>
        <div className="space-y-4">
          {SPENDING_DATA.categories.map((c, i) => (
            <motion.div key={c.label} layout
              className="cursor-pointer" onClick={() => setActive(active === c.label ? null : c.label)}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CAT_COLORS[i] }} />
                  <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>{c.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black" style={{ color: CAT_COLORS[i] }}>{c.pct}%</span>
                  <span className="text-xs" style={{ color: colors.text.tertiary }}>{fmtFull(c.spend)}</span>
                </div>
              </div>
              <AnimBar pct={c.pct} color={CAT_COLORS[i]} delay={i * 0.1 + 0.1} />
              <AnimatePresence>
                {active === c.label && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="text-xs mt-1.5 font-semibold" style={{ color: CAT_COLORS[i] }}>
                    {fmtFull(c.spend)} spent on {c.label.toLowerCase()} items total.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Monthly chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl p-6 shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <p className="font-bold text-sm mb-6" style={{ color: colors.text.primary }}>Monthly Spending</p>
        <div className="flex items-end gap-3 h-36">
          {SPENDING_DATA.monthly.map((m, i) => {
            const h = (m.spend / barMax) * 100;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.08 }}
                  className="text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#667eea' }}>
                  {fmtNaira(m.spend)}
                </motion.p>
                <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                  whileHover={{ scaleX: 1.1 }}
                  className="w-full rounded-t-xl cursor-pointer"
                  style={{ background: i === SPENDING_DATA.monthly.length - 1 ? 'linear-gradient(180deg,#667eea,#764ba2)' : (isDark ? 'rgba(102,126,234,0.3)' : 'rgba(102,126,234,0.15)') }} />
                <span className="text-[10px] font-bold" style={{ color: colors.text.tertiary }}>{m.month}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-4 text-center font-semibold" style={{ color: '#667eea' }}>
          ✦ AI: Your spending peaked in December. You're on a healthy trend this month.
        </p>
      </motion.div>
    </div>
  );
}
