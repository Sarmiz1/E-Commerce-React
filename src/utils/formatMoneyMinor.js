export const formatMoneyMinor = (amountMinor) => {
  if (amountMinor == null || isNaN(amountMinor)) return "₦0.00";
  return `₦${Number((amountMinor / 100).toFixed(2)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
};

export const formatMoneyCurrency = (amountMinor, currencyCode = 'NGN') => {
  if (amountMinor == null || isNaN(amountMinor)) return "₦0.00";
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2
  }).format(amountMinor / 100);
};