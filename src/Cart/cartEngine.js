import { CartStorage } from "./cartStorage";
import { CartAPI } from "../api/cartApi";

export const CartEngine = {
  isGuest(userId) {
    return !userId;
  },

  getGuestCart() {
    return CartStorage.get();
  },

  setGuestCart(items) {
    CartStorage.set(items);
  },

  mergeGuestToServer: async (userId, cartId) => {
    const guestCart = CartStorage.get();

    if (!guestCart.length) return;

    for (const item of guestCart) {
      await CartAPI.add({
        cartId,
        variantId: item.variant_id,
        quantity: item.quantity,
      });
    }

    CartStorage.clear();
  },
};