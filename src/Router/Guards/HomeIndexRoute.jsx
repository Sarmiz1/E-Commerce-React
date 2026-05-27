import { lazy, Suspense } from "react";
import { useAuth } from "../../Store/useAuthStore";
import { HomeSkeleton } from "../../Components/Fallback";

const HomePage = lazy(() => import("../../Features/HomePage/HomePage"));
const ModernLanding = lazy(() => import("../../Features/Marketting/ModernLanding/ModernLanding"));

export const HomeIndexRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <Suspense fallback={<HomeSkeleton />}>
      {user ? <HomePage /> : <ModernLanding />}
    </Suspense>
  );
};
