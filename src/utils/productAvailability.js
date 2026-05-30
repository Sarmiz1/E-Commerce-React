export const isSellableVariant = (variant) =>
  variant?.is_active !== false && Number(variant?.stock_quantity) > 0;

export const getSellableVariants = (product = {}) => {
  const variants = product.product_variants ?? product.variants;
  return Array.isArray(variants) ? variants.filter(isSellableVariant) : [];
};

export const normalizeSellableProduct = (product) => {
  if (!product || product.is_active === false) return null;

  const variants = product.product_variants ?? product.variants;
  if (!Array.isArray(variants)) return product;

  const sellableVariants = variants.filter(isSellableVariant);
  if (!sellableVariants.length) return null;

  return {
    ...product,
    product_variants: sellableVariants,
    ...(Array.isArray(product.variants) ? { variants: sellableVariants } : {}),
  };
};

export const filterSellableProducts = (products = []) =>
  products.map(normalizeSellableProduct).filter(Boolean);
