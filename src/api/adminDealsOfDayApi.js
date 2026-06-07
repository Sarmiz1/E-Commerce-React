import { supabase } from "../lib/supabaseClient";
import { fetchCurationProductsByIds } from "./curationFetchLoader";

const PUBLIC_ADMIN_DEAL_SELECT = `
  id,
  title,
  eyebrow,
  description,
  status,
  priority,
  starts_at,
  ends_at,
  timezone,
  accent_color,
  featured_product_id,
  product_ids,
  cta_label,
  cta_url,
  metadata,
  created_at,
  updated_at
`;

const ADMIN_DEAL_SELECT = `
  ${PUBLIC_ADMIN_DEAL_SELECT},
  created_by,
  updated_by
`;

const normalizeProductIds = (deal = {}) => [
  deal.featured_product_id,
  ...(Array.isArray(deal.product_ids) ? deal.product_ids : []),
];

const throwQueryError = (error) => {
  if (error) throw new Error(error.message);
};

const normalizeDeal = (deal = {}) => ({
  ...deal,
  title: deal.title || "Deal of the Day",
  eyebrow: deal.eyebrow || "Today Only",
  description: deal.description || "",
  accentColor: deal.accent_color || "#E8433A",
  productIds: normalizeProductIds(deal),
  metadata: deal.metadata || {},
});

const toShowcaseSection = async (deal) => {
  const normalized = normalizeDeal(deal);
  const productIds = [...new Set(normalized.productIds.filter(Boolean))].slice(0, 5);
  const products = await fetchCurationProductsByIds(productIds);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const orderedProducts = productIds
    .map((id) => productsById.get(id))
    .filter(Boolean);

  if (!orderedProducts.length) return null;

  return {
    id: "deal-of-the-day",
    label: normalized.title,
    topbarLabel: normalized.title,
    tag: normalized.eyebrow,
    tagColor: normalized.accentColor,
    accent: normalized.accentColor,
    description: normalized.description,
    path: normalized.cta_url || "/products/curations/deal-of-the-day",
    featured: orderedProducts[0],
    items: orderedProducts.slice(1, 5),
    stores: [],
    type: "products",
    isDealOfDay: true,
    isAdminControlled: true,
    saleEndsAt:
      normalized.ends_at ||
      normalized.metadata.saleEndsAt ||
      normalized.metadata.sale_ends_at,
    rawDeal: normalized,
  };
};

const activeDealQuery = () => {
  const now = new Date().toISOString();

  return supabase
    .from("admin_deals_of_day")
    .select(PUBLIC_ADMIN_DEAL_SELECT)
    .eq("status", "active")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(1);
};

export const AdminDealsOfDayAPI = {
  getPublicActive: () => ({
    queryKey: ["admin-deals-of-day", "public-active"],
    queryFn: async () => {
      const { data, error } = await activeDealQuery();

      if (error?.message?.includes("admin_users")) return null;
      throwQueryError(error);
      if (!data?.[0]) return null;
      return toShowcaseSection(data[0]);
    },
  }),

  listAdmin: ({ status, limit = 100 } = {}) => ({
    queryKey: ["admin-deals-of-day", "admin", status || "all", limit],
    queryFn: async () => {
      let query = supabase
        .from("admin_deals_of_day")
        .select(ADMIN_DEAL_SELECT)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      throwQueryError(error);
      return (data || []).map(normalizeDeal);
    },
  }),

  create: async (payload) => {
    const { data, error } = await supabase
      .from("admin_deals_of_day")
      .insert(payload)
      .select(ADMIN_DEAL_SELECT)
      .single();

    throwQueryError(error);
    return normalizeDeal(data);
  },

  update: async (id, payload) => {
    const { data, error } = await supabase
      .from("admin_deals_of_day")
      .update(payload)
      .eq("id", id)
      .select(ADMIN_DEAL_SELECT)
      .single();

    throwQueryError(error);
    return normalizeDeal(data);
  },

  remove: async (id) => {
    const { error } = await supabase
      .from("admin_deals_of_day")
      .delete()
      .eq("id", id);

    throwQueryError(error);
    return true;
  },

  normalizeDeal,
  toShowcaseSection,
};
