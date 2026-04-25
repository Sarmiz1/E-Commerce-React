// src/api/productsApi.js

import { supabase } from "../supabaseClient";

const PRODUCT_SELECT =
  "*, product_variants(*), product_images(*)";

const productsTable = () =>
  supabase.from("products").select(PRODUCT_SELECT);

const fetchProducts = async (builder, single = false) => {
  const { data, error } = single
    ? await builder.single()
    : await builder;

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Product not found");

  return data;
};

export const ProductsAPI = {
  getAll: () => ({
    queryKey: ["products"],
    queryFn: () =>
      fetchProducts(
        productsTable()
          .eq("is_active", true)
          .order("created_at", { ascending: false })
      ),
  }),

  getById: (id) => ({
    queryKey: ["product", id],
    queryFn: () =>
      fetchProducts(
        productsTable().eq("id", id),
        true
      ),
  }),

  

  getBySlug: (slug) => ({
    queryKey: ["product", slug],
    queryFn: () =>
      fetchProducts(
        productsTable()
          .eq("slug", slug)
          .eq("is_active", true),
        true
      ),
  }),

  getByKeywords: (keywordsArray) => ({
    queryKey: ["products", keywordsArray],
    queryFn: () =>
      fetchProducts(
        productsTable()
          .eq("is_active", true)
          .overlaps("keywords", keywordsArray)
          .order("created_at", { ascending: false })
      ),
  }),

  recommendations: (productID, limit = 8) => ({
  queryKey: ["product-recommendations", productID, limit],

  queryFn: async () => {
    const { data, error } = await supabase.rpc(
      "get_ranked_similar_products",
      {
        target_id: productID,
        limit_count: limit,
      }
    );

    if (error) {
      throw new Error(error.message || "Failed to fetch recommendations");
    }

    return data;
  },
}),
};