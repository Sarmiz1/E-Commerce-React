import { useCallback } from "react";
import { trackEvent } from "../Utils/analytics";

export function useTrackProductClick() {
  return useCallback((productId) => {
    if (!productId) return;

    trackEvent("product_click", { productId });
  }, []);
}
