import { postData, getData } from "./apiClients";


export const OrderAPI = {
  createOrder: (payload) => postData("/orders", payload),

  getOrder: (orderId) => getData(`/orders/${orderId}`),

  // optional future use
  getOrders: () => getData("/orders"),
};