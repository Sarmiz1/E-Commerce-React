import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../Store/useAuthStore";

export const GuestRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null; // or your skeleton later
  }

  if (user) {
    // Redirect back to the page the user was trying to visit, or home
    const from = location.state?.from || "/";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};
