import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useNavigate, useLoaderData } from "react-router-dom";
import NavBar from "./Components/NavBar";
import HeroSection from './Components/HeroSection';
import CategorySpotlight from "./Components/CategorySpotlight";
import ProductsSection from "./Components/ProductsSection";
import FlashSale from "./Components/FlashSale";
import TestimonialsCarousel from "./Components/TestimonialsCarousel";
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
import CartDrawer from "./Components/CartDrawer";
import Features from "./Components/Features";
import CtaSection from "./Components/CtaSection";
import BackToTop from "./Components/BackToTop";

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
      <Features />
      
      {/* Other Sections */}
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
      <CtaSection />

      {/* Cart Drawer */}
      <CartDrawer
        cart={cart}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      {/* Back to Top */}
      <BackToTop 
        showTopBtn={showTopBtn} 
        scrollToTop={scrollToTop} 
        scrollProgress={scrollProgress} />
    </div>
  );
}