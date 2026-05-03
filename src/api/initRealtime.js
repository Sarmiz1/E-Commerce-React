// src/lib/realtime.js
// FIXED IMPORT
import { supabase } from "../lib/supabaseClient";
import { queryClient } from "../queries/queryClient"; 

export const initRealtime = (userId) => {
  return supabase
    .channel("marketplace-live")

    // 🔥 seller dashboard updates
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats", userId] });
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      }
    )

    // 🔥 product changes
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
      },
      () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    )

    .subscribe();
};