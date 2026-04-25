import { ProductsAPI } from "../api/productsApi";
import { queryClient } from "../Context/QueryClient/QueryWrapper";

export const productDetailsLoader = async ({ params }) => {
  const { productSlug } = params;

  // 1. Fetch product by slug
  const product = await queryClient.ensureQueryData(
    ProductsAPI.getBySlug(productSlug)
  );

  // 2. Fetch recommendations using product ID
  await queryClient.ensureQueryData(
    ProductsAPI.recommendations(product.id)
  );

  return null;
};