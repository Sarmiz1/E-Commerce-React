import { supabase } from "../lib/supabaseClient";

const ADVERT_SELECT = `
  id,
  slug,
  title,
  eyebrow,
  subtitle,
  body,
  placement,
  surface,
  status,
  priority,
  weight,
  starts_at,
  ends_at,
  timezone,
  media_type,
  image_url,
  mobile_image_url,
  video_url,
  poster_url,
  alt_text,
  accent_color,
  text_color,
  overlay_color,
  overlay_opacity,
  theme,
  content_position,
  cta_label,
  cta_url,
  secondary_cta_label,
  secondary_cta_url,
  target_type,
  target_url,
  product_id,
  category_id,
  curation_id,
  store_id,
  audience_rules,
  metadata,
  impression_count,
  click_count,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeAdvert = (advert = {}) => ({
  ...advert,
  id: advert.id,
  slug: advert.slug,
  title: advert.title || "",
  eyebrow: advert.eyebrow || "",
  subtitle: firstDefined(advert.subtitle, advert.body, ""),
  imageUrl: firstDefined(advert.image_url, advert.poster_url, advert.mobile_image_url, ""),
  mobileImageUrl: firstDefined(advert.mobile_image_url, advert.image_url, advert.poster_url, ""),
  videoUrl: advert.video_url || "",
  posterUrl: firstDefined(advert.poster_url, advert.image_url, ""),
  altText: advert.alt_text || advert.title || "Advert",
  accentColor: advert.accent_color || "#E8433A",
  textColor: advert.text_color || "",
  overlayColor: advert.overlay_color || "",
  overlayOpacity: advert.overlay_opacity ?? 0.45,
  theme: advert.theme || "dark",
  contentPosition: advert.content_position || "left",
  ctaLabel: advert.cta_label || "",
  ctaUrl: firstDefined(advert.cta_url, advert.target_url, ""),
  secondaryCtaLabel: advert.secondary_cta_label || "",
  secondaryCtaUrl: advert.secondary_cta_url || "",
  targetType: advert.target_type || "url",
  targetUrl: advert.target_url || advert.cta_url || "",
  audienceRules: advert.audience_rules || {},
  metadata: advert.metadata || {},
  impressionCount: Number(advert.impression_count || 0),
  clickCount: Number(advert.click_count || 0),
});

const toHeroSlide = (advert) => {
  const normalized = normalizeAdvert(advert);

  return {
    id: normalized.id,
    advertId: normalized.id,
    type: normalized.media_type || "image",
    src: normalized.imageUrl,
    videoSrc: normalized.videoUrl || null,
    mobileSrc: normalized.mobileImageUrl,
    poster: normalized.posterUrl,
    eyebrow: normalized.eyebrow,
    headline: normalized.title,
    sub: normalized.subtitle,
    cta: normalized.ctaLabel || "Shop Now",
    ctaHref: normalized.ctaUrl || normalized.targetUrl,
    ctaSecondary: normalized.secondaryCtaLabel || "View All",
    ctaSecondaryHref: normalized.secondaryCtaUrl,
    accent: normalized.accentColor,
    theme: normalized.theme,
    position: normalized.contentPosition,
    alt: normalized.altText,
    overlayColor: normalized.overlayColor,
    overlayOpacity: normalized.overlayOpacity,
    rawAdvert: normalized,
  };
};

const applyPublicFilters = (query, { placement, surface, surfaces, limit = 8 } = {}) => {
  const now = new Date().toISOString();
  let nextQuery = query;

  if (placement) nextQuery = nextQuery.eq("placement", placement);
  if (Array.isArray(surfaces) && surfaces.length) {
    nextQuery = nextQuery.in("surface", surfaces);
  } else if (surface) {
    nextQuery = nextQuery.eq("surface", surface);
  }

  return nextQuery
    .eq("status", "active")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("priority", { ascending: true })
    .order("weight", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
};

const throwQueryError = (error) => {
  if (error) throw new Error(error.message);
};

export const AdminAdvertsAPI = {
  getPublic: ({ placement, surface, surfaces, limit } = {}) => ({
    queryKey: [
      "admin-adverts",
      "public",
      placement || "all",
      surface || surfaces?.join("|") || "all",
      limit || 8,
    ],
    queryFn: async () => {
      const { data, error } = await applyPublicFilters(
        supabase.from("admin_adverts").select(ADVERT_SELECT),
        { placement, surface, surfaces, limit },
      );

      throwQueryError(error);
      return (data || []).map(normalizeAdvert);
    },
  }),

  getPublicHeroSlides: ({
    placement = "showcase_hero",
    surface,
    includeGlobal = true,
    limit = 5,
  } = {}) => ({
    queryKey: [
      "admin-adverts",
      "hero-slides",
      placement,
      surface || "all",
      includeGlobal,
      limit,
    ],
    queryFn: async () => {
      const surfaces = surface && includeGlobal
        ? [surface, "products", "global", "all"]
        : undefined;
      const { data, error } = await applyPublicFilters(
        supabase.from("admin_adverts").select(ADVERT_SELECT),
        { placement, surface, surfaces, limit },
      );

      throwQueryError(error);
      return (data || []).map(toHeroSlide);
    },
  }),

  listAdmin: ({ placement, surface, status, limit = 100 } = {}) => ({
    queryKey: ["admin-adverts", "admin", placement || "all", surface || "all", status || "all", limit],
    queryFn: async () => {
      let query = supabase
        .from("admin_adverts")
        .select(ADVERT_SELECT)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (placement) query = query.eq("placement", placement);
      if (surface) query = query.eq("surface", surface);
      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      throwQueryError(error);
      return (data || []).map(normalizeAdvert);
    },
  }),

  create: async (payload) => {
    const { data, error } = await supabase
      .from("admin_adverts")
      .insert(payload)
      .select(ADVERT_SELECT)
      .single();

    throwQueryError(error);
    return normalizeAdvert(data);
  },

  update: async (id, payload) => {
    const { data, error } = await supabase
      .from("admin_adverts")
      .update(payload)
      .eq("id", id)
      .select(ADVERT_SELECT)
      .single();

    throwQueryError(error);
    return normalizeAdvert(data);
  },

  remove: async (id) => {
    const { error } = await supabase
      .from("admin_adverts")
      .delete()
      .eq("id", id);

    throwQueryError(error);
    return true;
  },

  recordEvent: async ({
    advertId,
    eventType,
    placement,
    surface,
    sessionId,
    metadata = {},
  }) => {
    if (!advertId || !eventType) return false;

    const { error } = await supabase.rpc("record_admin_advert_event", {
      p_advert_id: advertId,
      p_event_type: eventType,
      p_placement: placement || null,
      p_surface: surface || null,
      p_session_id: sessionId || null,
      p_metadata: metadata,
    });

    throwQueryError(error);
    return true;
  },

  normalizeAdvert,
  toHeroSlide,
};
