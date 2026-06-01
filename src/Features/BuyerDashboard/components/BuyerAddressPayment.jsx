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
import { ADDRESS_COUNTRIES, getAddressCountryLabel } from '../../../utils/addressCountries';
import { useBuyer } from '../context/BuyerContext';
import { buyerPhoneNumberSchema } from '../Schema/buyerPhoneSchema';
import { buyerAddressSchema, EMPTY_BUYER_ADDRESS } from '../Schema/buyerAddressSchema';
import {
  buyerPaymentMethodSchema,
  cleanCardNumber,
  EMPTY_BUYER_PAYMENT_METHOD,
  formatCardNumber,
  inferCardBrand,
} from '../Schema/buyerPaymentSchema';
import { BIcon } from './BuyerIcon';
import { EmailConfirmationModal, SecurePasswordModal } from './BuyerSecurityModals';

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

function AddressCountrySelect({ colors, isDark, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedCountry = ADDRESS_COUNTRIES.find(country => country.code === value)
    || ADDRESS_COUNTRIES[0];

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full rounded-xl px-4 py-2.5 text-left outline-none"
        style={{
          background: isDark ? colors.surface.tertiary : '#F9FAFB',
          border: `1px solid ${open ? '#667eea' : colors.border.default}`,
          boxShadow: open ? '0 0 0 3px rgba(102,126,234,0.12)' : 'none',
        }}
      >
        <span className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-bold" style={{ color: colors.text.primary }}>{selectedCountry.label}</span>
            <span className="text-[10px]" style={{ color: colors.text.tertiary }}>Delivery country</span>
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black"
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
            aria-label="Delivery country"
            className="absolute left-0 right-0 z-30 max-h-64 overflow-y-auto rounded-2xl p-2 shadow-2xl"
            style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}
          >
            {ADDRESS_COUNTRIES.map(country => {
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
                    {country.code}
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
    approveSensitiveAction,
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
        const approval = await setDefaultPhoneNumber({ id: secureAction.id, password });
        setPendingApproval(approval);
      } else {
        const approval = await deletePhoneNumber({ id: secureAction.id, password });
        setPendingApproval(approval);
      }
      setSecureAction(null);
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
      const approve = pendingApproval.resourceType
        ? approveSensitiveAction
        : approvePhoneNumberAction;
      await approve({ requestId: pendingApproval.requestId, confirmationCode });
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
            title="Confirm phone-number change"
            processing={saving}
            onClose={() => setPendingApproval(null)}
            onConfirm={confirmPhoneApproval}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export function BuyerAddresses() {
  const { colors, isDark } = useTheme();
  const {
    addresses = [],
    addressesLoading,
    addressesError,
    refreshAddresses,
    addAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    approveSensitiveAction,
    profile,
  } = useBuyer();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors: addressErrors },
  } = useForm({
    resolver: zodResolver(buyerAddressSchema),
    defaultValues: EMPTY_BUYER_ADDRESS,
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [secureAction, setSecureAction] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(null);

  const resetAddressEditor = () => {
    setEditingId(null);
    reset(EMPTY_BUYER_ADDRESS);
  };

  const saveAddress = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const address = {
        ...values,
        name: profile?.full_name || profile?.name || 'Buyer',
        isDefault: addresses.length === 0,
      };
      const approval = editingId === 'new'
        ? await addAddress(address)
        : await updateAddress({ id: editingId, ...address });
      setPendingApproval(approval);
      resetAddressEditor();
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
      const approval = secureAction.type === 'default'
        ? await setDefaultAddress({ id: secureAction.id, password })
        : await deleteAddress({ id: secureAction.id, password });
      setPendingApproval(approval);
      setSecureAction(null);
    } catch {
      // The mutation hook reports backend errors as toasts.
    } finally {
      setSaving(false);
    }
  };

  const confirmAddressApproval = async (confirmationCode) => {
    if (!pendingApproval) return;
    setSaving(true);
    try {
      await approveSensitiveAction({
        requestId: pendingApproval.requestId,
        confirmationCode,
      });
      setPendingApproval(null);
      await refreshAddresses?.();
    } catch {
      // The mutation hook reports backend errors as toasts.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <BuyerPhoneNumbers />
      <div style={{ borderTop: `1px solid ${colors.border.subtle}` }} />
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Saved Addresses</h2>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          type="button" onClick={() => editingId ? resetAddressEditor() : setEditingId('new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
          <BIcon name={editingId ? 'x' : 'plus'} size={15} /> {editingId ? 'Cancel' : 'Add New'}
        </motion.button>
      </div>

      <AnimatePresence>
        {editingId && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <form onSubmit={saveAddress} className="rounded-2xl p-5 space-y-4 shadow-sm"
              style={{ background: colors.surface.elevated, border: '1px solid rgba(102,126,234,0.3)' }}>
              <p className="font-bold text-sm" style={{ color: '#667eea' }}>
                {editingId === 'new' ? 'New Address' : 'Edit Address'}
              </p>
              {[
                ['Label (e.g. Home)', 'label'],
                ['Street Address', 'line1'],
                ['Apartment, suite, or landmark', 'line2'],
                ['City', 'city'],
                ['State', 'state'],
                ['Postal Code', 'postalCode'],
              ].map(([placeholder, key]) => (
                <div key={key}>
                  <input
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${addressErrors[key] ? '#ef4444' : colors.border.default}`, color: colors.text.primary }}
                    {...register(key)}
                  />
                  {addressErrors[key] && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{addressErrors[key].message}</p>}
                </div>
              ))}
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <AddressCountrySelect
                    colors={colors}
                    isDark={isDark}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {addressErrors.country && <p className="text-xs" style={{ color: '#ef4444' }}>{addressErrors.country.message}</p>}
              <input
                placeholder="Account password"
                type="password"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${addressErrors.password ? '#ef4444' : colors.border.default}`, color: colors.text.primary }}
                {...register('password')}
              />
              {addressErrors.password && <p className="text-xs" style={{ color: '#ef4444' }}>{addressErrors.password.message}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={resetAddressEditor} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                  {saving ? 'Saving...' : editingId === 'new' ? 'Save Address' : 'Update Address'}
                </motion.button>
              </div>
            </form>
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
                  <button type="button" onClick={() => setSecureAction({ type: 'default', id: address.id })}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ color: '#667eea', background: 'rgba(102,126,234,0.08)' }}>Set Default</button>
                )}
                <button type="button" onClick={() => {
                  setEditingId(address.id);
                  reset({
                    label: address.label,
                    line1: address.line1,
                    line2: address.line2 || '',
                    city: address.city,
                    state: address.state || '',
                    postalCode: address.postalCode || '',
                    country: address.country || 'NG',
                    password: '',
                    isDefault: address.isDefault,
                  });
                }} className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: '#667eea', background: 'rgba(102,126,234,0.08)' }}>
                  <BIcon name="edit" size={13} />
                </button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  type="button" onClick={() => setSecureAction({ type: 'delete', id: address.id })}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
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
              <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>{getAddressCountryLabel(address.country)}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {secureAction && (
          <SecurePasswordModal
            colors={colors}
            title={secureAction.type === 'delete' ? 'Delete address?' : 'Set default address?'}
            message="Enter your account password. We will email a confirmation code before applying this change."
            confirmLabel={secureAction.type === 'delete' ? 'Delete' : 'Continue'}
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
            title="Confirm address change"
            onClose={() => setPendingApproval(null)}
            onConfirm={confirmAddressApproval}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

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
    approveSensitiveAction,
  } = useBuyer();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors: paymentErrors },
  } = useForm({
    resolver: zodResolver(buyerPaymentMethodSchema),
    defaultValues: EMPTY_BUYER_PAYMENT_METHOD,
  });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [secureAction, setSecureAction] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(null);
  const BRAND_GRADIENT = {
    Mastercard: 'linear-gradient(135deg,#eb5757,#b91c1c)',
    Visa: 'linear-gradient(135deg,#1a1f71,#2563eb)',
    Verve: 'linear-gradient(135deg,#059669,#047857)',
  };
  const cardNumber = watch('cardNumber');
  const inferredBrand = inferCardBrand(cardNumber);

  const saveMethod = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const approval = await addPaymentMethod({
        ...values,
        brand: inferredBrand,
        isDefault: values.isDefault || payments.length === 0,
      });
      setPendingApproval(approval);
      reset(EMPTY_BUYER_PAYMENT_METHOD);
      setAdding(false);
    } catch {
      // The mutation hook reports backend errors as toasts.
    } finally {
      setSaving(false);
    }
  });

  const confirmSecureAction = async (password) => {
    if (!secureAction) return;
    try {
      setSaving(true);
      const approval = secureAction.type === 'default'
        ? await setDefaultPaymentMethod({ id: secureAction.id, password })
        : await deletePaymentMethod({ id: secureAction.id, password });
      setPendingApproval(approval);
      setSecureAction(null);
    } catch {
      // The mutation hook reports backend errors as toasts.
    } finally {
      setSaving(false);
    }
  };

  const confirmPaymentApproval = async (confirmationCode) => {
    if (!pendingApproval) return;
    setSaving(true);
    try {
      await approveSensitiveAction({
        requestId: pendingApproval.requestId,
        confirmationCode,
      });
      setPendingApproval(null);
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
            <form onSubmit={saveMethod} className="rounded-2xl p-5 space-y-4 shadow-sm"
              style={{ background: colors.surface.elevated, border: '1px solid rgba(102,126,234,0.3)' }}>
              <div>
                <p className="font-bold text-sm" style={{ color: '#667eea' }}>Add Card</p>
                <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>Detected brand: {inferredBrand}</p>
              </div>
              <input
                placeholder="Cardholder name" autoComplete="cc-name"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${paymentErrors.cardholderName ? '#ef4444' : colors.border.default}`, color: colors.text.primary }}
                {...register('cardholderName')} />
              {paymentErrors.cardholderName && <p className="text-xs" style={{ color: '#ef4444' }}>{paymentErrors.cardholderName.message}</p>}
              <input {...register('cardNumber')} value={formatCardNumber(cardNumber)} onChange={event => setValue('cardNumber', cleanCardNumber(event.target.value), { shouldDirty: true, shouldValidate: true })}
                placeholder="Card number" inputMode="numeric" autoComplete="cc-number"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${paymentErrors.cardNumber ? '#ef4444' : colors.border.default}`, color: colors.text.primary }} />
              {paymentErrors.cardNumber && <p className="text-xs" style={{ color: '#ef4444' }}>{paymentErrors.cardNumber.message}</p>}
              <input
                placeholder="Expiry MM/YY" autoComplete="cc-exp"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${paymentErrors.expiry ? '#ef4444' : colors.border.default}`, color: colors.text.primary }}
                {...register('expiry')} />
              {paymentErrors.expiry && <p className="text-xs" style={{ color: '#ef4444' }}>{paymentErrors.expiry.message}</p>}
              <input
                placeholder="CVV" inputMode="numeric" autoComplete="cc-csc" type="password"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${paymentErrors.cvv ? '#ef4444' : colors.border.default}`, color: colors.text.primary }}
                {...register('cvv')} />
              {paymentErrors.cvv && <p className="text-xs" style={{ color: '#ef4444' }}>{paymentErrors.cvv.message}</p>}
              <input
                placeholder="Account password" type="password" autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${paymentErrors.password ? '#ef4444' : colors.border.default}`, color: colors.text.primary }}
                {...register('password')} />
              {paymentErrors.password && <p className="text-xs" style={{ color: '#ef4444' }}>{paymentErrors.password.message}</p>}
              <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: colors.text.secondary }}>
                <input type="checkbox" {...register('isDefault')} />
                Make this my default payment method
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => {
                  setAdding(false);
                  reset(EMPTY_BUYER_PAYMENT_METHOD);
                }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                  {saving ? 'Saving...' : 'Save Card'}
                </motion.button>
              </div>
            </form>
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
      <AnimatePresence>
        {pendingApproval && (
          <EmailConfirmationModal
            colors={colors}
            approval={pendingApproval}
            processing={saving}
            title="Confirm payment-method change"
            onClose={() => setPendingApproval(null)}
            onConfirm={confirmPaymentApproval}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
