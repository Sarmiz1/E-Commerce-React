import { describe, expect, it } from "vitest";
import {
  buildFeaturedHref,
  buildLinkHref,
  buildViewAllHref,
} from "../megaMenuLinks";

describe("MegaMenu filtered destinations", () => {
  it("routes shop links to category endpoints", () => {
    expect(buildFeaturedHref({ tag: "Trending" })).toBe("/products/curations/trending");
    expect(buildLinkHref("Trending", "Women", "Dresses & Skirts")).toBe(
      "/products/categories/dresses-and-skirts?filter=women",
    );
    expect(buildLinkHref("Trending", "Lifestyle", "Kitchen & Dining")).toBe(
      "/products/categories/kitchen-and-dining",
    );
    expect(buildViewAllHref("Trending", "Men")).toBe("/products/categories?filter=men");
  });

  it("routes new-arrival links to their matching listing endpoints", () => {
    expect(buildLinkHref("New Arrivals", "This Week", "Trending Now")).toBe(
      "/products/curations/trending-now",
    );
    expect(buildLinkHref("New Arrivals", "Collections", "Workwear Edit")).toBe(
      "/products/collections/workwear-edit",
    );
    expect(buildLinkHref("New Arrivals", "By Category", "Beauty")).toBe(
      "/products/categories/beauty",
    );
  });

  it("routes brand links to nested brand endpoints", () => {
    expect(buildFeaturedHref({ tag: "Premium" })).toBe("/products/curations/brands");
    expect(buildLinkHref("Premium", "Luxury", "Gucci")).toBe(
      "/products/curations/brands/luxury/gucci",
    );
    expect(buildViewAllHref("Premium", "Luxury")).toBe(
      "/products/curations/brands/luxury",
    );
  });
});
