import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminDashboardApi } from "../../../../api/adminDashboardApi";

export const adminDashboardKey = ["admin-dashboard"];

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardKey,
    queryFn: adminDashboardApi.getDashboard,
    staleTime: 30_000,
  });
}

const toAmount = (value) => Number(value || 0);
const clampAmount = (value) => Math.max(0, value);

function updateOrderStatus(dashboard, { id, status }) {
  if (!dashboard?.orders?.length) return dashboard;

  const order = dashboard.orders.find((item) => item.id === id);
  if (!order || order.status === status) return dashboard;

  const wasPending = order.status === "pending";
  const willBePending = status === "pending";
  const wasPendingUnpaid = wasPending && order.payment === "unpaid";
  const willBePendingUnpaid = willBePending && order.payment === "unpaid";
  const wasPaidRevenue = order.payment === "paid" && order.status !== "cancelled";
  const willBePaidRevenue = order.payment === "paid" && status !== "cancelled";
  const orderAmount = toAmount(order.amount_minor);

  return {
    ...dashboard,
    stats: {
      ...dashboard.stats,
      pendingOrders: clampAmount(toAmount(dashboard.stats?.pendingOrders) + Number(willBePending) - Number(wasPending)),
      pendingUnpaidValueMinor: clampAmount(
        toAmount(dashboard.stats?.pendingUnpaidValueMinor) +
        (Number(willBePendingUnpaid) - Number(wasPendingUnpaid)) * orderAmount,
      ),
      revenueMinor: clampAmount(
        toAmount(dashboard.stats?.revenueMinor) +
        (Number(willBePaidRevenue) - Number(wasPaidRevenue)) * orderAmount,
      ),
    },
    orders: dashboard.orders.map((item) => item.id === id ? { ...item, status } : item),
  };
}

function useDashboardMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSettled: async (...args) => {
      await options.onSettled?.(...args);
      await queryClient.invalidateQueries({ queryKey: adminDashboardKey });
    },
  });
}

export const useSetAdminOrderStatus = () => {
  const queryClient = useQueryClient();

  return useDashboardMutation(
    ({ id, status }) => adminDashboardApi.setOrderStatus(id, status),
    {
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: adminDashboardKey });
        const previousDashboard = queryClient.getQueryData(adminDashboardKey);
        queryClient.setQueryData(adminDashboardKey, (dashboard) => updateOrderStatus(dashboard, variables));
        return { previousDashboard };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousDashboard) {
          queryClient.setQueryData(adminDashboardKey, context.previousDashboard);
        }
      },
    },
  );
};

export const useSetAdminProductActive = () =>
  useDashboardMutation(({ id, active }) => adminDashboardApi.setProductActive(id, active));

export const useSetAdminSellerStatus = () =>
  useDashboardMutation(({ id, status }) => adminDashboardApi.setSellerStatus(id, status));

export const useSetAdminSupportTicketStatus = () =>
  useDashboardMutation(({ id, status, escalate }) =>
    adminDashboardApi.setSupportTicketStatus(id, status, escalate));

export const useMoveAdminHiringCandidate = () =>
  useDashboardMutation(({ id, stage }) => adminDashboardApi.moveHiringCandidate(id, stage));

export const useQueueAdminAiQuery = () =>
  useDashboardMutation((prompt) => adminDashboardApi.queueAiQuery(prompt));
