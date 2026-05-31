import { keepPreviousData, useMutation, useMutationState, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminDashboardApi } from "../../../../api/adminDashboardApi";

export const adminDashboardKey = ["admin-dashboard"];
const adminOrderStatusMutationKey = [...adminDashboardKey, "order-status"];
const adminProductActiveMutationKey = [...adminDashboardKey, "product-active"];
const adminProductModerationMutationKey = [...adminDashboardKey, "product-moderation"];
const adminSellerStatusMutationKey = [...adminDashboardKey, "seller-status"];
const adminSupportTicketMutationKey = [...adminDashboardKey, "support-ticket"];

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardKey,
    queryFn: adminDashboardApi.getDashboard,
    staleTime: 30_000,
  });
}

export function useAdminProducts(params, enabled = true) {
  return useQuery({
    queryKey: [...adminDashboardKey, "products", params],
    queryFn: () => adminDashboardApi.getProducts(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminHiring(enabled = true) {
  return useQuery({
    queryKey: [...adminDashboardKey, "hiring"],
    queryFn: adminDashboardApi.getHiring,
    enabled,
    staleTime: 30_000,
  });
}

export function useAdminBuyers(enabled = true) {
  return useQuery({
    queryKey: [...adminDashboardKey, "buyers"],
    queryFn: adminDashboardApi.getBuyers,
    enabled,
    staleTime: 30_000,
  });
}

export function useAdminPageActivity() {
  return useQuery({
    queryKey: [...adminDashboardKey, "page-activity"],
    queryFn: adminDashboardApi.getPageActivity,
    staleTime: 30_000,
  });
}

export function useAdminUserGrowth(range) {
  return useQuery({
    queryKey: [...adminDashboardKey, "user-growth", range],
    queryFn: () => adminDashboardApi.getUserGrowth(range),
    staleTime: 30_000,
  });
}

export function useAdminPaidSalesChart(range) {
  return useQuery({
    queryKey: [...adminDashboardKey, "paid-sales-chart", range],
    queryFn: () => adminDashboardApi.getPaidSalesChart(range),
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

  const mutation = useDashboardMutation(
    ({ id, status }) => adminDashboardApi.setOrderStatus(id, status),
    {
      mutationKey: adminOrderStatusMutationKey,
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: adminDashboardKey });
        const previousDashboard = queryClient.getQueryData(adminDashboardKey);
        queryClient.setQueryData(adminDashboardKey, (dashboard) => updateOrderStatus(dashboard, variables));
        return {
          previousStatus: previousDashboard?.orders?.find((order) => order.id === variables.id)?.status,
        };
      },
      onError: (_error, variables, context) => {
        if (context?.previousStatus) {
          queryClient.setQueryData(adminDashboardKey, (dashboard) =>
            updateOrderStatus(dashboard, { id: variables.id, status: context.previousStatus }));
        }
      },
    },
  );

  const pendingUpdates = useMutationState({
    filters: { mutationKey: adminOrderStatusMutationKey, status: "pending" },
    select: (pendingMutation) => pendingMutation.state.variables,
  });

  return { ...mutation, pendingUpdates };
};

export const useSetAdminProductActive = () => {
  const mutation = useDashboardMutation(
    ({ id, active }) => adminDashboardApi.setProductActive(id, active),
    { mutationKey: adminProductActiveMutationKey },
  );

  const pendingUpdates = useMutationState({
    filters: { mutationKey: adminProductActiveMutationKey, status: "pending" },
    select: (pendingMutation) => pendingMutation.state.variables,
  });

  return { ...mutation, pendingUpdates };
};

export const useSetAdminProductModerationStatus = () => {
  const mutation = useDashboardMutation(
    ({ id, status }) => adminDashboardApi.setProductModerationStatus(id, status),
    { mutationKey: adminProductModerationMutationKey },
  );

  const pendingUpdates = useMutationState({
    filters: { mutationKey: adminProductModerationMutationKey, status: "pending" },
    select: (pendingMutation) => pendingMutation.state.variables,
  });

  return { ...mutation, pendingUpdates };
};

export const useSetAdminSellerStatus = () => {
  const mutation = useDashboardMutation(
    ({ id, status }) => adminDashboardApi.setSellerStatus(id, status),
    { mutationKey: adminSellerStatusMutationKey },
  );

  const pendingUpdates = useMutationState({
    filters: { mutationKey: adminSellerStatusMutationKey, status: "pending" },
    select: (pendingMutation) => pendingMutation.state.variables,
  });

  return { ...mutation, pendingUpdates };
};

export const useSetAdminSupportTicketStatus = () => {
  const mutation = useDashboardMutation(
    ({ id, status, escalate }) => adminDashboardApi.setSupportTicketStatus(id, status, escalate),
    { mutationKey: adminSupportTicketMutationKey },
  );

  const pendingUpdates = useMutationState({
    filters: { mutationKey: adminSupportTicketMutationKey, status: "pending" },
    select: (pendingMutation) => pendingMutation.state.variables,
  });

  return { ...mutation, pendingUpdates };
};

export const useMoveAdminHiringCandidate = () =>
  useDashboardMutation(({ id, stage }) => adminDashboardApi.moveHiringCandidate(id, stage));

export const useCreateAdminJobOpening = () =>
  useDashboardMutation((job) => adminDashboardApi.createJobOpening(job));

export const useSetAdminJobOpeningStatus = () =>
  useDashboardMutation(({ id, status }) => adminDashboardApi.setJobOpeningStatus(id, status));

export const useSaveAdminIntegration = () =>
  useDashboardMutation((integration) => adminDashboardApi.saveIntegration(integration));

export const useDeleteAdminIntegration = () =>
  useDashboardMutation((id) => adminDashboardApi.deleteIntegration(id));

export const useSaveAdminSetting = () =>
  useDashboardMutation((setting) => adminDashboardApi.saveSetting(setting));

export const useDeleteAdminSetting = () =>
  useDashboardMutation((key) => adminDashboardApi.deleteSetting(key));

export const usePromoteAdmin = () =>
  useDashboardMutation((admin) => adminDashboardApi.promoteAdmin(admin));

export const useConfigureAdminPromotionPasscode = () =>
  useDashboardMutation((passcode) => adminDashboardApi.configurePromotionPasscode(passcode));

export const useQueueAdminAiQuery = () =>
  useDashboardMutation((prompt) => adminDashboardApi.queueAiQuery(prompt));
