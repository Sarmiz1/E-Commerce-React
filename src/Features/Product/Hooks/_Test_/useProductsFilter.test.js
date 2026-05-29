import { describe, expect, it } from "vitest";
import { getListingContext, isSaleProduct } from "../useProductsFilter";

describe("getListingContext", () => {
  it("keeps the specific category link instead of broadening it with its column", () => {
    expect(
      getListingContext("/products/categories/dresses-and-skirts", "women").terms,
    ).toEqual(["dresses and skirts"]);
  });

  it("uses the column filter for category view-all links", () => {
    expect(getListingContext("/products/categories", "women").terms).toEqual(["women"]);
  });

  it("uses the leaf brand and recognizes sale curations", () => {
    expect(getListingContext("/products/curations/brands/luxury/gucci").terms).toEqual([
      "gucci",
    ]);
    expect(getListingContext("/products/curations/flash-sales").isSale).toBe(true);
  });
});

describe("isSaleProduct", () => {
  it("recognizes discounted catalog shapes", () => {
    expect(isSaleProduct({ price_minor: 5000, sale_price_minor: 3500 })).toBe(true);
    expect(isSaleProduct({ price_minor: 3500, compare_at_price_minor: 5000 })).toBe(true);
    expect(isSaleProduct({ price_minor: 3500, original_price_minor: 5000 })).toBe(true);
  });

  it("does not classify a cheap full-price product as a sale", () => {
    expect(isSaleProduct({ price_minor: 1500 })).toBe(false);
  });

  it("ignores an expired scheduled sale", () => {
    expect(
      isSaleProduct({
        price_minor: 5000,
        sale_price_minor: 3500,
        sale_ends_at: "2000-01-01T00:00:00.000Z",
      }),
    ).toBe(false);
  });
});
