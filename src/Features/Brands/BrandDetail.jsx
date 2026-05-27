import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import ModernNavbar from "../../Components/ModernNavbar";

gsap.registerPlugin(ScrollTrigger);

// Mock products for the brand
const PRODUCTS = [
  {
    id: 1,
    name: "Air Zoom Alpha",
    price: "₦125,000",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    name: "Phantom V",
    price: "₦145,000",
    img: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    name: "React Element",
    price: "₦89,000",
    img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    name: "Air Force 1 SP",
    price: "₦110,000",
    img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800",
  },
];

export default function BrandDetail() {
  const { brandId } = useParams();
  const mainRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.style.backgroundColor = "#050505";

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".product-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: "#products-grid", start: "top 85%" },
        },
      );
    }, mainRef);

    return () => {
      ctx.revert();
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div
      ref={mainRef}
      className="bg-[#050505] text-white min-h-screen selection:bg-blue-600/30"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <ModernNavbar
        navLinks={[
          { label: "All Brands", href: "/brands" },
          { label: "Shop", href: "/products" },
        ]}
      />

      {/* BACK BUTTON */}
      <div className="fixed top-24 left-6 z-50">
        <Link
          to="/brands"
          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* FULL-SCREEN HERO */}
      <section className="relative h-[90vh] min-h-[700px] w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=2000"
            alt="Brand Cover"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center mt-32">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "expo.out" }}
            className="text-[12vw] font-black uppercase tracking-tighter leading-none text-white text-center"
          >
            {brandId || "NIKE"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-3xl font-medium text-gray-300 mt-6 uppercase tracking-widest text-center"
          >
            Performance meets culture.
          </motion.p>
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section
        id="products-grid"
        className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto min-h-screen"
      >
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Latest Releases
          </h2>
          <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">
            {PRODUCTS.length} Items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="product-card group cursor-pointer">
              {/* Image Container */}
              <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden mb-6">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                />

                {/* Hover Add to Cart */}
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex justify-center">
                  <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-colors">
                    Add To Cart <ShoppingCart size={16} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                  {product.name}
                </h3>
                <span className="text-lg font-bold text-gray-400">
                  {product.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
