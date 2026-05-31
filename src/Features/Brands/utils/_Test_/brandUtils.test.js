import { describe, expect, it } from "vitest";
import {
  buildBrandCatalogHref,
  buildBrandHref,
  buildBrandsDirectoryHref,
  getBrandById,
  getBrandsByCategory,
  getProductsForBrand,
  getRelatedBrands,
} from "../brandUtils";

describe("brandUtils", () => {
  it("builds encoded directory and marketplace links", () => {
    expect(buildBrandsDirectoryHref()).toBe("/brands");
    expect(buildBrandHref("fenty-beauty")).toBe("/brands/fenty-beauty");
    expect(buildBrandCatalogHref("new-balance")).toBe(
      "/products/curations/shop-by-brands/new-balance",
    );
  });

  it("returns the complete directory for the All filter", () => {
    expect(getBrandsByCategory("All").length).toBeGreaterThan(12);
    expect(getBrandsByCategory("Tech").every((brand) => brand.category === "Tech")).toBe(true);
  });

  it("matches live listings by normalized brand aliases", () => {
    const brand = getBrandById("arc-teryx");
    const products = [
      { id: "1", brand: "Arc'teryx" },
      { id: "2", brand: { name: "ARCTERYX" } },
      { id: "3", brand: "Nike" },
    ];

    expect(getProductsForBrand(products, brand).map(({ id }) => id)).toEqual([
      "1",
      "2",
    ]);
  });

  it("returns curated related labels before category fallbacks", () => {
    expect(
      getRelatedBrands(getBrandById("nike")).map(({ id }) => id),
    ).toEqual(["adidas", "new-balance", "kith"]);
  });
});
