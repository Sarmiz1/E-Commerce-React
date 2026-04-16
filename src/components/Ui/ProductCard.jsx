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
import { motion } from "framer-motion";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import Stars from "../Stars";
import AddToCart from "./AddToCart";

// ── Helpers ────────────────────────────────────────────────────────────────────

function isNewProduct(product) {
  if (!product?.createdAt) return false;
  return Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
}

function isOnSale(product) {
  return Boolean(product?.priceCents && product.priceCents < 2000);
}

function Badge({ label, colorClass }) {
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm text-white ${colorClass}`}>
      {label}
    </span>
  );
}

// ── NavigableWrapper ───────────────────────────────────────────────────────────
// Makes the entire card area navigate to /products/:id on click.
// Smart exclusion: AddToCart button clicks and anchor clicks are passed through.
function NavigableWrapper({ productId, children }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (e.target.closest("[data-testid='add-to-cart-btn']")) return;
    if (e.target.closest("a[href]")) return;
    navigate(`/products/${productId}`);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
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
    <NavigableWrapper productId={product.id}>
      <motion.div
        data-product-image={product.image}
        whileHover={{ y: -10, boxShadow: "0 32px 64px rgba(79,70,229,0.14)" }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100/80 flex flex-col h-full"
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <img src={product.image} alt={product.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {newProduct && <Badge label="New" colorClass="bg-gradient-to-r from-blue-600 to-indigo-600" />}
            {onSale && <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
              View Product
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left pointer-events-none" />
        </div>
        <div className="p-5 flex flex-col gap-2 flex-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors duration-200">
            {product.name}
          </h3>
          <Stars rating={product.rating?.stars ?? 0} count={product.rating?.count ?? 0} />
          <div className="mt-auto pt-2 flex items-end justify-between">
            <p className="font-black text-xl text-gray-900">{formatMoneyCents(product.priceCents)}</p>
            {onSale && <p className="text-gray-400 text-xs line-through">{formatMoneyCents(Math.round(product.priceCents * 1.35))}</p>}
          </div>
          <AddToCart productId={product.id} variant="primary" />
        </div>
      </motion.div>
    </NavigableWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: horizontal
// ─────────────────────────────────────────────────────────────────────────────
function HorizontalCard({ product }) {
  return (
    <NavigableWrapper productId={product.id}>
      <motion.div
        data-product-image={product.image}
        whileHover={{ x: 4, boxShadow: "0 8px 32px rgba(79,70,229,0.10)" }}
        transition={{ duration: 0.2 }}
        className="group flex gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100/80"
      >
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
          <img src={product.image} alt={product.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-indigo-700 transition-colors">
              {product.name}
            </h3>
            <div className="mt-1">
              <Stars rating={product.rating?.stars ?? 0} count={product.rating?.count ?? 0} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 gap-2">
            <p className="font-black text-gray-900 text-base">{formatMoneyCents(product.priceCents)}</p>
            <AddToCart productId={product.id} variant="pill" />
          </div>
        </div>
      </motion.div>
    </NavigableWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: overlay
// ─────────────────────────────────────────────────────────────────────────────
function OverlayCard({ product }) {
  const onSale = isOnSale(product);

  return (
    <NavigableWrapper productId={product.id}>
      <motion.div
        data-product-image={product.image}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl"
        style={{ aspectRatio: "3/4" }}
      >
        <img src={product.image} alt={product.name} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        {onSale && (
          <div className="absolute top-3 left-3 z-10">
            <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white font-bold text-sm line-clamp-1 mb-1">{product.name}</p>
          <div className="flex items-center justify-between">
            <p className="font-black text-white text-lg">{formatMoneyCents(product.priceCents)}</p>
            <AddToCart productId={product.id} variant="ghost" className="!py-1.5 !px-3 !text-xs" />
          </div>
        </div>
      </motion.div>
    </NavigableWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: compact
// ─────────────────────────────────────────────────────────────────────────────
function CompactCard({ product }) {
  const onSale = isOnSale(product);

  return (
    <NavigableWrapper productId={product.id}>
      <motion.div
        data-product-image={product.image}
        whileHover={{ y: -5, scale: 1.03 }}
        transition={{ duration: 0.22 }}
        className="group bg-gray-50 rounded-2xl overflow-hidden hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100/60"
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
          <img src={product.image} alt={product.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {onSale && (
            <div className="absolute top-2 right-2">
              <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-bold text-gray-900 text-xs line-clamp-1 mb-0.5 group-hover:text-indigo-700 transition-colors">
            {product.name}
          </p>
          <Stars rating={product.rating?.stars ?? 0} count={0} />
          <div className="flex items-center justify-between mt-2">
            <p className="font-black text-indigo-600 text-sm">{formatMoneyCents(product.priceCents)}</p>
            <AddToCart productId={product.id} variant="icon" />
          </div>
        </div>
      </motion.div>
    </NavigableWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: ghost
// ─────────────────────────────────────────────────────────────────────────────
function GhostCard({ product }) {
  return (
    <NavigableWrapper productId={product.id}>
      <motion.div
        data-product-image={product.image}
        whileHover={{ y: -10, scale: 1.02 }}
        transition={{ duration: 0.25 }}
        className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all duration-300"
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <img src={product.image} alt={product.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white text-sm line-clamp-1 mb-1 group-hover:text-indigo-300 transition-colors">
            {product.name}
          </h3>
          <Stars rating={product.rating?.stars ?? 0} count={product.rating?.count ?? 0} light />
          <div className="flex items-center justify-between mt-3">
            <p className="font-black text-white text-base">{formatMoneyCents(product.priceCents)}</p>
            <AddToCart productId={product.id} variant="ghost" />
          </div>
        </div>
      </motion.div>
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
    <Link to={`/products/${product.id}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-3xl">
      <motion.div
        whileHover={{ y: -8, boxShadow: "0 20px 48px rgba(79,70,229,0.12)" }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full border border-gray-100/80"
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <img src={product.image} alt={product.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {newProduct && <Badge label="New" colorClass="bg-gradient-to-r from-blue-600 to-indigo-600" />}
            {onSale && <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
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
          <Stars rating={product.rating?.stars ?? 0} count={product.rating?.count ?? 0} />
          <div className="mt-auto pt-2 flex items-end justify-between">
            <p className="font-black text-xl text-gray-900">{formatMoneyCents(product.priceCents)}</p>
            {onSale && <p className="text-gray-400 text-xs line-through">{formatMoneyCents(Math.round(product.priceCents * 1.35))}</p>}
          </div>
        </div>
      </motion.div>
    </Link>
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
      className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100/80 flex flex-col"
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img src={product.image} alt={product.name} loading="lazy"
          className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {newProduct && <Badge label="New" colorClass="bg-gradient-to-r from-blue-600 to-indigo-600" />}
          {onSale && <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />}
        </div>
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{product.name}</h3>
        <Stars rating={product.rating?.stars ?? 0} count={product.rating?.count ?? 0} />
        <div className="mt-auto pt-2 flex items-end justify-between">
          <p className="font-black text-xl text-gray-900">{formatMoneyCents(product.priceCents)}</p>
          {onSale && <p className="text-gray-400 text-xs line-through">{formatMoneyCents(Math.round(product.priceCents * 1.35))}</p>}
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
    <motion.div
      data-cart-card
      whileHover={{ x: 4 }}
      className="hp-prod-card group flex gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
        <Link to={`/products/${product.id}`} className="cursor-pointer">
          <img src={product?.image} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </Link>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{product?.name}</h3>
          <Stars rating={product?.rating?.stars || 0} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="font-black text-gray-900">{formatMoneyCents(product?.priceCents)}</p>
          {/* <AddToCart productId={product?.id} /> */}
          {/* <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => handleAdd(e, product?.id)}
            className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Add</motion.button> */}
        </div>
        <AddToCart productId={product?.id} />
      </div>
    </motion.div>
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
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[ProductCard] Unknown variant "${variant}". Valid: ${Object.keys(VARIANT_MAP).join(", ")}`);
    }
    return null;
  }

  return <Card product={product} />;
}



