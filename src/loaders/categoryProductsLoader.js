import { CategoriesAPI } from "../api/categoriesApi";
import { queryClient } from "../queries/queryClient";

export const categoryProductsLoader = async ({ params }) => {
  const { categorySlug = "", subcategorySlug = "" } = params || {};

  return queryClient.ensureQueryData(
    CategoriesAPI.getProducts({
      categorySlug,
      subcategorySlug,
      limit: 120,
    }),
  );
};
