
// src/Components/Ui/ProductCard.jsx
//
// ── Variants ──────────────────────────────────────────────────────────────────
//
//  "standard"    Full card: image + name + rating + price + AddToCart.
//                Default. Use in product grids on white/light backgrounds.
//
//  "horizontal"  Side-by-side: thumbnail left, details right.
//                Use in cart previews, search results, wishlists, narrow columns.
//
//  "overlay"     Image-dominant with content sitting on a gradient overlay.
//                Use for flash deals, featured sections, bento cells, hero grids.
//
//  "compact"     Small minimal card, image on top, tiny text below.
//                Use in recommendation strips, "you might also like" rows.
//
//  "ghost"       Dark glassmorphism card for dark/coloured backgrounds.
//                Use inside the Editor's Picks, dark sections, night-mode areas.
//
//  "navigate"    Link-only card — clicking navigates to product detail.
//                No AddToCart button. Used for similar-products / related grids.
//  "customWide"  Custom Card basically for Best Sellers section cuz the space needs small cards
//                used AddToCart Button variant: default 
//
// ── Key design decisions ──────────────────────────────────────────────────────
//  • data-product-image="<url>" on every card root — feeds the fly-to-cart
//    animation. The animation reads this attribute directly, making it
//    completely immune to DOM structure changes inside the card.
//
//  • AddToCart variant matches the card variant — no mismatched styles.
//
//  • Stars component always receives the same props shape: rating and count.
//
// ── Bugs fixed from original ──────────────────────────────────────────────────
//  • 'tall' variant called handleAdd which was never defined → runtime crash
//  • data-cart-card on both outer wrapper AND inner div → .closest() found wrong element
//  • Stars received inconsistent prop shapes across variants
//  • console.log(product) in production
//  • 'wide' variant had commented-out + active AddToCart (potential double-add)
//  • 'simcard' was not a professional naming convention

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import Stars from "../Stars";
import AddToCart from "./AddToCart";

// ── Shared helpers ─────────────────────────────────────────────────────────────

/** Returns true if the product was created within the last 30 days. */
function isNewProduct(product) {
  if (!product?.createdAt) return false;
  const AGE_MS = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(product.createdAt).getTime() < AGE_MS;
}

/** Returns true for products cheaper than $20 (treated as "on sale"). */
function isOnSale(product) {
  return Boolean(product?.priceCents && product.priceCents < 2000);
}

// ── Badge component ────────────────────────────────────────────────────────────
function Badge({ label, colorClass }) {
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm text-white ${colorClass}`}>
      {label}
    </span>
  );
}

// ── ProductCard guard ──────────────────────────────────────────────────────────
function NullCard() { return null; }

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: standard
//  Full card with image, name, rating, price, and AddToCart (primary button).
// ─────────────────────────────────────────────────────────────────────────────
function StandardCard({ product }) {
  const newProduct = isNewProduct(product);
  const onSale = isOnSale(product);

  return (
    <motion.div
      data-product-image={product.image}
      whileHover={{ y: -10, boxShadow: "0 32px 64px rgba(79,70,229,0.14)" }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100/80 flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <Link to={`/products/${product.id}`} tabIndex={-1}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {newProduct && <Badge label="New" colorClass="bg-gradient-to-r from-blue-600 to-indigo-600" />}
          {onSale && <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />}
        </div>

        {/* Hover quick-view hint */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
            View Product
          </span>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-indigo-700 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        <Stars rating={product.rating?.stars ?? 0} count={product.rating?.count ?? 0} />

        <div className="mt-auto pt-2 flex items-end justify-between">
          <p className="font-black text-xl text-gray-900">{formatMoneyCents(product.priceCents)}</p>
          {onSale && (
            <p className="text-gray-400 text-xs line-through">
              {formatMoneyCents(Math.round(product.priceCents * 1.35))}
            </p>
          )}
        </div>

        <AddToCart productId={product.id} variant="primary" />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: horizontal
//  Thumbnail left, name / rating / price / button right. Good for lists.
// ─────────────────────────────────────────────────────────────────────────────
function HorizontalCard({ product }) {
  return (
    <motion.div
      data-product-image={product.image}
      whileHover={{ x: 4, boxShadow: "0 8px 32px rgba(79,70,229,0.10)" }}
      transition={{ duration: 0.2 }}
      className="group flex gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100/80"
    >
      {/* Thumbnail */}
      <Link to={`/products/${product.id}`} className="flex-shrink-0">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link to={`/products/${product.id}`}>
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight hover:text-indigo-700 transition-colors">
              {product.name}
            </h3>
          </Link>
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
  );
}


// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: overlay
//  Full-bleed image, all content sits in a gradient overlay at the bottom.
//  Great for flash-deal cards, bento grids, featured sections.
// ─────────────────────────────────────────────────────────────────────────────
function OverlayCard({ product }) {
  const onSale = isOnSale(product);

  return (
    <motion.div
      data-product-image={product.image}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl cursor-pointer"
      style={{ aspectRatio: "3/4" }}
    >
      {/* Full-bleed image */}
      <Link to={`/products/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
        />
      </Link>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Top badge */}
      {onSale && (
        <div className="absolute top-3 left-3 z-10">
          <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white font-bold text-sm line-clamp-1 mb-1">{product.name}</p>
        <div className="flex items-center justify-between">
          <p className="font-black text-white text-lg">{formatMoneyCents(product.priceCents)}</p>
          <AddToCart productId={product.id} variant="ghost" className="!py-1.5 !px-3 !text-xs" />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: compact
//  Small footprint. Square image, minimal text, icon-only add button.
//  Use in recommendation strips, "You might also like" carousels.
// ─────────────────────────────────────────────────────────────────────────────
function CompactCard({ product }) {
  const onSale = isOnSale(product);

  return (
    <motion.div
      data-product-image={product.image}
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ duration: 0.22 }}
      className="group bg-gray-50 rounded-2xl overflow-hidden hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100/60"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {onSale && (
          <div className="absolute top-2 right-2">
            <Badge label="Sale" colorClass="bg-gradient-to-r from-orange-500 to-red-500" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <Link to={`/products/${product.id}`}>
          <p className="font-bold text-gray-900 text-xs line-clamp-1 mb-0.5 hover:text-indigo-700 transition-colors">
            {product.name}
          </p>
        </Link>
        <Stars rating={product.rating?.stars ?? 0} count={0} />
        <div className="flex items-center justify-between mt-2">
          <p className="font-black text-indigo-600 text-sm">{formatMoneyCents(product.priceCents)}</p>
          <AddToCart productId={product.id} variant="icon" />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: ghost
//  Dark glassmorphism card. White text. Use on dark section backgrounds.
// ─────────────────────────────────────────────────────────────────────────────
function GhostCard({ product }) {
  return (
    <motion.div
      data-product-image={product.image}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-white text-sm line-clamp-1 mb-1 hover:text-indigo-300 transition-colors">
            {product.name}
          </h3>
        </Link>
        <Stars rating={product.rating?.stars ?? 0} count={product.rating?.count ?? 0} light />
        <div className="flex items-center justify-between mt-3">
          <p className="font-black text-white text-base">{formatMoneyCents(product.priceCents)}</p>
          <AddToCart productId={product.id} variant="ghost" />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT: navigate
//  Link-only card. Clicking navigates to the product detail page.
//  No add-to-cart button — used in similar-products sections, related grids.
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
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
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
            {onSale && (
              <p className="text-gray-400 text-xs line-through">
                {formatMoneyCents(Math.round(product.priceCents * 1.35))}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
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
        <img src={product?.image} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
//  MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

const VARIANT_MAP = {
  standard: StandardCard,
  horizontal: HorizontalCard,
  overlay: OverlayCard,
  compact: CompactCard,
  ghost: GhostCard,
  navigate: NavigateCard,
  customWide: customWideCard
};

/**
 * ProductCard
 *
 * @param {object} product
 *   Full product object from the API. Required.
 *
 * @param {"standard"|"horizontal"|"overlay"|"compact"|"ghost"|"navigate"} [variant="standard"]
 *   Visual layout variant. See variant documentation at top of file.
 *
 * @example
 *   <ProductCard product={product} />
 *   <ProductCard product={product} variant="overlay" />
 *   <ProductCard product={product} variant="horizontal" />
 */
export default function ProductCard({ product, variant = "standard" }) {
  if (!product) return null;

  const Card = VARIANT_MAP[variant];
  if (!Card) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[ProductCard] Unknown variant "${variant}". Valid options: ${Object.keys(VARIANT_MAP).join(", ")}`);
    }
    return null;
  }

  return <Card product={product} />;
}




