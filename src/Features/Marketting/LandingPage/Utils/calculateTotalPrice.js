
 export const calculateTotalPrice = (cart) => cart?.reduce((a, i) => a + i?.product?.priceMinor * i.quantity, 0);
