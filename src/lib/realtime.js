import { supabase } from "./supabaseClient";

/**
 * initRealtime
 * - attaches realtime listeners
 * - invalidates TanStack cache
 */
export const initRealtime = (queryClient, userId) => {
  if (!queryClient) return;

  const channel = supabase.channel("marketplace-realtime");

  // ==============================
  // 🧠 ORDERS (SELLER + ADMIN IMPACT)
  // ==============================
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "orders",
    },
    (payload) => {
      // seller dashboard updates
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["dashboard", userId],
        });

        queryClient.invalidateQueries({
          queryKey: ["orders", userId],
        });
      }

      // admin stats updates
      queryClient.invalidateQueries({
        queryKey: ["admin-stats"],
      });
    }
  );

  // ==============================
  // 🛒 PRODUCTS (SELLER + LISTINGS)
  // ==============================
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "products",
    },
    () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["my-products", userId],
        });
      }
    }
  );

  // ==============================
  // 📦 CART (BUYER ONLY)
  // ==============================
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "cart_items",
    },
    (payload) => {
      if (!userId) return;

      queryClient.invalidateQueries({
        queryKey: ["cart", userId],
      });
    }
  );

  channel.subscribe((status) => {
    console.log("Realtime status:", status);
  });

  return channel;
};