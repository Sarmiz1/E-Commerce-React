import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { BUYER_PROFILE } from '../data/buyerData';
import { BIcon } from './BuyerIcon';

function Field({ label, defaultValue, type = 'text', placeholder }) {
  const { colors, isDark } = useTheme();
  const [value, setValue] = useState(defaultValue || '');
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>{label}</label>
      <input type={type} value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: isDark ? colors.surface.tertiary : '#F9FAFB',
          border: `1.5px solid ${focused ? '#667eea' : colors.border.default}`,
          color: colors.text.primary,
          boxShadow: focused ? '0 0 0 3px rgba(102,126,234,0.12)' : 'none',
        }} />
    </div>
  );
}

function Section({ title, icon, children, delay }) {
  const { colors } = useTheme();
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-6 shadow-sm space-y-5"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
      <div className="flex items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
        <BIcon name={icon} size={16} style={{ color: '#667eea' }} />
        <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{title}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

function Toggle({ label, desc, defaultVal }) {
  const { colors } = useTheme();
  const [on, setOn] = useState(defaultVal);
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>{desc}</p>
      </div>
      <motion.button onClick={() => setOn(v => !v)}
        className="relative w-11 h-6 rounded-full flex-shrink-0"
        style={{ background: on ? '#667eea' : colors.border.strong }}>
        <motion.div animate={{ x: on ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
      </motion.button>
    </div>
  );
}

export default function BuyerSettings() {
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Account Settings</h2>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-lg">S</div>
        <div>
          <button className="text-sm font-bold px-4 py-2 rounded-xl" style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea' }}>Change Photo</button>
          <p className="text-xs mt-1.5" style={{ color: colors.text.tertiary }}>JPG, PNG up to 2MB</p>
        </div>
      </motion.div>

      <Section title="Personal Information" icon="user" delay={0.05}>
        <Field label="Full Name" defaultValue={BUYER_PROFILE.name} />
        <Field label="Email Address" defaultValue={BUYER_PROFILE.email} type="email" />
        <Field label="Phone Number" defaultValue={BUYER_PROFILE.phone} type="tel" />
      </Section>

      <Section title="Preferences & AI" icon="sparkle" delay={0.12}>
        <Toggle label="AI Shopping Suggestions" desc="Let AI recommend products based on your taste" defaultVal={true} />
        <Toggle label="Price Drop Alerts" desc="Notify me when wishlist items drop in price" defaultVal={true} />
        <Toggle label="Order Status Updates" desc="SMS and email notifications for deliveries" defaultVal={true} />
        <Toggle label="Promotions & Deals" desc="Receive exclusive offers tailored to you" defaultVal={false} />
      </Section>

      <Section title="Security" icon="credit-card" delay={0.18}>
        <Field label="Current Password" type="password" placeholder="Enter current password" />
        <Field label="New Password" type="password" placeholder="At least 8 characters" />
        <Field label="Confirm New Password" type="password" placeholder="Repeat new password" />
      </Section>

      {/* Save */}
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={save} disabled={saving}
        className="px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
        style={{ background: saved ? '#059669' : 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', opacity: saving ? 0.75 : 1 }}>
        {saving
          ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" /> Saving…</>
          : saved ? <><BIcon name="check" size={15} /> Saved!</>
          : 'Save Changes'}
      </motion.button>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="rounded-2xl p-5 shadow-sm" style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.03)' }}>
        <p className="font-bold text-sm mb-1" style={{ color: '#ef4444' }}>Danger Zone</p>
        <p className="text-xs mb-4" style={{ color: colors.text.tertiary }}>Permanently delete your account and all associated data. This cannot be undone.</p>
        <button onClick={() => setDeleteConfirm(true)}
          className="text-sm font-bold px-4 py-2 rounded-xl border"
          style={{ borderColor: '#ef4444', color: '#ef4444' }}>Delete Account</button>
      </motion.div>
    </div>
  );
}
