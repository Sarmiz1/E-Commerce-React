import { OrderAPI } from "../api/orderApi"; 

export const fetchOrdersLoader = async () => {
  try {
    const orders = await OrderAPI.getOrders();
    return orders;
  } catch {
    throw new Response("Failed to fetch orders", {
      status: 500,
    });
  }
};