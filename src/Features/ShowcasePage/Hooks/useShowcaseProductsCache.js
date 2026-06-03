import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function seedShowcaseProductCache(queryClient, products = []) {
  if (!queryClient || !products.length) return;

  products.forEach((product) => {
    queryClient.setQueryData(["product", product.id], product);
    queryClient.setQueryData(["product", product.slug], product);
  });

  queryClient.setQueryData(["products", "complete-catalog-v1"], (current = []) => {
    const productsById = new Map((current || []).map((product) => [product.id, product]));
    products.forEach((product) => productsById.set(product.id, product));
    return [...productsById.values()];
  });
}

export function useShowcaseProductsCache(products = []) {
  const queryClient = useQueryClient();

  useEffect(() => {
    seedShowcaseProductCache(queryClient, products);
  }, [products, queryClient]);
}
