import { describe, expect, it } from "vitest";
import { resolveCurationSlug } from "../curationsApi";

describe("resolveCurationSlug", () => {
  it("normalizes known navigation aliases", () => {
    expect(resolveCurationSlug("flash-sales")).toBe("flash-deals");
    expect(resolveCurationSlug("trending-now")).toBe("trending-products");
    expect(resolveCurationSlug("lookbook")).toBe("lookbook-products");
  });

  it("leaves backend curation slugs intact", () => {
    expect(resolveCurationSlug("editors-picks")).toBe("editors-picks");
  });
});
