// src/api/productsApi.js
import { supabase } from "../lib/supabaseClient";
import { createResourceApi } from "./createResourceApi";

// 🔥 Ultimate select string with explicit relationship hints
const PRODUCT_SELECT = `
  *,
  seller:seller_public!seller_id (
    id,
    full_name,
    avatar_url,
    store_name,
    store_slug,
    store_logo,
    rating,
    is_verified_store,
    trust_score,
    seller_badges
  ),
  product_variants(*),
  product_images(*)
`;

// 🔥 Create base resources
export const productsResource = createResourceApi("products", PRODUCT_SELECT);


export const ProductsAPI = {
  getAll: () => ({
    queryKey: ["products"],
    queryFn: () =>
      productsResource.list(supabase, [
        ["is_active", "eq", true],
        ["created_at", "order", { ascending: false }],
      ]),
  }),

  getById: (id) => ({
    queryKey: ["product", id],
    queryFn: () => productsResource.get(supabase, id),
  }),

  getBySlug: (slug) => ({
    queryKey: ["product", slug],
    queryFn: async () => {
      const data = await productsResource.list(supabase, [
        ["slug", "eq", slug],
        ["is_active", "eq", true],
      ]);

      if (!data?.length) {
        throw new Error("Product not found");
      }

      return data[0];
    },
  }),

  getByKeywords: (keywordsArray) => ({
    queryKey: ["products", keywordsArray],
    queryFn: () =>
      productsResource.list(supabase, [
        ["is_active", "eq", true],
        ["keywords", "overlaps", keywordsArray],
        ["created_at", "order", { ascending: false }],
      ]),
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
        throw new Error(
          error.message || "Failed to fetch recommendations"
        );
      }

      return data ?? [];
    },
  }),
};

// Also keep storeApi logic here for backward compatibility if needed
export const storeApi = {
  getMyStore: async (userId) => {
    const { data, error } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

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
};
