export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "default", label: "By default" },
  { value: "name", label: "Name" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
];

export function productDetailHref(product) {
  return `/products/${product?.slug || product?.id}`;
}

export function getProductSize(product) {
  const variantSize = product?.product_variants?.find((variant) => variant?.size)?.size;
  return product?.size || product?.volume || variantSize || "30 ml";
}

export function getDefaultVariantId(product) {
  return (
    product?.variant_id ||
    product?.product_variants?.find((variant) => variant?.id)?.id ||
    undefined
  );
}

export function sortWishlistProducts(products, sortBy) {
  const sorted = [...products];

  if (sortBy === "name") {
    sorted.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
  }

  if (sortBy === "price-low") {
    sorted.sort((a, b) => (a?.price_cents || 0) - (b?.price_cents || 0));
  }

  if (sortBy === "price-high") {
    sorted.sort((a, b) => (b?.price_cents || 0) - (a?.price_cents || 0));
  }

  if (sortBy === "rating") {
    sorted.sort((a, b) => (b?.rating_stars || 0) - (a?.rating_stars || 0));
  }

  return sorted;
}
