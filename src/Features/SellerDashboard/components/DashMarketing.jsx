import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from "../../../Store/useThemeStore";
import { useDashboard } from '../context/DashboardContext';
import { useDeleteSellerCoupon, useSaveSellerCoupon, useSellerCoupons } from '../hooks/useSellerQueries';
import { Icon } from './DashIcon';

function Toggle({ value, onChange }) {
  const { colors } = useTheme();
  return (
    <motion.button onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full"
      style={{ background: value ? colors.cta.primary : colors.border.strong }}
      transition={{ duration: 0.2 }}>
      <motion.div animate={{ x: value ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
    </motion.button>
  );
}

function ToolCard({ icon, title, desc, actionLabel, children, delay = 0, onAction, actionDisabled = false, actionStyle }) {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleAction = async () => {
    if (onAction) {
      setLoading(true);
      await onAction();
      setLoading(false);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-6 shadow-sm space-y-5 flex flex-col"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
      <div className="flex items-center gap-3">
        <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.07)' }}>
          <Icon name={icon} size={18} style={{ color: colors.cta.primary }} />
        </motion.div>
        <div>
          <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{title}</p>
          <p className="text-xs" style={{ color: colors.text.tertiary }}>{desc}</p>
        </div>
      </div>

      <div className="flex-1">{children}</div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={handleAction}
        disabled={loading || actionDisabled}
        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
        style={done ? { background: colors.state.successBg, color: colors.state.success } : actionStyle || { background: isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.07)', color: colors.cta.primary }}>
        {loading ? (
          <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full block" />
            Processing...</>
        ) : done ? (
          <><Icon name="check" size={15} /> Done!</>
        ) : actionLabel}
      </motion.button>
    </motion.div>
  );
}

const couponSchema = z.object({
  code: z.string()
    .trim()
    .min(3, 'Code must be at least 3 characters.')
    .max(24, 'Code must be 24 characters or fewer.')
    .regex(/^[A-Z0-9_-]+$/i, 'Use letters, numbers, underscores, or hyphens.'),
  label: z.string().trim().max(80, 'Label must be 80 characters or fewer.').optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().positive('Discount value is required.'),
  minOrder: z.coerce.number().min(0, 'Minimum order cannot be negative.').default(0),
  maxUses: z.union([z.literal(''), z.coerce.number().int().positive('Use limit must be positive.')]).optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
  productIds: z.array(z.string()).min(1, 'Select at least one product.'),
}).superRefine((value, ctx) => {
  if (value.discountType === 'percentage' && value.discountValue > 90) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Percentage coupons cannot exceed 90%.',
      path: ['discountValue'],
    });
  }
});

const couponDefaults = {
  code: '',
  label: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrder: 0,
  maxUses: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
  productIds: [],
};

const formatCouponMoney = (minor = 0) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(minor || 0) / 100);

const minorToNaira = (minor = 0) => Number(minor || 0) / 100;

const dateTimeLocalValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
};

const couponToFormValues = (coupon) => ({
  code: coupon?.code || '',
  label: coupon?.label || '',
  discountType: coupon?.discount_type || 'percentage',
  discountValue: coupon?.discount_type === 'fixed'
    ? minorToNaira(coupon?.discount_value)
    : Number(coupon?.discount_value || 10),
  minOrder: minorToNaira(coupon?.min_order_cents),
  maxUses: coupon?.max_uses || '',
  startsAt: dateTimeLocalValue(coupon?.starts_at),
  expiresAt: dateTimeLocalValue(coupon?.expires_at),
  isActive: coupon?.is_active ?? true,
  productIds: Array.isArray(coupon?.product_ids) ? coupon.product_ids : [],
});

function SellerCouponManager({ products = [] }) {
  const { colors, isDark } = useTheme();
  const couponsQuery = useSellerCoupons();
  const saveCoupon = useSaveSellerCoupon();
  const deleteCoupon = useDeleteSellerCoupon();
  const [editingCoupon, setEditingCoupon] = useState(null);

  const form = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: couponDefaults,
    mode: 'onBlur',
  });
  const discountType = useWatch({ control: form.control, name: 'discountType' });

  const productOptions = useMemo(
    () => products
      .filter((product) => product?.id)
      .map((product) => ({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
      })),
    [products],
  );

  useEffect(() => {
    form.reset(editingCoupon ? couponToFormValues(editingCoupon) : couponDefaults);
  }, [editingCoupon, form]);

  const submitCoupon = form.handleSubmit(async (values) => {
    await saveCoupon.mutateAsync({
      id: editingCoupon?.id || null,
      ...values,
      code: values.code.toUpperCase(),
      maxUses: values.maxUses === '' ? null : Number(values.maxUses),
      startsAt: values.startsAt || null,
      expiresAt: values.expiresAt || null,
    });
    setEditingCoupon(null);
    form.reset(couponDefaults);
  });

  const removeCoupon = async (couponId) => {
    await deleteCoupon.mutateAsync(couponId);
    if (editingCoupon?.id === couponId) setEditingCoupon(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.4 }}
      className="rounded-2xl p-6 shadow-sm space-y-5 md:col-span-2"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.07)' }}>
            <Icon name="percent" size={18} style={{ color: colors.cta.primary }} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: colors.text.primary }}>Seller Coupons</p>
            <p className="text-xs" style={{ color: colors.text.tertiary }}>Product-specific coupons for your own catalog.</p>
          </div>
        </div>
        {editingCoupon ? (
          <button
            type="button"
            onClick={() => setEditingCoupon(null)}
            className="text-xs font-bold"
            style={{ color: colors.cta.primary }}
          >
            Create new coupon
          </button>
        ) : null}
      </div>

      <form onSubmit={submitCoupon} className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>Code</label>
          <input
            {...form.register('code')}
            onChange={(event) => form.setValue('code', event.target.value.toUpperCase(), { shouldValidate: true, shouldDirty: true })}
            placeholder="e.g. SUMMER15"
            className="w-full px-4 py-2.5 rounded-xl text-sm font-mono outline-none border"
            style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', borderColor: colors.border.default, color: colors.text.primary }}
          />
          {form.formState.errors.code && <p className="text-[11px] mt-1 font-semibold" style={{ color: colors.state.error }}>{form.formState.errors.code.message}</p>}
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>Label</label>
          <input
            {...form.register('label')}
            placeholder="Short buyer-facing label"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', borderColor: colors.border.default, color: colors.text.primary }}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>Discount Type</label>
          <select {...form.register('discountType')}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', borderColor: colors.border.default, color: colors.text.primary }}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>
            {discountType === 'fixed' ? 'Amount (NGN)' : 'Percent Off'}
          </label>
          <input
            {...form.register('discountValue')}
            type="number"
            min="1"
            step={discountType === 'fixed' ? '100' : '1'}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', borderColor: colors.border.default, color: colors.text.primary }}
          />
          {form.formState.errors.discountValue && <p className="text-[11px] mt-1 font-semibold" style={{ color: colors.state.error }}>{form.formState.errors.discountValue.message}</p>}
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>Minimum Eligible Product Spend (NGN)</label>
          <input {...form.register('minOrder')} type="number" min="0" step="100"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', borderColor: colors.border.default, color: colors.text.primary }} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>Max Uses</label>
          <input {...form.register('maxUses')} type="number" min="1" placeholder="Unlimited"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', borderColor: colors.border.default, color: colors.text.primary }} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>Starts At</label>
          <input {...form.register('startsAt')} type="datetime-local"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', borderColor: colors.border.default, color: colors.text.primary }} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.tertiary }}>Expires At</label>
          <input {...form.register('expiresAt')} type="datetime-local"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', borderColor: colors.border.default, color: colors.text.primary }} />
        </div>
        <Controller
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <div className="flex items-center justify-between p-4 rounded-xl lg:col-span-2"
              style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}` }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>Coupon Active</p>
                <p className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>Turn this off to pause redemption without deleting.</p>
              </div>
              <Toggle value={field.value} onChange={field.onChange} />
            </div>
          )}
        />
        <Controller
          control={form.control}
          name="productIds"
          render={({ field }) => (
            <div className="lg:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: colors.text.tertiary }}>Eligible Products</label>
              {productOptions.length ? (
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
                  {productOptions.map((product) => {
                    const selected = field.value.includes(product.id);
                    return (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => {
                          field.onChange(selected
                            ? field.value.filter((id) => id !== product.id)
                            : [...field.value, product.id]);
                        }}
                        className="flex items-center gap-3 rounded-xl p-3 text-left transition-all"
                        style={{
                          background: selected ? `${colors.cta.primary}14` : isDark ? colors.surface.tertiary : '#F9FAFB',
                          border: `1px solid ${selected ? colors.cta.primary : colors.border.default}`,
                          color: colors.text.primary,
                        }}
                      >
                        {product.image ? <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg" style={{ background: colors.surface.tertiary }} />}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold">{product.name}</span>
                          <span className="block text-[10px]" style={{ color: colors.text.tertiary }}>{formatCouponMoney(product.price)}</span>
                        </span>
                        {selected ? <Icon name="check" size={14} style={{ color: colors.cta.primary }} /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs" style={{ color: colors.text.tertiary }}>Add products before creating seller coupons.</p>
              )}
              {form.formState.errors.productIds && <p className="text-[11px] mt-1 font-semibold" style={{ color: colors.state.error }}>{form.formState.errors.productIds.message}</p>}
            </div>
          )}
        />
        <div className="flex flex-col gap-2 sm:flex-row lg:col-span-2">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saveCoupon.isPending || !productOptions.length}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: colors.cta.primary, color: '#fff', opacity: saveCoupon.isPending || !productOptions.length ? 0.6 : 1 }}>
            {saveCoupon.isPending ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
          </motion.button>
          {editingCoupon ? (
            <button type="button" onClick={() => setEditingCoupon(null)} className="px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: colors.text.secondary }}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Existing Seller Coupons</p>
        {couponsQuery.isLoading ? (
          <p className="text-xs" style={{ color: colors.text.tertiary }}>Loading coupons...</p>
        ) : couponsQuery.data?.length ? (
          <div className="grid gap-2">
            {couponsQuery.data.map((coupon) => (
              <div key={coupon.id} className="flex flex-col gap-3 rounded-xl p-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}` }}>
                <div className="min-w-0">
                  <p className="font-mono text-sm font-black tracking-wider" style={{ color: colors.text.primary }}>{coupon.code}</p>
                  <p className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>
                    {coupon.discount_type === 'fixed' ? formatCouponMoney(coupon.discount_value) : `${coupon.discount_value}%`} off
                    {' '}on {(coupon.products || []).length} product{(coupon.products || []).length === 1 ? '' : 's'}
                    {' '}· used {coupon.used_count || 0}{coupon.max_uses ? `/${coupon.max_uses}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingCoupon(coupon)} className="rounded-lg px-3 py-2 text-xs font-bold"
                    style={{ background: `${colors.cta.primary}12`, color: colors.cta.primary }}>Edit</button>
                  <button type="button" onClick={() => removeCoupon(coupon.id)} disabled={deleteCoupon.isPending} className="rounded-lg px-3 py-2 text-xs font-bold"
                    style={{ background: colors.state.errorBg, color: colors.state.error }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: colors.text.tertiary }}>No seller coupons yet.</p>
        )}
      </div>
    </motion.div>
  );
}

export default function DashMarketing() {
  const { colors, isDark } = useTheme();
  const { updateMarketing, products } = useDashboard();
  const [flashActive, setFlashActive] = useState(false);
  const [featuredToggle, setFeaturedToggle] = useState(false);
  const [sponsoredToggle, setSponsoredToggle] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Marketing Tools</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SellerCouponManager products={products} />

        {/* Flash sale */}
        <ToolCard icon="zap" title="Flash Sale" desc="Time-limited price drops for your store" actionLabel="Configure Timer" delay={0.1}
          onAction={() => updateMarketing({ type: 'flash_sale', active: flashActive })}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}` }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>Flash Sale Active</p>
                <p className="text-xs mt-0.5" style={{ color: flashActive ? colors.state.success : colors.text.tertiary }}>
                  {flashActive ? '🔥 Currently LIVE' : 'Currently off'}
                </p>
              </div>
              <Toggle value={flashActive} onChange={setFlashActive} />
            </div>
            {flashActive && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl text-center"
                style={{ background: isDark ? 'rgba(255,215,0,0.08)' : 'rgba(196,154,0,0.06)', border: `1px solid ${colors.state.warning}30` }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.state.warning }}>Time Remaining</p>
                <p className="font-black text-2xl tabular-nums" style={{ color: colors.text.primary }}>04:59:32</p>
              </motion.div>
            )}
          </div>
        </ToolCard>

        {/* Featured product */}
        <ToolCard icon="star" title="Featured Boost" desc="Pin your product on the homepage hero" actionLabel="Select & Boost Product" delay={0.15}
          onAction={() => updateMarketing({ type: 'featured', active: featuredToggle })}>
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}` }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>Homepage Feature Slot</p>
              <p className="text-xs mt-0.5" style={{ color: featuredToggle ? colors.cta.primary : colors.text.tertiary }}>
                {featuredToggle ? 'Stealth Sneakers X1' : 'No product selected'}
              </p>
            </div>
            <Toggle value={featuredToggle} onChange={setFeaturedToggle} />
          </div>
        </ToolCard>

        {/* Sponsored */}
        <ToolCard icon="trending-up" title="Sponsored Ads" desc="Pay-per-click campaigns across Woosho" actionLabel="Manage Budget" delay={0.2}
          onAction={() => updateMarketing({ type: 'sponsored', active: sponsoredToggle })}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.default}` }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>Ad Campaigns</p>
                <p className="text-xs mt-0.5" style={{ color: sponsoredToggle ? colors.state.success : colors.text.tertiary }}>
                  {sponsoredToggle ? '✓ Running · ₦2,500/day' : 'Not running'}
                </p>
              </div>
              <Toggle value={sponsoredToggle} onChange={setSponsoredToggle} />
            </div>
            {sponsoredToggle && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 gap-2">
                {[{ l: 'Impressions', v: '12.4K' }, { l: 'Clicks', v: '384' }, { l: 'CTR', v: '3.1%' }, { l: 'Spent', v: '₦17.5K' }].map(m => (
                  <div key={m.l} className="p-3 rounded-xl text-center" style={{ background: isDark ? 'rgba(0,255,148,0.06)' : 'rgba(5,150,105,0.05)', border: `1px solid ${isDark ? 'rgba(0,255,148,0.12)' : 'rgba(5,150,105,0.12)'}` }}>
                    <p className="text-lg font-black" style={{ color: colors.text.primary }}>{m.v}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: colors.text.tertiary }}>{m.l}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </ToolCard>
      </div>
    </div>
  );
}
