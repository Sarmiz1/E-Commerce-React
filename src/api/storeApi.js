// src/api/storeApi.js
import { supabase } from "../supabaseClient";

export const StoreAPI = {
  getMyStore: async (userId) => {
    const { data, error } = await supabase
      .from("seller_profiles")
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  getMyProducts: async (userId) => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_variants(*),
        product_images(*)
      `)
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  getDashboardStats: async (userId) => {
    const { data, error } = await supabase
      .from("seller_dashboard_stats")
      .select("*")
      .eq("seller_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  getLiveStats: async (userId) => {
    const { data, error } = await supabase
      .from("seller_live_stats")
      .select("*")
      .eq("seller_id", userId)
      .single();

    if (error) throw error;
    return data;
  }
};


