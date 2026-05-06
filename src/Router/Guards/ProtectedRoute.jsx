import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../Store/useAuthStore";

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null; // or a skeleton later
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
