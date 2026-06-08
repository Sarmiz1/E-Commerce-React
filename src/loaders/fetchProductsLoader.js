import { ProductsAPI } from "../api/productsApi";
import { queryClient } from "../queries/queryClient"; 

export const fetchProductsLoader = async () => {
  return queryClient.ensureQueryData(ProductsAPI.getAll());
};

