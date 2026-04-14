// src/Context/CartAnimationContext.jsx
//
// Stores a single ref to the cart icon in the Navbar and makes it available
// to every component in the tree — without prop-drilling.
//
// ── How it works ──────────────────────────────────────────────────────────────
//  1. Wrap your app in <CartAnimationProvider> (alongside <CartProvider>).
//  2. The Navbar calls useRegisterCartIcon(ref) once on mount to register its
//     cart button DOM node.
//  3. Any component calls useCartIconRef() to get that ref and pass it to
//     runFlyToCart — or use the pre-wired useAddToCart() hook which handles
//     everything automatically.
//
// ── Usage example ─────────────────────────────────────────────────────────────
//
//   // Navbar.jsx
//   import { useRegisterCartIcon } from "../Context/CartAnimationContext";
//   const cartBtnRef = useRef(null);
//   useRegisterCartIcon(cartBtnRef);
//   <button ref={cartBtnRef}>🛒</button>
//
//   // Any AddToCart button, anywhere in the app
//   import { useAddToCart } from "../hooks/useAddToCart";
//   const { handleAdd, loading } = useAddToCart(product.id);
//   <button onClick={(e) => handleAdd(e)}>Add to Cart</button>
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";

// ── Context stores a mutable ref container so updates never cause re-renders ──
// We store a { current: ref } object rather than the ref itself so the context
// value is always the same object reference — zero re-renders on registration.
const CartAnimationContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function CartAnimationProvider({ children }) {
  // This ref-of-refs pattern means the context value never changes identity,
  // so no consumer ever re-renders due to this context.
  const cartIconRefHolder = useRef(null); // cartIconRefHolder.current = the actual ref

  return (
    <CartAnimationContext.Provider value={cartIconRefHolder}>
      {children}
    </CartAnimationContext.Provider>
  );
}

// ── useRegisterCartIcon ────────────────────────────────────────────────────────
/**
 * Called once in Navbar to register the cart button ref globally.
 *
 * @param {React.RefObject<HTMLElement>} ref  A ref attached to the cart icon button.
 */
export function useRegisterCartIcon(ref) {
  const holder = useContext(CartAnimationContext);

  useEffect(() => {
    if (holder && ref) {
      holder.current = ref; // store the ref object, not the DOM node
    }
  }, [holder, ref]);
}

// ── useCartIconRef ─────────────────────────────────────────────────────────────
/**
 * Returns the cart icon ref registered by Navbar.
 * Returns null if the Navbar hasn't mounted yet.
 *
 * @returns {React.RefObject<HTMLElement>|null}
 */

export function useCartIconRef() {
  const holder = useContext(CartAnimationContext);
  // holder.current is the ref object set by Navbar (e.g. { current: <button> })
  return holder?.current ?? null;
}