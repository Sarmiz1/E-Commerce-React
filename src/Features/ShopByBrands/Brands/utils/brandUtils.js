import { BRANDS } from "../data/brandsData";

const normalizeBrandValue = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const buildBrandHref = (brandId) =>
  `/brands/${encodeURIComponent(brandId)}`;

export const buildBrandCatalogHref = (brandName) =>
  `/products?search=${encodeURIComponent(brandName)}`;

export const getBrandById = (brandId) =>
  BRANDS.find((brand) => brand.id === brandId);

export const getBrandsByCategory = (category) =>
  category === "All"
    ? BRANDS
    : BRANDS.filter((brand) => brand.category === category);

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

