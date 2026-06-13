import { keepPreviousData, useMutation, useMutationState, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminDashboardApi } from "../../../../api/adminDashboardApi";
import { AdminAdvertsAPI } from "../../../../api/adminAdvertsApi";
import { AdminDealsOfDayAPI } from "../../../../api/adminDealsOfDayApi";
import { AdvertisementsAPI } from "../../../../api/advertisementsApi";

export const adminDashboardKey = ["admin-dashboard"];
const adminOrderStatusMutationKey = [...adminDashboardKey, "order-status"];
const adminProductActiveMutationKey = [...adminDashboardKey, "product-active"];
const adminProductModerationMutationKey = [...adminDashboardKey, "product-moderation"];
const adminSellerStatusMutationKey = [...adminDashboardKey, "seller-status"];
const adminBuyerLifecycleMutationKey = [...adminDashboardKey, "buyer-lifecycle"];
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

export function useAdminDeactivatedBuyers(enabled = true) {
  return useQuery({
    queryKey: [...adminDashboardKey, "deactivated-buyers"],
    queryFn: adminDashboardApi.getDeactivatedBuyers,
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

export const useReviewBuyerReactivation = () =>
  useDashboardMutation(
    ({ id, approve, note }) => adminDashboardApi.reviewBuyerReactivation(id, approve, note),
    { mutationKey: adminBuyerLifecycleMutationKey },
  );

export const usePermanentlyDeleteBuyerAccount = () =>
  useDashboardMutation(
    (id) => adminDashboardApi.permanentlyDeleteBuyerAccount(id),
    { mutationKey: adminBuyerLifecycleMutationKey },
  );

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
  useDashboardMutation((job) => adminDashboardApi.saveJobOpening(job));

export const useSetAdminJobOpeningStatus = () =>
  useDashboardMutation(({ id, status }) => adminDashboardApi.setJobOpeningStatus(id, status));

export const useSaveAdminCareerQuestion = () =>
  useDashboardMutation((question) => adminDashboardApi.saveCareerQuestion(question));

export const useDeleteAdminCareerQuestion = () =>
  useDashboardMutation((id) => adminDashboardApi.deleteCareerQuestion(id));

export const useOpenAdminCareerDocument = () =>
  useMutation({ mutationFn: (id) => adminDashboardApi.getHiringDocumentUrl(id) });

export const useSaveAdminIntegration = () =>
  useDashboardMutation((integration) => adminDashboardApi.saveIntegration(integration));

export const useDeleteAdminIntegration = () =>
  useDashboardMutation((id) => adminDashboardApi.deleteIntegration(id));

export const useSaveAdminSetting = () =>
  useDashboardMutation((setting) => adminDashboardApi.saveSetting(setting));

export const useDeleteAdminSetting = () =>
  useDashboardMutation((key) => adminDashboardApi.deleteSetting(key));

export function useAdminPromoCodes(enabled = true) {
  return useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: adminDashboardApi.getPromoCodes,
    enabled,
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData ?? [],
  });
}

export const useSaveAdminPromoCode = () =>
  useDashboardMutation((promo) => adminDashboardApi.savePromoCode(promo));

export const useDeleteAdminPromoCode = () =>
  useDashboardMutation((code) => adminDashboardApi.deletePromoCode(code));

export function useAdminCheckoutPricing(enabled = true) {
  return useQuery({
    queryKey: [...adminDashboardKey, "checkout-pricing"],
    queryFn: adminDashboardApi.getCheckoutPricing,
    enabled,
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData ?? { deliveryZones: [], taxRules: [] },
  });
}

export const useSaveAdminDeliveryFeeZone = () =>
  useDashboardMutation((zone) => adminDashboardApi.saveDeliveryFeeZone(zone), {
    onSettled: async (_data, _error, _variables, _context) => {
      // The dashboard invalidation happens in useDashboardMutation; this keeps the
      // focused checkout-pricing query fresh too.
    },
  });

export const useSaveAdminTaxRule = () =>
  useDashboardMutation((rule) => adminDashboardApi.saveTaxRule(rule));

export const usePromoteAdmin = () =>
  useDashboardMutation((admin) => adminDashboardApi.promoteAdmin(admin));

export const useConfigureAdminPromotionPasscode = () =>
  useDashboardMutation((passcode) => adminDashboardApi.configurePromotionPasscode(passcode));

export const useQueueAdminAiQuery = () =>
  useDashboardMutation((prompt) => adminDashboardApi.queueAiQuery(prompt));

export function useAdminAdverts(enabled = true) {
  return useQuery({
    ...AdminAdvertsAPI.listAdmin({ limit: 100 }),
    enabled,
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData ?? [],
  });
}

export const useSaveAdminAdvert = () =>
  useDashboardMutation(({ id, payload }) =>
    id ? AdminAdvertsAPI.update(id, payload) : AdminAdvertsAPI.create(payload));

export const useDeleteAdminAdvert = () =>
  useDashboardMutation((id) => AdminAdvertsAPI.remove(id));

export function useAdminDealsOfDay(enabled = true) {
  return useQuery({
    ...AdminDealsOfDayAPI.listAdmin({ limit: 100 }),
    enabled,
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData ?? [],
  });
}

export const useSaveAdminDealOfDay = () =>
  useDashboardMutation(({ id, payload }) =>
    id ? AdminDealsOfDayAPI.update(id, payload) : AdminDealsOfDayAPI.create(payload));

export const useDeleteAdminDealOfDay = () =>
  useDashboardMutation((id) => AdminDealsOfDayAPI.remove(id));

export function useAdminSellerAdvertisements(enabled = true) {
  return useQuery({
    ...AdvertisementsAPI.listAdmin({ limit: 100 }),
    enabled,
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData ?? [],
  });
}

export const useUpdateSellerAdvertisementStatus = () =>
  useDashboardMutation(({ id, payload }) => AdvertisementsAPI.updateAdminStatus(id, payload));
