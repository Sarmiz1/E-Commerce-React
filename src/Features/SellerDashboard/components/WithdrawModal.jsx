import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../store/useThemeStore";
import { fmtFull } from '../utils/format';
import { Icon } from './DashIcon';

// ─── Fee calculator — simulates server-side fee computation ──────────────────
function calculateFees(amount) {
  if (!amount || amount <= 0) return { processingFee: 0, serviceFee: 0, totalFee: 0, netAmount: 0 };
  const processingFee = Math.round(amount * 0.015);         // 1.5% processing
  const serviceFee = amount >= 100000 ? 500 : 250;          // flat service fee (scales)
  const totalFee = processingFee + serviceFee;
  const netAmount = amount - totalFee;
  return { processingFee, serviceFee, totalFee, netAmount };
}

// ─── Step indicators ─────────────────────────────────────────────────────────
function StepDots({ step, colors }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map(s => (
        <div key={s} className="flex items-center gap-2">
          <motion.div
            animate={{ scale: step === s ? 1.15 : 1, opacity: step >= s ? 1 : 0.3 }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black"
            style={{
              background: step > s ? colors.state.success : step === s ? colors.cta.primary : colors.surface.tertiary,
              color: step >= s ? '#fff' : colors.text.tertiary,
              border: step === s ? `2px solid ${colors.cta.primary}` : 'none',
            }}>
            {step > s ? <Icon name="check" size={12} /> : s}
          </motion.div>
          {s < 3 && (
            <div className="w-8 h-0.5 rounded-full" style={{ background: step > s ? colors.state.success : colors.border.default }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ─── WITHDRAW MODAL ─────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
export default function WithdrawModal({ open, onClose, availableBalance, onWithdraw }) {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const passRef = useRef(null);

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setStep(1); setAmount(''); setPassword('');
      setShowPassword(false); setProcessing(false);
      setSuccess(false); setError('');
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const parsedAmount = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
  const fees = calculateFees(parsedAmount);

  // Format input on change
  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmount(raw);
    setError('');
  };

  // Quick amount buttons
  const quickAmounts = [50000, 100000, 250000, 500000];

  const goToStep2 = () => {
    if (parsedAmount < 1000) {
      setError('Minimum withdrawal is ₦1,000');
      return;
    }
    if (parsedAmount > availableBalance) {
      setError('Amount exceeds available balance');
      return;
    }
    setStep(2);
    setTimeout(() => passRef.current?.focus(), 300);
  };

  const handleWithdraw = useCallback(async () => {
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Invalid password');
      return;
    }

    setProcessing(true);
    setError('');

    // Simulate server validation
    await new Promise(r => setTimeout(r, 1800));

    // Mock password check (in production this would be server-side)
    if (password !== 'seller123' && password.length >= 6) {
      // Accept any password >= 6 chars for demo
      setStep(3);
      setSuccess(true);
      setProcessing(false);
      if (onWithdraw) onWithdraw(parsedAmount, fees.totalFee, fees.netAmount);
    } else if (password === 'seller123') {
      setStep(3);
      setSuccess(true);
      setProcessing(false);
      if (onWithdraw) onWithdraw(parsedAmount, fees.totalFee, fees.netAmount);
    } else {
      setError('Incorrect password. Please try again.');
      setProcessing(false);
    }
  }, [password, parsedAmount, fees, onWithdraw]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="withdraw-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={() => !processing && onClose()}
          />

          {/* Modal */}
          <motion.div
            key="withdraw-modal"
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? 'rgba(144,171,255,0.12)' : 'rgba(0,80,212,0.07)' }}>
                  <Icon name="download" size={18} style={{ color: colors.cta.primary }} />
                </div>
                <div>
                  <h3 className="font-black text-base" style={{ color: colors.text.primary }}>Withdraw Funds</h3>
                  <p className="text-[11px]" style={{ color: colors.text.tertiary }}>Available: {fmtFull(availableBalance)}</p>
                </div>
              </div>
              {!processing && (
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.tertiary }}>
                  <Icon name="x" size={15} />
                </motion.button>
              )}
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <StepDots step={step} colors={colors} />

              <AnimatePresence mode="wait">
                {/* ═══ STEP 1: Enter Amount ═══ */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: colors.text.tertiary }}>Enter Amount</p>

                    {/* Amount input */}
                    <div className="relative mb-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black" style={{ color: colors.text.tertiary }}>₦</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={parsedAmount > 0 ? parsedAmount.toLocaleString() : ''}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl text-2xl font-black outline-none transition-all"
                        style={{
                          background: isDark ? colors.surface.tertiary : '#F5F6FA',
                          border: `2px solid ${error ? colors.state.error : colors.border.default}`,
                          color: colors.text.primary,
                          letterSpacing: '0.02em',
                        }}
                      />
                    </div>

                    {/* Quick amount buttons */}
                    <div className="flex gap-2 mb-5 flex-wrap">
                      {quickAmounts.map(qa => (
                        <motion.button key={qa} whileTap={{ scale: 0.95 }}
                          onClick={() => { setAmount(String(qa)); setError(''); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          style={{
                            background: parsedAmount === qa ? colors.cta.primary : (isDark ? colors.surface.tertiary : '#F3F4F6'),
                            color: parsedAmount === qa ? colors.cta.primaryText : colors.text.secondary,
                            border: `1px solid ${parsedAmount === qa ? colors.cta.primary : colors.border.subtle}`,
                          }}>
                          ₦{qa.toLocaleString()}
                        </motion.button>
                      ))}
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => { setAmount(String(availableBalance)); setError(''); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: isDark ? 'rgba(0,255,148,0.08)' : 'rgba(5,150,105,0.06)', color: colors.state.success, border: `1px solid ${isDark ? 'rgba(0,255,148,0.15)' : 'rgba(5,150,105,0.15)'}` }}>
                        Max
                      </motion.button>
                    </div>

                    {/* Fee breakdown */}
                    {parsedAmount > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="rounded-xl p-4 mb-4 space-y-2"
                        style={{ background: isDark ? 'rgba(144,171,255,0.05)' : 'rgba(0,80,212,0.03)', border: `1px solid ${isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.08)'}` }}>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: colors.text.tertiary }}>Processing fee (1.5%)</span>
                          <span className="font-bold" style={{ color: colors.text.secondary }}>{fmtFull(fees.processingFee)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: colors.text.tertiary }}>Service fee</span>
                          <span className="font-bold" style={{ color: colors.text.secondary }}>{fmtFull(fees.serviceFee)}</span>
                        </div>
                        <div className="h-px" style={{ background: colors.border.subtle }} />
                        <div className="flex justify-between text-xs">
                          <span className="font-bold" style={{ color: colors.text.tertiary }}>Total charges</span>
                          <span className="font-black" style={{ color: colors.state.warning }}>{fmtFull(fees.totalFee)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                          <span className="font-black" style={{ color: colors.text.primary }}>You'll receive</span>
                          <span className="font-black text-base" style={{ color: colors.state.success }}>{fmtFull(fees.netAmount)}</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-xs font-bold mb-3 flex items-center gap-1.5"
                          style={{ color: colors.state.error }}>
                          <Icon name="alert-circle" size={13} /> {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Continue button */}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={goToStep2}
                      disabled={parsedAmount <= 0}
                      className="w-full py-3.5 rounded-xl font-bold text-sm transition-all"
                      style={{
                        background: parsedAmount > 0 ? colors.cta.primary : (isDark ? colors.surface.tertiary : '#E5E7EB'),
                        color: parsedAmount > 0 ? colors.cta.primaryText : colors.text.tertiary,
                      }}>
                      Continue to Verification →
                    </motion.button>
                  </motion.div>
                )}

                {/* ═══ STEP 2: Password Verification ═══ */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: colors.text.tertiary }}>Verify Identity</p>

                    {/* Summary card */}
                    <div className="rounded-xl p-4 mb-5 space-y-1.5"
                      style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.subtle}` }}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: colors.text.tertiary }}>Withdraw</span>
                        <span className="font-black" style={{ color: colors.text.primary }}>{fmtFull(parsedAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: colors.text.tertiary }}>Fee</span>
                        <span className="font-bold" style={{ color: colors.state.warning }}>-{fmtFull(fees.totalFee)}</span>
                      </div>
                      <div className="h-px" style={{ background: colors.border.subtle }} />
                      <div className="flex justify-between text-sm">
                        <span className="font-bold" style={{ color: colors.text.primary }}>Net to bank</span>
                        <span className="font-black" style={{ color: colors.state.success }}>{fmtFull(fees.netAmount)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
                        <Icon name="credit-card" size={13} style={{ color: colors.text.tertiary }} />
                        <span className="text-xs" style={{ color: colors.text.tertiary }}>GTBank •••• 6789 · Adebayo James</span>
                      </div>
                    </div>

                    {/* Password field */}
                    <div className="mb-4">
                      <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: colors.text.tertiary }}>
                        Enter your account password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Icon name="lock" size={16} style={{ color: colors.text.tertiary }} />
                        </div>
                        <input
                          ref={passRef}
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => { setPassword(e.target.value); setError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleWithdraw()}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all"
                          style={{
                            background: isDark ? colors.surface.tertiary : '#F5F6FA',
                            border: `2px solid ${error ? colors.state.error : colors.border.default}`,
                            color: colors.text.primary,
                          }}
                        />
                        <button onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: colors.text.tertiary }}>
                          <Icon name={showPassword ? 'eye' : 'eye'} size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Security notice */}
                    <div className="flex items-start gap-2 mb-4 p-3 rounded-xl"
                      style={{ background: isDark ? 'rgba(144,171,255,0.05)' : 'rgba(0,80,212,0.03)', border: `1px solid ${isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.08)'}` }}>
                      <Icon name="shield" size={14} style={{ color: colors.cta.primary, marginTop: 1 }} />
                      <p className="text-[11px] leading-relaxed" style={{ color: colors.text.tertiary }}>
                        Your transaction is encrypted and secured. Funds typically arrive within 24 hours.
                      </p>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-xs font-bold mb-3 flex items-center gap-1.5"
                          style={{ color: colors.state.error }}>
                          <Icon name="alert-circle" size={13} /> {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button onClick={() => { setStep(1); setError(''); }}
                        disabled={processing}
                        className="flex-1 py-3.5 rounded-xl font-bold text-sm border"
                        style={{ borderColor: colors.border.default, color: colors.text.secondary, opacity: processing ? 0.5 : 1 }}>
                        ← Back
                      </button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={handleWithdraw}
                        disabled={processing || !password.trim()}
                        className="flex-[2] py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: processing ? colors.border.strong : password.trim() ? colors.cta.primary : (isDark ? colors.surface.tertiary : '#E5E7EB'),
                          color: password.trim() && !processing ? colors.cta.primaryText : colors.text.tertiary,
                          opacity: processing ? 0.8 : 1,
                        }}>
                        {processing ? (
                          <>
                            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Icon name="lock" size={14} /> Confirm Withdrawal
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ═══ STEP 3: Success ═══ */}
                {step === 3 && success && (
                  <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20 }}
                    className="text-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ background: colors.state.successBg }}>
                      <Icon name="check" size={28} style={{ color: colors.state.success }} />
                    </motion.div>
                    <h4 className="font-black text-xl mb-1" style={{ color: colors.text.primary }}>Withdrawal Submitted!</h4>
                    <p className="text-sm mb-4" style={{ color: colors.text.tertiary }}>
                      {fmtFull(fees.netAmount)} is on its way to your bank account.
                    </p>
                    <div className="rounded-xl p-4 mb-5 space-y-2 text-left"
                      style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.subtle}` }}>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: colors.text.tertiary }}>Transaction ID</span>
                        <span className="font-mono font-bold" style={{ color: colors.cta.primary }}>TXN-{c}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: colors.text.tertiary }}>Amount</span>
                        <span className="font-bold" style={{ color: colors.text.primary }}>{fmtFull(parsedAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: colors.text.tertiary }}>Fee</span>
                        <span className="font-bold" style={{ color: colors.state.warning }}>{fmtFull(fees.totalFee)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: colors.text.tertiary }}>ETA</span>
                        <span className="font-bold" style={{ color: colors.state.success }}>Within 24 hours</span>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={onClose}
                      className="w-full py-3.5 rounded-xl font-bold text-sm"
                      style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>
                      Done
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
