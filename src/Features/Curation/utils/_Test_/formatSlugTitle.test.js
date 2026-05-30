import { describe, expect, it } from "vitest";
import { formatSlugTitle } from "../formatSlugTitle";

describe("formatSlugTitle", () => {
  it("formats URL-friendly slugs for display", () => {
    expect(formatSlugTitle("new-arrivals")).toBe("New Arrivals");
    expect(formatSlugTitle("editors_picks")).toBe("Editors Picks");
  });

  it("handles missing values", () => {
    expect(formatSlugTitle()).toBe("");
  });
});
