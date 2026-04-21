import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { useDashboard, NAV_ITEMS } from '../context/DashboardContext';
import { Icon } from './DashIcon';

export default function DashSidebar() {
  const { colors, isDark } = useTheme();
  const { activePage, setActivePage, sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useDashboard();

  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: isDark ? colors.surface.secondary : '#FAFAFA', borderRight: `1px solid ${colors.border.subtle}` }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: colors.cta.primary }}>W</div>
              <span className="font-black text-lg tracking-tight" style={{ color: colors.text.primary }}>Woosho</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: isDark ? 'rgba(144,171,255,0.15)' : '#EEF2FF', color: colors.cta.primary }}>Seller</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setSidebarCollapsed(c => !c)}
          className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg transition-colors hover:opacity-70"
          style={{ color: colors.text.tertiary }}
        >
          <Icon name={sidebarCollapsed ? 'chevron-right' : 'chevron-left'} size={18} />
        </button>
        {/* Mobile close */}
        <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden" style={{ color: colors.text.tertiary }}>
          <Icon name="x" size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setMobileSidebarOpen(false); }}
              title={sidebarCollapsed ? item.label : ''}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left relative group"
              style={{
                background: isActive ? (isDark ? 'rgba(144,171,255,0.12)' : 'rgba(0,80,212,0.07)') : 'transparent',
                color: isActive ? colors.cta.primary : colors.text.secondary,
              }}
            >
              {isActive && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ background: colors.cta.primary }} />
              )}
              <Icon name={item.icon} size={19} style={{ flexShrink: 0, color: isActive ? colors.cta.primary : colors.text.tertiary }} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Store profile at bottom */}
      <div className="p-3" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">A</div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: colors.text.primary }}>Ade's Store</p>
                <p className="text-[11px] truncate" style={{ color: colors.text.tertiary }}>Pro Seller · Active</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:block flex-shrink-0 overflow-hidden h-screen sticky top-0"
        style={{ width: sidebarWidth }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-[240px] lg:hidden overflow-hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
