import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from "../../../Store/useThemeStore";
import { useDashboard } from '../context/DashboardContext';
import {
  useCreateSellerAdvertisement,
  useSellerAdvertisementAnalytics,
  useSellerAdvertisements,
} from '../hooks/useSellerQueries';
import { fmt } from '../utils/format';
import { Icon } from './DashIcon';

const PLACEMENTS = [
  {
    id: 'product_sponsored',
    title: 'Sponsored Product',
    packageId: 'starter',
    requiredPlan: 'starter',
    eligiblePlans: ['starter', 'growth', 'premium'],
    price: 5000,
    bidType: 'cpc',
    bid: 75,
    surface: 'Product feeds, category lists',
  },
  {
    id: 'search_sponsored',
    title: 'Search Sponsored',
    packageId: 'growth',
    requiredPlan: 'growth',
    eligiblePlans: ['growth', 'premium'],
    price: 20000,
    bidType: 'cpc',
    bid: 120,
    surface: 'Top search results',
  },
  {
    id: 'category_banner',
    title: 'Category Banner',
    packageId: 'growth',
    requiredPlan: 'growth',
    eligiblePlans: ['growth', 'premium'],
    price: 45000,
    bidType: 'cpm',
    bid: 900,
    surface: 'Category landing pages',
  },
  {
    id: 'homepage_hero',
    title: 'Homepage Hero',
    packageId: 'premium',
    requiredPlan: 'premium',
    eligiblePlans: ['premium'],
    price: 150000,
    bidType: 'flat',
    bid: 0,
    surface: 'Homepage above the fold',
  },
  {
    id: 'curation_slot',
    title: 'Curation Slot',
    packageId: 'premium',
    requiredPlan: 'premium',
    eligiblePlans: ['premium'],
    price: 90000,
    bidType: 'flat',
    bid: 0,
    surface: 'Curations and editorial modules',
  },
  {
    id: 'store_spotlight',
    title: 'Store Spotlight',
    packageId: 'growth',
    requiredPlan: 'growth',
    eligiblePlans: ['growth', 'premium'],
    price: 35000,
    bidType: 'cpm',
    bid: 650,
    surface: 'Stores discovery',
  },
];

const PLAN_RANK = { starter: 0, growth: 1, premium: 2 };

const toPlan = (value = 'starter') => String(value || 'starter').toLowerCase();
const canUsePlacement = (sellerPlan, placement) =>
  (PLAN_RANK[toPlan(sellerPlan)] ?? 0) >= (PLAN_RANK[placement.requiredPlan] ?? 0);

const statusStyle = (status, colors) => {
  const map = {
    approved: [colors.state.successBg, colors.state.success],
    pending_review: ['rgba(245,158,11,0.14)', '#D97706'],
    draft: ['rgba(107,114,128,0.14)', colors.text.tertiary],
    rejected: [colors.state.errorBg, colors.state.error],
    paused: ['rgba(99,102,241,0.14)', colors.cta.primary],
    completed: [colors.surface.tertiary, colors.text.secondary],
  };
  const [bg, fg] = map[status] || map.draft;
  return { background: bg, color: fg };
};

const compactNumber = (value = 0) =>
  Number(value || 0).toLocaleString(undefined, { notation: value >= 10000 ? 'compact' : 'standard' });

function buildTimeline(events = []) {
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = dayjs().subtract(13 - index, 'day');
    return {
      key: date.format('YYYY-MM-DD'),
      label: date.format('MMM D'),
      impressions: 0,
      clicks: 0,
      conversions: 0,
    };
  });
  const byKey = new Map(days.map((day) => [day.key, day]));

  events.forEach((event) => {
    const key = dayjs(event.occurred_at).format('YYYY-MM-DD');
    const day = byKey.get(key);
    if (!day) return;
    if (event.event_type === 'impression') day.impressions += 1;
    if (event.event_type === 'click') day.clicks += 1;
    if (event.event_type === 'conversion') day.conversions += 1;
  });

  return days;
}

function MetricCard({ label, value, sub, icon, delay }) {
  const { colors, isDark } = useTheme();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      transition={{ delay, duration: 0.35 }}
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: colors.text.tertiary }}>{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight" style={{ color: colors.text.primary }}>{value}</p>
          <p className="mt-1 text-xs" style={{ color: colors.text.tertiary }}>{sub}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: isDark ? 'rgba(144,171,255,0.1)' : 'rgba(0,80,212,0.07)', color: colors.cta.primary }}>
          <Icon name={icon} size={18} />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashAds() {
  const { colors, isDark } = useTheme();
  const { products, profile } = useDashboard();
  const sellerPlan = toPlan(profile?.subscriptionPlan);
  const advertsQuery = useSellerAdvertisements();
  const analyticsQuery = useSellerAdvertisementAnalytics();
  const createAdvert = useCreateSellerAdvertisement();
  const [selectedPlacementId, setSelectedPlacementId] = useState('product_sponsored');
  const selectedPlacement = PLACEMENTS.find((placement) => placement.id === selectedPlacementId) || PLACEMENTS[0];
  const defaultProduct = products?.[0];
  const [form, setForm] = useState({
    productId: defaultProduct?.id || '',
    title: '',
    subtitle: '',
    destinationUrl: '',
    budget: selectedPlacement.price,
    startsAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    endsAt: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    paymentReference: '',
    keywords: '',
    locations: '',
    categories: '',
  });

  const analytics = analyticsQuery.data || {};
  const totals = analytics.totals || {};
  const events = useMemo(() => analytics.events || [], [analytics.events]);
  const campaigns = useMemo(() => advertsQuery.data || [], [advertsQuery.data]);
  const timeline = useMemo(() => buildTimeline(events), [events]);
  const placementBars = useMemo(() => {
    const byPlacement = new Map(PLACEMENTS.map((placement) => [placement.id, {
      name: placement.title,
      impressions: 0,
      clicks: 0,
    }]));

    campaigns.forEach((campaign) => {
      if (!byPlacement.has(campaign.placement)) return;
      const row = byPlacement.get(campaign.placement);
      events
        .filter((event) => event.advertisement_id === campaign.id)
        .forEach((event) => {
          if (event.event_type === 'impression') row.impressions += 1;
          if (event.event_type === 'click') row.clicks += 1;
        });
    });

    return [...byPlacement.values()].filter((row) => row.impressions || row.clicks).slice(0, 6);
  }, [campaigns, events]);
  const ctr = totals.impressions ? ((totals.clicks || 0) / totals.impressions) * 100 : 0;
  const conversionRate = totals.clicks ? ((totals.conversions || 0) / totals.clicks) * 100 : 0;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updatePlacement = (placementId) => {
    const placement = PLACEMENTS.find((item) => item.id === placementId) || PLACEMENTS[0];
    setSelectedPlacementId(placementId);
    setForm((current) => ({
      ...current,
      budget: placement.price,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    await createAdvert.mutateAsync({
      ...form,
      productId: form.productId || null,
      creativeType: selectedPlacement.id === 'store_spotlight' ? 'store' : selectedPlacement.id === 'homepage_hero' || selectedPlacement.id === 'category_banner' ? 'banner' : 'product',
      placement: selectedPlacement.id,
      packageId: selectedPlacement.packageId,
      requiredSellerPlan: selectedPlacement.requiredPlan,
      eligiblePlanIds: selectedPlacement.eligiblePlans,
      sellerPlan,
      bidType: selectedPlacement.bidType,
      bid: selectedPlacement.bid,
      keywords: form.keywords.split(',').map((item) => item.trim()).filter(Boolean),
      locations: form.locations.split(',').map((item) => item.trim()).filter(Boolean),
      categories: form.categories.split(',').map((item) => item.trim()).filter(Boolean),
    });
    setForm((current) => ({
      ...current,
      title: '',
      subtitle: '',
      paymentReference: '',
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: colors.cta.primary }}>Advertising console</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight" style={{ color: colors.text.primary }}>Paid placements with admin approval.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: colors.text.tertiary }}>
            Create campaigns after payment, choose a placement that matches your subscription package, then track approval, delivery, and progress from one fast dashboard.
          </p>
        </div>
        <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}`, color: colors.text.secondary }}>
          Current package: <span className="font-black capitalize" style={{ color: colors.cta.primary }}>{sellerPlan}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard delay={0} icon="eye" label="Impressions" value={compactNumber(totals.impressions)} sub="Last 30 days" />
        <MetricCard delay={0.05} icon="trending-up" label="Clicks" value={compactNumber(totals.clicks)} sub={`${ctr.toFixed(2)}% CTR`} />
        <MetricCard delay={0.1} icon="shopping-cart" label="Conversions" value={compactNumber(totals.conversions)} sub={`${conversionRate.toFixed(2)}% from clicks`} />
        <MetricCard delay={0.15} icon="wallet" label="Attributed Revenue" value={fmt(totals.revenueMinor)} sub="Conversion event value" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black" style={{ color: colors.text.primary }}>Performance trend</h3>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>Impressions, clicks, and conversions by day</p>
            </div>
            {analyticsQuery.isFetching && <span className="text-xs font-bold" style={{ color: colors.text.tertiary }}>Refreshing...</span>}
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="adImpressions" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={colors.cta.primary} stopOpacity={0.32} />
                    <stop offset="95%" stopColor={colors.cta.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={colors.border.subtle} strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: colors.text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: colors.text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}`, borderRadius: 12, color: colors.text.primary }} />
                <Area dataKey="impressions" name="Impressions" stroke={colors.cta.primary} fill="url(#adImpressions)" strokeWidth={2.5} />
                <Area dataKey="clicks" name="Clicks" stroke="#10B981" fill="transparent" strokeWidth={2} />
                <Area dataKey="conversions" name="Conversions" stroke="#F59E0B" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl p-5 shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <h3 className="text-lg font-black" style={{ color: colors.text.primary }}>Placement mix</h3>
          <p className="mb-5 text-xs" style={{ color: colors.text.tertiary }}>Delivery split by approved campaign placement</p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placementBars.length ? placementBars : [{ name: 'No delivery yet', impressions: 0, clicks: 0 }]}>
                <CartesianGrid stroke={colors.border.subtle} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: colors.text.tertiary, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={70} />
                <YAxis tick={{ fill: colors.text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: colors.surface.elevated, border: `1px solid ${colors.border.default}`, borderRadius: 12, color: colors.text.primary }} />
                <Bar dataKey="impressions" fill={colors.cta.primary} radius={[8, 8, 0, 0]} />
                <Bar dataKey="clicks" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={submit} className="rounded-3xl p-5 shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <div className="mb-5">
            <h3 className="text-lg font-black" style={{ color: colors.text.primary }}>Create paid advertisement</h3>
            <p className="text-xs" style={{ color: colors.text.tertiary }}>Submit after payment. Admin will approve the final placement and schedule.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PLACEMENTS.map((placement) => {
              const eligible = canUsePlacement(sellerPlan, placement);
              const active = selectedPlacementId === placement.id;

              return (
                <button
                  className="rounded-2xl border p-4 text-left transition-all disabled:opacity-55"
                  disabled={!eligible}
                  key={placement.id}
                  onClick={() => updatePlacement(placement.id)}
                  style={{
                    background: active ? (isDark ? 'rgba(144,171,255,0.12)' : 'rgba(0,80,212,0.08)') : colors.surface.secondary,
                    borderColor: active ? colors.cta.primary : colors.border.subtle,
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black" style={{ color: colors.text.primary }}>{placement.title}</p>
                      <p className="mt-1 text-[11px]" style={{ color: colors.text.tertiary }}>{placement.surface}</p>
                    </div>
                    {!eligible && <Icon name="lock" size={15} style={{ color: colors.text.tertiary }} />}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider" style={{ color: colors.text.tertiary }}>
                    <span>{placement.requiredPlan}+ plan</span>
                    <span>{fmt(placement.price * 100)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-1 text-xs font-bold" style={{ color: colors.text.secondary }}>
              Product
              <select className="rounded-xl border px-3 py-3 text-sm outline-none" value={form.productId} onChange={(event) => update('productId', event.target.value)} style={{ background: colors.surface.secondary, borderColor: colors.border.default, color: colors.text.primary }}>
                <option value="">Store campaign</option>
                {(products || []).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold" style={{ color: colors.text.secondary }}>
              Campaign title
              <input required className="rounded-xl border px-3 py-3 text-sm outline-none" value={form.title} onChange={(event) => update('title', event.target.value)} style={{ background: colors.surface.secondary, borderColor: colors.border.default, color: colors.text.primary }} />
            </label>
            <label className="grid gap-1 text-xs font-bold" style={{ color: colors.text.secondary }}>
              Subtitle
              <input className="rounded-xl border px-3 py-3 text-sm outline-none" value={form.subtitle} onChange={(event) => update('subtitle', event.target.value)} style={{ background: colors.surface.secondary, borderColor: colors.border.default, color: colors.text.primary }} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold" style={{ color: colors.text.secondary }}>
                Budget
                <input min="1000" type="number" className="rounded-xl border px-3 py-3 text-sm outline-none" value={form.budget} onChange={(event) => update('budget', event.target.value)} style={{ background: colors.surface.secondary, borderColor: colors.border.default, color: colors.text.primary }} />
              </label>
              <label className="grid gap-1 text-xs font-bold" style={{ color: colors.text.secondary }}>
                Payment reference
                <input required className="rounded-xl border px-3 py-3 text-sm outline-none" value={form.paymentReference} onChange={(event) => update('paymentReference', event.target.value)} placeholder="Paystack / bank ref" style={{ background: colors.surface.secondary, borderColor: colors.border.default, color: colors.text.primary }} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold" style={{ color: colors.text.secondary }}>
                Start date
                <input type="date" className="rounded-xl border px-3 py-3 text-sm outline-none" value={form.startsAt} onChange={(event) => update('startsAt', event.target.value)} style={{ background: colors.surface.secondary, borderColor: colors.border.default, color: colors.text.primary }} />
              </label>
              <label className="grid gap-1 text-xs font-bold" style={{ color: colors.text.secondary }}>
                End date
                <input type="date" className="rounded-xl border px-3 py-3 text-sm outline-none" value={form.endsAt} onChange={(event) => update('endsAt', event.target.value)} style={{ background: colors.surface.secondary, borderColor: colors.border.default, color: colors.text.primary }} />
              </label>
            </div>
            <label className="grid gap-1 text-xs font-bold" style={{ color: colors.text.secondary }}>
              Targeting keywords
              <input className="rounded-xl border px-3 py-3 text-sm outline-none" value={form.keywords} onChange={(event) => update('keywords', event.target.value)} placeholder="sneakers, skincare, luxury" style={{ background: colors.surface.secondary, borderColor: colors.border.default, color: colors.text.primary }} />
            </label>
            <button disabled={createAdvert.isPending} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black" style={{ background: colors.cta.primary, color: colors.cta.primaryText }} type="submit">
              {createAdvert.isPending ? 'Submitting...' : 'Submit for admin approval'}
              <Icon name="arrow-up" size={15} />
            </button>
          </div>
        </form>

        <section className="rounded-3xl p-5 shadow-sm" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black" style={{ color: colors.text.primary }}>Campaigns</h3>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>Payment, approval, and placement status</p>
            </div>
            {advertsQuery.isFetching && <span className="text-xs font-bold" style={{ color: colors.text.tertiary }}>Syncing</span>}
          </div>
          <div className="space-y-3">
            {campaigns.length ? campaigns.map((campaign) => (
              <article className="rounded-2xl border p-4" key={campaign.id} style={{ background: colors.surface.secondary, borderColor: colors.border.subtle }}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-black" style={{ color: colors.text.primary }}>{campaign.title}</h4>
                      <span className="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider" style={statusStyle(campaign.approval_status, colors)}>
                        {campaign.approval_status?.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider" style={{ background: campaign.payment_status === 'paid' ? colors.state.successBg : 'rgba(245,158,11,0.14)', color: campaign.payment_status === 'paid' ? colors.state.success : '#D97706' }}>
                        {campaign.payment_status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: colors.text.tertiary }}>{campaign.product?.name || 'Store campaign'} · {campaign.placement?.replace(/_/g, ' ')}</p>
                    {campaign.admin_status_note && <p className="mt-2 text-xs" style={{ color: colors.text.secondary }}>{campaign.admin_status_note}</p>}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-black" style={{ color: colors.text.primary }}>{fmt(campaign.budget_minor)}</p>
                    <p className="mt-1 text-[11px]" style={{ color: colors.text.tertiary }}>{dayjs(campaign.created_at).format('MMM D, YYYY')}</p>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border p-8 text-center" style={{ borderColor: colors.border.subtle, color: colors.text.tertiary }}>
                No campaigns yet. Create your first paid advertisement after payment.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
