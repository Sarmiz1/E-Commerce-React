// → localStorage helpers

const KEY = "cart";

export const CartStorage = {
  load: () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  },

  save: (cart) => {
    localStorage.setItem(KEY, JSON.stringify(cart));
  },

  clear: () => {
    localStorage.removeItem(KEY);
  },
};