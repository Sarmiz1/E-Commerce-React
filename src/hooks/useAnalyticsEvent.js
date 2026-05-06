import { useCallback } from "react";
import { useAuth } from "../Store/useAuthStore";
import { trackEvent } from "../api/track_events";

export function useAnalyticsEvent() {
  const { user } = useAuth();

  return useCallback(
    (eventType, payload = {}) => {
      const {
        productId,
        product_id,
        variantId,
        variant_id,
        quantity,
        userId,
        user_id,
        metadata,
        ...rest
      } = payload;

      return trackEvent({
        eventType,
        productId: productId ?? product_id ?? null,
        variantId: variantId ?? variant_id ?? null,
        quantity: quantity ?? null,
        userId: userId ?? user_id ?? user?.id ?? null,
        metadata: {
          ...rest,
          ...(metadata || {}),
        },
      });
    },
    [user?.id],
  );
}
