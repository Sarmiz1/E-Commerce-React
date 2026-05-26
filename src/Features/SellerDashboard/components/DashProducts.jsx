import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from "../../../Store/useThemeStore";
import { useDashboard } from '../context/DashboardContext';
import { fmtFull } from '../utils/format';
import { Icon } from './DashIcon';
import { StatusBadge } from './DashOverview';
import {
  productSchema,
  productDefaults,
  emptyVariant,
  CATEGORIES,
  SIZES,
  CURRENCIES,
} from '../utils/productSchema';

const FILTERS = ['all', 'active', 'draft', 'out_of_stock'];

// ─── Mini Components ──────────────────────────────────────────────────────────

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

// ─── Image Upload Zone ─────────────────────────────────────────────────────────

function ImageUploadZone({ label, accept = 'image/*', multiple = false, files, onChange, colors, isDark, hint }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback((incoming) => {
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;
    onChange(multiple ? arr : arr[0]);
  }, [multiple, onChange]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Normalise to array for preview
  const previews = files
    ? multiple
      ? Array.isArray(files) ? files : []
      : [files]
    : [];

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>
        {label}
      </label>
      {hint && <p className="text-[10px] mb-2" style={{ color: colors.text.tertiary }}>{hint}</p>}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all"
        style={{
          borderColor: dragging ? colors.cta.primary : colors.border.default,
          background: dragging
            ? `${colors.cta.primary}11`
            : isDark ? colors.surface.tertiary : '#F9FAFB',
        }}
      >
        <Icon name="upload-cloud" size={22} style={{ color: colors.text.tertiary, margin: '0 auto 6px' }} />
        <p className="text-xs font-semibold" style={{ color: colors.text.secondary }}>
          {multiple ? 'Drop images here or click to browse' : 'Drop image or click to browse'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview strip */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {previews.map((f, i) => (
            <div key={i} className="relative group">
              <img
                src={URL.createObjectURL(f)}
                alt={`preview-${i}`}
                className="w-16 h-16 object-cover rounded-lg border"
                style={{ borderColor: colors.border.default }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (multiple) {
                    onChange(previews.filter((_, j) => j !== i));
                  } else {
                    onChange(null);
                  }
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: colors.state.error, color: '#fff' }}
              >
                <Icon name="x" size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Variants Builder ─────────────────────────────────────────────────────────

function VariantsBuilder({ control, register, errors, colors, isDark }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  const inputStyle = (hasErr) => ({
    background: isDark ? colors.surface.tertiary : '#F9FAFB',
    border: `1px solid ${hasErr ? colors.state.error : colors.border.default}`,
    color: colors.text.primary,
  });

  return (
    <div className="space-y-3">
      {fields.map((field, idx) => {
        const vErr = errors?.variants?.[idx] || {};
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl p-4 space-y-3 relative"
            style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6', border: `1px solid ${colors.border.subtle}` }}
          >
            {/* Variant header */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.cta.primary }}>
                Variant {idx + 1}
              </span>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(idx)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: `${colors.state.error}22`, color: colors.state.error }}>
                  <Icon name="trash" size={11} />
                </button>
              )}
            </div>

            {/* Row 1: Color + Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: colors.text.tertiary }}>Color</label>
                <input
                  {...register(`variants.${idx}.color`)}
                  placeholder="e.g. Black"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle(vErr.color)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: colors.text.tertiary }}>Size</label>
                <Controller
                  name={`variants.${idx}.size`}
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
                      style={inputStyle(vErr.size)}
                    >
                      <option value="">Select...</option>
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                />
              </div>
            </div>

            {/* Row 2: SKU + Stock + Price Override */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: colors.text.tertiary }}>SKU</label>
                <input
                  {...register(`variants.${idx}.sku`)}
                  placeholder="Auto"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle(vErr.sku)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: colors.text.tertiary }}>Stock <span style={{ color: colors.state.error }}>*</span></label>
                <input
                  {...register(`variants.${idx}.stock`, { valueAsNumber: true })}
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle(vErr.stock)}
                />
                {vErr.stock && <p className="text-[10px] mt-0.5 font-semibold" style={{ color: colors.state.error }}>{vErr.stock.message}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: colors.text.tertiary }}>Price Override</label>
                <input
                  {...register(`variants.${idx}.price_override`, { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Base"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle(vErr.price_override)}
                />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Add Variant button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => append({ ...emptyVariant })}
        className="w-full py-2.5 rounded-xl text-xs font-bold border-2 border-dashed flex items-center justify-center gap-1.5 transition-colors"
        style={{ borderColor: colors.cta.primary, color: colors.cta.primary, background: `${colors.cta.primary}0a` }}
      >
        <Icon name="plus" size={13} /> Add Another Variant
      </motion.button>
    </div>
  );
}

// ─── Field helpers ─────────────────────────────────────────────────────────────

function FieldLabel({ children, required, colors }) {
  return (
    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>
      {children}{required && <span style={{ color: colors.state.error }}> *</span>}
    </label>
  );
}

function InputField({ register, name, errors, colors, isDark, ...rest }) {
  return (
    <>
      <input
        {...register(name)}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          background: isDark ? colors.surface.tertiary : '#F9FAFB',
          border: `1px solid ${errors[name] ? colors.state.error : colors.border.default}`,
          color: colors.text.primary,
        }}
        {...rest}
      />
      {errors[name] && <p className="text-xs mt-1 font-semibold" style={{ color: colors.state.error }}>{errors[name].message}</p>}
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashProducts() {
  const { colors, isDark } = useTheme();
  const { products: liveProducts, deleteProduct, addProduct, loading } = useDashboard();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState(1);

  // Thumbnail & gallery state (outside RHF for File objects)
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);

  const products = liveProducts ?? [];

  // ── React Hook Form + Zod ─────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: productDefaults,
  });

  const closePanel = useCallback(() => {
    if (isSubmitting) return;
    setAddOpen(false);
    setThumbnailFile(null);
    setAdditionalFiles([]);
    reset(productDefaults);
  }, [isSubmitting, reset]);

  const onSubmit = useCallback(async (data) => {
    // Inject file state into the data object before sending
    await addProduct({
      ...data,
      thumbnailFile,
      additionalFiles,
    });
    closePanel();
  }, [addProduct, closePanel, thumbnailFile, additionalFiles]);

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

  // Common input style helper for the form
  const inputStyle = (hasErr) => ({
    background: isDark ? colors.surface.tertiary : '#F9FAFB',
    border: `1px solid ${hasErr ? colors.state.error : colors.border.default}`,
    color: colors.text.primary,
  });

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
            onClick={() => setAddOpen(true)}
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
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                          : <ProductAvatar name={p.name} />
                        }
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

      {/* ── Delete confirmation modal ── */}
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

      {/* ── Add Product slide-in panel ── */}
      {createPortal(
        <AnimatePresence>
          {addOpen && (
            <>
              {/* Backdrop */}
              <motion.div key="add-bg"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={closePanel}
              />

              {/* Panel */}
              <motion.div key="add-panel"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="fixed inset-y-0 right-0 w-full max-w-[520px] z-50 shadow-2xl flex flex-col"
                style={{ background: colors.surface.elevated, borderLeft: `1px solid ${colors.border.default}` }}
              >
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <div>
                    <h3 className="font-black text-lg" style={{ color: colors.text.primary }}>Add New Product</h3>
                    <p className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>Fill in all details — variants, images & pricing</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={closePanel}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
                    <Icon name="x" size={16} />
                  </motion.button>
                </div>

                {/* Scrollable form body */}
                <div className="flex-1 overflow-y-auto">
                  <form id="add-product-form" onSubmit={handleSubmit(onSubmit)} noValidate>

                    {/* ── Section: Core Details ── */}
                    <div className="px-6 pt-5 pb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: colors.cta.primary }}>Core Details</p>
                      <div className="space-y-4">

                        {/* Product Name */}
                        <div>
                          <FieldLabel required colors={colors}>Product Name</FieldLabel>
                          <InputField register={register} name="name" errors={errors} colors={colors} isDark={isDark}
                            placeholder="e.g. Premium Wireless Headphones" />
                        </div>

                        {/* Brand */}
                        <div>
                          <FieldLabel colors={colors}>Brand</FieldLabel>
                          <InputField register={register} name="brand" errors={errors} colors={colors} isDark={isDark}
                            placeholder="e.g. Samsung, Nike, Generic" />
                        </div>

                        {/* Category */}
                        <div>
                          <FieldLabel required colors={colors}>Category</FieldLabel>
                          <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none"
                                style={inputStyle(errors.category)}
                              >
                                <option value="">Select a category...</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            )}
                          />
                          {errors.category && <p className="text-xs mt-1 font-semibold" style={{ color: colors.state.error }}>{errors.category.message}</p>}
                        </div>

                        {/* Currency + Featured row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FieldLabel colors={colors}>Currency</FieldLabel>
                            <Controller
                              name="currency"
                              control={control}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                                  style={inputStyle(false)}
                                >
                                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              )}
                            />
                          </div>
                          <div className="flex flex-col justify-end">
                            <Controller
                              name="is_featured"
                              control={control}
                              render={({ field }) => (
                                <label className="flex items-center gap-2.5 cursor-pointer select-none h-[46px] px-4 rounded-xl"
                                  style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}` }}>
                                  <div
                                    onClick={() => field.onChange(!field.value)}
                                    className="relative w-9 h-5 rounded-full transition-all flex-shrink-0"
                                    style={{ background: field.value ? colors.cta.primary : colors.surface.tertiary, border: `1px solid ${colors.border.default}` }}
                                  >
                                    <motion.div
                                      animate={{ x: field.value ? 16 : 2 }}
                                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                      className="absolute top-0.5 w-4 h-4 rounded-full"
                                      style={{ background: field.value ? '#fff' : colors.text.tertiary }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold" style={{ color: colors.text.secondary }}>Featured</span>
                                </label>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mx-6 my-4 h-px" style={{ background: colors.border.subtle }} />

                    {/* ── Section: Images ── */}
                    <div className="px-6 pb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: colors.cta.primary }}>Images</p>
                      <div className="space-y-5">
                        {/* Thumbnail */}
                        <ImageUploadZone
                          label="Thumbnail (Main Image)"
                          multiple={false}
                          files={thumbnailFile}
                          onChange={setThumbnailFile}
                          colors={colors}
                          isDark={isDark}
                          hint="This is the primary image shown in listings and search results."
                        />
                        {/* Gallery */}
                        <ImageUploadZone
                          label="Gallery Images"
                          multiple
                          files={additionalFiles}
                          onChange={setAdditionalFiles}
                          colors={colors}
                          isDark={isDark}
                          hint="Additional product photos shown in the detail view (up to 8)."
                        />
                      </div>
                    </div>

                    <div className="mx-6 my-4 h-px" style={{ background: colors.border.subtle }} />

                    {/* ── Section: Pricing ── */}
                    <div className="px-6 pb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: colors.cta.primary }}>Pricing</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FieldLabel required colors={colors}>Base Price</FieldLabel>
                          <input
                            {...register('price', { valueAsNumber: true })}
                            type="number" min="0" step="0.01" placeholder="0.00"
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={inputStyle(errors.price)}
                          />
                          {errors.price && <p className="text-xs mt-1 font-semibold" style={{ color: colors.state.error }}>{errors.price.message}</p>}
                        </div>
                        <div>
                          <FieldLabel colors={colors}>Sale Price <span className="font-normal normal-case" style={{ color: colors.text.tertiary }}>(optional)</span></FieldLabel>
                          <input
                            {...register('sale_price', { valueAsNumber: true })}
                            type="number" min="0" step="0.01" placeholder="0.00"
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={inputStyle(errors.sale_price)}
                          />
                          {errors.sale_price && <p className="text-xs mt-1 font-semibold" style={{ color: colors.state.error }}>{errors.sale_price.message}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="mx-6 my-4 h-px" style={{ background: colors.border.subtle }} />

                    {/* ── Section: Variants ── */}
                    <div className="px-6 pb-2">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.cta.primary }}>
                          Variants <span className="text-[9px] font-semibold normal-case ml-1" style={{ color: colors.text.tertiary }}>(size, color, stock per variant)</span>
                        </p>
                      </div>
                      {errors.variants && !Array.isArray(errors.variants) && (
                        <p className="text-xs mb-3 font-semibold" style={{ color: colors.state.error }}>{errors.variants.message}</p>
                      )}
                      <AnimatePresence>
                        <VariantsBuilder
                          control={control}
                          register={register}
                          errors={errors}
                          colors={colors}
                          isDark={isDark}
                        />
                      </AnimatePresence>
                    </div>

                    <div className="mx-6 my-4 h-px" style={{ background: colors.border.subtle }} />

                    {/* ── Section: Descriptions ── */}
                    <div className="px-6 pb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: colors.cta.primary }}>Descriptions</p>
                      <div className="space-y-4">
                        <div>
                          <FieldLabel colors={colors}>Short Description <span className="font-normal normal-case" style={{ color: colors.text.tertiary }}>(max 200 chars)</span></FieldLabel>
                          <textarea
                            {...register('shortDescription')}
                            rows={2}
                            placeholder="A brief, catchy summary of the product"
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                            style={inputStyle(errors.shortDescription)}
                          />
                          {errors.shortDescription && <p className="text-xs mt-1 font-semibold" style={{ color: colors.state.error }}>{errors.shortDescription.message}</p>}
                        </div>
                        <div>
                          <FieldLabel colors={colors}>Full Description</FieldLabel>
                          <textarea
                            {...register('fullDescription')}
                            rows={4}
                            placeholder="Full product details, specs, materials..."
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                            style={inputStyle(errors.fullDescription)}
                          />
                        </div>
                        <div>
                          <FieldLabel colors={colors}>Key Features <span className="font-normal normal-case" style={{ color: colors.text.tertiary }}>(comma-separated)</span></FieldLabel>
                          <textarea
                            {...register('features')}
                            rows={2}
                            placeholder="e.g. Water resistant, 40hr battery, Noise cancelling"
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                            style={inputStyle(errors.features)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mx-6 my-4 h-px" style={{ background: colors.border.subtle }} />

                    {/* ── Section: SEO / Meta ── */}
                    <div className="px-6 pb-6">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: colors.cta.primary }}>SEO & Meta</p>
                      <div>
                        <FieldLabel colors={colors}>Keywords <span className="font-normal normal-case" style={{ color: colors.text.tertiary }}>(comma-separated)</span></FieldLabel>
                        <input
                          {...register('keywords')}
                          placeholder="e.g. wireless, headphones, bluetooth, audio"
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={inputStyle(errors.keywords)}
                        />
                      </div>
                    </div>

                  </form>
                </div>

                {/* Sticky Footer */}
                <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closePanel}
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 rounded-xl font-bold text-sm border transition-all"
                      style={{ borderColor: colors.border.default, color: colors.text.secondary }}
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                      type="submit"
                      form="add-product-form"
                      disabled={isSubmitting}
                      className="flex-[2] py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{ background: colors.cta.primary, color: colors.cta.primaryText, opacity: isSubmitting ? 0.7 : 1 }}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block"
                          />
                          Saving Product...
                        </>
                      ) : (
                        <><Icon name="plus" size={16} /> Save Product</>
                      )}
                    </motion.button>
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
