// src/Components/Ui/ProductCard.jsx
//
// ── Variants ──────────────────────────────────────────────────────────────────
//
//  "standard"    Full card: image + name + rating + price + AddToCart.
//                Navigates to product detail on click anywhere on the card.
//
//  "horizontal"  Side-by-side: thumbnail left, details right.
//                Navigates to product detail on click anywhere on the card.
//
//  "overlay"     Image-dominant with content on a gradient overlay.
//                Navigates to product detail on click anywhere on the card.
//
//  "compact"     Small minimal card, image on top, tiny text below.
//                Navigates to product detail on click anywhere on the card.
//
//  "ghost"       Dark glassmorphism card for dark backgrounds.
//                Navigates to product detail on click anywhere on the card.
//
//  "navigate"    Link-only card — no AddToCart button.
//                Navigates to product detail on click anywhere on the card.
//
//  "static"      Display-only. NO navigation. NO AddToCart.
//                Use in admin panels, email templates, read-only galleries,
//                print/PDF exports, or anywhere interaction must be disabled.
//
// "customWide"   Created basically for Best Sellers section in homepage cuz the space needs small cards
//                used default variant AddToCart Button 
//
// ── Navigation behaviour ─────────────────────────────────────────────────────
//  All variants except "static" use NavigableWrapper which navigates to
//  /products/:id on any click UNLESS the click came from:
//    • the AddToCart button (data-testid="add-to-cart-btn")
//    • a regular <a href> element (browser handles it natively)
//  This lets users click the image, price, name — anywhere — to navigate,
//  while AddToCart still adds to cart without triggering navigation.
//
// ── data-product-image attribute ─────────────────────────────────────────────
//  Every card root carries data-product-image={product.image}.
//  The fly-to-cart animation (cartAnimation.js) reads this to find the image
//  URL without DOM traversal — immune to layout changes inside the card.

import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion as Motion } from "framer-motion";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import Stars from "../Stars";
import { useTrackProductClick } from "../../Hooks/useTrackProductClick";
import AddToCart from "./AddToCart";
import { IconCart } from "../Icons/IconCart";
import WishlistHeart from "./WishlistHeart";
import QuickView from "./QuickView";
import { prefetchProductOnHover } from "../../Utils/prefetchProductOnHover";
import { getAnalyticsSessionId, trackEvent } from "../../api/track_events";

// ── Helpers ────────────────────────────────────────────────────────────────────

function isNewProduct(product) {
  if (!product?.created_at) return false;
  return Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000;
}

function isOnSale(product) {
  return Boolean(product?.price_cents && product.price_cents < 2000);
}

function Badge({ label, colorClass }) {
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm text-white ${colorClass}`}>
      {label}
    </span>
  );
}

function trackProductView(productId) {
  if (!productId) return;

  trackEvent({
    eventType: "view_product",
    productId,
    sessionId: getAnalyticsSessionId(),
  });
}

// ── Live Velocity Badge (Simulated) ──────────────────────────────────────────
function LiveVelocityBadge({ productId }) {
  if (!productId) return null;
  let velocity = null;
  const setVelocity = (nextVelocity) => {
    velocity = nextVelocity;
  };
  
  {
    const hash = String(productId).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    const num = Math.abs(hash % 100);
    
    if (num > 80) setVelocity({ type: 'scarcity', text: `Only ${num % 5 + 1} left` });
    else if (num > 60) setVelocity({ type: 'velocity', text: `🔥 ${num} viewing` });
    else if (num > 40) setVelocity({ type: 'sales', text: `${num} bought recently` });
  }

  if (!velocity) return null;

  const getStyle = () => {
    if (velocity.type === 'scarcity') return "bg-red-500/90 text-white";
    if (velocity.type === 'velocity') return "bg-orange-500/90 text-white";
    return "bg-black/80 text-white";
  };

  return (
    <div className={`absolute bottom-3 left-3 z-10 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg flex items-center gap-1.5 ${getStyle()}`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
      </span>
      {velocity.text}
    </div>
  );
}

// ── NavigableWrapper ───────────────────────────────────────────────────────────
// Makes the entire card area navigate to /products/:id on click.
// Smart exclusion: AddToCart button clicks and anchor clicks are passed through.
function NavigableWrapper({ product, children }) {
  const navigate = useNavigate();
  const trackClick = useTrackProductClick();
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    if (product) {
      queryClient.setQueryData(["product", product.slug || product.id], product);
      queryClient.setQueryData(["product", product.id], product);
      if (product.slug) prefetchProductOnHover(product.slug);
    }
  };

  const handleClick = (e) => {
    const addToCartBtn = e.target.closest("[data-testid='add-to-cart-btn']");
    if (addToCartBtn) return;

    const anchor = e.target.closest("a[href]");
    if (anchor) return;

    // Also exclude WishlistHeart clicks
    if (e.target.closest("button[title*='wishlist']")) return;
    // Also exclude QuickView clicks
    if (e.target.closest("button[title*='Quick View']")) return;

    const productId = product?.id;
    if (!productId) return;

    // ✅ track only real product card clicks
    trackClick(productId);
    trackProductView(productId);

    navigate(`/products/${product.slug || product.id}`);
  };

  return (
    <div onClick={handleClick} onMouseEnter={handleMouseEnter} className="cursor-pointer h-full">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: standard
// ─────────────────────────────────────────────────────────────────────────────
function StandardCard({ product }) {
  const newProduct = isNewProduct(product);
  const onSale = isOnSale(product);

  return (
    <NavigableWrapper product={product}>
      <Motion.div
        data-product-image={product.image}
        whileHover={{ y: -10, boxShadow: "0 32px 64px rgba(79,70,229,0.14)" }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100/80 flex flex-col h-full"
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <img
            src={product?.image}
            alt={product?.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x600?text=No+Image";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <QuickView product={product} className="top-3 right-12" />
          <WishlistHeart 
            className="absolute top-3 right-3" 
            productId={product.id}
            onToggle={(s) => console.log(`StdCard ${product.id} liked: ${s}`)}
          />
          <LiveVelocityBadge productId={product?.id} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {newProduct && <Badge label="New" colorClass="bg-gradient-to-r from-blue-600 to-indigo-600" />}
            {onSale && <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none z-10">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-quickview', { detail: product })); }}
              className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md pointer-events-auto transition-colors"
            >
              Quick View
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left pointer-events-none" />
        </div>
        <div className="p-5 flex flex-col gap-2 flex-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors duration-200">
            {product.name}
          </h3>
          <Stars rating={product.rating_stars} count={product.rating_count} />
          <div className="mt-auto pt-2 flex items-end justify-between">
            <p className="font-black text-xl text-gray-900">{formatMoneyCents(product.price_cents)}</p>
            {onSale && <p className="text-gray-400 text-xs line-through">{formatMoneyCents(Math.round(product.price_cents * 1.35))}</p>}
          </div>

          <AddToCart productId={product.id} variant className="w-full mt-2" />

        </div>
      </Motion.div>
    </NavigableWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: horizontal
// ─────────────────────────────────────────────────────────────────────────────
function HorizontalCard({ product }) {
  return (
    <NavigableWrapper product={product}>
      <Motion.div
        data-product-image={product.image}
        whileHover={{ x: 4, boxShadow: "0 8px 32px rgba(79,70,229,0.10)" }}
        transition={{ duration: 0.2 }}
        className="group flex gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100/80 relative"
      >
        <WishlistHeart 
          className="absolute top-2 right-2 scale-75" 
          productId={product.id}
          onToggle={(s) => console.log(`HCard ${product.id} liked: ${s}`)}
        />
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x600?text=No+Image";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <QuickView product={product} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-indigo-700 transition-colors pr-6">
              {product.name}
            </h3>
            <div className="mt-1">
              <Stars rating={product.rating_stars ?? 0} count={product.rating_count ?? 0} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 gap-2">
            <p className="font-black text-gray-900 text-base">{formatMoneyCents(product.price_cents)}</p>
            <AddToCart productId={product.id} variant="pill" />
          </div>
        </div>
      </Motion.div>
    </NavigableWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: overlay
// ─────────────────────────────────────────────────────────────────────────────
function OverlayCard({ product }) {
  const onSale = isOnSale(product);

  return (
    <NavigableWrapper product={product}>
      <Motion.div
        data-product-image={product.image}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl h-full flex flex-col"
        style={{ aspectRatio: "3/4" }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x600?text=No+Image";
          }}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <QuickView product={product} className="top-3 right-12" />
        <WishlistHeart 
          className="absolute top-3 right-3" 
          productId={product.id}
          onToggle={(s) => console.log(`OverlayCard ${product.id} liked: ${s}`)}
        />
        {onSale && (
          <div className="absolute top-3 left-3 z-10">
            <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white font-bold text-sm line-clamp-1 mb-1">{product.name}</p>
          <Stars rating={product.rating_stars} count={product.rating_count} />
          <div className="flex items-center justify-between">
            <p className="font-black text-white text-lg">{formatMoneyCents(product.price_cents)}</p>
            <AddToCart productId={product.id} variant="ghost" className="!py-1.5 !px-3 !text-xs" />
          </div>
        </div>
      </Motion.div>
    </NavigableWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: compact
// ─────────────────────────────────────────────────────────────────────────────
function CompactCard({ product }) {
  const onSale = isOnSale(product);

  return (
    <NavigableWrapper product={product}>
      <Motion.div
        data-product-image={product.image}
        whileHover={{ y: -5, scale: 1.03 }}
        transition={{ duration: 0.22 }}
        className="group bg-gray-50 rounded-2xl overflow-hidden hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100/60 flex flex-col h-full"
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x600?text=No+Image";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <QuickView product={product} className="top-2 right-10 scale-75" />
          <WishlistHeart 
            className="absolute top-2 right-2 scale-75" 
            productId={product.id}
            onToggle={(s) => console.log(`CompactCard ${product.id} liked: ${s}`)}
          />
          {onSale && (
            <div className="absolute top-2 left-2 z-10">
              <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />
            </div>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <p className="font-bold text-gray-900 text-xs line-clamp-1 mb-0.5 group-hover:text-indigo-700 transition-colors">
            {product.name}
          </p>
          <Stars rating={product.rating_stars} count={product.rating_count} />
          <div className="flex items-center justify-between mt-auto pt-2">
            <p className="font-black text-indigo-600 text-sm">{formatMoneyCents(product.price_cents)}</p>
            <AddToCart productId={product.id} variant="icon" />
          </div>
        </div>
      </Motion.div>
    </NavigableWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: ghost
// ─────────────────────────────────────────────────────────────────────────────
function GhostCard({ product }) {
  return (
    <NavigableWrapper product={product}>
      <Motion.div
        data-product-image={product.image}
        whileHover={{ y: -10, scale: 1.02 }}
        transition={{ duration: 0.25 }}
        className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex flex-col h-full"
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x600?text=No+Image";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <QuickView product={product} className="top-3 right-12" />
          <WishlistHeart 
            className="absolute top-3 right-3" 
            productId={product.id}
            onToggle={(s) => console.log(`GhostCard ${product.id} liked: ${s}`)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-white text-sm line-clamp-1 mb-1 group-hover:text-indigo-300 transition-colors">
            {product.name}
          </h3>
          <Stars rating={product.rating_stars} count={product.rating_count} light />
          <div className="flex items-center justify-between mt-auto pt-3">
            <p className="font-black text-white text-base">{formatMoneyCents(product.price_cents)}</p>
            <AddToCart productId={product.id} variant="ghost" />
          </div>
        </div>
      </Motion.div>
    </NavigableWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: navigate
//  Entire card is a <Link>. No AddToCart.
// ─────────────────────────────────────────────────────────────────────────────
function NavigateCard({ product }) {
  const newProduct = isNewProduct(product);
  const onSale = isOnSale(product);

  return (
    <div className="relative group h-full">
      <QuickView product={product} className="top-3 right-12 z-30" />
      <WishlistHeart 
        className="absolute top-3 right-3 z-30" 
        productId={product.id}
        onToggle={(s) => console.log(`NavCard ${product.id} liked: ${s}`)}
      />
      <Link
        to={`/products/${product.slug || product.id}`}
        onClick={() => trackProductView(product.id)}
        className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-3xl h-full">
        <Motion.div
          whileHover={{ y: -8, boxShadow: "0 20px 48px rgba(79,70,229,0.12)" }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full border border-gray-100/80"
        >
          <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x600?text=No+Image";
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {newProduct && <Badge label="New" colorClass="bg-gradient-to-r from-blue-600 to-indigo-600" />}
              {onSale && <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none z-10">
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                View Product
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left pointer-events-none" />
          </div>
          <div className="p-4 flex flex-col gap-1.5 flex-1">
            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors duration-200">
              {product.name}
            </h3>
            <Stars rating={product.rating_stars} count={product.rating_count} />
            <div className="mt-auto pt-2 flex items-end justify-between">
              <p className="font-black text-xl text-gray-900">{formatMoneyCents(product.price_cents)}</p>
              {onSale && <p className="text-gray-400 text-xs line-through">{formatMoneyCents(Math.round(product.price_cents * 1.35))}</p>}
            </div>
          </div>
        </Motion.div>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: static
//  Pure display — no navigation, no AddToCart.
//  Safe for admin panels, email renders, print views, read-only galleries.
// ─────────────────────────────────────────────────────────────────────────────
function StaticCard({ product }) {
  const newProduct = isNewProduct(product);
  const onSale = isOnSale(product);

  return (
    <div
      data-product-image={product.image}
      className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100/80 flex flex-col h-full relative group"
    >
      <WishlistHeart 
        className="absolute top-3 right-3" 
        productId={product.id}
        onToggle={(s) => console.log(`StaticCard ${product.id} liked: ${s}`)}
      />
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x600?text=No+Image";
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {newProduct && <Badge label="New" colorClass="bg-gradient-to-r from-blue-600 to-indigo-600" />}
          {onSale && <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />}
        </div>
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{product.name}</h3>
        <Stars rating={product.rating_stars} count={product.rating_count} />
        <div className="mt-auto pt-2 flex items-end justify-between">
          <p className="font-black text-xl text-gray-900">{formatMoneyCents(product.price_cents)}</p>
          {onSale && <p className="text-gray-400 text-xs line-through">{formatMoneyCents(Math.round(product.price_cents * 1.35))}</p>}
        </div>
        {/* AddToCart intentionally absent — static variant is display-only */}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: customWide
//  Created basically for Best Sellers section cuz the space needs small cards
//  used default variant AddToCart Button 
// ─────────────────────────────────────────────────────────────────────────────
function customWideCard({ product }) {
  return (
    <Motion.div
      data-cart-card
      whileHover={{ x: 4 }}
      className="hp-prod-card group flex gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 h-full relative"
    >
      <QuickView product={product} className="top-2 right-10 scale-75" />
      <WishlistHeart 
        className="absolute top-2 right-2 scale-75" 
        productId={product.id}
        onToggle={(s) => console.log(`CWCard ${product.id} liked: ${s}`)}
      />
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
        <Link
          to={`/products/${product?.slug || product?.id}`}
          onClick={() => trackProductView(product?.id)}
          className="cursor-pointer"
        >
          <img
            src={product?.image}
            alt={product?.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x600?text=No+Image";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight pr-6">{product?.name}</h3>
          <Stars rating={product?.rating_stars} count={product?.rating_count} />
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="font-black text-gray-900">{formatMoneyCents(product?.price_cents)}</p>
          <AddToCart productId={product?.id} variantId={product?.variant_id} />
        </div>
      </div>
    </Motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT MAP + MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
const VARIANT_MAP = {
  standard: StandardCard,
  horizontal: HorizontalCard,
  overlay: OverlayCard,
  compact: CompactCard,
  ghost: GhostCard,
  navigate: NavigateCard,
  static: StaticCard,
  customWide: customWideCard,
};

/**
 * ProductCard
 *
 * @param {object}  product    Full product object from the API. Required.
 * @param {"standard"|"horizontal"|"overlay"|"compact"|"ghost"|"navigate"|"static"} [variant="standard"]
 *
 * @example
 *   <ProductCard product={p} />
 *   <ProductCard product={p} variant="overlay" />
 *   <ProductCard product={p} variant="static" />    // display-only, no nav
 */
export default function ProductCard({ product, variant = "standard" }) {
  if (!product) return null;

  const Card = VARIANT_MAP[variant];
  if (!Card) {
    if (import.meta.env.DEV) {
      console.warn(`[ProductCard] Unknown variant "${variant}". Valid: ${Object.keys(VARIANT_MAP).join(", ")}`);
    }
    return null;
  }

  return <Card product={product} />;
}
