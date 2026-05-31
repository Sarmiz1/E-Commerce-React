import { Navigate, Outlet, useLocation } from "react-router-dom";
import { DashboardSkeleton } from "../../Components/Fallback";
import { useAdminSession } from "../../Store/useAdminSession";
import { useAuth } from "../../Store/useAuthStore";

export const CustomerOnlyRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdminSession, isCheckingAdmin } = useAdminSession();
  const location = useLocation();

  if (authLoading || isCheckingAdmin) {
    return <DashboardSkeleton />;
  }

  if (user && isAdminSession) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
