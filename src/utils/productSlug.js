const PRODUCT_SLUG_SUFFIX = /-(\d+)$/;

export const slugifyProductName = (name = "") =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";

export const createProductSlug = (name, suffix = Date.now()) =>
  `${slugifyProductName(name)}-${suffix}`;

export const refreshProductSlug = (name, currentSlug) => {
  const suffix = String(currentSlug || "").match(PRODUCT_SLUG_SUFFIX)?.[1];
  return createProductSlug(name, suffix || Date.now());
};

