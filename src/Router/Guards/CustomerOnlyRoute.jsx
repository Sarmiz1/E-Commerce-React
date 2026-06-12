import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CartSkeleton, DashboardSkeleton } from "../../Components/Fallback";
import { CheckoutLoading } from "../../Features/Checkout/Components/CheckoutLoading";
import { useAdminSession } from "../../Store/useAdminSession";
import { useAuth } from "../../Store/useAuthStore";

export const CustomerOnlyRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdminSession, isCheckingAdmin } = useAdminSession();
  const location = useLocation();
  const loadingFallback = location.pathname === "/checkout"
    ? <CheckoutLoading />
    : location.pathname === "/cart"
      ? <CartSkeleton />
      : <DashboardSkeleton />;

  if (authLoading || isCheckingAdmin) {
    return loadingFallback;
  }

  if (user && isAdminSession) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
