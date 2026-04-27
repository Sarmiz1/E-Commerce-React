import { queryClient } from "../queries/queryClient";
import { ProductsAPI } from "../api/productsApi";

let hoverTimer;

export const prefetchProductOnHover = (slug) => {
  if (!slug) return;

  const query = ProductsAPI.getBySlug(slug);

  const cached = queryClient.getQueryData(query.queryKey);
  if (cached) return;

  clearTimeout(hoverTimer);

  hoverTimer = setTimeout(() => {
    queryClient.prefetchQuery(query);
  }, 150);
};