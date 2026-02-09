export const FormatMoneyCents = (priceCent) => {

  return `$${((priceCent / 100).toFixed(2))}`
}