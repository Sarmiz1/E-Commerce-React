import { CartAPI } from "../api/cartApi";
import { queryClient } from "../queries/queryClient"; 

export const cartRecommendationsLoader = async ({ params }) => {
  const productID = params.id;

  await queryClient.ensureQueryData(
    CartAPI.cartRecommendations(productID, 8)
  );

  return null;
};