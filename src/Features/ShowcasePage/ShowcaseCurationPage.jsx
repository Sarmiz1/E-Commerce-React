import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CurationsAPI } from "../../api/curationsApi";
import { getProductImages } from "../../utils/getProductImages";
import ShowcasePage from "./ShowcasePage";
import { formatShowcaseTitle } from "./utils/formatShowcaseTitle";

const getDescription = (curation, title) =>
  curation?.description ||
  `Discover handpicked ${title.toLowerCase()} selected for the WooSho marketplace.`;

export default function ShowcaseCurationPage() {
  const { showcaseSlug = "", curationSlug = "" } = useParams();
  const slug = showcaseSlug || curationSlug;
  const displayTitle = formatShowcaseTitle(slug) || "Curation";

  const detailQuery = useInfiniteQuery({
    ...CurationsAPI.getDetailPage(slug, { pageSize: 24 }),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  });

  const pages = detailQuery.data?.pages || [];
  const firstPage = pages[0];
  const curation = firstPage?.curation;
  const products = pages.flatMap((page) => page.products || []);
  const title = curation?.name || displayTitle;
  const description = getDescription(curation, title);

  return (
    <ShowcasePage
      advert={{
        browsePath: "/products/curations",
        body: "Browse more WooSho curations assembled from active marketplace product feeds.",
        cta: "Browse curations",
      }}
      canonicalPath={`/products/curations/${encodeURIComponent(slug)}`}
      collectionLabel="Curated products"
      description={description}
      emptyBody="There are no active products in this curation yet. Explore the full marketplace in the meantime."
      emptyLabel="Curation coming soon"
      eyebrow="WooSho Curations"
      heroImage={getProductImages(products[0])[0]}
      isError={detailQuery.isError}
      isFetching={detailQuery.isFetching}
      isLoading={detailQuery.isLoading}
      isLoadingMore={detailQuery.isFetchingNextPage}
      hasMore={detailQuery.hasNextPage}
      noIndex={!detailQuery.isLoading && !curation}
      onLoadMore={() => detailQuery.fetchNextPage()}
      onRetry={() => detailQuery.refetch()}
      parentLabel="Curations"
      parentPath="/products/curations"
      products={products}
      title={title}
    />
  );
}
