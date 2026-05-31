import { Navigate } from "react-router-dom";
import { useAdminSession } from "../../Store/useAdminSession";
import { useAuth } from "../../Store/useAuthStore";
import DefaultLayout from "../../Layout/DefaultLayout";
import MarkettingLayout from "../../Layout/MarkettingLayout";
import { HomeSkeleton } from "../../Components/Fallback";

export const HomeRoute = () => {
  const { user, isLoading } = useAuth();
  const { isAdminSession, isCheckingAdmin } = useAdminSession();

  if (isLoading || isCheckingAdmin) {
    return <HomeSkeleton />;
  }

  if (user && isAdminSession) {
    return <Navigate to="/admin" replace />;
  }

  return user ? <DefaultLayout /> : <MarkettingLayout />;
};
