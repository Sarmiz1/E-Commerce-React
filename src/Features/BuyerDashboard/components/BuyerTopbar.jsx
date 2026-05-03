import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../store/useThemeStore";
import { useBuyer, BUYER_NAV } from '../context/BuyerContext';
import { BIcon } from './BuyerIcon';
import { fmtFull } from '../utils/fmt';

export default function BuyerTopbar() {
  const { colors, isDark, toggle } = useTheme();
  const { page, setPage, setSidebarOpen, notifs, unreadCount, cart, cartTotal, removeFromCart } = useBuyer();
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartOpen, setCartOpen]     = useState(false);
  const [search, setSearch]           = useState('');

  const unread = unreadCount ?? 0;
  const BUYER_NOTIFICATIONS = notifs ?? [];
  const pageLabel = BUYER_NAV.find(n => n.id === page)?.label || 'Dashboard';

  const NOTIF_COLOR = {
    shipping: '#667eea', deal: '#059669', stock: '#f59e0b',
    brand: '#8b5cf6', delivered: '#059669',
  };

  return (
    <header className="flex items-center gap-4 h-16 px-4 lg:px-8 flex-shrink-0 sticky top-0 z-30"
      style={{
        background: isDark ? `${colors.surface.primary}f0` : 'rgba(255,255,255,0.9)',
        borderBottom: `1px solid ${colors.border.subtle}`,
        backdropFilter: 'blur(16px)',
      }}>
      {/* Mobile burger */}
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg" style={{ color: colors.text.secondary }}>
        <BIcon name="menu" size={20} />
      </button>

      {/* Page title */}
      <p className="font-bold text-base hidden sm:block" style={{ color: colors.text.primary }}>{pageLabel}</p>

      {/* Search */}
      <div className="flex-1 max-w-sm mx-4 flex items-center gap-2 px-4 py-2 rounded-2xl"
        style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', border: `1px solid ${colors.border.subtle}` }}>
        <BIcon name="search" size={15} style={{ color: colors.text.tertiary }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products, orders..."
          className="bg-transparent outline-none text-sm flex-1"
          style={{ color: colors.text.primary }}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Cart with hover dropdown */}
        <div className="relative"
          onMouseEnter={() => setCartOpen(true)}
          onMouseLeave={() => setCartOpen(false)}
        >
          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
            <BIcon name="cart" size={17} />
            {cart.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-black text-white rounded-full flex items-center justify-center"
                style={{ background: '#667eea' }}>{cart.length}</span>
            )}
          </button>

          <AnimatePresence>
            {cartOpen && (
              <motion.div
                key="cart-dropdown"
                initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
                style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}>
                
                {/* Invisible bridge to prevent mouse leave in the gap */}
                <div className="absolute -top-3 left-0 right-0 h-3" />
                
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <span className="font-bold text-sm" style={{ color: colors.text.primary }}>Shopping Cart</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea' }}>{cart.length} items</span>
                </div>

                {/* Items */}
                {cart.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <BIcon name="cart" size={28} style={{ color: colors.text.tertiary, opacity: 0.3, margin: '0 auto 8px' }} />
                    <p className="text-sm" style={{ color: colors.text.tertiary }}>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {cart.map(item => {
                      const hue = item.name.charCodeAt(0) * 7 % 360;
                      return (
                        <div key={item.id} className="px-4 py-3 flex items-center gap-3 hover:opacity-80 transition-opacity"
                          style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-black text-white"
                            style={{ background: `hsl(${hue}, 55%, 50%)` }}>
                            {item.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: colors.text.primary }}>{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold" style={{ color: '#667eea' }}>{fmtFull(item.price)}</span>
                              {item.size && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: isDark ? 'rgba(102,126,234,0.1)' : '#EEF2FF', color: '#667eea' }}>{item.size}</span>}
                              <span className="text-[10px]" style={{ color: colors.text.tertiary }}>×{item.qty}</span>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 hover:opacity-70"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                            <BIcon name="x" size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer with totals + CTAs */}
                {cart.length > 0 && (
                  <div className="px-4 py-3" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold" style={{ color: colors.text.tertiary }}>Subtotal</span>
                      <span className="text-base font-black" style={{ color: colors.text.primary }}>{fmtFull(cartTotal)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setPage('orders')}
                        className="flex-1 py-2 rounded-xl text-xs font-bold border"
                        style={{ borderColor: colors.border.default, color: colors.text.secondary }}>
                        View All
                      </button>
                      <motion.button whileTap={{ scale: 0.96 }}
                        className="flex-[2] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff' }}>
                        <BIcon name="cart" size={13} /> Checkout
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme */}
        <button onClick={toggle} className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
          <BIcon name={isDark ? 'sun' : 'moon'} size={16} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
            <BIcon name="bell" size={17} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-black text-white rounded-full flex items-center justify-center"
                style={{ background: '#ef4444' }}>{unread}</span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                key="notif-dropdown"
                initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
                style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <span className="font-bold text-sm" style={{ color: colors.text.primary }}>Notifications</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{unread} new</span>
                </div>
                {BUYER_NOTIFICATIONS.slice(0, 4).map(n => (
                  <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:opacity-80 transition-opacity"
                    style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${NOTIF_COLOR[n.type]}15` }}>
                      <BIcon name={n.type === 'shipping' ? 'truck' : n.type === 'deal' ? 'save' : n.type === 'stock' ? 'bell' : n.type === 'delivered' ? 'check' : 'sparkle'} size={14} style={{ color: NOTIF_COLOR[n.type] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-tight" style={{ color: colors.text.primary, fontWeight: n.unread ? 600 : 400 }}>{n.title}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: colors.text.tertiary }}>{n.sub}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: colors.text.tertiary }}>{n.time}</p>
                    </div>
                    {n.unread && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#667eea' }} />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
            S
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                key="profile-dropdown"
                initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden shadow-2xl z-50"
                style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}>
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <p className="font-bold text-sm" style={{ color: colors.text.primary }}>Samuel Okafor</p>
                  <p className="text-xs" style={{ color: colors.text.tertiary }}>samuel@email.com</p>
                </div>
                {[
                  ['user',    'My Account',   'settings'],
                  ['package', 'My Orders',    'orders'],
                  ['heart',   'Wishlist',     'wishlist'],
                  ['log-out', 'Logout',       null],
                ].map(([ic, lbl, nav]) => (
                  <button key={lbl} onClick={() => nav && setPage(nav)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:opacity-70 transition-opacity"
                    style={{ color: lbl === 'Logout' ? '#ef4444' : colors.text.secondary }}>
                    <BIcon name={ic} size={15} /> {lbl}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
