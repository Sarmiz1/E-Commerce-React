import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../Store/useThemeStore";
import { Icon } from './DashIcon';

function SettingsField({ label, defaultValue, type = 'text', placeholder }) {
  const { colors, isDark } = useTheme();
  const [value, setValue] = useState(defaultValue || '');
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: isDark ? colors.surface.tertiary : '#F9FAFB',
            border: `1.5px solid ${focused ? colors.cta.primary : colors.border.default}`,
            color: colors.text.primary,
            boxShadow: focused ? `0 0 0 3px ${colors.cta.primary}18` : 'none',
          }}
        />
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, children, delay = 0 }) {
  const { colors } = useTheme();
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-6 shadow-sm space-y-5"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
      <div className="flex items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
        <Icon name={icon} size={16} style={{ color: colors.cta.primary }} />
        <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{title}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

export default function DashSettings() {
  const { colors, isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Settings</h2>

      <SettingsSection title="Store Information" icon="box" delay={0}>
        <SettingsField label="Store Name" defaultValue="Ade's Store" />
        <SettingsField label="Store Description" defaultValue="Premium footwear and apparel." />
        <SettingsField label="Business Email" defaultValue="seller@woosho.com" type="email" />
        <SettingsField label="Phone Number" defaultValue="+234 801 234 5678" type="tel" />
      </SettingsSection>

      <SettingsSection title="Payment Details" icon="wallet" delay={0.1}>
        <SettingsField label="Bank Name" defaultValue="GTBank" />
        <SettingsField label="Account Number" defaultValue="0123456789" />
        <SettingsField label="Account Name" defaultValue="Adebayo James" />
      </SettingsSection>

      <SettingsSection title="Notifications" icon="bell" delay={0.2}>
        {[
          { label: 'New Order Alerts', desc: 'Get notified when a new order is placed', default: true },
          { label: 'Low Stock Alerts', desc: 'Notify when products fall below 5 units', default: true },
          { label: 'Payout Confirmations', desc: 'Receive confirmation when payouts are sent', default: true },
          { label: 'Review Notifications', desc: 'Alert when customers leave a review', default: false },
        ].map(item => <NotifToggleRow key={item.label} item={item} />)}
      </SettingsSection>

      <SettingsSection title="Security" icon="settings" delay={0.3}>
        <SettingsField label="Current Password" type="password" placeholder="Enter current password" />
        <SettingsField label="New Password" type="password" placeholder="New password (min 8 chars)" />
        <SettingsField label="Confirm Password" type="password" placeholder="Repeat new password" />
      </SettingsSection>

      {/* Save button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave} disabled={saving}
          className="px-8 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all"
          style={{
            background: saved ? colors.state.success : colors.cta.primary,
            color: saved ? '#fff' : colors.cta.primaryText,
            opacity: saving ? 0.7 : 1,
          }}>
          {saving ? (
            <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" />
              Saving...</>
          ) : saved ? (
            <><Icon name="check" size={15} /> Saved!</>
          ) : 'Save All Changes'}
        </motion.button>
      </motion.div>
    </div>
  );
}

function NotifToggleRow({ item }) {
  const { colors, isDark } = useTheme();
  const [enabled, setEnabled] = useState(item.default);

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 mr-4">
        <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>{item.label}</p>
        <p className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>{item.desc}</p>
      </div>
      <motion.button onClick={() => setEnabled(e => !e)}
        className="relative w-11 h-6 rounded-full flex-shrink-0"
        style={{ background: enabled ? colors.cta.primary : colors.border.strong }}>
        <motion.div animate={{ x: enabled ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
      </motion.button>
    </div>
  );
}
