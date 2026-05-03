import { useAuth } from "../../Context/auth/AuthContext";
import DefaultLayout from "../../Layout/DefaultLayout";
import MarkettingLayout from "../../Layout/MarkettingLayout";
import { HomeSkeleton } from "../../Components/Fallback";

export const HomeRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return user ? <DefaultLayout /> : <MarkettingLayout />;
};
