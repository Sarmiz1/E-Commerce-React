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

function useDashboardMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminDashboardKey }),
  });
}

export const useSetAdminOrderStatus = () =>
  useDashboardMutation(({ id, status }) => adminDashboardApi.setOrderStatus(id, status));

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
