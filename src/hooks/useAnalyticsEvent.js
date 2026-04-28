import { useCallback } from "react";
import { useAuth } from "../Context/auth/AuthContext";
import { trackEvent } from "../Utils/analytics";

export function useAnalyticsEvent() {
  const { user } = useAuth();

  return useCallback(
    (type, payload = {}) =>
      trackEvent(type, {
        ...payload,
        userId: payload.userId || user?.id || null,
      }),
    [user?.id],
  );
}

