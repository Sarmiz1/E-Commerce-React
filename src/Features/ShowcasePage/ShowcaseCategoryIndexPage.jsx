import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminAdvertsAPI } from "../../api/adminAdvertsApi";
import { CategoriesAPI } from "../../api/categoriesApi";
import ShowcaseIndexPage from "./ShowcaseIndexPage";
import {
  buildCategoryIndexSections,
  buildShowcaseHeroSlides,
  buildTopbarLabels,
  getFirstShowcaseImage,
} from "./utils/showcaseAdapters";

export default function ShowcaseCategoryIndexPage() {
  const categoriesQuery = useQuery({
    ...CategoriesAPI.getIndexSections({ limitPerCategory: 5 }),
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

  const categories = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);
  const sections = useMemo(
    () => buildCategoryIndexSections(categories, "/products/categories"),
    [categories],
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
      isError={categoriesQuery.isError}
      isLoading={categoriesQuery.isLoading && !sections.length}
      onRetry={() => categoriesQuery.refetch()}
      sections={sections}
      topbarLabels={buildTopbarLabels(sections)}
      topbarOffset={70}
      pageName='categories'
    />
  );
}
