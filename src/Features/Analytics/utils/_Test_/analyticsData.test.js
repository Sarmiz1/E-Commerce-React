import { describe, expect, it } from "vitest";
import { buildMarketplaceSnapshot } from "../../Hooks/useMarketplaceSnapshot";

describe("buildMarketplaceSnapshot", () => {
  it("derives public marketplace metrics from live catalog records", () => {
    expect(
      buildMarketplaceSnapshot(
        [
          {
            id: "product-1",
            rating_count: 4,
            category: { id: "fashion" },
            seller: { id: "seller-1", is_verified_store: true },
            product_variants: [
              { stock_quantity: 3 },
              { stock_quantity: 2 },
            ],
          },
          {
            id: "product-2",
            rating_count: 2,
            category: { id: "fashion" },
            seller: { id: "seller-1", is_verified_store: true },
            product_variants: [{ stock_quantity: 5 }],
          },
          {
            id: "product-3",
            rating_count: 0,
            category_id: "home",
            seller_id: "seller-2",
            product_variants: [{ stock_quantity: 1 }],
          },
        ],
        [
          { id: "curation-1", productCount: 2 },
          { id: "curation-2", productCount: 3 },
        ],
      ),
    ).toEqual({
      liveProducts: 3,
      sellerCount: 2,
      categoryCount: 2,
      curationCount: 2,
      inventoryUnits: 11,
      reviewCount: 6,
      verifiedSellerCount: 1,
      curationPlacements: 5,
    });
  });

  it("returns zeroes when the public feeds are empty", () => {
    expect(buildMarketplaceSnapshot()).toEqual({
      liveProducts: 0,
      sellerCount: 0,
      categoryCount: 0,
      curationCount: 0,
      inventoryUnits: 0,
      reviewCount: 0,
      verifiedSellerCount: 0,
      curationPlacements: 0,
    });
  });
});

