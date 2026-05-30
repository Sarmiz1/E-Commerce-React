import { describe, expect, it } from "vitest";
import {
  filterSellableProducts,
  normalizeSellableProduct,
} from "../productAvailability";

describe("normalizeSellableProduct", () => {
  it("keeps only active variants with positive stock", () => {
    expect(normalizeSellableProduct({
      id: "product-1",
      is_active: true,
      product_variants: [
        { id: "available", is_active: true, stock_quantity: 4 },
        { id: "empty", is_active: true, stock_quantity: 0 },
        { id: "inactive", is_active: false, stock_quantity: 8 },
      ],
    })).toMatchObject({
      id: "product-1",
      product_variants: [{ id: "available", is_active: true, stock_quantity: 4 }],
    });
  });

  it("rejects inactive products and products without sellable variants", () => {
    expect(normalizeSellableProduct({
      id: "inactive-product",
      is_active: false,
      product_variants: [{ stock_quantity: 5 }],
    })).toBeNull();
    expect(normalizeSellableProduct({
      id: "empty-product",
      is_active: true,
      product_variants: [{ stock_quantity: 0 }],
    })).toBeNull();
  });
});

describe("filterSellableProducts", () => {
  it("removes products without available inventory", () => {
    expect(filterSellableProducts([
      { id: "available", product_variants: [{ stock_quantity: 1 }] },
      { id: "empty", product_variants: [{ stock_quantity: 0 }] },
    ])).toEqual([
      { id: "available", product_variants: [{ stock_quantity: 1 }] },
    ]);
  });
});
