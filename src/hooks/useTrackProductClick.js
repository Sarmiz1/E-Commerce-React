import { useCallback } from "react";
import { trackEvent } from "../api/track_events";

export function useTrackProductClick() {
  return useCallback((productId) => {
    if (!productId) return;

    trackEvent({ eventType: "product_click", productId });
  }, []);
}
