import { useQuery } from "@tanstack/react-query";
import { ProductsAPI } from "../../../api/productsApi";

export const useProductById = (id) => {
  return useQuery(ProductsAPI.getById(id));
};

export const useProductBySlug = (slug) => {
  return useQuery(ProductsAPI.getBySlug(slug));
};

export const useAllProducts = () => {
  return useQuery(ProductsAPI.getAll());
};

export const useProductRecommendations = (id, limit = 5) => {
  return useQuery({
    ...ProductsAPI.recommendations(id, limit),
    enabled: !!id,
  });
};