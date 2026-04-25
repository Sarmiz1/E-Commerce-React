import { useCallback } from "react";
import { supabase } from "../supabaseClient";

export function useTrackProductClick() {
  return useCallback((productId) => {
    if (!productId) return;

    // fire-and-forget (do NOT block UI)
    supabase.rpc("track_product_click", {
      product_id: productId,
    });
  }, []);
}