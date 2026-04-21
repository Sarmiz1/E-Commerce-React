import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { useDashboard } from '../context/DashboardContext';
import { Icon } from './DashIcon';
import { fmt } from '../utils/format';

const NOTIFICATIONS = [
  { id: 1, type: 'order',   text: 'New order #WOO-8822 received', time: '2 min ago', unread: true },
  { id: 2, type: 'stock',   text: 'Running Pro Max is low on stock (3 left)', time: '1 hr ago', unread: true },
  { id: 3, type: 'payout',  text: 'Payout of ₦200,000 processed', time: '3 hrs ago', unread: false },
  { id: 4, type: 'review',  text: 'New 5★ review on Stealth Sneakers X1', time: '5 hrs ago', unread: false },
];

export default function DashTopbar() {
  const { colors, isDark, toggle } = useTheme();
  const { setMobileSidebarOpen, activePage } = useDashboard();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const pageTitle = {
    overview: 'Overview', orders: 'Orders', products: 'Products', analytics: 'Analytics',
    customers: 'Customers', wallet: 'Wallet', marketing: 'Marketing', reviews: 'Reviews', settings: 'Settings',
  }[activePage] || 'Dashboard';

  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <header className="flex items-center gap-4 h-16 px-4 lg:px-8 flex-shrink-0 sticky top-0 z-30" style={{ background: isDark ? `${colors.surface.primary}f0` : `${colors.surface.primary}f0`, borderBottom: `1px solid ${colors.border.subtle}`, backdropFilter: 'blur(12px)' }}>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg" style={{ color: colors.text.secondary }}>
        <Icon name="menu" size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-lg font-bold" style={{ color: colors.text.primary }}>{pageTitle}</h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-52" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', border: `1px solid ${colors.border.subtle}` }}>
        <Icon name="search" size={15} style={{ color: colors.text.tertiary }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-transparent border-none outline-none flex-1 text-sm"
          style={{ color: colors.text.primary }}
        />
      </div>

      {/* Wallet badge */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: isDark ? 'rgba(144,171,255,0.08)' : 'rgba(0,80,212,0.06)', border: `1px solid ${isDark ? 'rgba(144,171,255,0.15)' : 'rgba(0,80,212,0.12)'}` }}>
        <Icon name="wallet" size={15} style={{ color: colors.cta.primary }} />
        <span className="text-sm font-bold" style={{ color: colors.cta.primary }}>{fmt(782000)}</span>
      </div>

      {/* Theme toggle */}
      <button onClick={toggle} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
        <Icon name={isDark ? 'sun' : 'moon'} size={16} />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }} className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
          <Icon name="bell" size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ background: colors.state.error }}>{unreadCount}</span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
              style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                <span className="font-bold text-sm" style={{ color: colors.text.primary }}>Notifications</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: colors.state.errorBg, color: colors.state.error }}>{unreadCount} new</span>
              </div>
              <div className="divide-y" style={{ borderColor: colors.border.subtle }}>
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} className="px-4 py-3 flex items-start gap-3 transition-colors hover:opacity-80">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0`} style={{ background: n.unread ? colors.cta.primary : 'transparent', border: n.unread ? 'none' : `1px solid ${colors.border.default}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug" style={{ color: colors.text.primary, fontWeight: n.unread ? 600 : 400 }}>{n.text}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: colors.text.tertiary }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative">
        <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">A</div>
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden shadow-2xl z-50"
              style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                <p className="font-bold text-sm" style={{ color: colors.text.primary }}>Ade's Store</p>
                <p className="text-xs" style={{ color: colors.text.tertiary }}>seller@woosho.com</p>
              </div>
              {[['settings', 'Settings'], ['settings', 'Store Settings'], ['log-out', 'Logout']].map(([ic, label]) => (
                <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:opacity-80" style={{ color: label === 'Logout' ? colors.state.error : colors.text.secondary }}>
                  <Icon name={ic} size={16} />
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
