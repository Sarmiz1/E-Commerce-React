import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../store/useAuthStore";

export const GuestRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // or your skeleton later
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
