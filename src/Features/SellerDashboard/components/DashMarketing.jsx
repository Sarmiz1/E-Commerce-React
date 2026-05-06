import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../Store/useThemeStore";
import { Icon } from './DashIcon';

function Toggle({ value, onChange }) {
  const { colors } = useTheme();
  return (
    <motion.button onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full"
      style={{ background: value ? colors.cta.primary : colors.border.strong }}
      transition={{ duration: 0.2 }}>
      <motion.div animate={{ x: value ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
    </motion.button>
  );
}

function ToolCard({ icon, title, desc, actionLabel, children, delay = 0, onAction, actionDisabled = false, actionStyle }) {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleAction = async () => {
    if (onAction) {
      setLoading(true);
      await onAction();
      setLoading(false);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-6 shadow-sm space-y-5 flex flex-col"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
      <div className="flex items-center gap-3">
        <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.07)' }}>
          <Icon name={icon} size={18} style={{ color: colors.cta.primary }} />
        </motion.div>
        <div>
          <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{title}</p>
          <p className="text-xs" style={{ color: colors.text.tertiary }}>{desc}</p>
        </div>
      </div>

      <div className="flex-1">{children}</div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={handleAction}
        disabled={loading || actionDisabled}
        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
        style={done ? { background: colors.state.successBg, color: colors.state.success } : actionStyle || { background: isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.07)', color: colors.cta.primary }}>
        {loading ? (
          <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full block" />
            Processing...</>
        ) : done ? (
          <><Icon name="check" size={15} /> Done!</>
        ) : actionLabel}
      </motion.button>
    </motion.div>
  );
}

export default function DashMarketing() {
  const { colors, isDark } = useTheme();
  const [discountCode, setDiscountCode] = useState('');
  const [discountPct, setDiscountPct] = useState(10);
  const [flashActive, setFlashActive] = useState(false);
  const [featuredToggle, setFeaturedToggle] = useState(false);
  const [sponsoredToggle, setSponsoredToggle] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCode = useCallback(async () => {
    await new Promise(r => setTimeout(r, 800));
    const code = discountCode || `WOO${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setGeneratedCode(`${code}${discountPct}`);
  }, [discountCode, discountPct]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Marketing Tools</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Discount creator */}
        <ToolCard icon="percent" title="Discount Code" desc="Create a custom coupon code" actionLabel="Generate Code" delay={0.05} onAction={generateCode}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>Code Prefix</label>
              <input value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER"
                className="w-full px-4 py-2.5 rounded-xl text-sm font-mono outline-none border"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', borderColor: colors.border.default, color: colors.text.primary }} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Discount Amount</label>
                <span className="text-sm font-black" style={{ color: colors.cta.primary }}>{discountPct}% OFF</span>
              </div>
              <input type="range" min={5} max={80} step={5} value={discountPct} onChange={e => setDiscountPct(+e.target.value)}
                className="w-full accent-blue-600 cursor-pointer" />
            </div>

            <AnimatePresence>
              {generatedCode && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: isDark ? 'rgba(144,171,255,0.08)' : 'rgba(0,80,212,0.05)', border: `1px solid ${isDark ? 'rgba(144,171,255,0.15)' : 'rgba(0,80,212,0.12)'}` }}>
                  <span className="flex-1 font-mono font-black text-lg tracking-widest" style={{ color: colors.cta.primary }}>{generatedCode}</span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={copyCode}
                    className="p-2 rounded-lg text-xs font-bold"
                    style={{ background: copied ? colors.state.successBg : colors.surface.tertiary, color: copied ? colors.state.success : colors.text.secondary }}>
                    {copied ? <Icon name="check" size={14} /> : <Icon name="eye" size={14} />}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ToolCard>

        {/* Flash sale */}
        <ToolCard icon="zap" title="Flash Sale" desc="Time-limited price drops for your store" actionLabel="Configure Timer" delay={0.1}
          onAction={() => new Promise(r => setTimeout(r, 500))}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}` }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>Flash Sale Active</p>
                <p className="text-xs mt-0.5" style={{ color: flashActive ? colors.state.success : colors.text.tertiary }}>
                  {flashActive ? '🔥 Currently LIVE' : 'Currently off'}
                </p>
              </div>
              <Toggle value={flashActive} onChange={setFlashActive} />
            </div>
            {flashActive && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl text-center"
                style={{ background: isDark ? 'rgba(255,215,0,0.08)' : 'rgba(196,154,0,0.06)', border: `1px solid ${colors.state.warning}30` }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.state.warning }}>Time Remaining</p>
                <p className="font-black text-2xl tabular-nums" style={{ color: colors.text.primary }}>04:59:32</p>
              </motion.div>
            )}
          </div>
        </ToolCard>

        {/* Featured product */}
        <ToolCard icon="star" title="Featured Boost" desc="Pin your product on the homepage hero" actionLabel="Select & Boost Product" delay={0.15}
          onAction={() => new Promise(r => setTimeout(r, 700))}>
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}` }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>Homepage Feature Slot</p>
              <p className="text-xs mt-0.5" style={{ color: featuredToggle ? colors.cta.primary : colors.text.tertiary }}>
                {featuredToggle ? 'Stealth Sneakers X1' : 'No product selected'}
              </p>
            </div>
            <Toggle value={featuredToggle} onChange={setFeaturedToggle} />
          </div>
        </ToolCard>

        {/* Sponsored */}
        <ToolCard icon="trending-up" title="Sponsored Ads" desc="Pay-per-click campaigns across Woosho" actionLabel="Manage Budget" delay={0.2}
          onAction={() => new Promise(r => setTimeout(r, 600))}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}` }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>Ad Campaigns</p>
                <p className="text-xs mt-0.5" style={{ color: sponsoredToggle ? colors.state.success : colors.text.tertiary }}>
                  {sponsoredToggle ? '✓ Running · ₦2,500/day' : 'Not running'}
                </p>
              </div>
              <Toggle value={sponsoredToggle} onChange={setSponsoredToggle} />
            </div>
            {sponsoredToggle && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 gap-2">
                {[{ l: 'Impressions', v: '12.4K' }, { l: 'Clicks', v: '384' }, { l: 'CTR', v: '3.1%' }, { l: 'Spent', v: '₦17.5K' }].map(m => (
                  <div key={m.l} className="p-3 rounded-xl text-center" style={{ background: isDark ? 'rgba(0,255,148,0.06)' : 'rgba(5,150,105,0.05)', border: `1px solid ${isDark ? 'rgba(0,255,148,0.12)' : 'rgba(5,150,105,0.12)'}` }}>
                    <p className="text-lg font-black" style={{ color: colors.text.primary }}>{m.v}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: colors.text.tertiary }}>{m.l}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </ToolCard>
      </div>
    </div>
  );
}
