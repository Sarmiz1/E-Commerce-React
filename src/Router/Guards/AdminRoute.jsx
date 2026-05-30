import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../Store/useAuthStore";
import { DashboardSkeleton } from "../../Components/Fallback";
import { adminApi } from "../../api/adminApi";

export const AdminRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  const { data: admin, isLoading: checking } = useQuery({
    queryKey: ["admin-role", user?.id],
    queryFn: () => adminApi.getCurrentAdmin(user.id),
    enabled: Boolean(user?.id) && !authLoading,
  });

  // 1. Still resolving auth or checking admin table
  if (authLoading || (user && checking)) {
    return <DashboardSkeleton />;
  }

  // 2. Not logged in → go to login
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // 3. Logged in but NOT in admin_users table (or deactivated)
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  // 4. Authenticated admin → pass role to children via Outlet context
  return <Outlet context={{ admin, adminRole: admin.role }} />;
};
