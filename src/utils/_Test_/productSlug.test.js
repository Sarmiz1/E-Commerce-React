import { describe, expect, it } from "vitest";
import {
  createProductSlug,
  refreshProductSlug,
  slugifyProductName,
} from "../productSlug";

describe("productSlug", () => {
  it("creates URL-safe product slugs", () => {
    expect(slugifyProductName(" Woosho Pro Max! ")).toBe("woosho-pro-max");
    expect(createProductSlug("Woosho Pro Max", 1234)).toBe("woosho-pro-max-1234");
  });

  it("refreshes the name while preserving the stable suffix", () => {
    expect(refreshProductSlug("Woosho Pro Max 2", "woosho-pro-max-1234"))
      .toBe("woosho-pro-max-2-1234");
  });
});

