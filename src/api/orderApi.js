// src/api/orderApi.js
import { supabase } from "../lib/supabaseClient";
import { handleResponse } from "./apiClients";

export const OrderAPI = {
  getDeliveryFeeOptions: ({ country = "Nigeria", state = "", city = "" } = {}) =>
    handleResponse(
      supabase.rpc("get_delivery_fee_options", {
        p_country: country,
        p_state: state,
        p_city: city,
      }),
    ),

  initializePaystackCheckout: ({ cartId, couponCode = null, shippingTier = "standard", checkout }) =>
    handleResponse(
      supabase.functions.invoke("paystack-checkout", {
        body: {
          action: "initialize",
          cartId,
          couponCode,
          shippingTier,
          checkout,
        },
      }),
    ),

  verifyPaystackPayment: (reference) =>
    handleResponse(
      supabase.functions.invoke("paystack-checkout", {
        body: {
          action: "verify",
          reference,
        },
      }),
    ),

  // Executes the highly-secure PostgreSQL RPC Function we built
  // This bypasses standard INSERTS to natively run the transactional lock and calculations inside the DB.
  createOrder: ({ cartId, couponCode = null, shippingTier = "standard" }) => {
    const args = {
      p_cart_id: cartId,
      p_shipping_tier: shippingTier
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

  // Cancels an order (marks as cancelled instead of deleting)
  cancelOrder: (orderId) =>
    handleResponse(
      supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
    )
};
