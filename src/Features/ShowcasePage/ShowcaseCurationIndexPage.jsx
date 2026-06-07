import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminAdvertsAPI } from "../../api/adminAdvertsApi";
import {
  CurationFetchLoaderAPI,
  createEmptyHomeCurations,
} from "../../api/curationFetchLoader";
import ShowcaseIndexPage from "./ShowcaseIndexPage";
import {
  buildCurationIndexSections,
  buildShowcaseHeroSlides,
  buildTopbarLabels,
  getFirstShowcaseImage,
  getSectionProducts,
} from "./utils/showcaseAdapters";

export default function ShowcaseCurationIndexPage() {
  const curationQuery = useQuery({
    ...CurationFetchLoaderAPI.getHomeCurations(),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData ?? createEmptyHomeCurations(),
  });
  const advertQuery = useQuery({
    ...AdminAdvertsAPI.getPublicHeroSlides({
      placement: "showcase_hero",
      surface: "curations",
    }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData ?? [],
  });

  const sections = useMemo(
    () => buildCurationIndexSections(curationQuery.data, "/products/curations"),
    [curationQuery.data],
  );
  const products = useMemo(() => getSectionProducts(sections), [sections]);
  const heroSlides = useMemo(
    () => advertQuery.data?.length ? advertQuery.data : buildShowcaseHeroSlides({
      id: "curation-index",
      title: "WooSho Curations",
      eyebrow: "Marketplace edits",
      subtitle: "Shop live product stories assembled from active WooSho curation feeds.",
      image: getFirstShowcaseImage(sections),
      accent: "#6B4FA0",
      cta: "Browse Curations",
      ctaSecondary: "View Products",
    }),
    [advertQuery.data, sections],
  );

  return (
    <ShowcaseIndexPage
      basePath="/products/curations"
      emptyMessage="No active curation sections are available yet."
      heroSlides={heroSlides}
      isError={curationQuery.isError}
      isLoading={curationQuery.isLoading && !sections.length}
      onRetry={() => curationQuery.refetch()}
      products={products}
      sections={sections}
      topbarLabels={buildTopbarLabels(sections)}
      topbarOffset={70}
      pageName='curations'
    />
  );
}
