// src/api/productsApi.js
import { supabase } from "../supabaseClient";
import { handleResponse } from "./apiClients";

export const ProductsAPI = {
  // Fetch active catalog with all color/size variants and images attached
  getAll: () =>
    handleResponse(
      supabase
        .from("products")
        .select("*, product_variants(*), product_images(*)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
    ),

  // Fetch single product details with relations mapped
  getById: (id) =>
    handleResponse(
      supabase
        .from("products")
        .select("*, product_variants(*), product_images(*)")
        .eq("id", id)
        .single()
    ),

  // Predictive pairings utilizing standard PostgreSQL array overlaps for keywords
  getByKeywords: (keywordsArray) =>
    handleResponse(
      supabase
        .from("products")
        .select("*, product_variants(*), product_images(*)")
        .eq("is_active", true)
        .overlaps("keywords", keywordsArray)
    ),
};