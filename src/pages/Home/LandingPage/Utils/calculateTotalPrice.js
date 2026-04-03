
 export const calculateTotalPrice = (cart) => cart.reduce((a, i) => a + i.priceCents * i.quantity, 0);
