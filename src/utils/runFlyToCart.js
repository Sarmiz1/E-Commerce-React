// src/utils/cartAnimation.js
//
// Fly-to-cart animation — guaranteed to work on every product card variant.
//
// ── Why the previous version failed ──────────────────────────────────────────
//  The old version walked the DOM looking for an <img> by traversing ancestors
//  with .closest(selector). This broke when:
//    • The card wrapper and an inner div both had [data-cart-card], so .closest()
//      found the wrong ancestor.
//    • The button was rendered as a compound component (AddToCart inside the card)
//      meaning event.currentTarget was the AddToCart root, not the card.
//    • There was no <img> reachable from that specific node path.
//
// ── New strategy — data-product-image attribute ───────────────────────────────
//  ProductCard puts data-product-image="<url>" on its outermost wrapper.
//  The animation reads this attribute directly — zero DOM traversal, zero fragility.
//
//  Priority order:
//    1. data-product-image on the closest [data-product-image] ancestor
//    2. The nearest <img> in the document by Euclidean distance (legacy fallback)
//    3. An indigo dot launched from the button (always fires, even offline)
//
// ── Usage ─────────────────────────────────────────────────────────────────────
//  The runFlyToCart function is called automatically by useAddToCart.
//  You never need to call it directly unless building a custom button.
//
//    import { runFlyToCart } from "../utils/cartAnimation";
//    runFlyToCart(clickEvent, cartIconRef);

import gsap from "gsap";

// ── Image resolution ──────────────────────────────────────────────────────────

/**
 * resolveImageSource(triggerEl)
 *
 * Finds the product image URL and its screen position.
 * Returns { src, rect } or null.
 *
 * @param {HTMLElement} triggerEl  The button that was clicked.
 */
function resolveImageSource(triggerEl) {
  // ── Strategy 1: data-product-image on any ancestor ─────────────────────────
  // ProductCard sets this on its root element. Completely unambiguous.
  const cardEl = triggerEl.closest("[data-product-image]");
  if (cardEl) {
    const src = cardEl.dataset.productImage;
    if (src) {
      // Use the card's bounding rect as the animation origin
      const rect = cardEl.getBoundingClientRect();
      // Try to get the actual img rect if it's smaller than the card
      const img = cardEl.querySelector("img[src]");
      const sourceRect = img ? img.getBoundingClientRect() : rect;
      if (sourceRect.width > 0) return { src, rect: sourceRect };
    }
  }

  // ── Strategy 2: nearest visible <img> in the document ─────────────────────
  // Fallback for any component that hasn't been updated to use data-product-image.
  const triggerRect = triggerEl.getBoundingClientRect();
  const triggerCx   = triggerRect.left + triggerRect.width  / 2;
  const triggerCy   = triggerRect.top  + triggerRect.height / 2;

  const imgs = Array.from(document.querySelectorAll("img[src]")).filter((img) => {
    const r = img.getBoundingClientRect();
    return r.width > 40 && r.height > 40 && img.src && !img.src.endsWith(".svg");
  });

  if (imgs.length) {
    imgs.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const da = Math.hypot(ar.left + ar.width/2 - triggerCx, ar.top + ar.height/2 - triggerCy);
      const db = Math.hypot(br.left + br.width/2 - triggerCx, br.top + br.height/2 - triggerCy);
      return da - db;
    });
    const img  = imgs[0];
    const rect = img.getBoundingClientRect();
    if (rect.width > 0) return { src: img.src, rect };
  }

  return null;
}

// ── Clone builder ─────────────────────────────────────────────────────────────

/**
 * buildFlyClone(imageResult, triggerEl)
 *
 * Creates the DOM element that visually flies to the cart.
 * If no image was found, it launches a branded dot from the button.
 */
function buildFlyClone(imageResult, triggerEl) {
  const clone = document.createElement("div");

  if (imageResult) {
    const { src, rect } = imageResult;
    Object.assign(clone.style, {
      position:           "fixed",
      top:                `${rect.top}px`,
      left:               `${rect.left}px`,
      width:              `${Math.min(rect.width, 180)}px`,   // cap so huge images don't dominate
      height:             `${Math.min(rect.height, 180)}px`,
      backgroundImage:    `url('${src}')`,
      backgroundSize:     "cover",
      backgroundPosition: "center",
      borderRadius:       "14px",
      zIndex:             "99999",
      pointerEvents:      "none",
      boxShadow:          "0 10px 36px rgba(79,70,229,0.30)",
      willChange:         "transform, top, left, width, height, opacity",
      // Prevent the clone from inheriting any CSS transforms from parent stacking contexts
      transform:          "none",
    });
  } else {
    // Dot fallback — always looks good regardless of product image availability
    const r = triggerEl.getBoundingClientRect();
    Object.assign(clone.style, {
      position:      "fixed",
      top:           `${r.top  + r.height / 2 - 18}px`,
      left:          `${r.left + r.width  / 2 - 18}px`,
      width:         "36px",
      height:        "36px",
      background:    "linear-gradient(135deg, #2563eb, #6366f1)",
      borderRadius:  "50%",
      zIndex:        "99999",
      pointerEvents: "none",
      boxShadow:     "0 4px 20px rgba(99,102,241,0.55)",
      willChange:    "transform, top, left, width, height, opacity",
    });
  }

  return clone;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * runFlyToCart(event, cartIconRef)
 *
 * Animates a clone of the product image flying into the Navbar cart icon,
 * then bounces the icon to confirm arrival.
 *
 * Called automatically by useAddToCart() — you rarely need this directly.
 *
 * @param {React.SyntheticEvent|Event} event
 *   The click event from the Add to Cart button. Must be called synchronously
 *   within the event handler (before any await) so currentTarget is still set.
 *
 * @param {React.RefObject<HTMLElement>} cartIconRef
 *   Ref to the cart icon button in the Navbar (registered via CartAnimationContext).
 */
export function runFlyToCart(event, cartIconRef) {
  // ── Guards ──────────────────────────────────────────────────────────────────
  if (!cartIconRef?.current) return;

  // currentTarget can be null on synthetic events after the handler returns,
  // but we're called synchronously so it should be valid. Still guard it.
  const triggerEl = event?.currentTarget ?? event?.target;
  if (!triggerEl) return;

  const cartEl   = cartIconRef.current;
  const cartRect = cartEl.getBoundingClientRect();
  if (!cartRect.width || !cartRect.height) return; // cart icon off-screen / hidden

  // ── Resolve image and build clone ──────────────────────────────────────────
  const imageResult = resolveImageSource(triggerEl);
  const clone        = buildFlyClone(imageResult, triggerEl);
  document.body.appendChild(clone);

  // ── Compute destination (centre of cart icon) ───────────────────────────────
  const destLeft = cartRect.left + cartRect.width  / 2 - 20;
  const destTop  = cartRect.top  + cartRect.height / 2 - 20;

  // ── GSAP animation ──────────────────────────────────────────────────────────
  gsap.to(clone, {
    top:          destTop,
    left:         destLeft,
    width:        40,
    height:       40,
    borderRadius: "50%",
    opacity:      0,
    duration:     0.7,
    ease:         "power3.in",
    onComplete() {
      clone.remove();
      // Elastic bounce on the cart icon — visual confirmation of arrival
      gsap.fromTo(
        cartEl,
        { scale: 1.5 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.5)" }
      );
    },
  });
}