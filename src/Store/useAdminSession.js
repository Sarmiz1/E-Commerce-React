import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import { useAuth } from "./useAuthStore";

export const useAdminSession = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    data: admin = null,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["admin-role", user?.id],
    queryFn: () => adminApi.getCurrentAdmin(user.id),
    enabled: Boolean(user?.id) && !authLoading,
    staleTime: 60_000,
  });

  return {
    admin,
    error,
    isAdminSession: Boolean(admin),
    isCheckingAdmin: authLoading || (Boolean(user?.id) && isLoading),
  };
};
