import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from '../../../Store/useThemeStore';
import {
  COUNTRY_CALLING_CODES,
  formatInternationalPhone,
  isValidInternationalPhone,
} from '../../../utils/phoneNumber';
import { useBuyer } from '../context/BuyerContext';
import {
  buyerPhoneNumberSchema,
  phoneConfirmationSchema,
  securedPhoneActionSchema,
} from '../Schema/buyerPhoneSchema';
import { BIcon } from './BuyerIcon';

function AccountDataFallback({ colors, loading = false, message = 'No available data', onRetry }) {
  return (
    <div className="rounded-2xl border border-dashed px-5 py-8 text-center" style={{ borderColor: colors.border.default }}>
      <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>
        {loading ? 'Loading available data...' : message}
      </p>
      {onRetry && !loading && (
        <button type="button" onClick={onRetry} className="mt-2 text-xs font-bold" style={{ color: '#667eea' }}>
          Try again
        </button>
      )}
    </div>
  );
}

function SecurePasswordModal({ colors, title, message, confirmLabel, processing, onClose, onConfirm }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(securedPhoneActionSchema),
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

function EmailConfirmationModal({ colors, approval, processing, onClose, onConfirm }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(phoneConfirmationSchema),
    defaultValues: { confirmationCode: '' },
  });

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
        <h4 className="font-black text-center mb-1" style={{ color: colors.text.primary }}>Confirm phone-number change</h4>
        <p className="text-sm text-center mb-4" style={{ color: colors.text.tertiary }}>
          Enter the six-digit code sent to {approval.emailHint || 'your account email'}.
        </p>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          onChange={event => setValue('confirmationCode', event.target.value.replace(/\D/g, '').slice(0, 6), { shouldValidate: true })}
          placeholder="000000"
          className="w-full px-4 py-2.5 rounded-xl text-sm tracking-[0.35em] text-center outline-none mb-4"
          style={{ border: `1px solid ${colors.border.default}`, color: colors.text.primary, background: colors.surface.tertiary }}
          {...register('confirmationCode')}
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

const EMPTY_PHONE_NUMBER = { countryCode: '234', phoneNumber: '', password: '', isDefault: false };

function CountryCodeSelect({ colors, isDark, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedCountry = COUNTRY_CALLING_CODES.find(country => country.code === value)
    || COUNTRY_CALLING_CODES[0];

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full rounded-xl px-3 py-2.5 text-left outline-none"
        style={{
          background: isDark ? colors.surface.tertiary : '#F9FAFB',
          border: `1px solid ${open ? '#667eea' : colors.border.default}`,
          boxShadow: open ? '0 0 0 3px rgba(102,126,234,0.12)' : 'none',
        }}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-xs font-bold" style={{ color: colors.text.primary }}>
              {selectedCountry.label}
            </span>
            <span className="text-[10px]" style={{ color: colors.text.tertiary }}>Country calling code</span>
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black"
            style={{ color: '#667eea', background: 'rgba(102,126,234,0.1)' }}
          >
            v
          </motion.span>
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="listbox"
            aria-label="Country calling code"
            className="absolute left-0 right-0 z-30 max-h-64 overflow-y-auto rounded-2xl p-2 shadow-2xl"
            style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}
          >
            {COUNTRY_CALLING_CODES.map(country => {
              const selected = country.code === selectedCountry.code;
              return (
                <motion.button
                  key={country.code}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onChange(country.code);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left"
                  style={{
                    color: selected ? '#667eea' : colors.text.secondary,
                    background: selected ? 'rgba(102,126,234,0.11)' : 'transparent',
                  }}
                >
                  <span className="truncate text-xs font-bold">{country.label}</span>
                  <span className="rounded-lg px-2 py-1 text-[10px] font-black"
                    style={{ color: '#667eea', background: 'rgba(102,126,234,0.1)' }}>
                    +{country.code}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BuyerPhoneNumbers() {
  const { colors, isDark } = useTheme();
  const {
    phoneNumbers = [],
    phoneNumbersLoading,
    phoneNumbersError,
    refreshPhoneNumbers,
    addPhoneNumber,
    updatePhoneNumber,
    setDefaultPhoneNumber,
    deletePhoneNumber,
    approvePhoneNumberAction,
  } = useBuyer();
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors: phoneFormErrors },
  } = useForm({
    resolver: zodResolver(buyerPhoneNumberSchema),
    defaultValues: EMPTY_PHONE_NUMBER,
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [secureAction, setSecureAction] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const countryCode = watch('countryCode');
  const phoneNumber = watch('phoneNumber');
  const password = watch('password');
  const validPhone = isValidInternationalPhone(countryCode, phoneNumber);

  const resetEditor = () => {
    setEditingId(null);
    reset(EMPTY_PHONE_NUMBER);
  };

  const savePhone = handleSubmit(async (values) => {
    setSaving(true);
    try {
      let approval;
      if (editingId === 'new') {
        approval = await addPhoneNumber({ ...values, isDefault: values.isDefault || phoneNumbers.length === 0 });
      } else {
        approval = await updatePhoneNumber({ id: editingId, ...values });
      }
      setPendingApproval(approval);
      setPhoneError('');
      resetEditor();
    } catch {
      // The mutation hook reports backend errors as toasts.
    } finally {
      setSaving(false);
    }
  });

  const confirmSecureAction = async (password) => {
    if (!secureAction) return;
    setSaving(true);
    try {
      if (secureAction.type === 'default') {
        await setDefaultPhoneNumber({ id: secureAction.id, password });
      } else {
        const approval = await deletePhoneNumber({ id: secureAction.id, password });
        setPendingApproval(approval);
      }
      setSecureAction(null);
      if (secureAction.type === 'default') await refreshPhoneNumbers?.();
    } catch {
      // The mutation hook reports backend errors as toasts.
    } finally {
      setSaving(false);
    }
  };

  const confirmPhoneApproval = async (confirmationCode) => {
    if (!pendingApproval) return;
    setSaving(true);
    try {
      await approvePhoneNumberAction({
        requestId: pendingApproval.requestId,
        confirmationCode,
      });
      setPendingApproval(null);
      setPhoneError('');
      await refreshPhoneNumbers?.();
    } catch {
      // The mutation hook reports backend errors as toasts.
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id) => {
    if (phoneNumbers.length <= 1) {
      setPhoneError('Keep at least one phone number on your account. Add another number before removing this one.');
      return;
    }

    setPhoneError('');
    setSecureAction({ type: 'delete', id });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black" style={{ color: colors.text.primary }}>Phone Numbers</h3>
          <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>Save up to two unique numbers. Password confirmation starts a change, then an email code approves it.</p>
        </div>
        <button
          type="button"
          onClick={() => editingId ? resetEditor() : setEditingId('new')}
          disabled={!editingId && phoneNumbers.length >= 2}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
          style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea' }}
        >
          <BIcon name={editingId ? 'x' : 'plus'} size={13} />
          {editingId ? 'Cancel' : 'Add Number'}
        </button>
      </div>

      {phoneError && (
        <p role="alert" className="rounded-xl px-3 py-2 text-xs font-semibold"
          style={{ color: '#b91c1c', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {phoneError}
        </p>
      )}

      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={savePhone} className="rounded-2xl p-4 space-y-3" style={{ background: colors.surface.elevated, border: '1px solid rgba(102,126,234,0.24)' }}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr]">
                <Controller
                  name="countryCode"
                  control={control}
                  render={({ field }) => (
                    <CountryCodeSelect
                      colors={colors}
                      isDark={isDark}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <input
                  placeholder="8035154276" type="tel" inputMode="numeric" aria-label="Local phone number"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }}
                  {...register('phoneNumber')} />
              </div>
              {phoneFormErrors.phoneNumber && <p className="text-xs" style={{ color: '#ef4444' }}>{phoneFormErrors.phoneNumber.message}</p>}
              <p className="text-[11px]" style={{ color: colors.text.tertiary }}>
                A local leading zero is accepted and removed when saving. Preview: {formatInternationalPhone(countryCode, phoneNumber) || '+2348034157476'}
              </p>
              <input
                placeholder="Account password" type="password" autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }}
                {...register('password')} />
              {phoneFormErrors.password && <p className="text-xs" style={{ color: '#ef4444' }}>{phoneFormErrors.password.message}</p>}
              {!phoneNumbers.some(phone => phone.isDefault) && (
                <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: colors.text.secondary }}>
                  <input type="checkbox" {...register('isDefault')} />
                  Make this my default number
                </label>
              )}
              <button type="submit" disabled={saving || !validPhone || !password}
                className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                {saving ? 'Saving...' : editingId === 'new' ? 'Save Number' : 'Update Number'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {phoneNumbersLoading ? (
        <AccountDataFallback colors={colors} loading />
      ) : phoneNumbersError ? (
        <AccountDataFallback colors={colors} onRetry={() => refreshPhoneNumbers?.()} />
      ) : phoneNumbers.length === 0 ? (
        <AccountDataFallback colors={colors} message="No saved phone numbers" />
      ) : (
        <div className="space-y-3">
          {phoneNumbers.map(phone => (
            <div key={phone.id} className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
              style={{ background: colors.surface.elevated, border: `1px solid ${phone.isDefault ? '#667eea' : colors.border.subtle}` }}>
              <div>
                <p className="text-sm font-bold" style={{ color: colors.text.primary }}>
                  {formatInternationalPhone(phone.country_code, phone.phone_number) || phone.formatted_phone}
                </p>
                {phone.isDefault && <span className="text-[10px] font-black" style={{ color: '#667eea' }}>Default number</span>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => {
                  setEditingId(phone.id);
                  reset({ countryCode: phone.country_code, phoneNumber: phone.phone_number, password: '', isDefault: phone.isDefault });
                }} className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: '#667eea', background: 'rgba(102,126,234,0.08)' }}>
                  <BIcon name="edit" size={13} />
                </button>
                {!phone.isDefault && (
                  <button type="button" onClick={() => setSecureAction({ type: 'default', id: phone.id })}
                    className="text-[10px] font-bold px-2 rounded-lg"
                    style={{ color: '#667eea', background: 'rgba(102,126,234,0.08)' }}>Set Default</button>
                )}
                <button type="button" onClick={() => requestDelete(phone.id)}
                  aria-disabled={phoneNumbers.length <= 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', opacity: phoneNumbers.length <= 1 ? 0.45 : 1 }}>
                  <BIcon name="trash" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {secureAction && (
          <SecurePasswordModal
            colors={colors}
            title={secureAction.type === 'delete' ? 'Delete phone number?' : 'Set default number?'}
            message="Enter your account password to confirm this secured action."
            confirmLabel={secureAction.type === 'delete' ? 'Delete' : 'Confirm'}
            processing={saving}
            onClose={() => setSecureAction(null)}
            onConfirm={confirmSecureAction}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingApproval && (
          <EmailConfirmationModal
            colors={colors}
            approval={pendingApproval}
            processing={saving}
            onClose={() => setPendingApproval(null)}
            onConfirm={confirmPhoneApproval}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

const EMPTY_ADDRESS = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'NG',
};

export function BuyerAddresses() {
  const { colors, isDark } = useTheme();
  const {
    addresses = [],
    addressesLoading,
    addressesError,
    refreshAddresses,
    addAddress,
    setDefaultAddress,
    deleteAddress,
    profile,
  } = useBuyer();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [newAddr, setNewAddr] = useState(EMPTY_ADDRESS);

  const saveNew = async () => {
    if (!newAddr.line1.trim() || !newAddr.city.trim()) return;
    setSaving(true);
    try {
      await addAddress({
        ...newAddr,
        name: profile?.full_name || profile?.name || 'Buyer',
        isDefault: addresses.length === 0,
      });
      setNewAddr(EMPTY_ADDRESS);
      setAdding(false);
      await refreshAddresses?.();
    } finally {
      setSaving(false);
    }
  };

  const updateDefault = async (id) => {
    setPendingId(id);
    try {
      await setDefaultAddress(id);
      await refreshAddresses?.();
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await deleteAddress(id);
      await refreshAddresses?.();
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <BuyerPhoneNumbers />
      <div style={{ borderTop: `1px solid ${colors.border.subtle}` }} />
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Saved Addresses</h2>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          type="button" onClick={() => setAdding(current => !current)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
          <BIcon name="plus" size={15} /> Add New
        </motion.button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="rounded-2xl p-5 space-y-4 shadow-sm"
              style={{ background: colors.surface.elevated, border: '1px solid rgba(102,126,234,0.3)' }}>
              <p className="font-bold text-sm" style={{ color: '#667eea' }}>New Address</p>
              {[
                ['Label (e.g. Home)', 'label'],
                ['Street Address', 'line1'],
                ['Apartment, suite, or landmark', 'line2'],
                ['City', 'city'],
                ['State', 'state'],
                ['Postal Code', 'postalCode'],
                ['Country Code', 'country'],
              ].map(([placeholder, key]) => (
                <input key={key} value={newAddr[key]} onChange={event => setNewAddr(current => ({ ...current, [key]: event.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }} />
              ))}
              <div className="flex gap-3">
                <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  type="button" onClick={saveNew} disabled={saving || !newAddr.line1.trim() || !newAddr.city.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                  {saving ? 'Saving...' : 'Save Address'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {addressesLoading ? (
          <AccountDataFallback colors={colors} loading />
        ) : addressesError ? (
          <AccountDataFallback colors={colors} onRetry={() => refreshAddresses?.()} />
        ) : addresses.length === 0 ? (
          <AccountDataFallback colors={colors} message="No saved addresses" />
        ) : addresses.map((address, index) => (
          <motion.div key={address.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: colors.surface.elevated, border: `1.5px solid ${address.isDefault ? '#667eea' : colors.border.subtle}` }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: address.isDefault ? 'rgba(102,126,234,0.1)' : (isDark ? colors.surface.tertiary : '#F3F4F6') }}>
                  <BIcon name="map-pin" size={15} style={{ color: address.isDefault ? '#667eea' : colors.text.tertiary }} />
                </div>
                <div>
                  <span className="text-sm font-bold" style={{ color: colors.text.primary }}>{address.label}</span>
                  {address.isDefault && (
                    <span className="ml-2 text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea' }}>Default</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!address.isDefault && (
                  <button type="button" onClick={() => updateDefault(address.id)} disabled={pendingId === address.id}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg disabled:opacity-50"
                    style={{ color: '#667eea', background: 'rgba(102,126,234,0.08)' }}>Set Default</button>
                )}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  type="button" onClick={() => remove(address.id)} disabled={pendingId === address.id}
                  className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-50"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}>
                  <BIcon name="trash" size={13} />
                </motion.button>
              </div>
            </div>
            <div className="space-y-0.5 pl-10">
              <p className="text-sm font-bold" style={{ color: colors.text.primary }}>{address.name}</p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>{address.line1}</p>
              {address.line2 && <p className="text-sm" style={{ color: colors.text.secondary }}>{address.line2}</p>}
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
              </p>
              <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>{address.country}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const EMPTY_PAYMENT_METHOD = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  password: '',
  isDefault: false,
};

const cleanCardNumber = value => value.replace(/\D/g, '').slice(0, 19);
const formatCardNumber = value => cleanCardNumber(value).replace(/(.{4})/g, '$1 ').trim();
const inferCardBrand = value => {
  const cardNumber = cleanCardNumber(value);
  if (/^4/.test(cardNumber)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) return 'Mastercard';
  if (/^(506|507|650)/.test(cardNumber)) return 'Verve';
  return 'Card';
};
const passesLuhnCheck = value => {
  const digits = cleanCardNumber(value);
  if (digits.length < 13) return false;

  return digits
    .split('')
    .reverse()
    .reduce((sum, digit, index) => {
      const valueAtIndex = Number(digit) * (index % 2 ? 2 : 1);
      return sum + (valueAtIndex > 9 ? valueAtIndex - 9 : valueAtIndex);
    }, 0) % 10 === 0;
};

export function BuyerPayments() {
  const { colors, isDark } = useTheme();
  const {
    payments = [],
    paymentsLoading,
    paymentsError,
    refreshPayments,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
  } = useBuyer();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [secureAction, setSecureAction] = useState(null);
  const [newMethod, setNewMethod] = useState(EMPTY_PAYMENT_METHOD);
  const BRAND_GRADIENT = {
    Mastercard: 'linear-gradient(135deg,#eb5757,#b91c1c)',
    Visa: 'linear-gradient(135deg,#1a1f71,#2563eb)',
    Verve: 'linear-gradient(135deg,#059669,#047857)',
  };
  const inferredBrand = inferCardBrand(newMethod.cardNumber);
  const validMethod = newMethod.cardholderName.trim().length >= 2
    && passesLuhnCheck(newMethod.cardNumber)
    && /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(newMethod.expiry)
    && /^[0-9]{3,4}$/.test(newMethod.cvv)
    && Boolean(newMethod.password);

  const saveMethod = async () => {
    if (!validMethod) return;
    setSaving(true);
    try {
      await addPaymentMethod({
        ...newMethod,
        brand: inferredBrand,
        isDefault: newMethod.isDefault || payments.length === 0,
      });
      setNewMethod(EMPTY_PAYMENT_METHOD);
      setAdding(false);
      await refreshPayments?.();
    } finally {
      setSaving(false);
    }
  };

  const confirmSecureAction = async (password) => {
    if (!secureAction) return;
    try {
      setSaving(true);
      if (secureAction.type === 'default') {
        await setDefaultPaymentMethod({ id: secureAction.id, password });
      } else {
        await deletePaymentMethod({ id: secureAction.id, password });
      }
      setSecureAction(null);
      await refreshPayments?.();
    } catch {
      // The mutation hook reports backend errors as toasts.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Payment Methods</h2>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          type="button" onClick={() => setAdding(current => !current)}
          disabled={!adding && payments.length >= 2}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
          <BIcon name="plus" size={15} /> Add Card
        </motion.button>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.15)' }}>
        <BIcon name="check" size={15} style={{ color: '#059669' }} />
        <p className="text-xs font-semibold" style={{ color: '#059669' }}>Save up to two cards. Only masked metadata is stored. Raw card numbers and CVVs are discarded after validation.</p>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="rounded-2xl p-5 space-y-4 shadow-sm"
              style={{ background: colors.surface.elevated, border: '1px solid rgba(102,126,234,0.3)' }}>
              <div>
                <p className="font-bold text-sm" style={{ color: '#667eea' }}>Add Card</p>
                <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>Detected brand: {inferredBrand}</p>
              </div>
              <input value={newMethod.cardholderName} onChange={event => setNewMethod(current => ({ ...current, cardholderName: event.target.value }))}
                placeholder="Cardholder name" autoComplete="cc-name"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }} />
              <input value={formatCardNumber(newMethod.cardNumber)} onChange={event => setNewMethod(current => ({ ...current, cardNumber: cleanCardNumber(event.target.value) }))}
                placeholder="Card number" inputMode="numeric" autoComplete="cc-number"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }} />
              <input value={newMethod.expiry} onChange={event => setNewMethod(current => ({ ...current, expiry: event.target.value.slice(0, 5) }))}
                placeholder="Expiry MM/YY" autoComplete="cc-exp"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }} />
              <input value={newMethod.cvv} onChange={event => setNewMethod(current => ({ ...current, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="CVV" inputMode="numeric" autoComplete="cc-csc" type="password"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }} />
              <input value={newMethod.password} onChange={event => setNewMethod(current => ({ ...current, password: event.target.value }))}
                placeholder="Account password" type="password" autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }} />
              <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: colors.text.secondary }}>
                <input type="checkbox" checked={newMethod.isDefault} onChange={event => setNewMethod(current => ({ ...current, isDefault: event.target.checked }))} />
                Make this my default payment method
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  type="button" onClick={saveMethod} disabled={saving || !validMethod}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                  {saving ? 'Saving...' : 'Save Card'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {paymentsLoading ? (
          <AccountDataFallback colors={colors} loading />
        ) : paymentsError ? (
          <AccountDataFallback colors={colors} onRetry={() => refreshPayments?.()} />
        ) : payments.length === 0 ? (
          <AccountDataFallback colors={colors} message="No saved payment methods" />
        ) : payments.map((card, index) => (
          <motion.div key={card.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className="rounded-2xl overflow-hidden shadow-sm relative"
            style={{ border: `1.5px solid ${card.isDefault ? '#667eea' : colors.border.subtle}` }}>
            <div className="h-28 p-5 flex flex-col justify-between"
              style={{ background: BRAND_GRADIENT[card.brand] || 'linear-gradient(135deg,#667eea,#764ba2)' }}>
              <div className="flex items-center justify-between">
                <p className="text-white font-black text-lg">{card.brand}</p>
                {card.isDefault && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white">Default</span>}
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">{card.cardholder_name || 'Saved card'}</p>
                <p className="text-white/80 font-mono text-base tracking-widest">**** **** **** {card.last4}</p>
              </div>
            </div>
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: colors.surface.elevated }}>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>Expires {card.expiry}</p>
              <div className="flex items-center gap-2">
                {!card.isDefault && (
                  <button type="button" onClick={() => setSecureAction({ type: 'default', id: card.id })}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ color: '#667eea', background: 'rgba(102,126,234,0.08)' }}>Set Default</button>
                )}
                <motion.button whileHover={{ scale: 1.1 }} type="button" onClick={() => setSecureAction({ type: 'delete', id: card.id })}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}>
                  <BIcon name="trash" size={13} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {secureAction && (
          <SecurePasswordModal
            colors={colors}
            title={secureAction.type === 'delete' ? 'Remove card?' : 'Set default card?'}
            message="Enter your account password to confirm this secured action."
            confirmLabel={secureAction.type === 'delete' ? 'Remove' : 'Confirm'}
            processing={saving}
            onClose={() => setSecureAction(null)}
            onConfirm={confirmSecureAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
