const NEW_ARRIVALS_SLUG = "new-arrivals";
const PREMIUM_SLUG = "premium";
const THIS_WEEK_SLUG = "this-week";
const COLLECTIONS_SLUG = "collections";
const BY_CATEGORY_SLUG = "by-category";

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildFeaturedHref = (featured) => {
  const tagSlug = slugify(featured?.tag);

  if (tagSlug === PREMIUM_SLUG) {
    return "/products/curations/brands";
  }

  return `/products/curations/${tagSlug}`;
};

export const buildLinkHref = (featuredTag, heading, label) => {
  const featuredTagSlug = slugify(featuredTag);
  const headingSlug = slugify(heading);
  const labelSlug = slugify(label);

  if (featuredTagSlug === PREMIUM_SLUG) {
    return `/products/curations/brands/${headingSlug}/${labelSlug}`;
  }

  if (headingSlug === THIS_WEEK_SLUG) {
    const curationSlug =
      labelSlug === NEW_ARRIVALS_SLUG ? NEW_ARRIVALS_SLUG : labelSlug;
    return `/products/curations/${curationSlug}`;
  }

  if (headingSlug === COLLECTIONS_SLUG) {
    return `/products/collections/${labelSlug}`;
  }

  if (headingSlug === BY_CATEGORY_SLUG) {
    return `/products/categories/${labelSlug}`;
  }

  const href = `/products/categories/${labelSlug}`;
  if (headingSlug === "lifestyle") {
    return href;
  }

  return `${href}?${new URLSearchParams({ filter: headingSlug }).toString()}`;
};

export const buildViewAllHref = (featuredTag, heading) => {
  const featuredTagSlug = slugify(featuredTag);
  const headingSlug = slugify(heading);

  if (featuredTagSlug === PREMIUM_SLUG) {
    return `/products/curations/brands/${headingSlug}`;
  }

  if (headingSlug === THIS_WEEK_SLUG) {
    return "/products/curations";
  }

  if (headingSlug === COLLECTIONS_SLUG) {
    return "/products/collections";
  }

  if (headingSlug === BY_CATEGORY_SLUG) {
    return "/products/categories";
  }

  return `/products/categories?${new URLSearchParams({ filter: headingSlug }).toString()}`;
};
