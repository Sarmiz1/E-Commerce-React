import { CartAPI } from "../api/cartApi";
import { queryClient } from "../queries/queryClient"; 

export const cartRecommendationsLoader = async () => {
  const recommendations = await queryClient.ensureQueryData(
    CartAPI.cartRecommendations([], 8)
  );

  return { recommendations };
};
