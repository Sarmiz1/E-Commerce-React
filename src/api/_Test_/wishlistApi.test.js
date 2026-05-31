import { beforeEach, describe, expect, it, vi } from "vitest";
import { WishlistAPI } from "../wishlistApi";

describe("WishlistAPI guest merge", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("clears local wishlist items after they merge successfully", async () => {
    WishlistAPI.setGuestWishlist(["product-1", "product-2"]);
    vi.spyOn(WishlistAPI, "add").mockResolvedValue();

    await expect(WishlistAPI.mergeGuestToServer()).resolves.toEqual({
      mergedCount: 2,
      failedProductIds: [],
    });

    expect(WishlistAPI.getGuestWishlist()).toEqual([]);
  });

  it("retains only wishlist items that fail to merge", async () => {
    WishlistAPI.setGuestWishlist(["product-1", "product-2"]);
    vi.spyOn(WishlistAPI, "add")
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error("Unavailable"));

    await expect(WishlistAPI.mergeGuestToServer()).resolves.toEqual({
      mergedCount: 1,
      failedProductIds: ["product-2"],
    });

    expect(WishlistAPI.getGuestWishlist()).toEqual(["product-2"]);
  });
});
