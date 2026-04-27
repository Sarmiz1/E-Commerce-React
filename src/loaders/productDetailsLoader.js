import { ProductsAPI } from "../api/productsApi";
import { queryClient } from "../queries/queryClient"; 

export const productDetailsLoader = async ({ params }) => {
  const { productSlug } = params;

  const product = await queryClient.ensureQueryData(
    ProductsAPI.getBySlug(productSlug)
  );

  await queryClient.ensureQueryData(
    ProductsAPI.recommendations(product.id)
  );

  return {
    productSlug,
  };
};