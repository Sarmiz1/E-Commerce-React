import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ProductsAPI } from "../../api/productsApi";
import { getProductImages } from "../../utils/getProductImages";
import {
  getProductCategoryOptions,
  matchesProductCategory,
} from "../Product/Hooks/useProductsFilter";
import ShowcasePage from "./ShowcasePage";
import { formatShowcaseTitle } from "./utils/formatShowcaseTitle";

const normalizeCategory = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

export default function ShowcaseCategoryPage() {
  const { categorySlug = "" } = useParams();
  const productsQuery = useQuery({
    ...ProductsAPI.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  const allProducts = useMemo(() => productsQuery.data || [], [productsQuery.data]);
  const categoryOptions = useMemo(
    () => getProductCategoryOptions(allProducts),
    [allProducts],
  );
  const category = useMemo(
    () =>
      categoryOptions.find((option) =>
        normalizeCategory(option.value) === normalizeCategory(categorySlug) ||
        normalizeCategory(option.label) === normalizeCategory(categorySlug),
      ),
    [categoryOptions, categorySlug],
  );
  const products = useMemo(
    () => allProducts.filter((product) => matchesProductCategory(product, category?.value || categorySlug)),
    [allProducts, category?.value, categorySlug],
  );
  const title = category?.label || formatShowcaseTitle(categorySlug) || "Category";
  const description = `Shop ${title.toLowerCase()} products from independent WooSho marketplace stores.`;

  return (
    <ShowcasePage
      advert={{
        browsePath: "/products/categories",
        body: "Browse more categories from the live WooSho catalog.",
        cta: "Browse categories",
      }}
      canonicalPath={`/products/categories/${encodeURIComponent(categorySlug)}`}
      collectionLabel="Category products"
      description={description}
      emptyBody="There are no active products in this category yet. Explore the full marketplace in the meantime."
      emptyLabel="Category coming soon"
      eyebrow="WooSho Categories"
      heroImage={getProductImages(products[0])[0]}
      isError={productsQuery.isError}
      isFetching={productsQuery.isFetching}
      isLoading={productsQuery.isLoading}
      noIndex={!productsQuery.isLoading && !category}
      onRetry={() => productsQuery.refetch()}
      parentLabel="Categories"
      parentPath="/products/categories"
      products={products}
      title={title}
    />
  );
}
