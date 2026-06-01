import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../../Store/useThemeStore';
import { useBuyer } from '../context/BuyerContext';
import {
  buyerAccountSchema,
  deleteBuyerAccountSchema,
  toBuyerAccountFormValues,
  toBuyerAccountPayload,
} from '../Schema/buyerAccountSchema';
import { BIcon } from './BuyerIcon';

function Field({ label, error, helper, ...inputProps }) {
  const { colors, isDark } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>
        {label}
      </label>
      <input
        {...inputProps}
        onFocus={(event) => {
          setFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          inputProps.onBlur?.(event);
        }}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: isDark ? colors.surface.tertiary : '#F9FAFB',
          border: `1.5px solid ${error ? '#ef4444' : focused ? '#667eea' : colors.border.default}`,
          color: colors.text.primary,
          boxShadow: focused ? '0 0 0 3px rgba(102,126,234,0.12)' : 'none',
        }}
      />
      {helper && !error && <p className="text-xs" style={{ color: colors.text.tertiary }}>{helper}</p>}
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error.message}</p>}
    </div>
  );
}

function Section({ title, icon, children, delay }) {
  const { colors } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-6 shadow-sm space-y-5"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}
    >
      <div className="flex items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
        <BIcon name={icon} size={16} style={{ color: '#667eea' }} />
        <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{title}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

function Toggle({ label, desc, enabled, onChange }) {
  const { colors } = useTheme();
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>{desc}</p>
      </div>
      <motion.button
        type="button"
        aria-pressed={enabled}
        onClick={() => onChange(!enabled)}
        className="relative w-11 h-6 rounded-full flex-shrink-0"
        style={{ background: enabled ? '#667eea' : colors.border.strong }}
      >
        <motion.div
          animate={{ x: enabled ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
        />
      </motion.button>
    </div>
  );
}

function LoadingState({ onRetry, error }) {
  const { colors } = useTheme();
  return (
    <div
      className="max-w-2xl rounded-2xl p-8 text-center"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}
    >
      <p className="font-bold text-sm" style={{ color: colors.text.primary }}>
        {error ? 'Account settings could not be loaded.' : 'Loading account settings...'}
      </p>
      {error && (
        <button type="button" onClick={onRetry} className="mt-4 text-sm font-bold" style={{ color: '#667eea' }}>
          Try again
        </button>
      )}
    </div>
  );
}

export default function BuyerSettings() {
  const { colors } = useTheme();
  const {
    profile,
    accountSettings,
    accountSettingsLoading,
    accountSettingsError,
    refreshAccountSettings,
    saveAccountSettings,
    deleteAccount,
  } = useBuyer();
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState('');
  const photoInputRef = useRef(null);

  const initialValues = useMemo(
    () => toBuyerAccountFormValues(accountSettings, profile),
    [accountSettings, profile],
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(buyerAccountSchema),
    defaultValues: initialValues,
  });
  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    reset: resetDelete,
    formState: { errors: deleteErrors, isSubmitting: isDeleting },
  } = useForm({
    resolver: zodResolver(deleteBuyerAccountSchema),
    defaultValues: { confirmation: '', password: '' },
  });

  const avatarFile = useWatch({ control, name: 'avatarFile' });
  const avatarUrl = useWatch({ control, name: 'avatarUrl' });
  const fullName = useWatch({ control, name: 'fullName' });
  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : ''),
    [avatarFile],
  );

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const submit = handleSubmit(async (values) => {
    try {
      const result = await saveAccountSettings(toBuyerAccountPayload(values));
      reset(toBuyerAccountFormValues(result.settings, profile));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      // The mutation hook reports the backend error as a toast.
    }
  });

  const confirmDelete = handleDeleteSubmit(async ({ confirmation, password }) => {
    try {
      await deleteAccount({ confirmation, password });
      window.location.assign('/');
    } catch {
      // The mutation hook reports the backend error as a toast.
    }
  });

  const closeDeleteDialog = () => {
    setDeleteConfirm(false);
    resetDelete();
  };

  if (accountSettingsLoading) return <LoadingState />;
  if (accountSettingsError) {
    return <LoadingState error={accountSettingsError} onRetry={() => refreshAccountSettings?.()} />;
  }

  const selectedAvatar = avatarPreview || avatarUrl;
  const visibleAvatar = selectedAvatar && selectedAvatar !== failedAvatar;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Account Settings</h2>

      <form onSubmit={submit} className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
          <div className="w-20 h-20 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-lg">
            {visibleAvatar ? (
              <img
                src={visibleAvatar}
                alt={`${fullName || 'Buyer'} profile`}
                className="w-full h-full object-cover"
                onError={() => setFailedAvatar(selectedAvatar)}
              />
            ) : (
              (fullName?.charAt(0) || 'B').toUpperCase()
            )}
          </div>
          <div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                setFailedAvatar('');
                setValue('avatarFile', event.target.files?.[0] || null, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="text-sm font-bold px-4 py-2 rounded-xl"
                style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea' }}
              >
                Change Photo
              </button>
              {visibleAvatar && (
                <button
                  type="button"
                  onClick={() => {
                    setValue('avatarFile', null, { shouldDirty: true, shouldValidate: true });
                    setValue('avatarUrl', '', { shouldDirty: true, shouldValidate: true });
                    setFailedAvatar('');
                  }}
                  className="text-sm font-bold px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs mt-1.5" style={{ color: colors.text.tertiary }}>JPG, PNG, or WEBP up to 2MB</p>
            {errors.avatarFile && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.avatarFile.message}</p>}
          </div>
        </motion.div>

        <Section title="Personal Information" icon="user" delay={0.05}>
          <Field label="Full Name" error={errors.fullName} {...register('fullName')} />
          <Field
            label="Email Address"
            type="email"
            helper="Changing your email may require confirmation from the new address."
            error={errors.email}
            {...register('email')}
          />
        </Section>

        <Section title="Preferences & AI" icon="sparkle" delay={0.12}>
          <Controller
            name="aiSuggestions"
            control={control}
            render={({ field }) => (
              <Toggle
                label="AI Shopping Suggestions"
                desc="Let AI recommend products based on your taste"
                enabled={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="priceDropAlerts"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Price Drop Alerts"
                desc="Notify me when wishlist items drop in price"
                enabled={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="orderStatusUpdates"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Order Status Updates"
                desc="Receive notifications for delivery activity"
                enabled={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="promotionsDeals"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Promotions & Deals"
                desc="Receive offers tailored to your account"
                enabled={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Section>

        <Section title="Security" icon="lock" delay={0.18}>
          <p className="text-xs" style={{ color: colors.text.tertiary }}>
            Leave these fields empty unless you want to change your password.
          </p>
          <Field
            label="Current Password"
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword}
            {...register('currentPassword')}
          />
          <Field
            label="New Password"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword}
            {...register('newPassword')}
          />
          <Field
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </Section>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
          style={{
            background: saved ? '#059669' : 'linear-gradient(135deg,#667eea,#764ba2)',
            color: '#fff',
            opacity: isSubmitting || !isDirty ? 0.65 : 1,
          }}
        >
          {isSubmitting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block"
              />
              Saving...
            </>
          ) : saved ? (
            <>
              <BIcon name="check" size={15} /> Saved
            </>
          ) : (
            'Save Changes'
          )}
        </motion.button>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-5 shadow-sm"
        style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.03)' }}
      >
        <p className="font-bold text-sm mb-1" style={{ color: '#ef4444' }}>Danger Zone</p>
        <p className="text-xs mb-4" style={{ color: colors.text.tertiary }}>
          Permanently delete your account and associated buyer data. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setDeleteConfirm(true)}
          className="text-sm font-bold px-4 py-2 rounded-xl border"
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
        >
          Delete Account
        </button>
      </motion.div>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.66)' }}
          >
            <motion.form
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onSubmit={confirmDelete}
              className="w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4"
              style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}
            >
              <div>
                <p className="text-lg font-black" style={{ color: colors.text.primary }}>Delete your account?</p>
                <p className="text-sm mt-2" style={{ color: colors.text.tertiary }}>
                  This permanently removes your account. Type <strong>DELETE</strong> to continue.
                </p>
              </div>
              <Field
                label="Confirmation"
                placeholder="DELETE"
                autoComplete="off"
                error={deleteErrors.confirmation}
                {...registerDelete('confirmation')}
              />
              <Field
                label="Account Password"
                type="password"
                autoComplete="current-password"
                error={deleteErrors.password}
                {...registerDelete('password')}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeDeleteDialog} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ color: colors.text.secondary }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#ef4444', opacity: isDeleting ? 0.65 : 1 }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
