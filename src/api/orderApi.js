// src/api/orderApi.js
import { supabase } from "../supabaseClient";
import { handleResponse } from "./apiClients";

export const OrderAPI = {

  // Executes the highly-secure PostgreSQL RPC Function we built
  // This bypasses standard INSERTS to natively run the transactional lock and calculations inside the DB.
  createOrder: ({ cartId, userId, couponCode = null }) => 
    handleResponse(
      supabase.rpc("checkout_cart", {
        p_cart_id: cartId,
        p_user_id: userId,
        p_coupon_code: couponCode
      })
    ),

  // Retrieves an order by ID, mapped to its immutably snapshotted items
  getOrder: (orderId) => 
    handleResponse(
      supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product_variants (*)
          )
        `)
        .eq("id", orderId)
        .single()
    ),

  // Generates user's order history
  getOrders: (userId) => 
    handleResponse(
      supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    )
};