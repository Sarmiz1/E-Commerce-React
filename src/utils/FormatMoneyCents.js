export const formatMoneyCents = (priceCent) => {
  if (priceCent == null || isNaN(priceCent)) return "$0.00";
  return `$${((priceCent / 100).toFixed(2))}`;
};

// Currency-aware formatter (stub — user will finalize)
export const formatMoneyCurrency = (amountMinor) => {
  if (amountMinor == null || isNaN(amountMinor)) return "₦0.00";
  return `₦${Number((amountMinor / 100).toFixed(2)).toLocaleString()}`;
};