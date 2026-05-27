// src/Features/Orders/Tracking/hooks/useOrderTracking.js
// ─── Fetches, derives, and auto-polls the tracked order ───────────────────────

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrderAPI } from '../../../../api/orderApi';
import { useOrders } from '../../../../hooks/order/useOrders';
import { useAutoPoll } from '../utils/trackingUtils';

export function useOrderTracking(trackedId) {
  const [updatedAt, setUpdatedAt] = useState(null);

  // ── All user orders (for recent-order pills + fuzzy fallback) ────────────
  const { data: recentOrdersData, isLoading: ordersLoading } = useOrders();
  const orders = useMemo(() => recentOrdersData || [], [recentOrdersData]);

  // ── Fetch the specific order by exact ID ─────────────────────────────────
  const { data: fetchedOrder, isLoading: isQueryLoading } = useQuery({
    queryKey: ['order', trackedId],
    queryFn:  () => OrderAPI.getOrder(trackedId),
    enabled:  !!trackedId,
    retry:    false,
    staleTime: 30_000,
  });

  // ── Derive: prefer exact fetch, fallback to fuzzy search on list ─────────
  const trackedOrder = useMemo(() => {
    if (fetchedOrder?.id) return fetchedOrder;
    if (!trackedId || !orders.length) return null;
    const q = trackedId.toLowerCase();
    return (
      orders.find((o) =>
        o.id?.toLowerCase().includes(q) ||
        (o.order_items || []).some((i) =>
          i.products?.name?.toLowerCase().includes(q)
        )
      ) ?? null
    );
  }, [fetchedOrder, trackedId, orders]);

  // ── Refresh callback (used by button + auto-poll) ─────────────────────────
  const refresh = useCallback(() => setUpdatedAt(new Date().toISOString()), []);

  // ── Auto-poll every 30 s while in-transit ─────────────────────────────────
  useAutoPoll(trackedOrder?.status, refresh);

  return {
    orders,
    ordersLoading,
    trackedOrder,
    isQueryLoading,
    updatedAt,
    refresh,
  };
}
