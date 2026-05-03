import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../store/useThemeStore";
import { useBuyer } from '../context/BuyerContext';
import { fmtFull } from '../utils/fmt';
import { BIcon } from './BuyerIcon';

const QUICK = [10000, 25000, 50000, 100000];
const TXN_FILTERS = ['all', 'fund', 'withdraw', 'purchase', 'credit', 'refund'];
const TXN_META = {
  fund:     { icon: 'arrow-down', color: '#059669', label: 'Funded' },
  withdraw: { icon: 'arrow-up',  color: '#ef4444', label: 'Withdrawn' },
  purchase: { icon: 'cart',      color: '#667eea', label: 'Purchase' },
  credit:   { icon: 'zap',       color: '#f59e0b', label: 'AI Credits' },
  refund:   { icon: 'refresh',   color: '#8b5cf6', label: 'Refund' },
};

// ─── Fund Modal ──────────────────────────────────────────────────────────────
function FundModal({ open, onClose, onFund }) {
  const { colors, isDark } = useTheme();
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const ref = useRef(null);
  const parsed = parseInt(amount.replace(/\D/g, '')) || 0;

  useEffect(() => { if (open) { setAmount(''); setProcessing(false); setSuccess(false); setTimeout(() => ref.current?.focus(), 200); } }, [open]);

  const submit = useCallback(async () => {
    if (parsed < 500) return;
    setProcessing(true);
    await onFund(parsed);
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => { onClose(); }, 1800);
  }, [parsed, onFund, onClose]);

  if (!open) return null;
  return createPortal(
    <AnimatePresence>
      {open && (<>
        <motion.div key="fb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md" onClick={() => !processing && onClose()} />
        <motion.div key="fm" initial={{ opacity: 0, scale: 0.88, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-[95vw] max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(5,150,105,0.1)' }}><BIcon name="plus" size={18} style={{ color: '#059669' }} /></div>
                <div><h3 className="font-black text-base" style={{ color: colors.text.primary }}>Fund Wallet</h3><p className="text-[11px]" style={{ color: colors.text.tertiary }}>Add money to your wallet</p></div>
              </div>
              {!processing && <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.tertiary }}><BIcon name="x" size={15} /></button>}
            </div>
            <div className="px-6 py-6">
              {success ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(5,150,105,0.1)' }}><BIcon name="check" size={28} style={{ color: '#059669' }} /></div>
                  <h4 className="font-black text-xl mb-1" style={{ color: colors.text.primary }}>Funded!</h4>
                  <p className="text-sm" style={{ color: colors.text.tertiary }}>{fmtFull(parsed)} added to your wallet</p>
                </motion.div>
              ) : (<>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: colors.text.tertiary }}>Enter Amount</p>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black" style={{ color: colors.text.tertiary }}>₦</span>
                  <input ref={ref} type="text" value={parsed > 0 ? parsed.toLocaleString() : ''} onChange={e => setAmount(e.target.value)} placeholder="0"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl text-2xl font-black outline-none" style={{ background: isDark ? colors.surface.tertiary : '#F5F6FA', border: `2px solid ${colors.border.default}`, color: colors.text.primary }} />
                </div>
                <div className="flex gap-2 mb-5 flex-wrap">
                  {QUICK.map(q => (
                    <motion.button key={q} whileTap={{ scale: 0.95 }} onClick={() => setAmount(String(q))}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: parsed === q ? '#667eea' : (isDark ? colors.surface.tertiary : '#F3F4F6'), color: parsed === q ? '#fff' : colors.text.secondary, border: `1px solid ${parsed === q ? '#667eea' : colors.border.subtle}` }}>
                      ₦{q.toLocaleString()}
                    </motion.button>
                  ))}
                </div>
                <div className="flex items-start gap-2 mb-4 p-3 rounded-xl" style={{ background: isDark ? 'rgba(102,126,234,0.05)' : 'rgba(102,126,234,0.03)', border: `1px solid ${isDark ? 'rgba(102,126,234,0.1)' : 'rgba(102,126,234,0.08)'}` }}>
                  <BIcon name="shield" size={14} style={{ color: '#667eea', marginTop: 1 }} />
                  <p className="text-[11px] leading-relaxed" style={{ color: colors.text.tertiary }}>Secured by Paystack. Funds are instantly available.</p>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={submit} disabled={parsed < 500 || processing}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: parsed >= 500 ? 'linear-gradient(135deg, #667eea, #764ba2)' : (isDark ? colors.surface.tertiary : '#E5E7EB'), color: parsed >= 500 ? '#fff' : colors.text.tertiary }}>
                  {processing ? (<><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" /> Processing...</>) : 'Fund Wallet'}
                </motion.button>
              </>)}
            </div>
          </div>
        </motion.div>
      </>)}
    </AnimatePresence>, document.body
  );
}

// ─── Withdraw Modal ──────────────────────────────────────────────────────────
function WithdrawModal({ open, onClose, balance, onWithdraw }) {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const ref = useRef(null);
  const passRef = useRef(null);
  const parsed = parseInt(amount.replace(/\D/g, '')) || 0;
  const fee = Math.round(parsed * 0.10);
  const net = parsed - fee;

  useEffect(() => { if (open) { setStep(1); setAmount(''); setPassword(''); setProcessing(false); setSuccess(false); setError(''); setResult(null); setTimeout(() => ref.current?.focus(), 200); } }, [open]);

  const goStep2 = () => { if (parsed < 1000) { setError('Minimum ₦1,000'); return; } if (parsed > balance) { setError('Exceeds balance'); return; } setStep(2); setTimeout(() => passRef.current?.focus(), 200); };

  const submit = useCallback(async () => {
    if (!password || password.length < 6) { setError('Password must be 6+ chars'); return; }
    setProcessing(true); setError('');
    const res = await onWithdraw(parsed, password);
    if (res.success) { setResult(res); setSuccess(true); setStep(3); } else { setError(res.error || 'Failed'); }
    setProcessing(false);
  }, [parsed, password, onWithdraw]);

  if (!open) return null;
  return createPortal(
    <AnimatePresence>
      {open && (<>
        <motion.div key="wb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md" onClick={() => !processing && onClose()} />
        <motion.div key="wm" initial={{ opacity: 0, scale: 0.88, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-[95vw] max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)' }}><BIcon name="arrow-up" size={18} style={{ color: '#ef4444' }} /></div>
                <div><h3 className="font-black text-base" style={{ color: colors.text.primary }}>Withdraw Funds</h3><p className="text-[11px]" style={{ color: colors.text.tertiary }}>Balance: {fmtFull(balance)}</p></div>
              </div>
              {!processing && <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.tertiary }}><BIcon name="x" size={15} /></button>}
            </div>
            <div className="px-6 py-6">
              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1,2,3].map(s => (<div key={s} className="flex items-center gap-2"><div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: step > s ? '#059669' : step === s ? '#667eea' : colors.surface.tertiary, color: step >= s ? '#fff' : colors.text.tertiary }}>{step > s ? <BIcon name="check" size={12} /> : s}</div>{s < 3 && <div className="w-8 h-0.5 rounded-full" style={{ background: step > s ? '#059669' : colors.border.default }} />}</div>))}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: colors.text.tertiary }}>Enter Amount</p>
                    <div className="relative mb-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black" style={{ color: colors.text.tertiary }}>₦</span>
                      <input ref={ref} type="text" value={parsed > 0 ? parsed.toLocaleString() : ''} onChange={e => { setAmount(e.target.value); setError(''); }} placeholder="0"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl text-2xl font-black outline-none" style={{ background: isDark ? colors.surface.tertiary : '#F5F6FA', border: `2px solid ${error ? '#ef4444' : colors.border.default}`, color: colors.text.primary }} />
                    </div>
                    {parsed > 0 && (
                      <div className="rounded-xl p-4 mb-4 space-y-2" style={{ background: isDark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.03)', border: `1px solid ${isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)'}` }}>
                        <div className="flex justify-between text-xs"><span style={{ color: colors.text.tertiary }}>Withdrawal fee (10%)</span><span className="font-bold" style={{ color: '#ef4444' }}>-{fmtFull(fee)}</span></div>
                        <div className="h-px" style={{ background: colors.border.subtle }} />
                        <div className="flex justify-between text-sm"><span className="font-black" style={{ color: colors.text.primary }}>You'll receive</span><span className="font-black text-base" style={{ color: '#059669' }}>{fmtFull(net)}</span></div>
                      </div>
                    )}
                    {error && <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: '#ef4444' }}><BIcon name="alert-circle" size={13} /> {error}</p>}
                    <motion.button whileTap={{ scale: 0.97 }} onClick={goStep2} disabled={parsed <= 0} className="w-full py-3.5 rounded-xl font-bold text-sm"
                      style={{ background: parsed > 0 ? '#667eea' : (isDark ? colors.surface.tertiary : '#E5E7EB'), color: parsed > 0 ? '#fff' : colors.text.tertiary }}>Continue →</motion.button>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: colors.text.tertiary }}>Verify Identity</p>
                    <div className="rounded-xl p-4 mb-5 space-y-1.5" style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.subtle}` }}>
                      <div className="flex justify-between text-sm"><span style={{ color: colors.text.tertiary }}>Withdraw</span><span className="font-black" style={{ color: colors.text.primary }}>{fmtFull(parsed)}</span></div>
                      <div className="flex justify-between text-sm"><span style={{ color: colors.text.tertiary }}>Fee (10%)</span><span className="font-bold" style={{ color: '#ef4444' }}>-{fmtFull(fee)}</span></div>
                      <div className="h-px" style={{ background: colors.border.subtle }} />
                      <div className="flex justify-between text-sm"><span className="font-bold" style={{ color: colors.text.primary }}>Net to bank</span><span className="font-black" style={{ color: '#059669' }}>{fmtFull(net)}</span></div>
                    </div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: colors.text.tertiary }}>Account Password</label>
                    <div className="relative mb-4">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2"><BIcon name="lock" size={16} style={{ color: colors.text.tertiary }} /></div>
                      <input ref={passRef} type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none" style={{ background: isDark ? colors.surface.tertiary : '#F5F6FA', border: `2px solid ${error ? '#ef4444' : colors.border.default}`, color: colors.text.primary }} />
                    </div>
                    {error && <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: '#ef4444' }}><BIcon name="alert-circle" size={13} /> {error}</p>}
                    <div className="flex gap-3">
                      <button onClick={() => { setStep(1); setError(''); }} disabled={processing} className="flex-1 py-3.5 rounded-xl font-bold text-sm border" style={{ borderColor: colors.border.default, color: colors.text.secondary }}>← Back</button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={submit} disabled={processing || !password.trim()} className="flex-[2] py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                        style={{ background: password.trim() && !processing ? '#ef4444' : (isDark ? colors.surface.tertiary : '#E5E7EB'), color: password.trim() && !processing ? '#fff' : colors.text.tertiary }}>
                        {processing ? (<><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" /> Processing...</>) : (<><BIcon name="lock" size={14} /> Confirm</>)}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
                {step === 3 && success && (
                  <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(5,150,105,0.1)' }}><BIcon name="check" size={28} style={{ color: '#059669' }} /></div>
                    <h4 className="font-black text-xl mb-1" style={{ color: colors.text.primary }}>Withdrawal Submitted!</h4>
                    <p className="text-sm mb-4" style={{ color: colors.text.tertiary }}>{fmtFull(net)} is on its way to your bank.</p>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={onClose} className="w-full py-3.5 rounded-xl font-bold text-sm" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff' }}>Done</motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </>)}
    </AnimatePresence>, document.body
  );
}

// ─── Main Wallet Page ────────────────────────────────────────────────────────
export default function BuyerWallet() {
  const { colors, isDark } = useTheme();
  const { walletBalance, walletTransactions, fundWallet, withdrawWallet } = useBuyer();
  const [fundOpen, setFundOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? walletTransactions : walletTransactions.filter(t => t.type === filter);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Wallet</h2>

      {/* Balance card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15" style={{ background: '#fff' }} />
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Available Balance</p>
          <p className="text-4xl font-black text-white mb-6">{fmtFull(walletBalance)}</p>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFundOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' }}>
              <BIcon name="plus" size={16} /> Fund Wallet
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setWithdrawOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', backdropFilter: 'blur(8px)' }}>
              <BIcon name="arrow-up" size={16} /> Withdraw
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Transaction filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TXN_FILTERS.map(f => (
          <motion.button key={f} onClick={() => setFilter(f)} whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap capitalize"
            style={filter === f ? { background: '#667eea', color: '#fff' } : { background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
            {f === 'all' ? `All (${walletTransactions.length})` : f}
          </motion.button>
        ))}
      </div>

      {/* Transaction list */}
      <motion.div layout className="rounded-2xl overflow-hidden shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center"><BIcon name="wallet" size={32} style={{ color: colors.text.tertiary, opacity: 0.3 }} /><p className="text-sm mt-3" style={{ color: colors.text.tertiary }}>No transactions</p></div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((txn, i) => {
              const meta = TXN_META[txn.type] || TXN_META.fund;
              const isPositive = txn.amount > 0;
              return (
                <motion.div key={txn.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}12` }}>
                    <BIcon name={meta.icon} size={17} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: colors.text.primary }}>{txn.desc}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: colors.text.tertiary }}>{txn.date} · {meta.label}</p>
                  </div>
                  <span className="text-sm font-black tabular-nums" style={{ color: isPositive ? '#059669' : '#ef4444' }}>
                    {isPositive ? '+' : ''}{fmtFull(txn.amount)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>

      <FundModal open={fundOpen} onClose={() => setFundOpen(false)} onFund={fundWallet} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} balance={walletBalance} onWithdraw={withdrawWallet} />
    </div>
  );
}
