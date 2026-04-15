// ─── Product card variants ─────────────────────────────────────────────────────
import { useState } from "react";
import { motion } from "framer-motion";
import { formatMoneyCents } from "../../Utils/formatMoneyCents"; 
import { useCartIconRef } from "../../Context/cart/CartAnimationContext"; 
import { runFlyToCart } from "../../Utils/runFlyToCart"; 
import Stars from "../Stars";
import { useAddToCart } from "../../Hooks/cart/useAddCart";
import AddToCart from "./AddToCart";
import { Link } from "react-router-dom";


const issNew = (product) => product?.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 * 30;


export default function ProductCard({ product, variant = "default" }) {


  const { handleAdd, loading, success } = useAddToCart(product.id);

  const cartIconRef = useCartIconRef();

  const isNew = issNew(product)

  console.log(product)

  if (!product) return null;

  const onSale = product?.priceCents && product.priceCents < 2000;


  //Tall 
  if (variant === "tall") return (
    <motion.div 
      data-cart-card
      whileHover={{ y: -10 }} 
      className="hp-prod-card group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="relative h-72 overflow-hidden" data-cart-card>
        <img src={product?.image} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-red-600 px-2.5 py-1 rounded-full">SALE</div>
        <motion.button whileTap={{ scale: 0.93 }} onClick={(e) => handleAdd(e, product?.id)}
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


  // Wide
  if (variant === "wide") return (
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
  );

  // Minimal
  if (variant === "minimal") return (
    <motion.div
      data-cart-card 
      whileHover={{ y: -6, scale: 1.02 }} 
      className="hp-prod-card group bg-gray-50 rounded-2xl overflow-hidden hover:bg-white hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden bg-white">
        <img src={product?.image} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Featured</p>
        <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{product?.name}</h3>
        <div className="flex items-center justify-between mt-3">
          <p className="font-black text-indigo-600">{formatMoneyCents(product?.priceCents)}</p>
          <AddToCart productId={product?.id} />

        </div>
      </div>
    </motion.div>
  );

  // Dark
  if (variant === "dark") return (
    <motion.div 
      data-cart-card
      whileHover={{ y: -10 }} 
      className="hp-prod-card group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300"
    >
      <div className="relative h-52 overflow-hidden">
        <img src={product?.image} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{product?.name}</h3>
        <Stars rating={product?.rating?.stars || 0} />
        <div className="flex items-center justify-between mt-3">
          <p className="font-black text-white">{formatMoneyCents(product?.priceCents)}</p>
          <AddToCart productId={product?.id} />
        </div>
      </div>
    </motion.div>
  );

  // Simcard
  if (variant === 'simcard') return (
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
            <Stars stars={product.rating.stars} count={product.rating.count} variant="compact" />
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


  // default
  return (
    <motion.div
      data-cart-card 
      whileHover={{ y: -12, boxShadow: "0 32px 64px rgba(79,70,229,0.15)" }} className="hp-prod-card group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative overflow-hidden">
        <img src={product?.image} alt={product?.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"  />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600 px-2.5 py-1 rounded-full shadow-sm">New</div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-1">{product?.name}</h3>
        <Stars rating={product?.rating?.stars || 0} />
        <div className="flex items-center justify-between mt-4">
          <p className="font-black text-2xl text-gray-900">{formatMoneyCents(product?.priceCents)}</p>
          <AddToCart productId={product?.id} />
        </div>
      </div>

      {/* Test Animation */}
    </motion.div>
  );
}



