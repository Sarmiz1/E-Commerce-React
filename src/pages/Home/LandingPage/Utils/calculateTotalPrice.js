
 export const calculateTotalPrice = (cart) => cart.reduce((a, i) => a + i.product.priceCents * i.quantity, 0);
