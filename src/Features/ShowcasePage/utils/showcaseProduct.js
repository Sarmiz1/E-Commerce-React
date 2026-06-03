import { getProductImages } from "../../../utils/getProductImages";
import { formatMoneyMinor } from "../../../utils/formatMoneyMinor";
import { getEffectivePriceMinor } from "../../../utils/productPricing";

export const getShowcaseProductImage = (product) =>
  product?.img || getProductImages(product)[0] || product?.image || "";

export const getShowcaseVariantId = (product) =>
  product?.variant_id ||
  product?.product_variants?.find((variant) => variant?.id)?.id ||
  product?.variants?.find((variant) => variant?.id)?.id ||
  null;

export const getShowcasePriceMinor = (product) => {
  const effective = getEffectivePriceMinor(product);
  if (effective > 0) return effective;
  if (Number(product?.price_minor) > 0) return Number(product.price_minor);
  if (Number(product?.price) > 0) return Math.round(Number(product.price) * 1500 * 100);
  return 0;
};

export const getShowcaseOriginalPriceMinor = (product) =>
  Number(product?.compare_at_price_minor || product?.original_price_minor) || 0;

export const getShowcaseDiscount = (product) => {
  const price = getShowcasePriceMinor(product);
  const original = getShowcaseOriginalPriceMinor(product);

  if (!price || !original || original <= price) return null;
  return Math.round((1 - price / original) * 100);
};

export const formatShowcaseProductPrice = (product, priceMinor = getShowcasePriceMinor(product)) =>
  formatMoneyMinor(priceMinor);

export const getShowcaseProductPath = (product) =>
  `/products/${product?.slug || product?.id}`;

export const normalizeShowcaseProduct = (product = {}) => ({
  ...product,
  img: product.img || getShowcaseProductImage(product),
  image: product.image || product.img || getShowcaseProductImage(product),
  variant_id: getShowcaseVariantId(product),
});
