import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartAPI } from "../../api/cartApi";
import { CartEngine } from "../cartEngine";
import { CartStorage } from "../cartStorage";

vi.mock("../../api/cartApi", () => ({
  CartAPI: {
    add: vi.fn(),
  },
}));

describe("CartEngine guest merge", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("moves guest cart items into the signed-in cart and clears local storage", async () => {
    CartStorage.set([
      { product_id: "product-1", variant_id: "variant-1", quantity: 2 },
    ]);
    CartAPI.add.mockResolvedValueOnce({});

    await expect(
      CartEngine.mergeGuestToServer("user-1", "cart-1"),
    ).resolves.toEqual({ mergedCount: 1, failedItems: [] });

    expect(CartAPI.add).toHaveBeenCalledWith({
      cartId: "cart-1",
      productId: "product-1",
      variantId: "variant-1",
      quantity: 2,
    });
    expect(CartStorage.get()).toEqual([]);
  });

  it("retains items that fail to merge so shopper intent is not lost", async () => {
    const unavailableItem = {
      product_id: "product-2",
      variant_id: "variant-2",
      quantity: 1,
    };
    CartStorage.set([
      { product_id: "product-1", variant_id: "variant-1", quantity: 2 },
      unavailableItem,
    ]);
    CartAPI.add
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("Unavailable"));

    await expect(
      CartEngine.mergeGuestToServer("user-1", "cart-1"),
    ).resolves.toEqual({ mergedCount: 1, failedItems: [unavailableItem] });

    expect(CartStorage.get()).toEqual([unavailableItem]);
  });
});

describe("CartStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("recovers from non-array local storage values", () => {
    window.localStorage.setItem("guest_cart", JSON.stringify({ bad: true }));
    expect(CartStorage.get()).toEqual([]);
  });
});
