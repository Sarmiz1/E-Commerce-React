export const formatMoneyCents = (priceCent) => {

  return `$${((priceCent / 100).toFixed(2))}`
}