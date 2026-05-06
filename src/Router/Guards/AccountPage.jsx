import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../Store/useAuthStore";
import { DashboardSkeleton } from "../../components/Fallback";

// React.lazy expects the promise to resolve to an object with a "default" property
const BuyerDashboard = lazy(() => import("../../Features/BuyerDashboard/BuyerDashboard"));
const SellerDashboard = lazy(() => import("../../Features/SellerDashboard/SellerDashboard"));

export const AccountPage = () => {
  const { user } = useAuth();

  // In Supabase, custom data passed during signUp (like role) is stored in user_metadata
  const role = user?.user_metadata?.role;

  // If role is missing or not recognizable, we redirect as fallback
  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  // Wrap the lazy components in Suspense with our skeleton
  if (role === "seller") {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <SellerDashboard />
      </Suspense>
    );
  }

  if (role === "buyer") {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <BuyerDashboard />
      </Suspense>
    );
  }

  // Fallback for unhandled roles
  return <Navigate to="/" replace />;
};
