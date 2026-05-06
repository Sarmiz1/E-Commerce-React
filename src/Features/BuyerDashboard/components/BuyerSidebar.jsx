import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../Store/useThemeStore";
import { useBuyer, BUYER_NAV } from '../context/BuyerContext';
import { BIcon } from './BuyerIcon';
import { Logo } from '../../../components/Ui/Logo';

// ─── Sidebar content (extracted to avoid remount on parent re-render) ─────────
function SidebarContent({ mobileMode, collapsed, toggleCollapsed, setSidebarOpen, toggleSidebar, page, setPage, colors, isDark, unread, profile, stats }) {
  return (
    <div className="flex flex-col h-full" style={{
      background: isDark ? colors.surface.secondary : '#FAFBFF',
      borderRight: `1px solid ${colors.border.subtle}`,
      height: '100%',
    }}>
      {/* ── Logo row ── */}
      <div className="flex items-center justify-between px-4 py-5"
        style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
        <AnimatePresence mode="wait">
          {(collapsed && !mobileMode) ? (
            <motion.div key="logo-icon" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center">
              <Logo variant="icon" isDark={isDark} size={11} />
            </motion.div>
          ) : (
            <motion.div key="logo-full" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 ml-1">
              <Logo size={10} variant="wordmark" isDark={isDark} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop collapse toggle */}
        <button onClick={toggleCollapsed}
          className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg transition-colors hover:opacity-60"
          style={{ color: colors.text.tertiary }}>
          <BIcon name={collapsed ? 'chevron-right' : 'chevron-left'} size={16} />
        </button>

        {/* Mobile close */}
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden"
          style={{ color: colors.text.tertiary }}>
          <BIcon name="x" size={17} />
        </button>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group mb-2"
          style={{
            background: isDark ? 'rgba(102,126,234,0.06)' : 'rgba(102,126,234,0.04)',
            color: colors.text.secondary,
            borderBottom: `1px solid ${colors.border.subtle}`,
          }}
          title={collapsed ? 'Back to Home' : ''}
        >
          <BIcon name="home" size={18} style={{ flexShrink: 0, color: colors.text.tertiary }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span key="home-lbl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold whitespace-nowrap">
                Back to Home
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {BUYER_NAV.map(item => {
          const isActive = page === item.id;
          return (
            <button key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              title={collapsed ? item.label : ''}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left relative"
              style={{
                background: isActive
                  ? (isDark ? 'rgba(102,126,234,0.12)' : 'rgba(102,126,234,0.08)')
                  : 'transparent',
                color: isActive ? '#667eea' : colors.text.secondary,
              }}>

              {isActive && (
                <motion.div layoutId="buyer-nav-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: 'linear-gradient(180deg, #667eea, #764ba2)' }} />
              )}

              <div className="relative flex-shrink-0">
                <BIcon name={item.icon} size={18}
                  style={{ color: isActive ? '#667eea' : colors.text.tertiary }} />
                {item.id === 'notifs' && unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center"
                    style={{ background: '#ef4444' }}>{unread}</span>
                )}
              </div>

              <AnimatePresence>
                {(!collapsed || mobileMode) && (
                  <motion.div key={`label-${item.id}`}
                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-semibold truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff' }}>
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl"
          style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(102,126,234,0.04)' }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">{(profile?.full_name?.charAt(0) || profile?.name?.charAt(0) || 'B').toUpperCase()}</div>
          <AnimatePresence>
            {(!collapsed || mobileMode) && (
              <motion.div key="profile-text"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: colors.text.primary }}>{profile?.full_name || profile?.name || 'Buyer'}</p>
                <p className="text-[10px] truncate" style={{ color: colors.text.tertiary }}>{(stats?.rewardPoints || 0).toLocaleString()} reward pts ⭐</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function BuyerSidebar({ mobileMode = false }) {
  const { colors, isDark } = useTheme();
  const { page, setPage, collapsed, toggleCollapsed, sidebarOpen, setSidebarOpen, toggleSidebar, unreadCount, profile, stats } = useBuyer();
  const unread = unreadCount ?? 0;
  
  // Mobile mode is always full width, desktop depends on collapsed state
  const w = mobileMode ? '100%' : (collapsed ? 68 : 236);

  const sharedProps = { mobileMode, collapsed, toggleCollapsed, setSidebarOpen, toggleSidebar, page, setPage, colors, isDark, unread, profile, stats };

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className={`${mobileMode ? 'flex' : 'hidden lg:flex'} flex-col flex-shrink-0 h-screen overflow-hidden sticky top-0`}
      style={{ width: w }}>
      <SidebarContent {...sharedProps} />
    </motion.aside>
  );
}
