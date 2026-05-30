import { describe, expect, it } from "vitest";
import {
  getEffectivePriceMinor,
  getProductCategoryOptions,
  isInStockProduct,
  isSaleProduct,
  matchesProductCategory,
} from "../useProductsFilter";

describe("matchesProductCategory", () => {
  it("matches a joined backend category by its name or slug", () => {
    const product = {
      category: {
        id: "category-1",
        name: "Beauty & Health",
        slug: "beauty-and-health",
      },
    };

    expect(matchesProductCategory(product, "Beauty & Health")).toBe(true);
    expect(matchesProductCategory(product, "beauty-and-health")).toBe(true);
  });

  it("does not match category text found elsewhere in a product", () => {
    expect(matchesProductCategory(
      {
        name: "Gaming desk",
        full_description: "Perfect for an electronics setup",
        category: { name: "Home & Garden", slug: "home-and-garden" },
      },
      "electronics",
    )).toBe(false);
  });
});

describe("getProductCategoryOptions", () => {
  it("derives unique sorted options from backend category joins", () => {
    expect(getProductCategoryOptions([
      { image: "fashion.jpg", category: { id: "2", name: "Fashion", slug: "fashion" } },
      { image: "electronics.jpg", category: { id: "1", name: "Electronics", slug: "electronics" } },
      { image: "duplicate.jpg", category: { id: "2", name: "Fashion", slug: "fashion" } },
    ])).toEqual([
      { id: "all", label: "All", value: "All", image: "" },
      { id: "1", label: "Electronics", value: "electronics", image: "electronics.jpg" },
      { id: "2", label: "Fashion", value: "fashion", image: "fashion.jpg" },
    ]);
  });
});

describe("isInStockProduct", () => {
  it("uses real variant inventory instead of product price", () => {
    expect(isInStockProduct({
      price_minor: 5000,
      product_variants: [{ stock_quantity: 0 }, { stock_quantity: 3 }],
    })).toBe(true);
    expect(isInStockProduct({
      price_minor: 5000,
      product_variants: [{ stock_quantity: 0 }],
    })).toBe(false);
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

  it("uses an active sale price for budget filtering and sorting", () => {
    expect(getEffectivePriceMinor({
      price_minor: 5000,
      sale_price_minor: 3500,
    })).toBe(3500);
  });
});
