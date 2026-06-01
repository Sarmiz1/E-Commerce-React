const toMinorAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

const toTimestamp = (value) => {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

export const hasActiveSalePrice = (product, now = Date.now()) => {
  const price = toMinorAmount(product?.price_minor);
  const salePrice = toMinorAmount(product?.sale_price_minor);
  const saleStartsAt = toTimestamp(product?.sale_starts_at);
  const saleEndsAt = toTimestamp(product?.sale_ends_at);

  return (
    salePrice > 0 &&
    salePrice < price &&
    (!saleStartsAt || saleStartsAt <= now) &&
    (!saleEndsAt || saleEndsAt >= now)
  );
};

export const getEffectivePriceMinor = (product) =>
  hasActiveSalePrice(product)
    ? toMinorAmount(product?.sale_price_minor)
    : toMinorAmount(product?.price_minor);

export const getSellablePriceMinor = (product, variant) => {
  if (hasActiveSalePrice(product)) {
    return toMinorAmount(product?.sale_price_minor);
  }

  return toMinorAmount(variant?.price_minor) || toMinorAmount(product?.price_minor);
};

export const getSaleOriginalPriceMinor = (product) =>
  hasActiveSalePrice(product) ? toMinorAmount(product?.price_minor) : 0;

