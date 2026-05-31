const KEY = "guest_cart";

export const CartStorage = {
  get: () => {
    try {
      const items = JSON.parse(localStorage.getItem(KEY)) || [];
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  },

  set: (items) => {
    localStorage.setItem(KEY, JSON.stringify(Array.isArray(items) ? items : []));
  },

  clear: () => localStorage.removeItem(KEY),
};
