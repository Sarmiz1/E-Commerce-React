import { useAuth } from "../../Store/useAuthStore";
import HomePage from "../../Features/HomePage/HomePage";
import ModernLanding from "../../Features/Marketting/ModernLanding/ModernLanding";
import { HomeSkeleton } from "../../components/Fallback";

export const HomeIndexRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return user ? <HomePage /> : <ModernLanding />;
};
