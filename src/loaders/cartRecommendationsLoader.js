import { CartAPI } from "../api/cartApi";
import { queryClient } from "../Context/QueryClient/QueryWrapper";

export const cartRecommendationsLoader = async ({ params }) => {
  const productID = params.id;

  await queryClient.ensureQueryData(
    CartAPI.recommendations(productID, 8)
  );

  return null;
};