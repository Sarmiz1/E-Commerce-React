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

    if (!userId || !cartId || !guestCart.length) {
      return { mergedCount: 0, failedItems: guestCart };
    }

    const results = await Promise.allSettled(
      guestCart.map((item) =>
        CartAPI.add({
          cartId,
          productId: item.product_id,
          variantId: item.variant_id,
          quantity: item.quantity,
        }),
      ),
    );
    const failedItems = guestCart.filter(
      (_item, index) => results[index].status === "rejected",
    );

    if (failedItems.length) {
      CartStorage.set(failedItems);
    } else {
      CartStorage.clear();
    }

    return {
      mergedCount: guestCart.length - failedItems.length,
      failedItems,
    };
  },
};
