import { postData, getData } from "./apiClients";

export const OrderAPI = {
  createOrder: (payload) => postData("/api/orders", payload),

  getOrder: (orderId) => getData(`/api/orders/${orderId}`),

  // optional future use
  getOrders: () => getData("/api/orders"),
};