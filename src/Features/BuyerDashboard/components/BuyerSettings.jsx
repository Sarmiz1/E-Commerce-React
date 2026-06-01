import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useTheme } from '../../../Store/useThemeStore';
import { useBuyer } from '../context/BuyerContext';
import {
  buyerAccountSchema,
  buyerEmailUpdateSchema,
  buyerPasswordUpdateSchema,
  BUYER_DEACTIVATION_REASONS,
  deactivateBuyerAccountSchema,
  toBuyerAccountFormValues,
  toBuyerAccountPayload,
} from '../Schema/buyerAccountSchema';
import { BIcon } from './BuyerIcon';
import BuyerAvatar from './BuyerAvatar';
import { EmailConfirmationModal } from './BuyerSecurityModals';

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

function EmailUpdateModal({ colors, currentEmail, onClose, onConfirm }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(buyerEmailUpdateSchema),
    defaultValues: { email: currentEmail || '', password: '' },
  });

  return (
    <>
      <motion.div
        key="email-update-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
        <motion.form
          key="email-update-modal"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          onSubmit={handleSubmit(onConfirm)}
          className="pointer-events-auto w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl p-4 shadow-xl space-y-4 sm:max-h-[calc(100dvh-3rem)] sm:p-6"
          style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}
        >
          <div>
            <p className="text-lg font-black" style={{ color: colors.text.primary }}>Update email address</p>
            <p className="text-sm mt-2" style={{ color: colors.text.tertiary }}>
              Enter a new address and your password. We will send a code to your current account email first.
            </p>
          </div>
          <Field
            label="New Email Address"
            type="email"
            autoComplete="email"
            error={errors.email}
            {...register('email')}
          />
          <Field
            label="Account Password"
            type="password"
            autoComplete="current-password"
            error={errors.password}
            {...register('password')}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="w-full px-4 py-2 rounded-xl text-sm font-bold sm:w-auto" style={{ color: colors.text.secondary }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 rounded-xl text-sm font-bold text-white sm:w-auto"
              style={{ background: '#667eea', opacity: isSubmitting ? 0.65 : 1 }}
            >
              {isSubmitting ? 'Sending...' : 'Send Confirmation Code'}
            </button>
          </div>
        </motion.form>
      </div>
    </>
  );
}

function PasswordUpdateModal({ colors, onClose, onConfirm }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(buyerPasswordUpdateSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  return (
    <>
      <motion.div
        key="password-update-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
        <motion.form
          key="password-update-modal"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          onSubmit={handleSubmit(onConfirm)}
          className="pointer-events-auto w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl p-4 shadow-xl space-y-4 sm:max-h-[calc(100dvh-3rem)] sm:p-6"
          style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}
        >
          <div>
            <p className="text-lg font-black" style={{ color: colors.text.primary }}>Update account password</p>
            <p className="text-sm mt-2" style={{ color: colors.text.tertiary }}>
              Enter your current password and choose a new one. We will email a confirmation code before applying the change.
            </p>
          </div>
          <Field label="Current Password" type="password" autoComplete="current-password" error={errors.currentPassword} {...register('currentPassword')} />
          <Field label="New Password" type="password" autoComplete="new-password" error={errors.newPassword} {...register('newPassword')} />
          <Field label="Confirm New Password" type="password" autoComplete="new-password" error={errors.confirmPassword} {...register('confirmPassword')} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="w-full px-4 py-2 rounded-xl text-sm font-bold sm:w-auto" style={{ color: colors.text.secondary }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 rounded-xl text-sm font-bold text-white sm:w-auto" style={{ background: '#667eea', opacity: isSubmitting ? 0.65 : 1 }}>
              {isSubmitting ? 'Sending...' : 'Send Confirmation Code'}
            </button>
          </div>
        </motion.form>
      </div>
    </>
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
    uploadAccountAvatar,
    removeAccountAvatar,
    saveAccountPreference,
    requestEmailChange,
    approveEmailChange,
    requestPasswordChange,
    approvePasswordChange,
    deactivateAccount,
    approveSensitiveAction,
  } = useBuyer();
  const [saved, setSaved] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [emailUpdateOpen, setEmailUpdateOpen] = useState(false);
  const [pendingEmailApproval, setPendingEmailApproval] = useState(null);
  const [emailApprovalProcessing, setEmailApprovalProcessing] = useState(false);
  const [passwordUpdateOpen, setPasswordUpdateOpen] = useState(false);
  const [pendingPasswordApproval, setPendingPasswordApproval] = useState(null);
  const [pendingNewPassword, setPendingNewPassword] = useState('');
  const [passwordApprovalProcessing, setPasswordApprovalProcessing] = useState(false);
  const [pendingDeactivateApproval, setPendingDeactivateApproval] = useState(null);
  const [dropzoneError, setDropzoneError] = useState('');
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);
  const [avatarUploadFailed, setAvatarUploadFailed] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const avatarActionInFlightRef = useRef(false);

  const initialValues = useMemo(
    () => toBuyerAccountFormValues(accountSettings, profile),
    [accountSettings, profile],
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    resetField,
    getValues,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(buyerAccountSchema),
    defaultValues: initialValues,
  });
  const {
    register: registerDeactivate,
    control: deactivateControl,
    handleSubmit: handleDeactivateSubmit,
    reset: resetDeactivate,
    formState: { errors: deactivateErrors, isSubmitting: isDeactivating },
  } = useForm({
    resolver: zodResolver(deactivateBuyerAccountSchema),
    defaultValues: { confirmation: '', reason: undefined, otherReason: '', password: '' },
  });

  const avatarFile = useWatch({ control, name: 'avatarFile' });
  const avatarUrl = useWatch({ control, name: 'avatarUrl' });
  const fullName = useWatch({ control, name: 'fullName' });
  const deactivateReason = useWatch({ control: deactivateControl, name: 'reason' });
  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : ''),
    [avatarFile],
  );
  const selectedAvatar = avatarPreview || avatarUrl;

  useEffect(() => {
    reset(initialValues, { keepDirtyValues: true });
  }, [initialValues, reset]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const selectAvatar = useCallback((files) => {
    const file = files[0];
    if (!file) return;

    setDropzoneError('');
    setAvatarUploadFailed(false);
    setAvatarUploadProgress(0);
    setValue('avatarFile', file, { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  const rejectAvatar = useCallback((rejections) => {
    const code = rejections[0]?.errors?.[0]?.code;
    setDropzoneError(
      code === 'file-too-large'
        ? 'Photo must be 2MB or smaller'
        : 'Photo must be a JPG, PNG, or WEBP image',
    );
    setAvatarUploadFailed(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
    multiple: false,
    disabled: avatarUploading || avatarRemoving,
    onDropAccepted: selectAvatar,
    onDropRejected: rejectAvatar,
  });

  const submit = handleSubmit(async (values) => {
    if (avatarActionInFlightRef.current) return;

    try {
      const result = await saveAccountSettings(toBuyerAccountPayload(values));
      reset(toBuyerAccountFormValues(result.settings, profile));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      // The mutation hook reports the backend error as a toast.
    }
  });

  const uploadSelectedAvatar = async () => {
    if (!avatarFile || avatarActionInFlightRef.current) return;

    avatarActionInFlightRef.current = true;
    setDropzoneError('');
    setAvatarUploadFailed(false);
    setAvatarUploadProgress(0);
    setAvatarUploading(true);
    try {
      const result = await uploadAccountAvatar({
        file: avatarFile,
        onProgress: setAvatarUploadProgress,
      });
      resetField('avatarUrl', { defaultValue: result.avatarUrl });
      resetField('avatarFile', { defaultValue: null });
      setAvatarUploadProgress(100);
    } catch (error) {
      setDropzoneError(error.message || 'Unable to upload profile photo');
      setAvatarUploadFailed(true);
    } finally {
      avatarActionInFlightRef.current = false;
      setAvatarUploading(false);
    }
  };

  const removeSavedAvatar = async () => {
    if (avatarActionInFlightRef.current) return;

    avatarActionInFlightRef.current = true;
    setDropzoneError('');
    setAvatarRemoving(true);
    try {
      await removeAccountAvatar();
      resetField('avatarFile', { defaultValue: null });
      resetField('avatarUrl', { defaultValue: '' });
      setAvatarUploadProgress(0);
      setAvatarUploadFailed(false);
    } catch (error) {
      setDropzoneError(error.message || 'Unable to remove profile photo');
    } finally {
      avatarActionInFlightRef.current = false;
      setAvatarRemoving(false);
    }
  };

  const confirmDeactivation = handleDeactivateSubmit(async (details) => {
    try {
      const approval = await deactivateAccount(details);
      setPendingDeactivateApproval(approval);
      closeDeactivateDialog();
    } catch {
      // The mutation hook reports the backend error as a toast.
    }
  });

  const updatePreference = async (name, onChange, enabled) => {
    const previous = getValues(name);
    onChange(enabled);
    try {
      await saveAccountPreference({ name, enabled });
    } catch {
      onChange(previous);
    }
  };

  const startEmailChange = async (details) => {
    try {
      const approval = await requestEmailChange(details);
      setPendingEmailApproval(approval);
      setEmailUpdateOpen(false);
    } catch {
      // The mutation hook reports the backend error as a toast.
    }
  };

  const approveEmailUpdate = async (confirmationCode) => {
    if (!pendingEmailApproval) return;
    setEmailApprovalProcessing(true);
    try {
      await approveEmailChange({
        requestId: pendingEmailApproval.requestId,
        confirmationCode,
      });
      setPendingEmailApproval(null);
    } catch {
      // The mutation hook reports the backend error as a toast.
    } finally {
      setEmailApprovalProcessing(false);
    }
  };

  const startPasswordChange = async ({ currentPassword, newPassword }) => {
    try {
      const approval = await requestPasswordChange({ currentPassword });
      setPendingNewPassword(newPassword);
      setPendingPasswordApproval(approval);
      setPasswordUpdateOpen(false);
    } catch {
      // The mutation hook reports the backend error as a toast.
    }
  };

  const approvePasswordUpdate = async (confirmationCode) => {
    if (!pendingPasswordApproval || !pendingNewPassword) return;
    setPasswordApprovalProcessing(true);
    try {
      await approvePasswordChange({
        requestId: pendingPasswordApproval.requestId,
        confirmationCode,
        newPassword: pendingNewPassword,
      });
      setPendingPasswordApproval(null);
      setPendingNewPassword('');
    } catch {
      // The mutation hook reports the backend error as a toast.
    } finally {
      setPasswordApprovalProcessing(false);
    }
  };

  const approveDeactivation = async (confirmationCode) => {
    if (!pendingDeactivateApproval) return;
    try {
      await approveSensitiveAction({
        requestId: pendingDeactivateApproval.requestId,
        confirmationCode,
      });
      window.location.assign('/');
    } catch {
      // The mutation hook reports the backend error as a toast.
    }
  };

  const closeDeactivateDialog = () => {
    setDeactivateConfirm(false);
    resetDeactivate();
  };

  if (accountSettingsLoading) return <LoadingState />;
  if (accountSettingsError) {
    return <LoadingState error={accountSettingsError} onRetry={() => refreshAccountSettings?.()} />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Account Settings</h2>

      <form onSubmit={submit} className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <BuyerAvatar
            src={selectedAvatar}
            name={fullName}
            loading="eager"
            className="h-20 w-20 flex-shrink-0 rounded-2xl text-3xl font-black shadow-lg"
          />
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <div
                {...getRootProps()}
                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 aria-disabled:cursor-wait aria-disabled:opacity-60"
                style={{
                  background: isDragActive ? 'rgba(102,126,234,0.18)' : 'rgba(102,126,234,0.1)',
                  color: '#667eea',
                }}
              >
                <input {...getInputProps()} />
                {isDragActive
                  ? 'Drop Photo Here'
                  : (avatarFile || avatarUrl) ? 'Choose a Different Photo' : 'Choose Photo'}
              </div>
              {avatarFile && (
                <>
                  <button
                    type="button"
                    onClick={uploadSelectedAvatar}
                    disabled={avatarUploading}
                    className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                  >
                    {avatarUploading ? 'Uploading...' : avatarUploadFailed ? 'Try Again' : 'Upload Photo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetField('avatarFile', { defaultValue: null });
                      setAvatarUploadProgress(0);
                      setAvatarUploadFailed(false);
                      setDropzoneError('');
                    }}
                    disabled={avatarUploading}
                    className="rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-wait disabled:opacity-60"
                    style={{ color: colors.text.secondary }}
                  >
                    Cancel Preview
                  </button>
                </>
              )}
              {avatarUrl && !avatarFile && (
                <button
                  type="button"
                  onClick={removeSavedAvatar}
                  disabled={avatarRemoving}
                  className="text-sm font-bold px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', opacity: avatarRemoving ? 0.6 : 1 }}
                >
                  {avatarRemoving ? 'Deleting...' : 'Delete Photo'}
                </button>
              )}
            </div>
            {(avatarUploading || (avatarUploadProgress > 0 && !avatarUploadFailed)) && (
              <div className="max-w-xs space-y-1">
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: colors.border.subtle }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={false}
                    animate={{ width: `${avatarUploadProgress}%` }}
                    style={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }}
                  />
                </div>
                <p className="text-[11px] font-bold" style={{ color: colors.text.tertiary }}>
                  {avatarUploadProgress >= 100
                    ? (avatarUploading ? 'Processing profile photo...' : 'Profile photo uploaded')
                    : `Uploading ${avatarUploadProgress}%`}
                </p>
              </div>
            )}
            <p className="text-xs" style={{ color: colors.text.tertiary }}>
              JPG, PNG, or WEBP up to 2MB. Drag and drop also works.
            </p>
            {dropzoneError && <p className="text-xs" style={{ color: '#ef4444' }}>{dropzoneError}</p>}
            {errors.avatarFile && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.avatarFile.message}</p>}
          </div>
        </motion.div>

        <Section title="Personal Information" icon="user" delay={0.05}>
          <Field label="Full Name" error={errors.fullName} {...register('fullName')} />
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <Field
                label="Email Address"
                type="email"
                readOnly
                aria-readonly="true"
                helper="Locked by default. Updating it requires your password, a code sent to your current email, and confirmation from the new address."
                error={errors.email}
                {...register('email')}
              />
            </div>
            <button
              type="button"
              onClick={() => setEmailUpdateOpen(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea' }}
            >
              Update Email
            </button>
          </div>
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
                onChange={(enabled) => updatePreference('aiSuggestions', field.onChange, enabled)}
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
                onChange={(enabled) => updatePreference('priceDropAlerts', field.onChange, enabled)}
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
                onChange={(enabled) => updatePreference('orderStatusUpdates', field.onChange, enabled)}
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
                onChange={(enabled) => updatePreference('promotionsDeals', field.onChange, enabled)}
              />
            )}
          />
        </Section>

        <Section title="Security" icon="lock" delay={0.18}>
          <p className="text-xs" style={{ color: colors.text.tertiary }}>
            Password changes require your current password and a confirmation code sent to your account email.
          </p>
          <button
            type="button"
            onClick={() => setPasswordUpdateOpen(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea' }}
          >
            Update Password
          </button>
        </Section>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isSubmitting || avatarUploading || avatarRemoving || !isDirty}
          className="px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
          style={{
            background: saved ? '#059669' : 'linear-gradient(135deg,#667eea,#764ba2)',
            color: '#fff',
            opacity: isSubmitting || avatarUploading || avatarRemoving || !isDirty ? 0.65 : 1,
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
          Deactivate your buyer account and sign out. Your data is retained until an admin reviews any future reactivation request or permanently deletes the account.
        </p>
        <button
          type="button"
          onClick={() => setDeactivateConfirm(true)}
          className="text-sm font-bold px-4 py-2 rounded-xl border"
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
        >
          Deactivate Account
        </button>
      </motion.div>

      <AnimatePresence>
        {passwordUpdateOpen && (
          <PasswordUpdateModal
            colors={colors}
            onClose={() => setPasswordUpdateOpen(false)}
            onConfirm={startPasswordChange}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingPasswordApproval && (
          <EmailConfirmationModal
            colors={colors}
            approval={pendingPasswordApproval}
            processing={passwordApprovalProcessing}
            title="Confirm password update"
            onClose={() => {
              setPendingPasswordApproval(null);
              setPendingNewPassword('');
            }}
            onConfirm={approvePasswordUpdate}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {emailUpdateOpen && (
          <EmailUpdateModal
            colors={colors}
            currentEmail={profile.email}
            onClose={() => setEmailUpdateOpen(false)}
            onConfirm={startEmailChange}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingEmailApproval && (
          <EmailConfirmationModal
            colors={colors}
            approval={pendingEmailApproval}
            processing={emailApprovalProcessing}
            title="Confirm email update"
            onClose={() => setPendingEmailApproval(null)}
            onConfirm={approveEmailUpdate}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deactivateConfirm && (
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
              onSubmit={confirmDeactivation}
              className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl p-6 shadow-xl space-y-4"
              style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}
            >
              <div>
                <p className="text-lg font-black" style={{ color: colors.text.primary }}>Deactivate your account?</p>
                <p className="text-sm mt-2" style={{ color: colors.text.tertiary }}>
                  Your account becomes inaccessible until an admin approves a reactivation request. Type <strong>DEACTIVATE</strong> to continue.
                </p>
              </div>
              <Controller
                name="reason"
                control={deactivateControl}
                render={({ field }) => (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Reason</p>
                    <div className="grid gap-2">
                      {BUYER_DEACTIVATION_REASONS.map((reason) => (
                        <button
                          key={reason.id}
                          type="button"
                          onClick={() => field.onChange(reason.id)}
                          className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all"
                          style={{
                            background: field.value === reason.id ? 'rgba(239,68,68,0.1)' : colors.surface.tertiary,
                            border: `1px solid ${field.value === reason.id ? '#ef4444' : colors.border.default}`,
                            color: field.value === reason.id ? '#ef4444' : colors.text.secondary,
                          }}
                        >
                          {reason.label}
                        </button>
                      ))}
                    </div>
                    {deactivateErrors.reason && <p className="text-xs" style={{ color: '#ef4444' }}>{deactivateErrors.reason.message}</p>}
                  </div>
                )}
              />
              {deactivateReason === 'other' && (
                <Field
                  label="Tell us more"
                  placeholder="Your reason"
                  error={deactivateErrors.otherReason}
                  {...registerDeactivate('otherReason')}
                />
              )}
              <Field
                label="Confirmation"
                placeholder="DEACTIVATE"
                autoComplete="off"
                error={deactivateErrors.confirmation}
                {...registerDeactivate('confirmation')}
              />
              <Field
                label="Account Password"
                type="password"
                autoComplete="current-password"
                error={deactivateErrors.password}
                {...registerDeactivate('password')}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeDeactivateDialog} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ color: colors.text.secondary }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeactivating}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#ef4444', opacity: isDeactivating ? 0.65 : 1 }}
                >
                  {isDeactivating ? 'Preparing...' : 'Deactivate Account'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingDeactivateApproval && (
          <EmailConfirmationModal
            colors={colors}
            approval={pendingDeactivateApproval}
            processing={false}
            title="Confirm account deactivation"
            onClose={() => setPendingDeactivateApproval(null)}
            onConfirm={approveDeactivation}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
