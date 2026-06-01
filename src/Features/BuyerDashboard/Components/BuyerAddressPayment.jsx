import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../../Store/useThemeStore';
import { useBuyer } from '../context/BuyerContext';
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
  const [password, setPassword] = useState('');

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
      <motion.div
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
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder="Account password"
          autoComplete="current-password"
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4"
          style={{ border: `1px solid ${colors.border.default}`, color: colors.text.primary, background: colors.surface.tertiary }}
        />
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
          <button type="button" onClick={() => onConfirm(password)} disabled={processing || !password}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: '#667eea', color: '#fff' }}>
            {processing ? 'Confirming...' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </>
  );
}

const EMPTY_PHONE_NUMBER = { phoneNumber: '', password: '', isDefault: false };

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
  } = useBuyer();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_PHONE_NUMBER);
  const [saving, setSaving] = useState(false);
  const [secureAction, setSecureAction] = useState(null);
  const validPhone = /^\+?[0-9\s()-]{7,24}$/.test(draft.phoneNumber.trim());

  const resetEditor = () => {
    setEditingId(null);
    setDraft(EMPTY_PHONE_NUMBER);
  };

  const savePhone = async () => {
    if (!validPhone || !draft.password) return;
    setSaving(true);
    try {
      if (editingId) {
        await updatePhoneNumber({ id: editingId, ...draft });
      } else {
        await addPhoneNumber({ ...draft, isDefault: draft.isDefault || phoneNumbers.length === 0 });
      }
      resetEditor();
      await refreshPhoneNumbers?.();
    } catch {
      // The mutation hook reports backend errors as toasts.
    } finally {
      setSaving(false);
    }
  };

  const confirmSecureAction = async (password) => {
    if (!secureAction) return;
    setSaving(true);
    try {
      if (secureAction.type === 'default') {
        await setDefaultPhoneNumber({ id: secureAction.id, password });
      } else {
        await deletePhoneNumber({ id: secureAction.id, password });
      }
      setSecureAction(null);
      await refreshPhoneNumbers?.();
    } catch {
      // The mutation hook reports backend errors as toasts.
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black" style={{ color: colors.text.primary }}>Phone Numbers</h3>
          <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>Save up to two unique contact numbers. Password confirmation is required.</p>
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

      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl p-4 space-y-3" style={{ background: colors.surface.elevated, border: '1px solid rgba(102,126,234,0.24)' }}>
              <input value={draft.phoneNumber} onChange={event => setDraft(current => ({ ...current, phoneNumber: event.target.value }))}
                placeholder="+234 801 234 5678" type="tel"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }} />
              <input value={draft.password} onChange={event => setDraft(current => ({ ...current, password: event.target.value }))}
                placeholder="Account password" type="password" autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }} />
              {!phoneNumbers.some(phone => phone.isDefault) && (
                <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: colors.text.secondary }}>
                  <input type="checkbox" checked={draft.isDefault} onChange={event => setDraft(current => ({ ...current, isDefault: event.target.checked }))} />
                  Make this my default number
                </label>
              )}
              <button type="button" onClick={savePhone} disabled={saving || !validPhone || !draft.password}
                className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                {saving ? 'Saving...' : editingId === 'new' ? 'Save Number' : 'Update Number'}
              </button>
            </div>
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
                <p className="text-sm font-bold" style={{ color: colors.text.primary }}>{phone.phone_number}</p>
                {phone.isDefault && <span className="text-[10px] font-black" style={{ color: '#667eea' }}>Default number</span>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => {
                  setEditingId(phone.id);
                  setDraft({ phoneNumber: phone.phone_number, password: '', isDefault: phone.isDefault });
                }} className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: '#667eea', background: 'rgba(102,126,234,0.08)' }}>
                  <BIcon name="edit" size={13} />
                </button>
                {!phone.isDefault && (
                  <button type="button" onClick={() => setSecureAction({ type: 'default', id: phone.id })}
                    className="text-[10px] font-bold px-2 rounded-lg"
                    style={{ color: '#667eea', background: 'rgba(102,126,234,0.08)' }}>Set Default</button>
                )}
                <button type="button" onClick={() => setSecureAction({ type: 'delete', id: phone.id })}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}>
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
