export const formatMoneyCents = (priceCent) => {
  if (priceCent == null || isNaN(priceCent)) return "$0.00";
  return `$${((priceCent / 100).toFixed(2))}`;
};