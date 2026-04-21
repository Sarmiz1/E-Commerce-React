import { useEffect, useRef, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { TRANSACTIONS } from '../data/mockData';
import { fmt, fmtFull } from '../utils/format';
import { Icon } from './DashIcon';
import { StatusBadge } from './DashOverview';

function CountUp({ to, duration = 1.2, prefix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctrl = animate(0, to, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(v) { if (ref.current) ref.current.textContent = prefix + '₦' + Math.round(v).toLocaleString(); },
    });
    return () => ctrl.stop();
  }, [to]);
  return <span ref={ref}>{prefix}₦0</span>;
}

function BalanceCard({ label, value, sub, accent = false, icon, delay = 0 }) {
  const { colors, isDark } = useTheme();
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4 }}
      className="rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col gap-2"
      style={accent ? { background: colors.cta.primary } : { background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
      {accent && (
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ background: '#fff' }} />
      )}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent ? 'rgba(255,255,255,0.6)' : colors.text.tertiary }}>{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent ? 'rgba(255,255,255,0.15)' : (isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.07)') }}>
          <Icon name={icon} size={15} style={{ color: accent ? '#fff' : colors.cta.primary }} />
        </div>
      </div>
      <p className="text-4xl font-black tabular-nums" style={{ color: accent ? '#fff' : colors.text.primary }}>
        <CountUp to={value} duration={1.6} delay={delay} />
      </p>
      {sub && <p className="text-[11px]" style={{ color: accent ? 'rgba(255,255,255,0.6)' : colors.text.tertiary }}>{sub}</p>}
    </motion.div>
  );
}

export default function DashWallet() {
  const { colors, isDark } = useTheme();
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawDone, setWithdrawDone] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredTxns = filter === 'all' ? TRANSACTIONS : TRANSACTIONS.filter(t => t.status === filter);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    await new Promise(r => setTimeout(r, 1400));
    setWithdrawing(false);
    setWithdrawDone(true);
    setTimeout(() => setWithdrawDone(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Wallet & Payouts</h2>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          onClick={handleWithdraw} disabled={withdrawing || withdrawDone}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
          style={{
            background: withdrawDone ? colors.state.success : colors.cta.primary,
            color: colors.cta.primaryText,
            opacity: withdrawing ? 0.7 : 1,
          }}>
          {withdrawing ? (
            <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" /> Processing...</>
          ) : withdrawDone ? (
            <><Icon name="check" size={15} /> Withdrawal Sent!</>
          ) : (
            <><Icon name="download" size={15} /> Withdraw Funds</>
          )}
        </motion.button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BalanceCard label="Available Balance" value={782000} sub="Ready to withdraw" accent icon="wallet" delay={0} />
        <BalanceCard label="Pending Balance" value={312500} sub="Clears in 5–7 days" icon="trending-up" delay={0.08} />
        <BalanceCard label="Total Earnings" value={4820500} sub="All time" icon="bar-chart" delay={0.16} />
      </div>

      {/* Transaction history */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
          <p className="font-bold text-sm" style={{ color: colors.text.primary }}>Transaction History</p>
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6' }}>
            {['all', 'settled', 'pending', 'paid'].map(f => (
              <motion.button key={f} onClick={() => setFilter(f)} whileTap={{ scale: 0.93 }}
                className="px-3 py-1 rounded-md text-[10px] font-bold capitalize transition-colors"
                style={filter === f ? { background: colors.cta.primary, color: colors.cta.primaryText } : { color: colors.text.tertiary }}>
                {f}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ background: isDark ? colors.surface.tertiary : '#FAFAFA' }}>
                {['Date', 'Reference', 'Amount', 'Fee', 'Net Earned', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.border.subtle }}>
              {filteredTxns.map((t, i) => (
                <motion.tr key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,80,212,0.015)' }}
                  className="transition-colors">
                  <td className="px-6 py-3.5 text-xs" style={{ color: colors.text.tertiary }}>{t.date}</td>
                  <td className="px-6 py-3.5 text-xs font-mono font-bold" style={{ color: colors.text.secondary }}>{t.ref}</td>
                  <td className="px-6 py-3.5 text-sm font-bold" style={{ color: t.amount < 0 ? colors.state.error : colors.state.success }}>
                    {t.amount < 0 ? '-' : '+'}{fmtFull(Math.abs(t.amount))}
                  </td>
                  <td className="px-6 py-3.5 text-sm" style={{ color: colors.text.tertiary }}>{t.fee > 0 ? fmtFull(t.fee) : '—'}</td>
                  <td className="px-6 py-3.5 text-sm font-bold" style={{ color: t.net < 0 ? colors.state.error : colors.state.success }}>
                    {t.net < 0 ? '-' : '+'}{fmtFull(Math.abs(t.net))}
                  </td>
                  <td className="px-6 py-3.5"><StatusBadge status={t.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
