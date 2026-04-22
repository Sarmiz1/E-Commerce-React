import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { useDashboard } from '../context/DashboardContext';
import { fmtFull } from '../utils/format';
import { Icon } from './DashIcon';
import { StatusBadge } from './DashOverview';

const STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered'];

export default function DashOrders() {
  const { colors, isDark } = useTheme();
  const { orders: liveOrders, updateOrderStatus, loading } = useDashboard();
  const [activeStatus, setActiveStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState(null); // null = use live data
  const [pendingStatus, setPendingStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  // merge local optimistic updates with live data
  const baseOrders = orders ?? liveOrders ?? [];

  const filtered = baseOrders.filter(o => {
    const matchStatus = activeStatus === 'all' || o.status === activeStatus;
    const matchSearch = search === '' || (o.customer || '').toLowerCase().includes(search.toLowerCase()) || (o.id || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openOrder = useCallback((order) => {
    setSelectedOrder(order);
    setPendingStatus(order.status);
    setSaved(false);
  }, []);

  const saveStatus = useCallback(async () => {
    if (!pendingStatus || pendingStatus === selectedOrder.status) return;
    setSaving(true);
    const result = await updateOrderStatus(selectedOrder.id, pendingStatus);
    if (result?.success) {
      // optimistic update
      setOrders(prev => (prev ?? liveOrders ?? []).map(o =>
        o.id === selectedOrder.id ? { ...o, status: pendingStatus } : o
      ));
      setSelectedOrder(prev => ({ ...prev, status: pendingStatus }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    }
    setSaving(false);
  }, [pendingStatus, selectedOrder, updateOrderStatus, liveOrders]);

  const countsByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'all' ? baseOrders.length : baseOrders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Order Management</h2>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', border: `1px solid ${colors.border.subtle}` }}>
            <Icon name="search" size={14} style={{ color: colors.text.tertiary }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
              className="bg-transparent outline-none text-sm w-36" style={{ color: colors.text.primary }} />
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
            <Icon name="download" size={15} /> Export CSV
          </motion.button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUSES.map(s => (
          <motion.button key={s} onClick={() => setActiveStatus(s)}
            whileTap={{ scale: 0.95 }}
            className="relative px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap capitalize transition-colors"
            style={activeStatus === s ? { background: colors.cta.primary, color: colors.cta.primaryText } : { background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
            {s === 'all' ? 'All' : s}
            {countsByStatus[s] > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                style={{ background: activeStatus === s ? 'rgba(255,255,255,0.25)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)') }}>
                {countsByStatus[s]}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Table */}
      <motion.div layout className="rounded-2xl overflow-hidden shadow-sm"
        style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ background: isDark ? colors.surface.tertiary : '#FAFAFA' }}>
                {['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.border.subtle }}>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Icon name="package" size={32} style={{ color: colors.text.tertiary, opacity: 0.4 }} />
                        <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>No orders found</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : filtered.map((order, i) => (
                  <motion.tr key={order.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,80,212,0.015)' }}
                    className="cursor-pointer transition-colors"
                    onClick={() => openOrder(order)}>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold" style={{ color: colors.cta.primary }}>{order.id}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold" style={{ color: colors.text.primary }}>{order.customer}</td>
                    <td className="px-6 py-4 text-sm max-w-[160px]" style={{ color: colors.text.secondary }}>
                      <span className="truncate block">{order.product}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold" style={{ color: colors.text.primary }}>{fmtFull(order.amount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-xs" style={{ color: colors.text.tertiary }}>{order.date}</td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => openOrder(order)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ color: colors.cta.primary, background: isDark ? 'rgba(144,171,255,0.08)' : 'rgba(0,80,212,0.06)' }}>
                        <Icon name="eye" size={13} /> View
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>

      {/* Order detail slide-in panel */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 w-full max-w-[420px] z-50 shadow-2xl overflow-y-auto"
            style={{ background: colors.surface.elevated, borderLeft: `1px solid ${colors.border.default}` }}>
            <div className="p-6 space-y-6">
              {/* Panel header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold" style={{ color: colors.cta.primary }}>{selectedOrder.id}</span>
                  <h3 className="font-black text-lg mt-0.5" style={{ color: colors.text.primary }}>Order Details</h3>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedOrder(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
                  <Icon name="x" size={16} />
                </motion.button>
              </div>

              {/* Order info */}
              <div className="space-y-0 rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.border.subtle}` }}>
                {[
                  { label: 'Customer', value: selectedOrder.customer, icon: 'users' },
                  { label: 'Product', value: selectedOrder.product, icon: 'box' },
                  { label: 'Amount', value: fmtFull(selectedOrder.amount), icon: 'trending-up' },
                  { label: 'Date', value: selectedOrder.date, icon: 'settings' },
                ].map((row, i) => (
                  <motion.div key={row.label} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center justify-between px-4 py-3.5"
                    style={{ borderBottom: i < 3 ? `1px solid ${colors.border.subtle}` : 'none', background: i % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)') }}>
                    <span className="text-sm flex items-center gap-2" style={{ color: colors.text.tertiary }}>
                      <Icon name={row.icon} size={14} style={{ color: colors.text.tertiary }} />
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>{row.value}</span>
                  </motion.div>
                ))}
              </div>

              {/* Current status */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Current Status</p>
                <StatusBadge status={selectedOrder.status} />
              </div>

              {/* Status timeline */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: colors.text.tertiary }}>Update Status</p>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5" style={{ background: colors.border.default }} />

                  <div className="space-y-2">
                    {STATUS_FLOW.map((s, i) => {
                      const currentIdx = STATUS_FLOW.indexOf(selectedOrder.status);
                      const isCompleted = i <= currentIdx;
                      const isPending = s === pendingStatus;

                      return (
                        <motion.button key={s} onClick={() => setPendingStatus(s)}
                          whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center gap-4 py-2.5 rounded-xl px-3 text-left transition-colors"
                          style={{ background: isPending ? (isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.06)') : 'transparent' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all"
                            style={{
                              background: isPending ? colors.cta.primary : isCompleted ? colors.state.successBg : (isDark ? colors.surface.tertiary : '#F3F4F6'),
                              border: `2px solid ${isPending ? colors.cta.primary : isCompleted ? colors.state.success : colors.border.default}`,
                            }}>
                            {isCompleted
                              ? <Icon name="check" size={14} style={{ color: isPending ? colors.cta.primaryText : colors.state.success }} />
                              : <span className="text-[10px] font-black" style={{ color: colors.text.tertiary }}>{i + 1}</span>
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold capitalize" style={{ color: isPending ? colors.cta.primary : isCompleted ? colors.text.primary : colors.text.tertiary }}>{s}</p>
                          </div>
                          {isPending && <Icon name="chevron-right" size={14} style={{ color: colors.cta.primary }} />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Save button */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={saveStatus}
                disabled={saving || pendingStatus === selectedOrder.status}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: saved ? colors.state.success : pendingStatus === selectedOrder.status ? (isDark ? colors.surface.tertiary : '#F3F4F6') : colors.cta.primary,
                  color: saved ? '#fff' : pendingStatus === selectedOrder.status ? colors.text.tertiary : colors.cta.primaryText,
                  opacity: saving ? 0.7 : 1,
                }}>
                {saving ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" />
                    Saving...
                  </>
                ) : saved ? (
                  <><Icon name="check" size={16} /> Status Updated!</>
                ) : (
                  'Save Changes'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
