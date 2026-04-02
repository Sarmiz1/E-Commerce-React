import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useNavigate, useLoaderData } from "react-router-dom";
import NavBar from "./Components/NavBar";
import HeroSection from './Components/HeroSection';
import ParticleField from "./Components/ParticleField";
import CategorySpotlight from "./Components/CategorySpotlight";
import ProductsSection from "./Components/ProductsSection";
import FlashSale from "./Components/FlashSale";
import TestimonialsCarousel from "./Components/TestimonialsCarousel";
import FloatingOrbs from "./Components/FloatingOrbs";
import StatsBanner from "./Components/StatsBanner";

import ComparisonTable from "./Components/ComparisonTable";
import HorizontalScroll from "./Components/HorizontalScroll";
import ParallaxBanner from "./Components/ParallaxBanner";
import BentoPerks from "./Components/BentoPerks";
import Newsletter from "./Components/Newsletter";
import AppBanner from "./Components/AppBanner";
import SplitShowcase from "./Components/SplitShowcase";
import HowItWorks from "./Components/HowItWorks";
import BrandStrip from "./Components/BrandStrip";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);



// ─── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const cartIconRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroBtnRef = useRef(null);
  const productsRef = useRef(null);

  const products = useLoaderData();
  const trendingProducts = useMemo(() => products?.slice(0, 6) || [], [products]);

  // Hero entrance — no ScrollTrigger, plain timeline
  useEffect(() => {
    if (!heroTitleRef.current) return;
    const tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo(heroTitleRef.current, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.05, ease: "expo.out", clearProps: "all" })
      .fromTo(heroSubRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "all" }, "-=0.6")
      .fromTo(heroBtnRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "back.out(2)", clearProps: "all" }, "-=0.4");
    return () => tl.kill();
  }, []);

  // Products + Features + CTA — scoped refs, runs after data
  useEffect(() => {
    if (!trendingProducts.length || !productsRef.current) return;
    const t = setTimeout(() => {
      const cards = productsRef.current.querySelectorAll(".se-pc");
      if (cards.length) gsap.fromTo(cards, { y: 75, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: productsRef.current, start: "top 83%", once: true } });
      const featureSec = document.querySelector("#features");
      if (featureSec) {
        const fc = featureSec.querySelectorAll(".se-fc");
        if (fc.length) gsap.fromTo(fc, { scale: 0.82, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.14, duration: 0.8, ease: "back.out(1.5)", clearProps: "all", scrollTrigger: { trigger: featureSec, start: "top 82%", once: true } });
      }
      const ctaSec = document.querySelector("#cta");
      if (ctaSec) {
        const cc = ctaSec.querySelector(".se-cc");
        if (cc) gsap.fromTo(cc, { y: 45, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: ctaSec, start: "top 83%", once: true } });
      }
    }, 200);
    return () => clearTimeout(t);
  }, [trendingProducts]);

  useEffect(() => {
    const onScroll = () => {
      const st = window.scrollY; const dh = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(dh > 0 ? Math.min(st / dh, 1) : 0); setShowTopBtn(st > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const addToCart = (product, e) => {
    if (!product) return;
    const card = e.currentTarget.closest(".se-pc"); const img = card?.querySelector("img");
    if (img && cartIconRef.current) {
      const ir = img.getBoundingClientRect(); const cr = cartIconRef.current.getBoundingClientRect();
      const clone = document.createElement("div");
      clone.style.cssText = `position:fixed;top:${ir.top}px;left:${ir.left}px;width:${ir.width}px;height:${ir.height}px;background-image:url('${img.src}');background-size:cover;background-position:center;border-radius:16px;z-index:9999;pointer-events:none;box-shadow:0 8px 32px rgba(79,70,229,0.3);`;
      document.body.appendChild(clone);
      gsap.to(clone, { top: cr.top + cr.height / 2 - 20, left: cr.left + cr.width / 2 - 20, width: 40, height: 40, borderRadius: "50%", opacity: 0, duration: 0.75, ease: "power3.in", onComplete: () => { clone.remove(); if (cartIconRef.current) gsap.fromTo(cartIconRef.current, { scale: 1.4 }, { scale: 1, duration: 0.4, ease: "elastic.out(1.2,0.5)" }); } });
    }
    setCart((prev) => { const ex = prev.find((i) => i.id === product.id); if (ex) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i); return [...prev, { ...product, quantity: 1 }]; });
  };

  const updateQuantity = (id, amt) => setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + amt) } : i));
  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const totalPrice = cart.reduce((a, i) => a + i.priceCents * i.quantity, 0);

  const renderStars = (rating = 0) => {
    const full = Math.floor(rating), half = rating % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
    return (
      <div className="flex items-center gap-0.5">
        {Array(full).fill().map((_, i) => <span key={`f${i}`} className="text-yellow-400 text-sm">★</span>)}
        {half && <span className="text-yellow-400 text-sm">⯪</span>}
        {Array(empty).fill().map((_, i) => <span key={`e${i}`} className="text-gray-200 text-sm">★</span>)}
        <span className="ml-1.5 text-xs text-gray-400">{rating}</span>
      </div>
    );
  };

  const scrollToSection = (id) => { gsap.to(window, { duration: 1, scrollTo: id, ease: "power2.inOut" }); setMobileMenuOpen(false); };
  const scrollToTop = () => gsap.to(window, { duration: 1, scrollTo: { y: 0 }, ease: "power2.inOut" });
  const navLinks = [{ label: "Products", href: "#products" }, { label: "Features", href: "#features" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#cta" }];

  return (
    <div ref={pageRef} className="bg-gray-50 text-gray-800 overflow-x-hidden">
      <style>{`
        @keyframes se-float-orb{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-40px) scale(1.05)}66%{transform:translate(-20px,30px) scale(0.97)}}
        .se-float-orb{animation:se-float-orb linear infinite}
        @keyframes se-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .se-marquee{animation:se-marquee 24s linear infinite}
        @keyframes se-marquee-rev{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
        .se-marquee-rev{animation:se-marquee-rev 20s linear infinite}
        @keyframes se-glow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
        .se-hero-glow{animation:se-glow 6s ease-in-out infinite}
        @keyframes se-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .se-shimmer{background:linear-gradient(90deg,#fff 0%,#a5b4fc 30%,#fff 60%,#818cf8 90%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:se-shimmer 4s linear infinite}
        @keyframes se-float-y{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        .se-float-y{animation:se-float-y 4s ease-in-out infinite}
        @keyframes se-twinkle{0%,100%{opacity:.1;transform:scale(1)}50%{opacity:.9;transform:scale(1.4)}}
        .se-twinkle{animation:se-twinkle ease-in-out infinite}
      `}</style>

      {/* ── HEADER (user's exact structure) ── */}
      <NavBar
        navLinks={navLinks}
        scrollToSection={scrollToSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        cart={cart}
        navigate={navigate}
        setCartOpen={setCartOpen}
        cartIconRef={cartIconRef}
      />

      {/* Spacer for fixed header+marquee on mobile */}
      <div className="h-[100px] md:h-0" />

      {/* ── HERO ── */}
      <HeroSection
        heroTitleRef={heroTitleRef}
        heroSubRef={heroSubRef}
        heroBtnRef={heroBtnRef}
        scrollToSection={scrollToSection}
        navigate={navigate}
      />

      {/* Category Spotlight */}
      <CategorySpotlight />

      {/* Products */}
      <ProductsSection 
        productsRef={productsRef}
        trendingProducts={trendingProducts}
        renderStars={renderStars}
        formatMoneyCents={formatMoneyCents}
        addToCart={addToCart}
        navigate={navigate}
      />
      
      {/* Flash Sale */}
      <FlashSale />

      {/* Features */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e40af 100%)" }} />
        <FloatingOrbs dark />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Why We're Different</p>
          <h3 className="text-4xl font-black text-white mb-16">Why Shop With Us?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[{ icon: "🚀", title: "Fast Delivery", desc: "Same-day shipping on thousands of items. Get your orders quickly and safely." }, { icon: "🔒", title: "Secure Payments", desc: "Bank-grade encryption on every transaction. Your data stays yours." }, { icon: "↩️", title: "Easy Returns", desc: "Hassle-free returns within 30 days. No questions, no drama." }].map((f, i) => (
              <motion.div key={i} whileHover={{ y: -8, scale: 1.02 }} className="se-fc bg-white/10 backdrop-blur-sm border border-white/20 p-10 rounded-3xl text-white hover:bg-white/15 transition-all duration-300">
                <div className="text-5xl mb-5">{f.icon}</div>
                <h4 className="font-bold text-xl mb-3">{f.title}</h4>
                <p className="text-indigo-200 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <StatsBanner />
      <BrandStrip />
      <HowItWorks />
      <SplitShowcase />
      <TestimonialsCarousel />
      <AppBanner />
      <Newsletter />
      <BentoPerks />
      <ParallaxBanner />
      <HorizontalScroll />
      <ComparisonTable />

      {/* CTA */}
      <section id="cta" className="relative py-32 overflow-hidden" style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 50%,#8b5cf6 100%)" }}>
        <ParticleField />
        <div className="absolute w-96 h-96 rounded-full bg-white/5 blur-3xl -top-20 -right-20" />
        <div className="absolute w-80 h-80 rounded-full bg-purple-400/20 blur-3xl -bottom-20 -left-20" />
        <div className="se-cc relative z-10 text-center text-white max-w-2xl mx-auto px-6">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">Join the Community</p>
          <h3 className="text-5xl font-black mb-6 leading-tight">Ready to Start<br />Shopping?</h3>
          <p className="text-blue-100 text-lg mb-10">Join over 2 million happy customers and discover your next favorite thing.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }} className="bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl text-lg shadow-2xl">Get Started Free</motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="border-2 border-white/40 text-white font-semibold px-10 py-4 rounded-2xl text-lg hover:bg-white/10 transition backdrop-blur-sm">Learn More</motion.button>
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl z-[70] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-black">Your Cart</h3>
                <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {cart.length === 0 && (<div className="text-center py-20"><div className="text-5xl mb-4">🛒</div><p className="text-gray-400 font-medium">Your cart is empty</p><button onClick={() => setCartOpen(false)} className="mt-4 text-indigo-600 text-sm font-semibold">Continue Shopping →</button></div>)}
                {cart.map((item) => (
                  <motion.div layout key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                    {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatMoneyCents(item.priceCents)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 text-sm font-bold flex items-center justify-center hover:bg-gray-100">−</button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 text-sm font-bold flex items-center justify-center hover:bg-gray-100">+</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400 transition text-lg self-start">✕</button>
                  </motion.div>
                ))}
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4"><span className="text-gray-500 font-medium">Total</span><span className="text-2xl font-black text-gray-900">{formatMoneyCents(totalPrice)}</span></div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/30">Checkout →</motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Back to Top */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button initial={{ opacity: 0, scale: 0.7, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.7, y: 40 }} transition={{ duration: 0.3, ease: "backOut" }} onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 transition-transform duration-200">
            <svg className="absolute w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="transparent" />
              <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="3" fill="transparent" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - scrollProgress)} strokeLinecap="round" />
            </svg>
            <span className="relative text-white font-bold text-lg">↑</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}