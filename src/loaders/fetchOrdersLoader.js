import { OrderAPI } from "../api/orderApi"; 
import { supabase } from "../supabaseClient";

export const fetchOrdersLoader = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return []; // Return empty if not logged in
    }

    const orders = await OrderAPI.getOrders(user.id);
    return orders;
  } catch {
    throw new Response("Failed to fetch orders", {
      status: 500,
    });
  }
};