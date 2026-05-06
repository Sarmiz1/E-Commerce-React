import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../Store/useAuthStore";
import { DashboardSkeleton } from "../../components/Fallback";

export const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRole = profile?.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
