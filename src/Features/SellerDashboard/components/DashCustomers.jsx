import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../store/useThemeStore";
import { useDashboard } from '../context/DashboardContext';
import { fmtFull } from '../utils/format';
import { Icon } from './DashIcon';

const TAG_STYLES = {
  vip:    { label: 'VIP',    bg: 'rgba(255,215,0,0.12)',  color: '#c49a00' },
  repeat: { label: 'Repeat', bg: 'rgba(0,80,212,0.08)',   color: '#0050d4' },
  new:    { label: 'New',    bg: 'rgba(16,185,129,0.1)',  color: '#059669' },
};

function CustomerTag({ tag }) {
  const s = TAG_STYLES[tag] || TAG_STYLES.new;
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function DashCustomers() {
  const { colors, isDark } = useTheme();
  const { customers: liveCustomers } = useDashboard();
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState('spent');
  const [selected, setSelected] = useState(null);

  const CUSTOMERS = liveCustomers ?? [];

  const filtered = CUSTOMERS
    .filter(c => {
      const matchTag = tagFilter === 'all' || c.tag === tagFilter;
      const matchSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      return matchTag && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'spent') return b.spent - a.spent;
      if (sortBy === 'orders') return b.orders - a.orders;
      return a.name.localeCompare(b.name);
    });

  const totalSpend = CUSTOMERS.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Customers</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', border: `1px solid ${colors.border.subtle}` }}>
            <Icon name="search" size={14} style={{ color: colors.text.tertiary }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
              className="bg-transparent outline-none text-sm w-36" style={{ color: colors.text.primary }} />
          </div>
        </div>
      </div>

      {/* Summary + filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Summary pills */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: `${CUSTOMERS.length} Total`, color: colors.text.secondary, bg: isDark ? colors.surface.tertiary : '#F3F4F6' },
            { label: `${CUSTOMERS.filter(c => c.tag === 'vip').length} VIP`, color: '#c49a00', bg: 'rgba(255,215,0,0.1)' },
            { label: `${CUSTOMERS.filter(c => c.tag === 'new').length} New`, color: '#059669', bg: 'rgba(16,185,129,0.1)' },
          ].map(pill => (
            <span key={pill.label} className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: pill.bg, color: pill.color }}>{pill.label}</span>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Tag filter */}
          {['all', 'vip', 'repeat', 'new'].map(t => (
            <motion.button key={t} onClick={() => setTagFilter(t)} whileTap={{ scale: 0.94 }}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize"
              style={tagFilter === t ? { background: colors.cta.primary, color: colors.cta.primaryText } : { background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
              {t}
            </motion.button>
          ))}

          {/* Sort */}
          <select onChange={e => setSortBy(e.target.value)} value={sortBy}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold outline-none cursor-pointer"
            style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary, border: `1px solid ${colors.border.subtle}` }}>
            <option value="spent">Sort: Most Spent</option>
            <option value="orders">Sort: Most Orders</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div layout className="rounded-2xl overflow-hidden shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ background: isDark ? colors.surface.tertiary : '#FAFAFA' }}>
                {['Customer', 'Tag', 'Orders', 'Total Spent', 'Last Purchase', 'Contact', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.border.subtle }}>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={7} className="px-6 py-14 text-center">
                      <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>No customers found</p>
                    </td>
                  </motion.tr>
                ) : filtered.map((c, i) => (
                  <motion.tr key={c.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,80,212,0.015)' }}
                    className="cursor-pointer transition-colors" onClick={() => setSelected(c)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><CustomerTag tag={c.tag} /></td>
                    <td className="px-6 py-4 text-sm font-bold" style={{ color: colors.text.primary }}>{c.orders}</td>
                    <td className="px-6 py-4 text-sm font-bold" style={{ color: colors.text.primary }}>{fmtFull(c.spent)}</td>
                    <td className="px-6 py-4 text-xs" style={{ color: colors.text.tertiary }}>{c.last}</td>
                    <td className="px-6 py-4 text-xs" style={{ color: colors.cta.primary }}>{c.email}</td>
                    <td className="px-6 py-4">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={e => { e.stopPropagation(); setSelected(c); }}
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

      {/* Customer detail panel */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div key="bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div key="panel"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm z-50 shadow-2xl overflow-y-auto"
              style={{ background: colors.surface.elevated, borderLeft: `1px solid ${colors.border.default}` }}>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg" style={{ color: colors.text.primary }}>Customer Profile</h3>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelected(null)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
                    <Icon name="x" size={16} />
                  </motion.button>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="text-center">
                    <p className="font-black text-lg" style={{ color: colors.text.primary }}>{selected.name}</p>
                    <p className="text-sm" style={{ color: colors.text.tertiary }}>{selected.email}</p>
                    <CustomerTag tag={selected.tag} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Orders', value: selected.orders },
                    { label: 'Total Spent', value: fmtFull(selected.spent) },
                    { label: 'Last Visit', value: selected.last },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB' }}>
                      <p className="text-base font-black" style={{ color: colors.text.primary }}>{s.value}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: colors.text.tertiary }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>
                  Send Message
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
