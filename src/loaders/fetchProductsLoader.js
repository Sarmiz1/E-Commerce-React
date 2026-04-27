import { ProductsAPI } from "../api/productsApi";
import { queryClient } from "../queries/queryClient"; 

export const fetchProductsLoader = async () => {
    // Preload into react-query cache
  await queryClient.ensureQueryData(ProductsAPI.getAll());

  return null;

};

