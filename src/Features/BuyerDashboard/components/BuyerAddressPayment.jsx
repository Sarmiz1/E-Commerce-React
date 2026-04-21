import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { ADDRESSES, PAYMENT_METHODS } from '../data/buyerData';
import { BIcon } from './BuyerIcon';

// ─── Addresses ────────────────────────────────────────────────────────────────
export function BuyerAddresses() {
  const { colors, isDark } = useTheme();
  const [addresses, setAddresses] = useState(ADDRESSES);
  const [adding, setAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', line1: '', line2: '', phone: '' });
  const [saved, setSaved] = useState(false);

  const saveNew = async () => {
    if (!newAddr.line1) return;
    setSaved(true);
    await new Promise(r => setTimeout(r, 800));
    setAddresses(a => [...a, { id: Date.now(), ...newAddr, name: 'Samuel Okafor', isDefault: false }]);
    setAdding(false);
    setNewAddr({ label: '', line1: '', line2: '', phone: '' });
    setSaved(false);
  };

  const setDefault = (id) => setAddresses(a => a.map(ad => ({ ...ad, isDefault: ad.id === id })));
  const remove = (id) => setAddresses(a => a.filter(ad => ad.id !== id));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Saved Addresses</h2>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          onClick={() => setAdding(a => !a)}
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
              style={{ background: colors.surface.elevated, border: `1px solid rgba(102,126,234,0.3)` }}>
              <p className="font-bold text-sm" style={{ color: '#667eea' }}>+ New Address</p>
              {[
                ['Label (e.g. Home)', 'label'],
                ['Street Address', 'line1'],
                ['City, State', 'line2'],
                ['Phone Number', 'phone'],
              ].map(([ph, k]) => (
                <input key={k} value={newAddr[k]} onChange={e => setNewAddr(n => ({ ...n, [k]: e.target.value }))}
                  placeholder={ph}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}`, color: colors.text.primary }} />
              ))}
              <div className="flex gap-3">
                <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={saveNew}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                  {saved ? <><BIcon name="check" size={14} /> Saved!</> : 'Save Address'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {addresses.map((addr, i) => (
          <motion.div key={addr.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: colors.surface.elevated, border: `1.5px solid ${addr.isDefault ? '#667eea' : colors.border.subtle}` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: addr.isDefault ? 'rgba(102,126,234,0.1)' : (isDark ? colors.surface.tertiary : '#F3F4F6') }}>
                  <BIcon name="map-pin" size={15} style={{ color: addr.isDefault ? '#667eea' : colors.text.tertiary }} />
                </div>
                <div>
                  <span className="text-sm font-bold" style={{ color: colors.text.primary }}>{addr.label}</span>
                  {addr.isDefault && (
                    <span className="ml-2 text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea' }}>Default</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} className="text-[10px] font-bold px-2.5 py-1 rounded-lg hover:opacity-70"
                    style={{ color: '#667eea', background: 'rgba(102,126,234,0.08)' }}>Set Default</button>
                )}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => remove(addr.id)} className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}>
                  <BIcon name="trash" size={13} />
                </motion.button>
              </div>
            </div>
            <div className="space-y-0.5 pl-10">
              <p className="text-sm" style={{ color: colors.text.primary }}>{addr.name}</p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>{addr.line1}</p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>{addr.line2}</p>
              <p className="text-sm" style={{ color: colors.text.tertiary }}>{addr.phone}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Payment Methods ──────────────────────────────────────────────────────────
export function BuyerPayments() {
  const { colors, isDark } = useTheme();
  const [cards, setCards] = useState(PAYMENT_METHODS);
  const [delId, setDelId] = useState(null);
  const [adding, setAdding] = useState(false);

  const BRAND_GRADIENT = { Mastercard: 'linear-gradient(135deg,#eb5757,#b91c1c)', Visa: 'linear-gradient(135deg,#1a1f71,#2563eb)' };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Payment Methods</h2>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          onClick={() => setAdding(a => !a)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
          <BIcon name="plus" size={15} /> Add Card
        </motion.button>
      </div>

      {/* Secure badge */}
      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.15)' }}>
        <BIcon name="check" size={15} style={{ color: '#059669' }} />
        <p className="text-xs font-semibold" style={{ color: '#059669' }}>All payments secured by Paystack · 256-bit SSL encryption</p>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {cards.map((card, i) => (
          <motion.div key={card.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl overflow-hidden shadow-sm relative"
            style={{ border: `1.5px solid ${card.isDefault ? '#667eea' : colors.border.subtle}` }}>
            {/* Card visual */}
            <div className="h-28 p-5 flex flex-col justify-between"
              style={{ background: BRAND_GRADIENT[card.brand] || 'linear-gradient(135deg,#667eea,#764ba2)' }}>
              <div className="flex items-center justify-between">
                <p className="text-white font-black text-lg">{card.brand}</p>
                {card.isDefault && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white">Default</span>}
              </div>
              <p className="text-white/80 font-mono text-base tracking-widest">•••• •••• •••• {card.last4}</p>
            </div>
            <div className="px-5 py-3 flex items-center justify-between"
              style={{ background: colors.surface.elevated }}>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>Expires {card.expiry}</p>
              <div className="flex items-center gap-2">
                {!card.isDefault && (
                  <button className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ color: '#667eea', background: 'rgba(102,126,234,0.08)' }}
                    onClick={() => setCards(c => c.map(cd => ({ ...cd, isDefault: cd.id === card.id })))}>
                    Set Default
                  </button>
                )}
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setDelId(card.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}>
                  <BIcon name="trash" size={13} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {delId && (
          <>
            <motion.div key="bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setDelId(null)} />
            <motion.div key="modal" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 rounded-2xl p-6 shadow-2xl"
              style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <BIcon name="credit-card" size={22} style={{ color: '#ef4444' }} />
              </div>
              <h4 className="font-black text-center mb-1" style={{ color: colors.text.primary }}>Remove Card?</h4>
              <p className="text-sm text-center mb-5" style={{ color: colors.text.tertiary }}>This card will be removed from your account.</p>
              <div className="flex gap-3">
                <button onClick={() => setDelId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
                <button onClick={() => { setCards(c => c.filter(cd => cd.id !== delId)); setDelId(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#ef4444', color: '#fff' }}>Remove</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
