import { useAuth } from "../../Store/useAuthStore";
import DefaultLayout from "../../Layout/DefaultLayout";
import MarkettingLayout from "../../Layout/MarkettingLayout";
import { HomeSkeleton } from "../../components/Fallback";

export const HomeRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return user ? <DefaultLayout /> : <MarkettingLayout />;
};
