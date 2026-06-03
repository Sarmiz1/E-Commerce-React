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

export const buildCurationIndexSections = (feed, basePath = "/products/curation") => {
  if (!feed) return [];

  return CURATION_DEFINITIONS.map((definition, index) => {
    const curation = getCurationForDefinition(feed.curations || [], definition);
    const items = (feed[definition.key] || []).map(normalizeShowcaseProduct);

    if (!curation || !items.length) return null;

    const id = slugify(curation.slug || definition.slugs[0] || definition.key);
    const accent = ACCENTS[index % ACCENTS.length];

    return {
      id,
      label: curation.name || titleFromKey(definition.key),
      topbarLabel: curation.name || titleFromKey(definition.key),
      tag: "CURATION",
      tagColor: accent,
      accent,
      path: `${basePath}/${encodeURIComponent(id)}`,
      items,
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
      .slice(0, 10)
      .map(normalizeShowcaseProduct);
    const accent = ACCENTS[index % ACCENTS.length];

    return {
      id,
      label: category.label,
      topbarLabel: category.label,
      tag: `${items.length} PICKS`,
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
