import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function seedShowcaseProductCache(queryClient, products = []) {
  if (!queryClient || !products.length) return;

  products.filter((product) => product?.id).forEach((product) => {
    queryClient.setQueryData(["product", product.id], product);
    if (product.slug) {
      queryClient.setQueryData(["product", product.slug], product);
    }
  });
}

export function useShowcaseProductsCache(products = []) {
  const queryClient = useQueryClient();

  useEffect(() => {
    seedShowcaseProductCache(queryClient, products);
  }, [products, queryClient]);
}
