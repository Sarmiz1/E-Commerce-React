import { useAuth } from "../../Context/auth/AuthContext";
import HomePage from "../../Features/HomePage/HomePage";
import ModernLanding from "../../Features/Marketting/ModernLanding/ModernLanding";
import { HomeSkeleton } from "../../Components/Fallback";

export const HomeIndexRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return user ? <HomePage /> : <ModernLanding />;
};
