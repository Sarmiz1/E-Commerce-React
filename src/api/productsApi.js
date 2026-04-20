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
  // Fetch single product details by id
  getById: (id) =>
    handleResponse(
      supabase
        .from("products")
        .select("*, product_variants(*), product_images(*)")
        .eq("id", id)
        .single()
    ),

  // Fetch single product details by slug
  getBySlug: (slug) =>
    handleResponse(
      supabase
        .from("products")
        .select("*, product_variants(*), product_images(*)")
        .eq("slug", slug)
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