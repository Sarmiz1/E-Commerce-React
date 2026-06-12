import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ProductsAPI } from "../../api/productsApi";
import { getProductImages } from "../../utils/getProductImages";
import ShowcasePage from "./ShowcasePage";
import { formatShowcaseTitle } from "./utils/formatShowcaseTitle";

const normalizeSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim();

export default function ShowcaseBrandPage() {
  const { brandSlug = "" } = useParams();
  const normalizedBrandSlug = normalizeSlug(brandSlug);
  const productsQuery = useQuery({
    ...ProductsAPI.getByBrandSlug(normalizedBrandSlug, 120),
    staleTime: 1000 * 60 * 5,
  });
  const products = productsQuery.data || [];
  const title =
    products[0]?.brand ||
    formatShowcaseTitle(brandSlug) ||
    "Brand";

  return (
    <ShowcasePage
      advert={{
        browsePath: "/products/shop-by-brands",
        body: "Browse more brands from active WooSho marketplace listings.",
        cta: "Browse brands",
      }}
      canonicalPath={`/products/shop-by-brands/${encodeURIComponent(brandSlug)}`}
      collectionLabel="Brand products"
      description={`Shop live ${title} listings from WooSho sellers.`}
      emptyBody="There are no active products for this brand yet. Explore the full brand directory in the meantime."
      emptyLabel="Brand coming soon"
      eyebrow="Shop By Brand"
      heroImage={getProductImages(products[0])[0]}
      isError={productsQuery.isError}
      isFetching={productsQuery.isFetching}
      isLoading={productsQuery.isLoading}
      noIndex={!productsQuery.isLoading && products.length === 0}
      onRetry={() => productsQuery.refetch()}
      parentLabel="Shop By Brand"
      parentPath="/products/shop-by-brands"
      products={products}
      title={title}
    />
  );
}
