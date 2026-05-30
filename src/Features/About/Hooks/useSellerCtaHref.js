import { useAuth } from "../../../Store/useAuthStore";

export function useSellerCtaHref() {
  const { user } = useAuth();
  return user ? "/account" : "/signup";
}
