import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const curationQuery = useQuery({
    ...CurationsAPI.getBySlug(slug),
    enabled: Boolean(slug),
  });
  const productsQuery = useQuery({
    ...CurationsAPI.getProducts(slug),
    enabled: Boolean(slug),
  });

  const curation = curationQuery.data;
  const products = useMemo(() => productsQuery.data || [], [productsQuery.data]);
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
      isError={curationQuery.isError || productsQuery.isError}
      isFetching={curationQuery.isFetching || productsQuery.isFetching}
      isLoading={curationQuery.isLoading || productsQuery.isLoading}
      noIndex={!curation}
      onRetry={() => {
        curationQuery.refetch();
        productsQuery.refetch();
      }}
      parentLabel="Curations"
      parentPath="/products/curations"
      products={products}
      title={title}
    />
  );
}
