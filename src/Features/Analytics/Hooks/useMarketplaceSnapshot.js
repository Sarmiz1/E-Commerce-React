import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CurationsAPI } from "../../../api/curationsApi";
import { useAllProducts } from "../../../hooks/product/useProducts";

const toPositiveNumber = (value) => Math.max(Number(value) || 0, 0);

const getProductKey = (product, nestedKey, fallbackKey) =>
  product?.[nestedKey]?.id || product?.[fallbackKey] || product?.[nestedKey];

export function buildMarketplaceSnapshot(products = [], curations = []) {
  const sellerIds = new Set();
  const verifiedSellerIds = new Set();
  const categoryIds = new Set();
  let inventoryUnits = 0;
  let reviewCount = 0;

  products.forEach((product) => {
    const sellerId = getProductKey(product, "seller", "seller_id");
    const categoryId = getProductKey(product, "category", "category_id");

    if (sellerId) sellerIds.add(sellerId);
    if (categoryId) categoryIds.add(categoryId);
    if (sellerId && product?.seller?.is_verified_store) {
      verifiedSellerIds.add(sellerId);
    }

    reviewCount += toPositiveNumber(product?.rating_count);
    inventoryUnits += (product?.product_variants || []).reduce(
      (total, variant) => total + toPositiveNumber(variant?.stock_quantity),
      0,
    );
  });

  return {
    liveProducts: products.length,
    sellerCount: sellerIds.size,
    categoryCount: categoryIds.size,
    curationCount: curations.length,
    inventoryUnits,
    reviewCount,
    verifiedSellerCount: verifiedSellerIds.size,
    curationPlacements: curations.reduce(
      (total, curation) => total + toPositiveNumber(curation?.productCount),
      0,
    ),
  };
}

export function useMarketplaceSnapshot() {
  const productsQuery = useAllProducts();
  const curationsQuery = useQuery(CurationsAPI.getAll());
  const snapshot = useMemo(
    () =>
      buildMarketplaceSnapshot(
        productsQuery.data || [],
        curationsQuery.data || [],
      ),
    [curationsQuery.data, productsQuery.data],
  );

  return {
    snapshot,
    isLoading: productsQuery.isLoading || curationsQuery.isLoading,
    isFetching: productsQuery.isFetching || curationsQuery.isFetching,
    unavailableSources: {
      catalog: productsQuery.isError,
      curations: curationsQuery.isError,
    },
    refresh: () => Promise.all([productsQuery.refetch(), curationsQuery.refetch()]),
  };
}

