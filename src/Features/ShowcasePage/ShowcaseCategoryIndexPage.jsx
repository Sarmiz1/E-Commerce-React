import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminAdvertsAPI } from "../../api/adminAdvertsApi";
import { ProductsAPI } from "../../api/productsApi";
import ShowcaseIndexPage from "./ShowcaseIndexPage";
import {
  buildCategoryIndexSections,
  buildShowcaseHeroSlides,
  buildTopbarLabels,
  getFirstShowcaseImage,
} from "./utils/showcaseAdapters";

export default function ShowcaseCategoryIndexPage() {
  const productsQuery = useQuery({
    ...ProductsAPI.getAll(),
    staleTime: 1000 * 60 * 5,
  });
  const advertQuery = useQuery({
    ...AdminAdvertsAPI.getPublicHeroSlides({
      placement: "showcase_hero",
      surface: "categories",
    }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData ?? [],
  });

  const products = useMemo(() => productsQuery.data || [], [productsQuery.data]);
  const sections = useMemo(
    () => buildCategoryIndexSections(products, "/products/categories"),
    [products],
  );
  const heroSlides = useMemo(
    () => advertQuery.data?.length ? advertQuery.data : buildShowcaseHeroSlides({
      id: "category-index",
      title: "Shop by Category",
      eyebrow: "WooSho categories",
      subtitle: "Browse the marketplace by product category, with live products pulled from the global catalog.",
      image: getFirstShowcaseImage(sections),
      accent: "#0F7B6C",
      cta: "Browse Categories",
      ctaSecondary: "View Products",
    }),
    [advertQuery.data, sections],
  );

  return (
    <ShowcaseIndexPage
      basePath="/products/categories"
      emptyMessage="No active category sections are available yet."
      heroSlides={heroSlides}
      isError={productsQuery.isError}
      isLoading={productsQuery.isLoading && !sections.length}
      onRetry={() => productsQuery.refetch()}
      products={products}
      sections={sections}
      topbarLabels={buildTopbarLabels(sections)}
      topbarOffset={70}
      pageName='categories'
    />
  );
}
