import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import WishlistHeart from "../../../Components/Ui/WishlistHeart";

export default function InlineAd({ product, type, allProducts }) {
  const { isDark, colors } = useTheme();
  if (!product) return null;

  const adImages = useMemo(() => {
    const base = [product.image].filter(Boolean);
    if (allProducts?.length) {
      const extras = allProducts
        .filter((p) => p.id !== product.id && p.image)
        .slice(0, 4)
        .map((p) => p.image);
      return [...base, ...extras].slice(0, 5);
    }
    return base;
  }, [product, allProducts]);

  if (type === "featured") {
    return (
      <div className="col-span-full xl:col-span-2 relative group">
        <WishlistHeart 
          className="absolute top-4 right-4"
          onToggle={(s) => console.log(`Ad ${product.id} liked: ${s}`)}
        />
        <Link
          to={`/products/${product.slug || product.id}`}
          className="block h-full"
        >
          <motion.div
            whileHover="hover"
            className="pg-card-enter relative rounded-2xl overflow-hidden flex items-center justify-between gap-4 cursor-pointer h-full border border-white/5"
            variants={{
              hover: {
                scale: 1.01,
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                borderColor: "rgba(255,255,255,0.15)",
              },
            }}
            style={{
              background: isDark
                ? `linear-gradient(120deg, ${colors.surface.tertiary} 0%, #1e1b4b 100%)`
                : "linear-gradient(120deg, #111827 0%, #1e1b4b 100%)",
            }}
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <motion.img
                variants={{ hover: { scale: 1.15, filter: "brightness(0.9)" } }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src={product.image}
                alt=""
                className="w-full h-full object-cover opacity-70"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, ${isDark ? "#000" : "#111"} 50%, transparent 95%)`,
                }}
              />
              <motion.div
                variants={{ hover: { x: ["-100%", "200%"] } }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] pointer-events-none"
              />
            </div>

            <div className="relative z-10 flex items-center gap-4 pl-6 py-4">
              <motion.span
                variants={{ hover: { scale: 1.2, rotate: 15 } }}
                className="text-3xl text-white/40 font-serif italic"
              >
                ✦
              </motion.span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: colors.brand.electricBlue }}
                  >
                    Featured Drop
                  </p>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10 uppercase font-bold tracking-tighter">
                    Limited
                  </span>
                </div>
                <motion.p
                  variants={{ hover: { x: 5 } }}
                  className="text-sm font-bold text-white line-clamp-1"
                >
                  {product.name}
                </motion.p>
                <p className="text-[10px] text-white/50 italic line-clamp-1">
                  Exclusively curated for the season
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-4 pr-6 py-4">
              <div className="text-right">
                <p className="font-black text-xl text-white">
                  {formatMoneyCents(product.price_cents)}
                </p>
                <p className="text-[11px] line-through opacity-40 text-white">
                  {formatMoneyCents(Math.round(product.price_cents * 1.6))}
                </p>
              </div>
              <motion.span
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,1)",
                  color: "#000",
                }}
                className="text-[11px] font-bold px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 transition-all duration-300"
              >
                Shop Now
              </motion.span>
            </div>
          </motion.div>
        </Link>
      </div>
    );
  }

  return (
    <div className="col-span-full xl:col-span-2 relative group">
      <WishlistHeart 
        className="absolute top-4 right-4"
        onToggle={(s) => console.log(`Ad ${product.id} liked: ${s}`)}
      />
      <Link
        to={`/products/${product.slug || product.id}`}
        className="block h-full"
      >
        <motion.div
          whileHover="hover"
          className="pg-card-enter relative rounded-2xl overflow-hidden flex items-center justify-between gap-4 cursor-pointer h-full border border-amber-500/10"
          variants={{
            hover: {
              scale: 1.01,
              boxShadow: "0 15px 30px rgba(180,83,9,0.15)",
              borderColor: "rgba(217,119,6,0.3)",
            },
          }}
          style={{ background: isDark ? "rgba(180,83,9,0.05)" : "#fffbeb" }}
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.img
              variants={{ hover: { scale: 1.2 } }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              src={product.image}
              alt=""
              className="w-full h-full object-cover opacity-15 grayscale"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${isDark ? "#1a1a1a" : "#fffbeb"} 40%, transparent 100%)`,
              }}
            />
            <motion.div
              variants={{ hover: { x: ["-100%", "200%"] } }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent skew-x-[-25deg] pointer-events-none"
            />
          </div>

          <div className="relative z-10 flex items-center gap-4 pl-6 py-4">
            <motion.span
              variants={{ hover: { scale: 1.2, rotate: -15 } }}
              className="text-3xl"
            >
              ⚡
            </motion.span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: colors.brand.gold }}
                >
                  Flash Deal
                </p>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/10 uppercase font-bold tracking-tighter">
                  Live
                </span>
              </div>
              <motion.p
                variants={{ hover: { x: 5 } }}
                className="text-sm font-bold line-clamp-1"
                style={{ color: colors.text.primary }}
              >
                {product.name}
              </motion.p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 pr-6 py-4">
            <div className="text-right">
              <p
                className="font-black text-xl"
                style={{ color: colors.brand.gold }}
              >
                {formatMoneyCents(product.price_cents)}
              </p>
              <p
                className="text-[11px] line-through"
                style={{ color: colors.text.tertiary }}
              >
                {formatMoneyCents(Math.round(product.price_cents * 1.4))}
              </p>
            </div>
            <motion.span
              whileHover={{ scale: 1.05, backgroundColor: "#d97706" }}
              className="text-[11px] font-bold px-5 py-2.5 rounded-xl bg-amber-600 text-white transition-all duration-300"
            >
              Shop →
            </motion.span>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
