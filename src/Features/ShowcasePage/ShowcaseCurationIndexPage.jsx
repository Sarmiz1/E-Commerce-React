import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const sections = useMemo(
    () => buildCurationIndexSections(curationQuery.data, "/products/curation"),
    [curationQuery.data],
  );
  const products = useMemo(() => getSectionProducts(sections), [sections]);
  const heroSlides = useMemo(
    () => buildShowcaseHeroSlides({
      id: "curation-index",
      title: "WooSho Curations",
      eyebrow: "Marketplace edits",
      subtitle: "Shop live product stories assembled from active WooSho curation feeds.",
      image: getFirstShowcaseImage(sections),
      accent: "#6B4FA0",
      cta: "Browse Curations",
      ctaSecondary: "View Products",
    }),
    [sections],
  );

  return (
    <ShowcaseIndexPage
      basePath="/products/curation"
      emptyMessage="No active curation sections are available yet."
      heroSlides={heroSlides}
      isError={curationQuery.isError}
      isLoading={curationQuery.isLoading && !sections.length}
      onRetry={() => curationQuery.refetch()}
      products={products}
      sections={sections}
      topbarLabels={buildTopbarLabels(sections)}
      topbarOffset={70}
    />
  );
}
