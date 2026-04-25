const KEY = "guest_cart";

export const CartStorage = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  },

  set: (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
  },

  clear: () => localStorage.removeItem(KEY),
};