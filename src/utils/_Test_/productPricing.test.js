import { describe, expect, it } from "vitest";
import {
  getSaleOriginalPriceMinor,
  getSellablePriceMinor,
  hasActiveSalePrice,
} from "../productPricing";

describe("productPricing", () => {
  it("uses an active product sale before a stale variant price", () => {
    const product = { price_minor: 20_000, sale_price_minor: 10_000 };
    const variant = { price_minor: 200 };

    expect(getSellablePriceMinor(product, variant)).toBe(10_000);
    expect(getSaleOriginalPriceMinor(product)).toBe(20_000);
  });

  it("uses an explicit variant override when no sale is active", () => {
    expect(getSellablePriceMinor(
      { price_minor: 20_000 },
      { price_minor: 15_000 },
    )).toBe(15_000);
  });

  it("falls back to the product base price for an inherited variant", () => {
    expect(getSellablePriceMinor(
      { price_minor: 20_000 },
      { price_minor: null },
    )).toBe(20_000);
  });

  it("does not activate a sale outside its schedule", () => {
    expect(hasActiveSalePrice({
      price_minor: 20_000,
      sale_price_minor: 10_000,
      sale_ends_at: "2000-01-01T00:00:00.000Z",
    })).toBe(false);
  });
});

