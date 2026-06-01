import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  buyerActionConfirmationSchema,
  securedBuyerActionSchema,
} from '../Schema/buyerSecuritySchema';

export function SecurePasswordModal({ colors, title, message, confirmLabel, processing, onClose, onConfirm }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(securedBuyerActionSchema),
    defaultValues: { password: '' },
  });

  return (
    <>
      <motion.div
        key="secure-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.form
        onSubmit={handleSubmit(({ password }) => onConfirm(password))}
        key="secure-modal"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 rounded-2xl p-6 shadow-2xl"
        style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}
      >
        <h4 className="font-black text-center mb-1" style={{ color: colors.text.primary }}>{title}</h4>
        <p className="text-sm text-center mb-4" style={{ color: colors.text.tertiary }}>{message}</p>
        <input
          type="password"
          placeholder="Account password"
          autoComplete="current-password"
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4"
          style={{ border: `1px solid ${colors.border.default}`, color: colors.text.primary, background: colors.surface.tertiary }}
          {...register('password')}
        />
        {errors.password && <p className="text-xs mb-3" style={{ color: '#ef4444' }}>{errors.password.message}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
          <button type="submit" disabled={processing}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: '#667eea', color: '#fff' }}>
            {processing ? 'Confirming...' : confirmLabel}
          </button>
        </div>
      </motion.form>
    </>
  );
}

export function EmailConfirmationModal({
  colors,
  approval,
  processing,
  title = 'Confirm secured change',
  onClose,
  onConfirm,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buyerActionConfirmationSchema),
    defaultValues: { confirmationCode: '' },
  });
  const confirmationCodeField = register('confirmationCode');

  return (
    <>
      <motion.div
        key="email-confirmation-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.form
        onSubmit={handleSubmit(({ confirmationCode }) => onConfirm(confirmationCode))}
        key="email-confirmation-modal"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 rounded-2xl p-6 shadow-2xl"
        style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}
      >
        <h4 className="font-black text-center mb-1" style={{ color: colors.text.primary }}>{title}</h4>
        <p className="text-sm text-center mb-4" style={{ color: colors.text.tertiary }}>
          Enter the six-digit code sent to {approval.emailHint || 'your account email'}.
        </p>
        <input
          {...confirmationCodeField}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          onChange={event => setValue('confirmationCode', event.target.value.replace(/\D/g, '').slice(0, 6), { shouldValidate: true })}
          placeholder="000000"
          className="w-full px-4 py-2.5 rounded-xl text-sm tracking-[0.35em] text-center outline-none mb-4"
          style={{ border: `1px solid ${colors.border.default}`, color: colors.text.primary, background: colors.surface.tertiary }}
        />
        {errors.confirmationCode && <p className="text-xs mb-3" style={{ color: '#ef4444' }}>{errors.confirmationCode.message}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
          <button type="submit" disabled={processing}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: '#667eea', color: '#fff' }}>
            {processing ? 'Approving...' : 'Approve'}
          </button>
        </div>
      </motion.form>
    </>
  );
}
