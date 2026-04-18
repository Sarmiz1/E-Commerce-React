// src/api/cartApi.js
import { supabase } from "../supabaseClient";
import { handleResponse } from "./apiClients";

export const CartAPI = {

  // Loads the user's active cart. If none exists, creates one silently.
  load: async (userId) => {
    // 1. Find explicit active cart
    let { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    // 2. Fallback creation if none exist (First time shopper)
    if (!cart) {
      const { data: newCart, error } = await supabase
        .from("carts")
        .insert({ user_id: userId, status: "active" })
        .select("id")
        .single();
        
      if (error) throw new Error(error.message);
      cart = newCart;
    }

    // 3. Hydrate relations (Fetching products AND their selected variants)
    return handleResponse(
      supabase
        .from("cart_items")
        .select(`
          id,
          cart_id,
          quantity,
          product_id,
          variant_id,
          products (*),
          product_variants (*)
        `)
        .eq("cart_id", cart.id)
    ).then(items => ({ cartId: cart.id, items })); // Return cartId alongside items for React Context
  },

  // Because of our custom DB Constraint unique(cart_id, variant_id), Supabase 
  // allows us to run upsert() here natively to handle quantity accumulations!
  add: (cartId, productId, variantId, quantity = 1) =>
    handleResponse(
      supabase
        .from("cart_items")
        .upsert(
          { cart_id: cartId, product_id: productId, variant_id: variantId, quantity },
          { onConflict: 'cart_id, variant_id' }
        )
    ),

  update: (cartItemId, quantity) =>
    handleResponse(
      supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItemId)
    ),

  remove: (cartItemId) =>
    handleResponse(
      supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId)
    ),

  clear: (cartId) =>
    handleResponse(
      supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId)
    )
};