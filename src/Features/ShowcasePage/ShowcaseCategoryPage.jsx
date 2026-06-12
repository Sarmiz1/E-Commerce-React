import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CategoriesAPI } from "../../api/categoriesApi";
import { getProductImages } from "../../utils/getProductImages";
import ShowcasePage from "./ShowcasePage";
import { formatShowcaseTitle } from "./utils/formatShowcaseTitle";

export default function ShowcaseCategoryPage() {
  const { categorySlug = "" } = useParams();
  const productsQuery = useQuery({
    ...CategoriesAPI.getProducts({ categorySlug, limit: 120 }),
    staleTime: 1000 * 60 * 5,
  });

  const products = productsQuery.data || [];
  const title = products[0]?.category?.name || formatShowcaseTitle(categorySlug) || "Category";
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
      noIndex={!productsQuery.isLoading && products.length === 0}
      onRetry={() => productsQuery.refetch()}
      parentLabel="Categories"
      parentPath="/products/categories"
      products={products}
      title={title}
    />
  );
}
