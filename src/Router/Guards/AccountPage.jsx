import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../Store/useAuthStore";
import { DashboardSkeleton } from "../../Components/Fallback";
import { accountApi } from "../../api/accountApi";

// React.lazy expects the promise to resolve to an object with a "default" property
const BuyerDashboard = lazy(() => import("../../Features/BuyerDashboard/BuyerDashboard"));
const SellerDashboard = lazy(() => import("../../Features/SellerDashboard/SellerDashboard"));

export const AccountPage = () => {
  const { user } = useAuth();
  const { data: role, isLoading } = useQuery({
    queryKey: ["account-role", user?.id],
    queryFn: () => accountApi.getRole(user.id),
    enabled: Boolean(user?.id),
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!role) {
    return <Navigate to="/onboarding" replace />;
  }

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

  return <Navigate to="/" replace />;
};
