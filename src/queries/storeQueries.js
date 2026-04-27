// src/queries/storeQueries.js
import { StoreAPI } from "@/api/storeApi";

export const storeQueries = {
  myStore: (userId) => ({
    queryKey: ["my-store", userId],
    queryFn: () => StoreAPI.getMyStore(userId),
  }),

  myProducts: (userId) => ({
    queryKey: ["my-products", userId],
    queryFn: () => StoreAPI.getMyProducts(userId),
  }),

  dashboardStats: (userId) => ({
    queryKey: ["dashboard-stats", userId],
    queryFn: () => StoreAPI.getDashboardStats(userId),
  }),

  liveStats: (userId) => ({
    queryKey: ["live-stats", userId],
    queryFn: () => StoreAPI.getLiveStats(userId),
  }),
};
