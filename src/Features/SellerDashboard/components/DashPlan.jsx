import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../store/useThemeStore";
import { Icon } from './DashIcon';

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 0, priceLabel: 'Free', period: 'forever',
    color: '#6b7280', perks: ['20 active listings','50 AI credits / month','4% transaction fee','Basic analytics','Community support'],
  },
  {
    id: 'growth', name: 'Growth', price: 5000, priceLabel: '₦5,000', period: '/ month',
    color: '#6366f1', badge: 'Most Popular', featured: true,
    perks: ['Unlimited listings','500 AI credits / month','3.5% transaction fee','AI pricing intelligence','Social commerce feed','Priority support'],
  },
  {
    id: 'pro', name: 'Pro', price: 12000, priceLabel: '₦12,000', period: '/ month',
    color: '#f59e0b', badge: 'Best Value',
    perks: ['Everything in Growth','Unlimited AI credits','3% transaction fee','Custom storefront branding','API access','Dedicated account manager'],
  },
];

function PlanCard({ plan, currentPlan, onSelect, delay }) {
  const { colors, isDark } = useTheme();
  const isCurrent = currentPlan === plan.id;
  const isUpgrade = PLANS.findIndex(p => p.id === plan.id) > PLANS.findIndex(p => p.id === currentPlan);
  const isDowngrade = PLANS.findIndex(p => p.id === plan.id) < PLANS.findIndex(p => p.id === currentPlan);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,80,212,0.12)' }}
      className="rounded-2xl p-6 flex flex-col relative overflow-hidden transition-shadow"
      style={{
        background: plan.featured
          ? (isDark ? `linear-gradient(160deg, ${plan.color}18 0%, ${colors.surface.elevated} 60%)` : `linear-gradient(160deg, ${plan.color}0a 0%, ${colors.surface.elevated} 60%)`)
          : colors.surface.elevated,
        border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? plan.color : colors.border.subtle}`,
      }}>
      {plan.badge && (
        <div className="absolute -top-0.5 right-4 px-3 py-1 rounded-b-lg text-[9px] font-black uppercase tracking-wider text-white"
          style={{ background: plan.color }}>{plan.badge}</div>
      )}
      {isCurrent && (
        <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black"
          style={{ background: `${plan.color}18`, color: plan.color }}>
          <Icon name="check" size={10} /> Current Plan
        </div>
      )}

      <div className={isCurrent ? 'mt-8' : 'mt-1'}>
        <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: plan.color }}>{plan.name}</div>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-black" style={{ color: colors.text.primary }}>{plan.priceLabel}</span>
          <span className="text-xs" style={{ color: colors.text.tertiary }}>{plan.period}</span>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 my-5">
        {plan.perks.map(perk => (
          <div key={perk} className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${plan.color}18` }}>
              <Icon name="check" size={9} style={{ color: plan.color }} />
            </div>
            <span className="text-xs" style={{ color: colors.text.secondary }}>{perk}</span>
          </div>
        ))}
      </div>

      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={() => !isCurrent && onSelect(plan)}
        disabled={isCurrent}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all"
        style={{
          background: isCurrent ? (isDark ? colors.surface.tertiary : '#F3F4F6') : plan.featured ? plan.color : `${plan.color}12`,
          color: isCurrent ? colors.text.tertiary : plan.featured ? '#fff' : plan.color,
          border: !plan.featured && !isCurrent ? `1px solid ${plan.color}40` : 'none',
          cursor: isCurrent ? 'default' : 'pointer',
        }}>
        {isCurrent ? 'Current Plan' : isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
      </motion.button>
    </motion.div>
  );
}

export default function DashPlan() {
  const { colors, isDark } = useTheme();
  const [currentPlan, setCurrentPlan] = useState('growth');
  const [confirmModal, setConfirmModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSelect = useCallback((plan) => {
    setConfirmModal(plan);
    setSuccess(false);
  }, []);

  const confirmChange = useCallback(async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setCurrentPlan(confirmModal.id);
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => { setConfirmModal(null); setSuccess(false); }, 2000);
  }, [confirmModal]);

  const confirmCancel = useCallback(async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setCurrentPlan('starter');
    setProcessing(false);
    setCancelModal(false);
  }, []);

  const currentPlanData = PLANS.find(p => p.id === currentPlan);
  const renewDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Subscription Plan</h2>
          <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>Manage your Woosho seller subscription</p>
        </div>
        {currentPlan !== 'starter' && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            onClick={() => setCancelModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            style={{ background: isDark ? 'rgba(255,94,0,0.08)' : 'rgba(220,38,38,0.06)', color: colors.state.error, border: `1px solid ${isDark ? 'rgba(255,94,0,0.15)' : 'rgba(220,38,38,0.12)'}` }}>
            <Icon name="x" size={13} /> Cancel Plan
          </motion.button>
        )}
      </div>

      {/* Current plan summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ background: isDark ? `${currentPlanData.color}08` : `${currentPlanData.color}06`, border: `1px solid ${currentPlanData.color}25` }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${currentPlanData.color}18` }}>
          <Icon name="crown" size={22} style={{ color: currentPlanData.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-base" style={{ color: colors.text.primary }}>{currentPlanData.name} Plan</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase" style={{ background: `${currentPlanData.color}18`, color: currentPlanData.color }}>Active</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>
            {currentPlan === 'starter' ? 'Free forever — no billing' : `Next billing: ${renewDate} · ${currentPlanData.priceLabel}${currentPlanData.period}`}
          </p>
        </div>
        {currentPlan !== 'starter' && (
          <div className="text-right">
            <p className="text-2xl font-black" style={{ color: currentPlanData.color }}>{currentPlanData.priceLabel}</p>
            <p className="text-[10px]" style={{ color: colors.text.tertiary }}>{currentPlanData.period}</p>
          </div>
        )}
      </motion.div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} currentPlan={currentPlan} onSelect={handleSelect} delay={i * 0.1} />
        ))}
      </div>

      <p className="text-[11px] text-center" style={{ color: colors.text.tertiary }}>
        All plans include bank-grade security · Powered by Paystack & Stripe · Cancel anytime
      </p>

      {/* ─── Confirm Change Modal ─── */}
      {createPortal(
        <AnimatePresence>
          {confirmModal && (
            <>
              <motion.div key="cbg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !processing && setConfirmModal(null)} />
              <motion.div key="cmodal"
                initial={{ opacity: 0, scale: 0.88, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 20 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="w-[90vw] max-w-sm rounded-2xl p-6 shadow-2xl pointer-events-auto"
                style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}>
                {success ? (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-4">
                    <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: colors.state.successBg }}>
                      <Icon name="check" size={24} style={{ color: colors.state.success }} />
                    </div>
                    <h4 className="font-black text-lg mb-1" style={{ color: colors.text.primary }}>Plan Updated!</h4>
                    <p className="text-sm" style={{ color: colors.text.tertiary }}>You're now on the {confirmModal.name} plan.</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `${confirmModal.color}18` }}>
                      <Icon name="crown" size={22} style={{ color: confirmModal.color }} />
                    </div>
                    <h4 className="font-black text-center text-lg mb-1" style={{ color: colors.text.primary }}>
                      Switch to {confirmModal.name}?
                    </h4>
                    <p className="text-sm text-center mb-5" style={{ color: colors.text.tertiary }}>
                      {confirmModal.price > 0 ? `You'll be charged ${confirmModal.priceLabel} ${confirmModal.period}. Changes take effect immediately.` : 'You\'ll be moved to the free plan. Some features may be limited.'}
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => setConfirmModal(null)} disabled={processing}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
                        style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
                      <motion.button whileTap={{ scale: 0.96 }} onClick={confirmChange} disabled={processing}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                        style={{ background: confirmModal.color, color: '#fff', opacity: processing ? 0.7 : 1 }}>
                        {processing ? (
                          <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" /> Updating...</>
                        ) : 'Confirm'}
                      </motion.button>
                    </div>
                  </>
                )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ─── Cancel Plan Modal ─── */}
      {createPortal(
        <AnimatePresence>
          {cancelModal && (
            <>
              <motion.div key="canbg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !processing && setCancelModal(false)} />
              <motion.div key="canmodal"
                initial={{ opacity: 0, scale: 0.88, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 20 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="w-[90vw] max-w-sm rounded-2xl p-6 shadow-2xl pointer-events-auto"
                style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: colors.state.errorBg }}>
                  <Icon name="alert-circle" size={22} style={{ color: colors.state.error }} />
                </div>
                <h4 className="font-black text-center text-lg mb-1" style={{ color: colors.text.primary }}>Cancel Your Plan?</h4>
                <p className="text-sm text-center mb-2" style={{ color: colors.text.tertiary }}>
                  You'll lose access to {currentPlanData.name} features at the end of your billing cycle.
                </p>
                <div className="rounded-xl p-3 mb-5 space-y-1.5" style={{ background: isDark ? 'rgba(255,94,0,0.06)' : 'rgba(220,38,38,0.04)', border: `1px solid ${isDark ? 'rgba(255,94,0,0.12)' : 'rgba(220,38,38,0.1)'}` }}>
                  {['Unlimited listings → 20 listings', 'AI credits reduced', 'Priority support removed'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs" style={{ color: colors.state.error }}>
                      <Icon name="x" size={10} /> {item}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCancelModal(false)} disabled={processing}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>Keep Plan</button>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={confirmCancel} disabled={processing}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2"
                    style={{ borderColor: colors.state.error, color: colors.state.error, opacity: processing ? 0.7 : 1 }}>
                    {processing ? (
                      <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        className="w-4 h-4 border-2 rounded-full block" style={{ borderColor: `${colors.state.error}40`, borderTopColor: colors.state.error }} /> Cancelling...</>
                    ) : 'Cancel Plan'}
                  </motion.button>
                </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
