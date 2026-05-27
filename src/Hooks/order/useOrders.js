import { useQuery } from "@tanstack/react-query";
import { OrderAPI } from "../../api/orderApi";
import { useAuth } from "../../Store/useAuthStore";

export function useOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const orders = await OrderAPI.getOrders(user.id);
      return orders || [];
    },
    enabled: !!user?.id,
  });
}
