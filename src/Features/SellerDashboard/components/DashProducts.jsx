import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../Store/useThemeStore";
import { useDashboard } from '../context/DashboardContext';
import { fmtFull } from '../utils/format';
import { Icon } from './DashIcon';
import { StatusBadge } from './DashOverview';

const FILTERS = ['all', 'active', 'draft', 'out_of_stock'];

function ProductAvatar({ name }) {
  const hue = name.charCodeAt(0) * 7 % 360;
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('');
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
      style={{ background: `hsl(${hue}, 65%, 52%)` }}>
      {initials}
    </div>
  );
}

function StockBar({ stock, max = 50 }) {
  const { colors } = useTheme();
  const pct = Math.min(100, (stock / max) * 100);
  const color = stock === 0 ? colors.state.error : stock < 10 ? colors.state.warning : colors.state.success;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: colors.surface.tertiary }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color }}>{stock}</span>
    </div>
  );
}

export default function DashProducts() {
  const { colors, isDark } = useTheme();
  const { products: liveProducts, deleteProduct, loading } = useDashboard();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState(1);

  const products = liveProducts ?? [];

  const confirmDelete = useCallback(async (id) => {
    await deleteProduct(id);
    setDeleteId(null);
  }, [deleteProduct]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d * -1);
    else { setSortBy(col); setSortDir(1); }
  };

  const filtered = products
    .filter(p => {
      const matchFilter = filter === 'all' || p.status === filter;
      const matchSearch = search === '' || (p.name || '').toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      const va = sortBy === 'name' ? (a.name || '') : sortBy === 'price' ? (a.price || 0) : sortBy === 'stock' ? (a.stock || 0) : (a.sales || 0);
      const vb = sortBy === 'name' ? (b.name || '') : sortBy === 'price' ? (b.price || 0) : sortBy === 'stock' ? (b.stock || 0) : (b.sales || 0);
      return typeof va === 'string' ? va.localeCompare(vb) * sortDir : (va - vb) * sortDir;
    });

  const filterLabel = { all: `All (${products.length})`, active: 'Active', draft: 'Draft', out_of_stock: 'Out of Stock' };

  const SortHeader = ({ col, label }) => {
    const active = sortBy === col;
    return (
      <th className="px-6 py-3 text-left cursor-pointer group" onClick={() => toggleSort(col)}>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: active ? colors.cta.primary : colors.text.tertiary }}>{label}</span>
          <motion.span animate={{ rotate: active && sortDir === -1 ? 180 : 0 }} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.cta.primary }}>
            <Icon name="arrow-up" size={10} />
          </motion.span>
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Products</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', border: `1px solid ${colors.border.subtle}` }}>
            <Icon name="search" size={14} style={{ color: colors.text.tertiary }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              className="bg-transparent outline-none text-sm w-36" style={{ color: colors.text.primary }} />
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm"
            style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>
            <Icon name="plus" size={16} /> Add New Product
          </motion.button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <motion.button key={f} onClick={() => setFilter(f)} whileTap={{ scale: 0.95 }}
            className="relative px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap capitalize transition-colors"
            style={filter === f ? { background: colors.cta.primary, color: colors.cta.primaryText } : { background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
            {filterLabel[f]}
          </motion.button>
        ))}
      </div>

      {/* Table */}
      <motion.div layout className="rounded-2xl overflow-hidden shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ background: isDark ? colors.surface.tertiary : '#FAFAFA' }}>
                <SortHeader col="name" label="Product" />
                <SortHeader col="price" label="Price" />
                <SortHeader col="stock" label="Stock" />
                <SortHeader col="sales" label="Sales" />
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Status</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.border.subtle }}>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Icon name="box" size={32} style={{ color: colors.text.tertiary, opacity: 0.4 }} />
                        <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>No products found</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : filtered.map((p, i) => (
                  <motion.tr key={p.id} layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.97 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,80,212,0.015)' }}
                    className="transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProductAvatar name={p.name} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>{p.name}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: colors.text.tertiary }}>ID #{String(p.id).padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold" style={{ color: colors.text.primary }}>{fmtFull(p.price)}</td>
                    <td className="px-6 py-4"><StockBar stock={p.stock} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold" style={{ color: colors.text.primary }}>{p.sales}</span>
                        <span className="text-[10px]" style={{ color: colors.text.tertiary }}>sold</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => setEditId(p.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: isDark ? 'rgba(144,171,255,0.08)' : 'rgba(0,80,212,0.06)', color: colors.cta.primary }}>
                          <Icon name="edit" size={14} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteId(p.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: isDark ? 'rgba(255,94,0,0.08)' : 'rgba(220,38,38,0.06)', color: colors.state.error }}>
                          <Icon name="trash" size={14} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      {createPortal(
        <AnimatePresence>
          {deleteId && (
            <>
              <motion.div key="del-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
              <motion.div key="del-modal"
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="w-80 rounded-2xl p-6 shadow-2xl pointer-events-auto"
                style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: colors.state.errorBg }}>
                  <Icon name="trash" size={22} style={{ color: colors.state.error }} />
                </div>
                <h4 className="font-black text-center text-lg mb-1" style={{ color: colors.text.primary }}>Delete Product?</h4>
                <p className="text-sm text-center mb-6" style={{ color: colors.text.tertiary }}>This action cannot be undone. The product will be permanently removed.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
                    style={{ borderColor: colors.border.default, color: colors.text.secondary }}>Cancel</button>
                  <button onClick={() => confirmDelete(deleteId)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: colors.state.error, color: '#fff' }}>Delete</button>
                </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
