import { describe, expect, it } from "vitest";
import {
  CartProvider as facadeProvider,
  useCart as facadeUseCart,
  useCartActions as facadeUseCartActions,
  useCartState as facadeUseCartState,
} from "../cartContext";
import {
  CartProvider,
  useCart,
  useCartActions,
  useCartState,
} from "../../context/cart/CartContext";

describe("cartContext facade", () => {
  it("re-exports the canonical cart provider and hooks", () => {
    expect(facadeProvider).toBe(CartProvider);
    expect(facadeUseCart).toBe(useCart);
    expect(facadeUseCartActions).toBe(useCartActions);
    expect(facadeUseCartState).toBe(useCartState);
  });
});
