import { supabase } from "../lib/supabaseClient";

const PUBLIC_ADVERTISEMENT_SELECT = `
  id,
  seller_id,
  product_id,
  title,
  subtitle,
  creative_type,
  placement,
  destination_url,
  image_url,
  package_id,
  required_seller_plan,
  eligible_plan_ids,
  budget_minor,
  bid_type,
  bid_minor,
  starts_at,
  ends_at,
  priority,
  weight,
  targeting_rules,
  creative_payload,
  metadata,
  created_at,
  product:products!product_id (
    id,
    name,
    slug,
    image,
    price_minor
  ),
  seller:seller_public!seller_id (
    id,
    full_name,
    store_name,
    store_slug,
    store_logo,
    avatar_url,
    rating,
    is_verified_store
  )
`;

const ADMIN_ADVERTISEMENT_SELECT = `
  ${PUBLIC_ADVERTISEMENT_SELECT},
  payment_status,
  payment_reference,
  approval_status,
  admin_status_note,
  admin_approved_by,
  admin_approved_at,
  updated_at
`;

const throwQueryError = (error) => {
  if (error) throw new Error(error.message);
};

const applyPublicFilters = (query, { placement, surface, limit = 6 } = {}) => {
  const now = new Date().toISOString();
  let nextQuery = query;

  if (placement) nextQuery = nextQuery.eq("placement", placement);
  if (surface) nextQuery = nextQuery.contains("targeting_rules", { surfaces: [surface] });

  return nextQuery
    .eq("approval_status", "approved")
    .eq("payment_status", "paid")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("priority", { ascending: true })
    .order("weight", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
};

export const AdvertisementsAPI = {
  getPublic: ({ placement, surface, limit } = {}) => ({
    queryKey: ["advertisements", "public", placement || "all", surface || "all", limit || 6],
    queryFn: async () => {
      const { data, error } = await applyPublicFilters(
        supabase.from("advertisements").select(PUBLIC_ADVERTISEMENT_SELECT),
        { placement, surface, limit },
      );

      throwQueryError(error);
      return data || [];
    },
  }),

  listAdmin: ({ status, placement, limit = 100 } = {}) => ({
    queryKey: ["advertisements", "admin", status || "all", placement || "all", limit],
    queryFn: async () => {
      let query = supabase
        .from("advertisements")
        .select(ADMIN_ADVERTISEMENT_SELECT)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) query = query.eq("approval_status", status);
      if (placement) query = query.eq("placement", placement);

      const { data, error } = await query;
      throwQueryError(error);
      return data || [];
    },
  }),

  updateAdminStatus: async (advertisementId, payload) => {
    const { data, error } = await supabase
      .from("advertisements")
      .update({
        approval_status: payload.approvalStatus,
        admin_status_note: payload.adminStatusNote || null,
        priority: payload.priority,
        weight: payload.weight,
        starts_at: payload.startsAt || null,
        ends_at: payload.endsAt || null,
        admin_approved_at: payload.approvalStatus === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", advertisementId)
      .select(ADMIN_ADVERTISEMENT_SELECT)
      .single();

    throwQueryError(error);
    return data;
  },

  recordEvent: async ({
    advertisementId,
    eventType,
    eventValueMinor = 0,
    productId,
    orderId,
    sessionId,
    placement,
    surface,
    metadata = {},
  }) => {
    if (!advertisementId || !eventType) return false;

    const { error } = await supabase
      .from("advertisement_events")
      .insert({
        advertisement_id: advertisementId,
        event_type: eventType,
        event_value_minor: eventValueMinor,
        product_id: productId || null,
        order_id: orderId || null,
        session_id: sessionId || null,
        placement: placement || null,
        surface: surface || null,
        metadata,
      });

    throwQueryError(error);
    return true;
  },
};
