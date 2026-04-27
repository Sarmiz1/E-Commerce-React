import { productsApi, cartApi, ordersApi, storeApi } from "@/api";

export const queries = {
  products: {
    key: ["products"],
    fn: () => productsApi.list(),
  },

  product: (id) => ({
    key: ["product", id],
    fn: () => productsApi.get(id),
  }),

  cart: (userId) => ({
    key: ["cart", userId],
    fn: () => cartApi.list(null, [["user_id", "eq", userId]]),
  }),

  orders: (userId) => ({
    key: ["orders", userId],
    fn: () => ordersApi.list(null, [["user_id", "eq", userId]]),
  }),

  store: (userId) => ({
    key: ["store", userId],
    fn: () => storeApi.getMyStore(userId),
  }),

  dashboard: (userId) => ({
    key: ["dashboard", userId],
    fn: () => storeApi.getDashboardStats(userId),
  }),
};