// src/api/orderApi.js
import { supabase } from "../lib/supabaseClient";
import { handleResponse } from "./apiClients";

export const OrderAPI = {

  // Executes the highly-secure PostgreSQL RPC Function we built
  // This bypasses standard INSERTS to natively run the transactional lock and calculations inside the DB.
  createOrder: ({ cartId, userId, couponCode = null, shippingCents = 0 }) => {
    const args = {
      p_cart_id: cartId,
      p_user_id: userId,
      p_shipping_cents: shippingCents
    };
    if (couponCode) {
      args.p_coupon_code = couponCode;
    }
    return handleResponse(supabase.rpc("checkout_cart", args));
  },

  // Retrieves an order by ID, mapped to its immutably snapshotted items
  getOrder: (orderId) => 
    handleResponse(
      supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (*),
            product_variants (*)
          )
        `)
        .eq("id", orderId)
        .single()
    ),

  getOrders: (userId) => 
    handleResponse(
      supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (*),
            product_variants (*)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    ),

  // Cancels an order
  cancelOrder: (orderId) =>
    handleResponse(
      supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
    )
};