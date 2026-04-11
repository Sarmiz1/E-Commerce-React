// src/Components/Ui/ProductCard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ratingCount } from "../../Utils/ratingsCount";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";

// ── Stars renderer ────────────────────────────────────────────────────────────
function StarRating({ stars = 0, count = 0 }) {
  const full  = Math.floor(stars);
  const half  = stars % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array(full).fill(0).map((_, i)  => <span key={`f${i}`} className="text-yellow-400 text-xs leading-none">★</span>)}
        {half                             && <span className="text-yellow-400 text-xs leading-none">⯪</span>}
        {Array(empty).fill(0).map((_, i) => <span key={`e${i}`} className="text-gray-200  text-xs leading-none">★</span>)}
      </div>
      {count > 0 && (
        <span className="text-gray-400 text-[11px] font-medium">({count.toLocaleString()})</span>
      )}
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  if (!product) return null;

  const isNew  = product?.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 * 30;
  const onSale = product?.priceCents && product.priceCents < 2000;

  return (
    <Link to={`/products/${product?.id}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-3xl">
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-indigo-500/15 transition-shadow duration-300 flex flex-col h-full border border-gray-100/80"
      >
        {/* ── Image wrapper ── */}
        <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "4/3" }}>
          <img
            src={product?.image}
            alt={product?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew && (
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                New
              </span>
            )}
            {onSale && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                Sale
              </span>
            )}
          </div>

          {/* Quick-view hint on hover */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
              View Product
            </span>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors duration-200">
            {product?.name}
          </h3>

          {product?.rating && (
            <StarRating stars={product.rating.stars} count={product.rating.count} />
          )}

          <div className="mt-auto pt-2 flex items-end justify-between">
            <p className="font-black text-xl text-gray-900">
              {formatMoneyCents(product?.priceCents)}
            </p>
            {onSale && product?.priceCents && (
              <p className="text-gray-400 text-xs line-through">
                {formatMoneyCents(Math.round(product.priceCents * 1.35))}
              </p>
            )}
          </div>
        </div>

        {/* Bottom accent line — grows on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </motion.div>
    </Link>
  );
}
