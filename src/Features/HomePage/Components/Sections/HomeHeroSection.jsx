import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import ParticleField from "../ParticleField";
import { formatMoneyCents } from "../../../../Utils/formatMoneyCents";
import Stars from "../../../../Components/Stars";
import { useTimeContext } from "../../../../Hooks/useTimeContext";

export default function HomeHeroSection({ heroFeatured }) {
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroBtnRef = useRef(null);
  const heroImgRef = useRef(null);
  const navigate = useNavigate();

  const context = useTimeContext();

  useEffect(() => {
    if (!heroTitleRef.current) return;
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(
      heroTitleRef.current,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", clearProps: "all" },
    )
      .fromTo(
        heroSubRef.current,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "all",
        },
        "-=0.65",
      )
      .fromTo(
        heroBtnRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "back.out(2)",
          clearProps: "all",
        },
        "-=0.45",
      )
      .fromTo(
        heroImgRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          clearProps: "all",
        },
        "-=1.0",
      );
    return () => tl.kill();
  }, []);

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br ${context.theme} text-white min-h-[90vh] flex items-center transition-colors duration-1000`}
    >
      <ParticleField />
      <div
        className={`absolute w-96 h-96 rounded-full blur-3xl -top-20 -left-20 hp-hero-glow ${context.glow}`}
      />
      <div
        className={`absolute w-80 h-80 rounded-full blur-3xl bottom-0 -right-20 hp-hero-glow ${context.glow}`}
        style={{ animationDelay: "3s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center w-full">
        {/* Left */}
        <div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-[0.35em] mb-6">
            New Season · Context Enabled ⚡
          </p>
          <h1
            ref={heroTitleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-6"
          >
            <span className="hp-shimmer block text-4xl mb-2">
              {context.greeting}
            </span>
            <span className="text-white">{context.sub}</span>
            <br />
            <span className="hp-shimmer">You'll Love</span>
          </h1>
          <p
            ref={heroSubRef}
            className="text-blue-100 text-lg leading-relaxed mb-10 max-w-md"
          >
            Premium quality. Curated luxury. Delivered to your door with
            white-glove care.
          </p>
          <div ref={heroBtnRef} className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              }}
              whileTap={{ scale: 0.97 }}
              className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-base shadow-2xl"
              onClick={() => navigate(`/products/${heroFeatured?.slug || ""}`)}
            >
              Shop Now →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="border-2 border-white/40 text-white px-8 py-4 rounded-2xl font-semibold backdrop-blur-sm hover:bg-white/10 transition"
              onClick={() => navigate("/products/new-drops")}
            >
              View Collection
            </motion.button>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              "⭐ 4.9 Rating",
              "🚀 Free Shipping",
              "🔒 Secure Pay",
              "↩️ Easy Returns",
            ].map((p) => (
              <span
                key={p}
                className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-blue-100 backdrop-blur-sm"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Right — featured product */}
        <div
          ref={heroImgRef}
          className="relative flex justify-center md:justify-end md:-mt-20 lg:-mt-10"
        >
          {heroFeatured ? (
            <div className="relative">
              <div className="relative w-72 md:w-80 h-96 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={heroFeatured.image}
                  alt={heroFeatured.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">
                    Featured Drop
                  </p>
                  <h3 className="font-black text-lg leading-tight mb-1 line-clamp-2">
                    {heroFeatured.name}
                  </h3>
                  <Stars
                    rating={heroFeatured.rating_stars}
                    count={heroFeatured.rating_count}
                  />
                  <p className="text-2xl font-black">
                    {formatMoneyCents(heroFeatured.price_cents)}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 font-black text-xs px-3 py-2 rounded-2xl shadow-xl"
              >
                NEW DROP ✦
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute -bottom-4 -left-6 bg-white text-gray-900 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2"
              >
                <span className="text-yellow-400">★</span>{" "}
                {heroFeatured.rating_stars} · {heroFeatured.reviews || "2K"}{" "}
                reviews
              </motion.div>
            </div>
          ) : (
            <div className="w-80 h-96 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-sm" />
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-0.5 h-8 bg-gradient-to-b from-white/50 to-transparent rounded-full"
        />
      </div>
    </section>
  );
}
