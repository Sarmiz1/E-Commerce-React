import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { BUYER_ORDERS } from '../data/buyerData';
import { fmtFull } from '../utils/fmt';
import { BIcon } from './BuyerIcon';
import { OrderStatusBadge, OrderTimeline } from './BuyerOverview';

const FILTERS = ['all', 'pending', 'shipped', 'delivered', 'cancelled'];

export default function BuyerOrders() {
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [reordered, setReordered] = useState({});

  const filtered = filter === 'all' ? BUYER_ORDERS : BUYER_ORDERS.filter(o => o.status === filter);

  const handleReorder = async (id) => {
    setReordered(r => ({ ...r, [id]: 'loading' }));
    await new Promise(res => setTimeout(res, 1000));
    setReordered(r => ({ ...r, [id]: 'done' }));
    setTimeout(() => setReordered(r => ({ ...r, [id]: null })), 2000);
  };

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? BUYER_ORDERS.length : BUYER_ORDERS.filter(o => o.status === f).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>My Orders</h2>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(f => (
          <motion.button key={f} onClick={() => setFilter(f)} whileTap={{ scale: 0.95 }}
            className="relative px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap capitalize"
            style={filter === f
              ? { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }
              : { background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
            {f === 'all' ? 'All' : f}
            <span className="ml-1.5 text-[9px] font-black"
              style={{ opacity: filter === f ? 0.7 : 0.5 }}>
              {counts[f]}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Order cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="empty"
              className="py-16 flex flex-col items-center gap-3">
              <BIcon name="package" size={36} style={{ color: colors.text.tertiary, opacity: 0.35 }} />
              <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>No orders here</p>
            </motion.div>
          ) : filtered.map((order, i) => {
            const isExpanded = expanded === order.id;
            return (
              <motion.div key={order.id} layout
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
                {/* Order row */}
                <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4">
                  {/* Product emoji */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6' }}>
                    {order.product.toLowerCase().includes('sneaker') || order.product.toLowerCase().includes('shoe') ? '👟'
                      : order.product.toLowerCase().includes('earbu') || order.product.toLowerCase().includes('watch') ? '🎧'
                      : '👕'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{order.product}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs font-mono" style={{ color: colors.text.tertiary }}>{order.id}</span>
                      <span className="text-xs" style={{ color: colors.text.tertiary }}>{order.date}</span>
                      <span className="text-sm font-black" style={{ color: colors.text.primary }}>{fmtFull(order.amount)}</span>
                    </div>
                    {order.eta && (
                      <p className="text-xs mt-1 font-semibold" style={{ color: '#667eea' }}>
                        🚚 {order.eta}
                      </p>
                    )}
                  </div>

                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="flex-shrink-0">
                    <BIcon name="chevron-down" size={18} style={{ color: colors.text.tertiary }} />
                  </motion.div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="overflow-hidden px-5 pb-5 space-y-5"
                      style={{ borderTop: `1px solid ${colors.border.subtle}` }}>

                      {/* Timeline */}
                      <div className="pt-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-4" style={{ color: colors.text.tertiary }}>Order Progress</p>
                        <OrderTimeline steps={order.timeline} currentStep={order.currentStep} />
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl" style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB' }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Delivery To</p>
                          <p className="text-xs font-semibold leading-relaxed" style={{ color: colors.text.primary }}>{order.address}</p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB' }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Payment</p>
                          <p className="text-xs font-semibold" style={{ color: colors.text.primary }}>{order.payment}</p>
                          <p className="text-[10px] mt-1 font-bold" style={{ color: '#059669' }}>✓ Secure Payment</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        {order.status === 'shipped' && (
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                            style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                            <BIcon name="truck" size={13} /> Track Live
                          </motion.button>
                        )}

                        {(order.status === 'delivered' || order.status === 'shipped') && (
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                            onClick={() => handleReorder(order.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                            style={{
                              background: reordered[order.id] === 'done' ? 'rgba(5,150,105,0.1)' : (isDark ? colors.surface.tertiary : '#F3F4F6'),
                              color: reordered[order.id] === 'done' ? '#059669' : colors.text.secondary,
                            }}>
                            {reordered[order.id] === 'loading' ? (
                              <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                className="w-3 h-3 border border-current border-t-transparent rounded-full block" /> Reordering…</>
                            ) : reordered[order.id] === 'done' ? (
                              <><BIcon name="check" size={13} /> Added to Cart!</>
                            ) : (
                              <><BIcon name="repeat" size={13} /> Buy Again</>
                            )}
                          </motion.button>
                        )}

                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                          style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
                          <BIcon name="download" size={13} /> Receipt
                        </motion.button>

                        {order.status === 'delivered' && (
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                            <BIcon name="refresh" size={13} /> Return
                          </motion.button>
                        )}

                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                          style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
                          <BIcon name="user" size={13} /> Contact Seller
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
