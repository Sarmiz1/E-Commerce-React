import { CURATION_DEFINITIONS } from "../../../api/curationFetchLoader";
import {
  getProductCategoryOptions,
  matchesProductCategory,
} from "../../Product/Hooks/useProductsFilter";
import { HERO_SLIDES } from "../data";
import { formatShowcaseTitle } from "./formatShowcaseTitle";
import { getShowcaseProductImage, normalizeShowcaseProduct } from "./showcaseProduct";

const ACCENTS = [
  "#E8433A",
  "#C9A84C",
  "#0F7B6C",
  "#6B4FA0",
  "#D4447A",
  "#1A73C9",
  "#F05D27",
];

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const titleFromKey = (key = "") =>
  formatShowcaseTitle(
    String(key)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, "-"),
  );

const getCurationForDefinition = (curations = [], definition) => {
  const slugs = new Set(definition.slugs.map(slugify));
  return curations.find((curation) => slugs.has(slugify(curation.slug)));
};

const SECTION_TAGS = {
  "trending-products": "LIVE",
  "trending-now": "LIVE",
  "best-sellers": "ALWAYS ON",
  "new-arrivals": "JUST IN",
  "flash-deals": "ENDS SOON",
  "deal-of-the-day": "TODAY ONLY",
  "editorial-collections": "CURATED",
  "editors-picks": "CURATED",
  "most-loved": "TOP RATED",
  "hot-right-now": "SURGING",
  "recommended-for-user": "PERSONAL",
  "continue-shopping": "PICK UP WHERE YOU LEFT OFF",
  "based-on-browsing": "JUST FOR YOU",
  "shop-by-brands": "BRAND DIRECTORY",
};

const getSectionTag = ({ curation, definition, items = [], fallback = "CURATED" }) => {
  const metadata = curation?.metadata || {};
  const slug = slugify(curation?.slug || definition?.slugs?.[0] || definition?.key);
  const keySlug = slugify(definition?.key || "");

  return (
    curation?.showcaseTag ||
    curation?.showcase_tag ||
    metadata.showcaseTag ||
    metadata.showcase_tag ||
    metadata.tag ||
    SECTION_TAGS[slug] ||
    SECTION_TAGS[keySlug] ||
    (items.some((item) => Number(item.recent_quantity_sold || 0) > 0) ? "LIVE" : fallback)
  );
};

const decorateShowcaseStore = (store = {}) => ({
  ...store,
  id: store.id,
  name: store.name || store.store_name || store.full_name || "WooSho Store",
  image: store.image || store.store_logo || store.avatar_url || "",
  slug: store.slug || store.store_slug || store.id,
  rating: Number(store.rating || 0),
  trustScore: Number(store.trustScore || store.trust_score || 0),
  isVerified: Boolean(store.isVerified || store.is_verified_store),
  badges: Array.isArray(store.badges || store.seller_badges)
    ? store.badges || store.seller_badges
    : [],
});

const decorateShowcaseBrand = (brand = {}) => ({
  ...brand,
  id: brand.id || brand.slug || brand.name,
  name: brand.name || brand.brand_name || "Brand",
  slug: brand.slug || brand.brand_slug || slugify(brand.name || brand.brand_name),
  image: brand.image || brand.sample_image || "",
  productCount: Number(brand.productCount || brand.product_count || 0),
});

const decorateShowcaseItem = (item = {}, index = 0, sectionTag = "") => {
  const normalized = normalizeShowcaseProduct(item);
  const sold = Number(normalized.sold || normalized.quantity_sold || 0);
  const recentSold = Number(normalized.recent_quantity_sold || 0);
  const rating = Number(normalized.rating_stars || normalized.rating || 0);
  const reviews = Number(normalized.rating_count || normalized.reviews || 0);
  const isNew = normalized.created_at
    ? Date.now() - new Date(normalized.created_at).getTime() < 1000 * 60 * 60 * 24 * 14
    : false;

  let badge =
    normalized.badge ||
    normalized.showcase_badge ||
    normalized.curation?.metadata?.badge ||
    normalized.curation?.metadata?.tag ||
    "";

  if (!badge) {
    if (index === 0 && /best|trending|hot/i.test(sectionTag)) badge = "#1 This Week";
    else if (recentSold >= 25) badge = "Viral";
    else if (recentSold >= 10) badge = "Trending";
    else if (isNew) badge = "New";
    else if (rating >= 4.7 && reviews >= 20) badge = "Top Rated";
  }

  return {
    ...normalized,
    badge,
    sold,
    quantity_sold: sold,
    sales_minor: Number(normalized.sales_minor || 0),
    saleEndsAt: normalized.saleEndsAt || normalized.sale_ends_at || normalized.curation?.metadata?.saleEndsAt || normalized.curation?.metadata?.sale_ends_at,
    saleStartsAt: normalized.saleStartsAt || normalized.sale_starts_at || normalized.curation?.metadata?.saleStartsAt || normalized.curation?.metadata?.sale_starts_at,
  };
};

const getSoonestSaleEnd = (items = []) =>
  items
    .map((item) => item.saleEndsAt || item.sale_ends_at || item.timeLeftEndsAt)
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()) && date.getTime() > Date.now())
    .sort((a, b) => a.getTime() - b.getTime())[0]
    ?.toISOString();

export const buildTopbarLabels = (sections = []) =>
  sections.reduce((labels, section) => {
    labels[section.id] = section.topbarLabel || section.label;
    return labels;
  }, {});

export const getSectionProducts = (sections = []) =>
  sections.flatMap((section) => [
    ...(section.featured ? [section.featured] : []),
    ...(section.items || []),
  ]);

export const buildShowcaseHeroSlides = ({
  id = "showcase-hero",
  title = "WooSho Showcase",
  eyebrow = "WooSho Showcase",
  subtitle = "Explore the latest products, collections, and marketplace edits.",
  image,
  accent = "#E8433A",
  cta = "Start Shopping",
  ctaSecondary = "View All",
} = {}) => [
  {
    id,
    type: "image",
    src: image || HERO_SLIDES[0].src,
    eyebrow,
    headline: title,
    sub: subtitle,
    cta,
    ctaSecondary,
    accent,
    theme: "dark",
    position: "left",
  },
];

export const buildCurationIndexSections = (feed, basePath = "/products/curations") => {
  if (!feed) return [];

  const definitionBySlug = new Map(
    CURATION_DEFINITIONS.flatMap((definition) =>
      definition.slugs.map((slug) => [slugify(slug), definition]),
    ),
  );
  const curationSections = feed.curationSections?.length
    ? feed.curationSections
    : CURATION_DEFINITIONS.map((definition) => {
        const curation = getCurationForDefinition(feed.curations || [], definition);
        if (!curation) return null;
        return {
          ...curation,
          products: feed[definition.key] || [],
        };
      }).filter(Boolean);

  const sections = curationSections.map((curation, index) => {
    const definition = definitionBySlug.get(slugify(curation.slug)) || null;
    const id = slugify(curation.slug || definition?.slugs?.[0] || definition?.key);
    const isStoreSection = id === "recently-added-stores";
    const isBrandSection = id === "shop-by-brands";
    const rawItems = curation.products || [];
    const rawStores = isStoreSection ? curation.stores || feed.recentlyAddedStores || [] : [];
    const rawBrands = isBrandSection ? curation.brands || feed.shopByBrands || [] : [];
    const sectionTag = getSectionTag({
      curation,
      definition,
      items: isStoreSection ? rawStores : isBrandSection ? rawBrands : rawItems,
      fallback: isStoreSection ? "FRESH ARRIVALS" : isBrandSection ? "BRAND DIRECTORY" : "CURATED",
    });
    const items = rawItems
      .slice(0, 5)
      .map((item, itemIndex) => decorateShowcaseItem(item, itemIndex, sectionTag));
    const stores = rawStores
      .slice(0, 5)
      .map(decorateShowcaseStore);
    const brands = rawBrands
      .slice(0, 8)
      .map(decorateShowcaseBrand);

    if (!curation || (!items.length && !stores.length && !brands.length)) return null;

    const accent = ACCENTS[index % ACCENTS.length];
    const isDealOfDay =
      id === "deal-of-the-day" ||
      slugify(definition?.key) === "deal-of-the-day" ||
      /deal of the day/i.test(curation.name || "");
    const isFlash =
      id === "flash-deals" ||
      slugify(definition?.key) === "flash-deals" ||
      /flash|sale/i.test(curation.name || "") ||
      sectionTag === "ENDS SOON";
    const saleEndsAt =
      curation.metadata?.saleEndsAt ||
      curation.metadata?.sale_ends_at ||
      curation.saleEndsAt ||
      curation.sale_ends_at ||
      getSoonestSaleEnd(items);
    const displayItems = isFlash && saleEndsAt
      ? items.map((item) => ({
          ...item,
          saleEndsAt: item.saleEndsAt || item.sale_ends_at || saleEndsAt,
        }))
      : items;

    return {
      id,
      label: curation.name || titleFromKey(definition?.key || id),
      topbarLabel: curation.name || titleFromKey(definition?.key || id),
      tag: sectionTag,
      tagColor: curation.showcaseTagColor || curation.showcase_tag_color || accent,
      accent,
      path: `${basePath}/${encodeURIComponent(id)}`,
      featured: isDealOfDay ? displayItems[0] : null,
      items: isDealOfDay ? displayItems.slice(1, 5) : displayItems,
      stores,
      brands,
      type: isBrandSection ? "brands" : isStoreSection ? "stores" : "products",
      isDealOfDay,
      isFlash,
      saleEndsAt,
      description: curation.description || "",
    };
  }).filter(Boolean);

  if (feed.adminDealOfDay?.featured) {
    const adminDealItems = [
      feed.adminDealOfDay.featured,
      ...(feed.adminDealOfDay.items || []),
    ]
      .slice(0, 5)
      .map((item, index) => decorateShowcaseItem(item, index, feed.adminDealOfDay.tag || "TODAY ONLY"));
    const adminSaleEndsAt =
      feed.adminDealOfDay.saleEndsAt ||
      getSoonestSaleEnd(adminDealItems);
    const displayItems = adminSaleEndsAt
      ? adminDealItems.map((item) => ({
          ...item,
          saleEndsAt: item.saleEndsAt || item.sale_ends_at || adminSaleEndsAt,
        }))
      : adminDealItems;
    const adminSection = {
      ...feed.adminDealOfDay,
      id: "deal-of-the-day",
      path: feed.adminDealOfDay.path || `${basePath}/deal-of-the-day`,
      featured: displayItems[0],
      items: displayItems.slice(1, 5),
      stores: [],
      type: "products",
      isDealOfDay: true,
      saleEndsAt: adminSaleEndsAt,
    };
    const fallbackIndex = sections.findIndex((section) => section.id === "deal-of-the-day");

    if (fallbackIndex >= 0) {
      sections[fallbackIndex] = adminSection;
    } else {
      sections.unshift(adminSection);
    }
  }

  if (!sections.some((section) => section.id === "recently-added-stores") && feed.recentlyAddedStores?.length) {
    sections.push({
      id: "recently-added-stores",
      label: "Recently Added Stores",
      topbarLabel: "Recently Added Stores",
      tag: "FRESH ARRIVALS",
      tagColor: "#0F7B6C",
      accent: "#0F7B6C",
      path: "/stores",
      type: "stores",
      stores: feed.recentlyAddedStores.slice(0, 5).map(decorateShowcaseStore),
      items: [],
      description: "Discover the newest stores joining WooSho.",
    });
  }

  return sections.map((section) =>
    section.id === "recently-added-stores"
      ? { ...section, path: "/stores" }
      : section.id === "shop-by-brands"
      ? { ...section, path: "/brands" }
      : section,
  );
};

export const buildCategoryIndexSections = (products = [], basePath = "/products/categories") => {
  const options = getProductCategoryOptions(products).filter((category) => category.value !== "All");

  return options.map((category, index) => {
    const id = slugify(category.value || category.label);
    const items = products
      .filter((product) => matchesProductCategory(product, category.value))
      .slice(0, 5)
      .map((product, itemIndex) => decorateShowcaseItem(product, itemIndex, category.label));
    const accent = ACCENTS[index % ACCENTS.length];
    const hasNewProducts = items.some((item) => {
      if (!item.created_at) return false;
      return Date.now() - new Date(item.created_at).getTime() < 1000 * 60 * 60 * 24 * 14;
    });

    return {
      id,
      label: category.label,
      topbarLabel: category.label,
      tag: hasNewProducts ? "JUST IN" : "ALWAYS ON",
      tagColor: accent,
      accent,
      path: `${basePath}/${encodeURIComponent(id)}`,
      items,
      description: `Explore ${category.label.toLowerCase()} products across WooSho.`,
    };
  }).filter((section) => section.items.length);
};

export const getFirstShowcaseImage = (sections = []) =>
  getShowcaseProductImage(getSectionProducts(sections)[0]);
