import { ProductsAPI } from "../api/productsApi";
import { queryClient } from "../Context/QueryClient/QueryWrapper";

export const fetchProductsLoader = async () => {
    // Preload into react-query cache
  await queryClient.ensureQueryData(ProductsAPI.getAll());

  return null;

};

