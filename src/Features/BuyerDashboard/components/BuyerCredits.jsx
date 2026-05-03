import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../store/useThemeStore";
import { useBuyer } from '../context/BuyerContext';
import { fmtFull } from '../utils/fmt';
import { BIcon } from './BuyerIcon';
import { AI_CREDIT_TIERS } from '../data/buyerData';

function CreditTierCard({ tier, delay, onBuy, buying }) {
  const { colors, isDark } = useTheme();
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -6, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : `0 20px 60px ${tier.color}18` }}
      className="rounded-2xl p-6 flex flex-col relative overflow-hidden" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
      {tier.badge && (
        <div className="absolute -top-0.5 right-4 px-3 py-1 rounded-b-lg text-[9px] font-black uppercase tracking-wider text-white" style={{ background: tier.color }}>{tier.badge}</div>
      )}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${tier.color}15` }}>
        <BIcon name={tier.icon} size={22} style={{ color: tier.color }} />
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: tier.color }}>{tier.name}</div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-black" style={{ color: colors.text.primary }}>{tier.credits}</span>
        <span className="text-xs" style={{ color: colors.text.tertiary }}>credits</span>
      </div>
      <p className="text-lg font-black mb-4" style={{ color: tier.color }}>{fmtFull(tier.price)}</p>
      <div className="flex-1 space-y-2.5 mb-5">
        {tier.perks.map(perk => (
          <div key={perk} className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${tier.color}18` }}>
              <BIcon name="check" size={9} style={{ color: tier.color }} />
            </div>
            <span className="text-xs" style={{ color: colors.text.secondary }}>{perk}</span>
          </div>
        ))}
      </div>
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onBuy(tier)} disabled={buying}
        className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
        style={{ background: tier.color, color: '#fff', opacity: buying ? 0.7 : 1 }}>
        {buying ? (<><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" /> Purchasing...</>) : (<><BIcon name="zap" size={14} /> Buy {tier.name}</>)}
      </motion.button>
    </motion.div>
  );
}

export default function BuyerCredits() {
  const { colors, isDark } = useTheme();
  const { aiCredits, creditHistory, totalCreditsPurchased, totalCreditsUsed, buyCredits, walletBalance, setPage } = useBuyer();
  const [buying, setBuying] = useState(false);
  const [purchased, setPurchased] = useState(null);

  const handleBuy = useCallback(async (tier) => {
    setBuying(true);
    const res = await buyCredits(tier);
    if (res.success) {
      setPurchased(tier);
      setTimeout(() => setPurchased(null), 3000);
    }
    setBuying(false);
  }, [buyCredits]);

  const usagePct = totalCreditsPurchased > 0 ? Math.round((totalCreditsUsed / totalCreditsPurchased) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2" style={{ color: colors.text.primary }}>
            <span className="text-lg">✦</span> AI Power-Ups
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>Supercharge your shopping with AI credits</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: isDark ? 'rgba(102,126,234,0.08)' : 'rgba(102,126,234,0.06)', border: `1px solid ${isDark ? 'rgba(102,126,234,0.15)' : 'rgba(102,126,234,0.1)'}` }}>
          <BIcon name="wallet" size={15} style={{ color: '#667eea' }} />
          <span className="text-sm font-bold" style={{ color: '#667eea' }}>Wallet: {fmtFull(walletBalance)}</span>
        </div>
      </div>

      {/* Credit balance hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-15" style={{ background: '#fff' }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Credits Available</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white">{aiCredits}</p>
              <span className="text-white/50 text-sm">credits</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center"><p className="text-xl font-black text-white">{totalCreditsPurchased}</p><p className="text-[10px] text-white/50">Total Bought</p></div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center"><p className="text-xl font-black text-white">{totalCreditsUsed}</p><p className="text-[10px] text-white/50">Total Used</p></div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center"><p className="text-xl font-black text-white">{usagePct}%</p><p className="text-[10px] text-white/50">Used</p></div>
          </div>
        </div>
        {/* Usage bar */}
        <div className="mt-4 w-full h-2 rounded-full bg-white/15 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${usagePct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} className="h-full rounded-full bg-white/60" />
        </div>
      </motion.div>

      {/* Success toast */}
      <AnimatePresence>
        {purchased && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)' }}>
            <BIcon name="check" size={18} style={{ color: '#059669' }} />
            <p className="text-sm font-bold" style={{ color: '#059669' }}>{purchased.credits} credits from the {purchased.name} pack added successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {AI_CREDIT_TIERS.map((tier, i) => (
          <CreditTierCard key={tier.id} tier={tier} delay={i * 0.1} onBuy={handleBuy} buying={buying} />
        ))}
      </div>

      {/* Recent usage */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.text.tertiary }}>Recent Usage</p>
        <div className="rounded-2xl overflow-hidden" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          {creditHistory.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-4 px-5 py-3.5" style={{ borderBottom: i < creditHistory.length - 1 ? `1px solid ${colors.border.subtle}` : 'none' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(102,126,234,0.08)' }}>
                <BIcon name="sparkle" size={14} style={{ color: '#667eea' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: colors.text.primary }}>{h.desc}</p>
                <p className="text-[10px]" style={{ color: colors.text.tertiary }}>{h.date}</p>
              </div>
              <span className="text-sm font-bold tabular-nums" style={{ color: '#ef4444' }}>-{h.used} cr</span>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-center" style={{ color: colors.text.tertiary }}>
        Credits are non-refundable · Purchased from your Woosho Wallet · <button onClick={() => setPage('wallet')} className="underline" style={{ color: '#667eea' }}>Fund Wallet</button>
      </p>
    </div>
  );
}
