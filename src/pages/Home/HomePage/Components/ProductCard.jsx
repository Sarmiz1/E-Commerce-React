// ─── Product card variants ─────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { formatMoneyCents } from "../../../../Utils/formatMoneyCents"; 
import Stars from "../Components/Stars";


export default function ProductCard({ product, variant = "default", onAddToCart }) {
  if (!product) return null;

  if (variant === "tall") return (
    <motion.div whileHover={{ y: -10 }} className="hp-prod-card group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="relative h-72 overflow-hidden">
        <img src={product?.image} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-red-600 px-2.5 py-1 rounded-full">SALE</div>
        <motion.button whileTap={{ scale: 0.93 }} onClick={(e) => onAddToCart?.(product, e)}
          className="absolute bottom-4 left-4 right-4 bg-white text-gray-900 font-bold py-2.5 rounded-2xl text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
          + Add to Cart
        </motion.button>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">{product?.name}</h3>
        <Stars rating={product?.rating?.stars || 0} />
        <p className="font-black text-xl text-gray-900 mt-2">{formatMoneyCents(product?.priceCents)}</p>
      </div>
    </motion.div>
  );

  if (variant === "wide") return (
    <motion.div whileHover={{ x: 4 }} className="hp-prod-card group flex gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300">
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
          <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => onAddToCart?.(product, e)}
            className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Add</motion.button>
        </div>
      </div>
    </motion.div>
  );

  if (variant === "minimal") return (
    <motion.div whileHover={{ y: -6, scale: 1.02 }} className="hp-prod-card group bg-gray-50 rounded-2xl overflow-hidden hover:bg-white hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden bg-white">
        <img src={product?.image} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Featured</p>
        <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{product?.name}</h3>
        <div className="flex items-center justify-between mt-3">
          <p className="font-black text-indigo-600">{formatMoneyCents(product?.priceCents)}</p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => onAddToCart?.(product, e)}
            className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">+</motion.button>
        </div>
      </div>
    </motion.div>
  );

  if (variant === "dark") return (
    <motion.div whileHover={{ y: -10 }} className="hp-prod-card group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
      <div className="relative h-52 overflow-hidden">
        <img src={product?.image} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{product?.name}</h3>
        <Stars rating={product?.rating?.stars || 0} />
        <div className="flex items-center justify-between mt-3">
          <p className="font-black text-white">{formatMoneyCents(product?.priceCents)}</p>
          <motion.button whileTap={{ scale: 0.9 }} className="bg-white text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl">+ Cart</motion.button>
        </div>
      </div>
    </motion.div>
  );

  // default
  return (
    <motion.div whileHover={{ y: -12, boxShadow: "0 32px 64px rgba(79,70,229,0.15)" }} className="hp-prod-card group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img src={product?.image} alt={product?.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600 px-2.5 py-1 rounded-full shadow-sm">New</div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-1">{product?.name}</h3>
        <Stars rating={product?.rating?.stars || 0} />
        <div className="flex items-center justify-between mt-4">
          <p className="font-black text-2xl text-gray-900">{formatMoneyCents(product?.priceCents)}</p>
          <motion.button whileTap={{ scale: 0.93 }} onClick={(e) => onAddToCart?.(product, e)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-indigo-500/40 transition-all">+ Cart</motion.button>
        </div>
      </div>
    </motion.div>
  );
}