import { motion, AnimatePresence } from "framer-motion";
import ParticleField from "./ParticleField";


const HeroSection = ({
  heroTitleRef,
  heroSubRef,
  heroBtnRef,
  scrollToSection,
  navigate
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white py-32 text-center min-h-[85vh] flex flex-col items-center justify-center">
      <ParticleField />
      <div className="absolute w-96 h-96 rounded-full bg-blue-400/30 blur-3xl top-0 -left-20 se-hero-glow" />
      <div className="absolute w-80 h-80 rounded-full bg-violet-500/30 blur-3xl bottom-0 -right-20 se-hero-glow" style={{ animationDelay: "3s" }} />
      <div className="absolute w-60 h-60 rounded-full bg-indigo-300/20 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 se-hero-glow" style={{ animationDelay: "1.5s" }} />
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <p className="text-blue-200 text-sm font-semibold tracking-[0.3em] uppercase mb-6">New Season. New Drops. 🔥</p>
        <h2 ref={heroTitleRef} className="text-6xl md:text-7xl font-black leading-none mb-6">
          <span className="se-shimmer">Discover</span><br /><span className="text-white">Products You'll</span><br /><span className="se-shimmer">Love</span>
        </h2>
        <p ref={heroSubRef} className="text-lg text-blue-100 max-w-xl mx-auto mb-10 leading-relaxed">Premium quality. Curated styles. Delivered to your door faster than you can say "add to cart."</p>
        <div ref={heroBtnRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button whileHover={{ scale: 1.06, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/products")} className="bg-white text-indigo-700 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl">Shop Now →</motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => scrollToSection("#products")} className="border-2 border-white/40 text-white px-10 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm hover:bg-white/10 transition">Trending ↓</motion.button>
        </div>
        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          {["⭐ 4.9 Rating", "🚀 Free Shipping", "🔒 Secure Pay", "↩️ Easy Returns"].map((pill) => <span key={pill} className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-blue-100 backdrop-blur-sm">{pill}</span>)}
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-0.5 h-8 bg-gradient-to-b from-white/50 to-transparent rounded-full" />
      </div>
    </section>
  )
}

export default HeroSection
