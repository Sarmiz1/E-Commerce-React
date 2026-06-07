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
  };
};

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

  return curationSections.map((curation, index) => {
    const definition = definitionBySlug.get(slugify(curation.slug)) || null;
    const rawItems = curation.products || [];
    const sectionTag = getSectionTag({ curation, definition, items: rawItems });
    const items = rawItems
      .slice(0, 5)
      .map((item, itemIndex) => decorateShowcaseItem(item, itemIndex, sectionTag));

    if (!curation || !items.length) return null;

    const id = slugify(curation.slug || definition?.slugs?.[0] || definition?.key);
    const accent = ACCENTS[index % ACCENTS.length];
    const isDealOfDay =
      id === "deal-of-the-day" ||
      slugify(definition?.key) === "deal-of-the-day" ||
      /deal of the day/i.test(curation.name || "");

    return {
      id,
      label: curation.name || titleFromKey(definition?.key || id),
      topbarLabel: curation.name || titleFromKey(definition?.key || id),
      tag: sectionTag,
      tagColor: curation.showcaseTagColor || curation.showcase_tag_color || accent,
      accent,
      path: `${basePath}/${encodeURIComponent(id)}`,
      featured: isDealOfDay ? items[0] : null,
      items: isDealOfDay ? items.slice(1, 5) : items,
      isDealOfDay,
      description: curation.description || "",
    };
  }).filter(Boolean);
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
