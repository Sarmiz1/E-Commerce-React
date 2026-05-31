import { BRANDS } from "../data/brandsData";

const normalizeBrandValue = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const BRANDS_DIRECTORY_HREF = "/brands";

export const buildBrandsDirectoryHref = () => BRANDS_DIRECTORY_HREF;

export const buildBrandHref = (brandId) =>
  `${BRANDS_DIRECTORY_HREF}/${encodeURIComponent(brandId)}`;

export const buildBrandCatalogHref = (brandId) =>
  `/products/curations/shop-by-brands/${encodeURIComponent(brandId)}`;

export const getBrandById = (brandId) =>
  BRANDS.find((brand) => brand.id === brandId);

export const getBrandsByCategory = (category) =>
  category === "All"
    ? BRANDS
    : BRANDS.filter((brand) => brand.category === category);

export const getRelatedBrands = (brand, limit = 3) => {
  if (!brand) return [];

  const relatedBrands = [];
  const seenIds = new Set([brand.id]);
  const addBrand = (candidate) => {
    if (!candidate || seenIds.has(candidate.id) || relatedBrands.length >= limit) {
      return;
    }

    seenIds.add(candidate.id);
    relatedBrands.push(candidate);
  };

  (brand.relatedBrandIds || [])
    .map(getBrandById)
    .forEach(addBrand);

  BRANDS.filter((candidate) => candidate.category === brand.category)
    .forEach(addBrand);

  return relatedBrands;
};

export const getProductsForBrand = (products, brand) => {
  if (!brand) return [];

  const aliases = new Set(
    [brand.name, ...(brand.aliases || [])].map(normalizeBrandValue),
  );

  return (products || []).filter((product) => {
    const productBrand =
      typeof product?.brand === "string" ? product.brand : product?.brand?.name;

    return aliases.has(normalizeBrandValue(productBrand));
  });
};
