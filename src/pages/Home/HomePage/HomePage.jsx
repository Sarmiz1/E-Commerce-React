import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useFetchData } from "../../../Hooks/useFetch";
import useShowErrorBoundary from "../../../Hooks/useShowErrorBoundary";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
// import Navbar from "./Navbar";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ─── Module-level constants (Math.random NEVER inside components) ─────────────
const HERO_PARTICLES = Array.from({ length: 50 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 2 + 0.4,
  vx: (Math.random() - 0.5) * 0.3,
  vy: (Math.random() - 0.5) * 0.3,
  opacity: Math.random() * 0.45 + 0.08,
}));

// ─── Static data ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Bags", emoji: "👜", bg: "from-rose-400 to-pink-600", count: "2.4K+" },
  { label: "Watches", emoji: "⌚", bg: "from-amber-400 to-orange-500", count: "890+" },
  { label: "Scarves", emoji: "🧣", bg: "from-violet-400 to-purple-600", count: "1.1K+" },
  { label: "Sunglasses", emoji: "🕶️", bg: "from-sky-400 to-blue-600", count: "670+" },
  { label: "Perfumes", emoji: "🧴", bg: "from-emerald-400 to-teal-600", count: "340+" },
  { label: "Shoes", emoji: "👠", bg: "from-gray-600 to-gray-900", count: "3.2K+" },
];

const BRANDS = ["ZARA", "H&M", "GUCCI", "PRADA", "VERSACE", "DIOR", "FENDI", "BALENCIAGA"];

const MARQUEE_ITEMS = [
  "Free Shipping Over $50", "New Arrivals Daily", "30-Day Returns",
  "Secure Checkout", "24/7 Concierge", "Members Save 15%",
];

const PERKS = [
  { icon: "🚀", title: "Express Delivery", desc: "Same-day on thousands of items. White-glove handling on every order." },
  { icon: "🔒", title: "Vault-Grade Security", desc: "256-bit encryption on every transaction. Your data stays yours." },
  { icon: "↩️", title: "Effortless Returns", desc: "No-questions 30-day returns. Full refunds processed in 48 hours." },
  { icon: "💎", title: "Member Privileges", desc: "Exclusive drops, early access, and curated edits before the public." },
];

const TESTIMONIALS = [
  { id: 1, text: "The packaging alone felt like unwrapping a gift from a Parisian boutique. Absolutely exceptional.", author: "Amara J.", role: "VIP Member", stars: 5 },
  { id: 2, text: "Delivered in 6 hours. I've never experienced e-commerce at this level before. Truly elite.", author: "Marcus W.", role: "Verified Buyer", stars: 5 },
  { id: 3, text: "The return was handled in 24 hours with a personal apology note. Class-defining service.", author: "Sophie K.", role: "Loyal Customer", stars: 5 },
  { id: 4, text: "Every product is exactly as described — photographed honestly, no surprises. Rare these days.", author: "Chen Li", role: "Top Reviewer", stars: 5 },
];

const HOW_IT_WORKS = [
  { num: "01", icon: "🔍", title: "Discover", desc: "Explore thousands of curated luxury items across every category." },
  { num: "02", icon: "🛒", title: "Select", desc: "Add to your wardrobe with a single tap." },
  { num: "03", icon: "💳", title: "Checkout", desc: "Secure, fast payment. Under 60 seconds." },
  { num: "04", icon: "📦", title: "Delivered", desc: "Your order arrives fast, tracked end-to-end." },
];

// ─── Styles constant ──────────────────────────────────────────────────────────
const STYLES = `
  @keyframes hp-float-orb{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-40px) scale(1.05)}66%{transform:translate(-20px,30px) scale(0.97)}}
  .hp-float-orb{animation:hp-float-orb linear infinite}
  @keyframes hp-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .hp-marquee{animation:hp-marquee 24s linear infinite}
  @keyframes hp-marquee-rev{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
  .hp-marquee-rev{animation:hp-marquee-rev 20s linear infinite}
  @keyframes hp-hero-glow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
  .hp-hero-glow{animation:hp-hero-glow 6s ease-in-out infinite}
  @keyframes hp-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .hp-shimmer{
    background:linear-gradient(90deg,#fff 0%,#a5b4fc 30%,#fff 60%,#818cf8 90%);
    background-size:200% auto;-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;animation:hp-shimmer 4s linear infinite;
  }
  @keyframes hp-float-y{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  .hp-float-y{animation:hp-float-y 4s ease-in-out infinite}

  @keyframes hp-count-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .hp-count-up{animation:hp-count-up 0.5s ease-out forwards}

  @keyframes hp-pulse-ring{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.4);opacity:0}100%{transform:scale(1.4);opacity:0}}
  .hp-pulse-ring{animation:hp-pulse-ring 2s ease-out infinite}

  @keyframes hp-scroll-x{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .hp-scroll-x{animation:hp-scroll-x 30s linear infinite}
  .hp-scroll-x:hover{animation-play-state:paused}

  .hp-progress-bar{transition:width 1.2s cubic-bezier(0.4,0,0.2,1)}

  .hp-back-top{
    position:fixed;bottom:2rem;right:2rem;z-index:50;
    width:3.5rem;height:3.5rem;border-radius:9999px;
    background:linear-gradient(135deg,#2563eb,#6366f1);
    color:white;display:flex;align-items:center;justify-content:center;
    box-shadow:0 10px 30px rgba(99,102,241,0.4);
    cursor:pointer;border:none;outline:none;
  }
  .hp-back-top:hover{transform:scale(1.1);box-shadow:0 16px 40px rgba(99,102,241,0.55);}
  .hp-back-top svg{transition:transform 0.2s;}
  .hp-back-top:hover svg{transform:translateY(-2px);}
`;

// ─── Shared helpers ───────────────────────────────────────────────────────────
function SectionLabel({ label }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">{label}</p>;
}

function Stars({ rating = 0 }) {
  const full = Math.floor(rating), half = rating % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array(full).fill(0).map((_, i) => <span key={`f${i}`} className="text-yellow-400 text-sm">★</span>)}
      {half && <span className="text-yellow-400 text-sm">⯪</span>}
      {Array(empty).fill(0).map((_, i) => <span key={`e${i}`} className="text-gray-200 text-sm">★</span>)}
      <span className="ml-1 text-xs text-gray-400">{rating}</span>
    </div>
  );
}

// ─── Particle canvas ──────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); let animId;
    // Clone module-level data with real pixel positions
    const particles = HERO_PARTICLES.map((p) => ({
      ...p,
      x: (p.x / 100) * (canvas.offsetWidth || 800),
      y: (p.y / 100) * (canvas.offsetHeight || 500),
    }));
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - d / 90)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Floating orbs ─────────────────────────────────────────────────────────────
function FloatingOrbs({ dark = false }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w: 600, h: 600, top: "-10%", left: "-10%", delay: 0, dur: 18 },
        { w: 400, h: 400, top: "40%", right: "-8%", delay: 3, dur: 22 },
        { w: 300, h: 300, bottom: "-5%", left: "30%", delay: 6, dur: 16 },
      ].map((o, i) => (
        <div key={i} style={{ width: o.w, height: o.h, top: o.top, left: o.left, right: o.right, bottom: o.bottom, animationDelay: `${o.delay}s`, animationDuration: `${o.dur}s` }}
          className={`absolute rounded-full blur-3xl hp-float-orb ${dark ? "bg-indigo-900/40" : "bg-gradient-to-br from-blue-400/20 to-indigo-500/20"}`} />
      ))}
    </div>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 py-2.5">
      <div className="flex whitespace-nowrap hp-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="text-white text-sm font-medium tracking-wide px-8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-200 inline-block" />{item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Product card variants ─────────────────────────────────────────────────────
function ProductCard({ product, variant = "default", onAddToCart }) {
  if (!product) return null;

  if (variant === "tall") return (
    <motion.div whileHover={{ y: -10 }} className="hp-prod-card group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="relative h-72 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-red-600 px-2.5 py-1 rounded-full">SALE</div>
        <motion.button whileTap={{ scale: 0.93 }} onClick={(e) => onAddToCart?.(product, e)}
          className="absolute bottom-4 left-4 right-4 bg-white text-gray-900 font-bold py-2.5 rounded-2xl text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
          + Add to Cart
        </motion.button>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">{product.name}</h3>
        <Stars rating={product.rating?.stars || 0} />
        <p className="font-black text-xl text-gray-900 mt-2">{formatMoneyCents(product.priceCents)}</p>
      </div>
    </motion.div>
  );

  if (variant === "wide") return (
    <motion.div whileHover={{ x: 4 }} className="hp-prod-card group flex gap-4 bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{product.name}</h3>
          <Stars rating={product.rating?.stars || 0} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="font-black text-gray-900">{formatMoneyCents(product.priceCents)}</p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => onAddToCart?.(product, e)}
            className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Add</motion.button>
        </div>
      </div>
    </motion.div>
  );

  if (variant === "minimal") return (
    <motion.div whileHover={{ y: -6, scale: 1.02 }} className="hp-prod-card group bg-gray-50 rounded-2xl overflow-hidden hover:bg-white hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden bg-white">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Featured</p>
        <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-3">
          <p className="font-black text-indigo-600">{formatMoneyCents(product.priceCents)}</p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => onAddToCart?.(product, e)}
            className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">+</motion.button>
        </div>
      </div>
    </motion.div>
  );

  if (variant === "dark") return (
    <motion.div whileHover={{ y: -10 }} className="hp-prod-card group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
      <div className="relative h-52 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{product.name}</h3>
        <Stars rating={product.rating?.stars || 0} />
        <div className="flex items-center justify-between mt-3">
          <p className="font-black text-white">{formatMoneyCents(product.priceCents)}</p>
          <motion.button whileTap={{ scale: 0.9 }} className="bg-white text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl">+ Cart</motion.button>
        </div>
      </div>
    </motion.div>
  );

  // default
  return (
    <motion.div whileHover={{ y: -12, boxShadow: "0 32px 64px rgba(79,70,229,0.15)" }} className="hp-prod-card group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600 px-2.5 py-1 rounded-full shadow-sm">New</div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-1">{product.name}</h3>
        <Stars rating={product.rating?.stars || 0} />
        <div className="flex items-center justify-between mt-4">
          <p className="font-black text-2xl text-gray-900">{formatMoneyCents(product.priceCents)}</p>
          <motion.button whileTap={{ scale: 0.93 }} onClick={(e) => onAddToCart?.(product, e)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-indigo-500/40 transition-all">+ Cart</motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ variant = "default", count = 1 }) {
  const items = Array(count).fill(0);
  if (variant === "tall") return items.map((_, i) => (
    <div key={i} className="rounded-3xl overflow-hidden bg-white shadow-lg animate-pulse">
      <div className="h-72 bg-gray-200" />
      <div className="p-5 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /><div className="h-6 bg-gray-200 rounded w-1/3 mt-2" /></div>
    </div>
  ));
  if (variant === "wide") return items.map((_, i) => (
    <div key={i} className="flex gap-4 bg-white rounded-2xl p-4 shadow-md animate-pulse">
      <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /><div className="h-5 bg-gray-200 rounded w-1/3 mt-3" /></div>
    </div>
  ));
  return items.map((_, i) => (
    <div key={i} className="rounded-3xl overflow-hidden bg-white shadow-md animate-pulse">
      <div className="h-56 bg-gray-200" />
      <div className="p-5 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /><div className="h-6 bg-gray-200 rounded w-1/3 mt-3" /></div>
    </div>
  ));
}

// ─── Section components (each owns its hooks) ─────────────────────────────────

function CategoriesSection() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".hp-cat-card"); if (!cards.length) return;
      gsap.fromTo(cards, { y: 65, scale: 0.93, opacity: 0 }, { y: 0, scale: 1, opacity: 1, stagger: 0.08, duration: 0.75, ease: "back.out(1.5)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <SectionLabel label="Collections" />
      <h2 className="text-3xl font-black text-gray-900 mb-12">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat) => (
          <motion.div key={cat.label} whileHover={{ scale: 1.06, y: -6 }} whileTap={{ scale: 0.97 }}
            className={`hp-cat-card bg-gradient-to-br ${cat.bg} rounded-2xl p-5 text-white text-center cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300`}>
            <div className="text-4xl mb-2">{cat.emoji}</div>
            <p className="font-bold text-sm">{cat.label}</p>
            <p className="text-white/70 text-[10px] mt-0.5">{cat.count}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function TrendingSection({ products, isLoading }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".hp-prod-card"); if (!cards.length) return;
      gsap.fromTo(cards, { y: 65, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 200);
    return () => clearTimeout(t);
  }, [products]);
  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div><SectionLabel label="Curated For You" /><h2 className="text-3xl font-black text-gray-900">Trending Right Now</h2></div>
          <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
          {isLoading ? <Skeleton count={6} /> : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

function FlashSaleSection({ products, isLoading }) {
  const ref = useRef(null);
  const [time, setTime] = useState({ h: 3, m: 47, s: 22 });
  const pad = (n) => String(n).padStart(2, "0");

  useEffect(() => {
    const id = setInterval(() => setTime((p) => {
      let { h, m, s } = p; s--;
      if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 3; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const left = el.querySelectorAll(".hp-fl"), right = el.querySelector(".hp-fr");
      if (left.length) gsap.fromTo(left, { x: -55, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
      if (right) gsap.fromTo(right, { x: 55, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 p-8 md:p-14 mb-10 shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <p className="hp-fl text-sm font-bold uppercase tracking-widest text-orange-100 mb-2">⚡ Limited Time Offer</p>
            <h2 className="hp-fl text-4xl md:text-5xl font-black leading-tight">Flash Sale<br />Up to <span className="text-yellow-300">70% OFF</span></h2>
            <p className="hp-fl mt-3 text-orange-100 max-w-xs">These deals vanish when the timer hits zero.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="hp-fl mt-6 bg-white text-red-600 font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition">Shop the Sale →</motion.button>
          </div>
          <div className="hp-fr flex gap-4">
            {[{ label: "Hours", val: time.h }, { label: "Mins", val: time.m }, { label: "Secs", val: time.s }].map((t) => (
              <div key={t.label} className="text-center">
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl w-20 h-20 flex items-center justify-center text-4xl font-black text-white shadow-xl">{pad(t.val)}</div>
                <p className="mt-2 text-xs text-orange-100 font-semibold uppercase tracking-widest">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {isLoading ? <Skeleton count={4} variant="tall" /> : products.map((p) => <ProductCard key={p.id} product={p} variant="tall" />)}
      </div>
    </section>
  );
}

function BestSellersSection({ products, isLoading }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const left = el.querySelector(".hp-bs-left"), right = el.querySelectorAll(".hp-bs-right");
      if (left) gsap.fromTo(left, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
      if (right.length) gsap.fromTo(right, { x: 50, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, [products]);

  const top = products[0];
  const rest = products.slice(1, 5);

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div><SectionLabel label="Fan Favourites" /><h2 className="text-3xl font-black text-gray-900">Best Sellers</h2></div>
          <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="hp-bs-left">
            {isLoading ? <Skeleton variant="tall" count={1} /> : top && (
              <motion.div whileHover={{ y: -8 }} className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="relative h-[420px] overflow-hidden">
                  <img src={top.image} alt={top.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-xs font-black px-3 py-1.5 rounded-full">#1 BEST SELLER</div>
                  <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                    <Stars rating={top.rating?.stars || 0} />
                    <h3 className="font-black text-2xl mt-2 mb-1 leading-tight">{top.name}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-black text-3xl">{formatMoneyCents(top.priceCents)}</span>
                      <motion.button whileTap={{ scale: 0.95 }} className="bg-white text-gray-900 font-bold px-6 py-3 rounded-2xl text-sm shadow-lg">Add to Cart</motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div className="space-y-4">
            {isLoading ? <Skeleton variant="wide" count={4} /> : rest.map((p) => <div key={p.id} className="hp-bs-right"><ProductCard product={p} variant="wide" /></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBanner() {
  const ref = useRef(null);
  const stats = [
    { value: "2M+", label: "Happy Customers", icon: "😊" },
    { value: "150K+", label: "Products Listed", icon: "📦" },
    { value: "4.9★", label: "Average Rating", icon: "⭐" },
    { value: "99%", label: "On-Time Delivery", icon: "🚀" },
  ];
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll(".hp-stat"); if (!items.length) return;
      gsap.fromTo(items, { scale: 0.5, y: 30, opacity: 0 }, { scale: 1, y: 0, opacity: 1, stagger: 0.12, duration: 0.75, ease: "back.out(2)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="relative overflow-hidden py-24 bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      <FloatingOrbs dark />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">By the Numbers</p>
        <h2 className="text-center text-3xl font-black text-white mb-14">Trusted Worldwide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label} className="hp-stat group">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <p className="text-4xl font-black bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">{s.value}</p>
              <p className="mt-2 text-sm text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewArrivalsSection({ products, isLoading }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".hp-prod-card"); if (!cards.length) return;
      gsap.fromTo(cards, { y: 55, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.09, duration: 0.8, ease: "back.out(1.3)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 200);
    return () => clearTimeout(t);
  }, [products]);
  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between mb-12">
        <div><SectionLabel label="Just Landed" /><h2 className="text-3xl font-black text-gray-900">New Arrivals</h2></div>
        <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {isLoading ? <Skeleton count={4} /> : products.map((p) => <ProductCard key={p.id} product={p} variant="minimal" />)}
      </div>
    </section>
  );
}

function SplitShowcase() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const left = el.querySelector(".hp-sl"), right = el.querySelector(".hp-sr"), badges = el.querySelectorAll(".hp-sb");
      if (left) gsap.fromTo(left, { x: -75, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      if (right) gsap.fromTo(right, { x: 75, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      if (badges.length) gsap.fromTo(badges, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.12, duration: 0.55, ease: "back.out(2)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 75%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-24 overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="hp-sl relative h-[480px]">
          <div className="absolute top-0 left-0 w-64 h-80 rounded-3xl overflow-hidden shadow-2xl rotate-[-4deg] hover:rotate-0 transition-transform duration-500"><div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-8xl">👗</div></div>
          <div className="absolute top-10 right-0 w-56 h-72 rounded-3xl overflow-hidden shadow-2xl rotate-[5deg] hover:rotate-0 transition-transform duration-500"><div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-8xl">👟</div></div>
          <div className="absolute bottom-0 left-16 w-52 h-64 rounded-3xl overflow-hidden shadow-2xl rotate-[2deg] hover:rotate-0 transition-transform duration-500"><div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-8xl">⌚</div></div>
          {[{ label: "New Season", color: "bg-rose-500", top: "8%", left: "55%" }, { label: "−40% OFF", color: "bg-indigo-600", top: "55%", left: "5%" }, { label: "Trending 🔥", color: "bg-amber-500", top: "82%", left: "58%" }].map((b) => (
            <div key={b.label} style={{ top: b.top, left: b.left }} className={`hp-sb absolute ${b.color} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 whitespace-nowrap`}>{b.label}</div>
          ))}
        </div>
        <div className="hp-sr space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">New Collection</p>
          <h2 className="text-5xl font-black text-gray-900 leading-tight">Style That<span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Speaks for You</span></h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md">From statement pieces to everyday essentials — our new season drop has something for every wardrobe and every mood.</p>
          <ul className="space-y-3">
            {["500+ new arrivals this week", "Exclusive member-only discounts", "Sustainable & ethically sourced"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-gray-700 font-medium"><span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</span>{item}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4 pt-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-500/30">Explore Collection</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="border-2 border-gray-200 text-gray-700 px-8 py-3.5 rounded-2xl font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-colors">See Lookbook</motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

function EditorsPicks({ products, isLoading }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".hp-prod-card"); if (!cards.length) return;
      gsap.fromTo(cards, { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "back.out(1.4)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, [products]);
  return (
    <section ref={ref} className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e40af 100%)" }}>
      <FloatingOrbs dark />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Hand-Picked</p>
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-3xl font-black text-white">Editor's Picks</h2>
          <motion.button whileHover={{ x: 4 }} className="text-indigo-300 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-72 bg-white/10 rounded-3xl animate-pulse" />) : products.map((p) => <ProductCard key={p.id} product={p} variant="dark" />)}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const line = el.querySelector(".hp-hiw-line"), cards = el.querySelectorAll(".hp-hiw-step");
      if (line) gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      if (cards.length) gsap.fromTo(cards, { y: 55, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: "back.out(1.6)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Simple Process</p>
        <h2 className="text-4xl font-black text-center text-gray-900 mb-20">How It Works</h2>
        <div className="relative">
          <div className="hp-hiw-line hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full z-0 origin-left" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="hp-hiw-step flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-indigo-500 text-indigo-600 text-xs font-black flex items-center justify-center shadow">{step.num}</span>
                </div>
                <h3 className="font-black text-lg text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[160px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PerksSection() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll(".hp-perk"); if (!items.length) return;
      gsap.fromTo(items, { y: 50, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, stagger: 0.13, duration: 0.8, ease: "back.out(1.5)", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-24 bg-gray-950 relative overflow-hidden">
      <FloatingOrbs dark />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Why Choose Us</p>
        <h2 className="text-4xl font-black text-center text-white mb-14">The ShopEase Difference</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map((perk, i) => (
            <motion.div key={i} whileHover={{ y: -8, scale: 1.02 }}
              className="hp-perk bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div className="text-5xl mb-5">{perk.icon}</div>
              <h3 className="font-bold text-xl mb-3">{perk.title}</h3>
              <p className="text-indigo-200/70 text-sm leading-relaxed">{perk.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0); const dragDelta = useRef(0);
  const sectionRef = useRef(null);
  const total = TESTIMONIALS.length;
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  useEffect(() => { const id = setInterval(next, 5500); return () => clearInterval(id); }, [next]);
  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const t = setTimeout(() => {
      const heads = el.querySelectorAll(".hp-th"); if (!heads.length) return;
      gsap.fromTo(heads, { y: 35, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  const onDS = (e) => { setDragging(true); dragStartX.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX; dragDelta.current = 0; };
  const onDM = (e) => { if (!dragging) return; dragDelta.current = (e.type === "touchmove" ? e.touches[0].clientX : e.clientX) - dragStartX.current; };
  const onDE = () => { if (!dragging) return; setDragging(false); if (dragDelta.current < -50) next(); else if (dragDelta.current > 50) prev(); };
  return (
    <section ref={sectionRef} className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#fafafa 50%,#f5f0ff 100%)" }}>
      <FloatingOrbs />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <p className="hp-th text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Client Stories</p>
        <h2 className="hp-th text-4xl font-black text-center mb-16 text-gray-900">What Our Members Say</h2>
        <div className="relative cursor-grab active:cursor-grabbing select-none" onMouseDown={onDS} onMouseMove={onDM} onMouseUp={onDE} onMouseLeave={onDE} onTouchStart={onDS} onTouchMove={onDM} onTouchEnd={onDE}>
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 80, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -80, scale: 0.96 }} transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="bg-white rounded-3xl shadow-2xl p-10 md:p-14 text-center mx-auto max-w-2xl">
              <div className="flex justify-center gap-1 mb-6">{Array(TESTIMONIALS[current].stars).fill(0).map((_, i) => <span key={i} className="text-yellow-400 text-2xl">★</span>)}</div>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed italic font-light">"{TESTIMONIALS[current].text}"</p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">{TESTIMONIALS[current].author[0]}</div>
                <div className="text-left"><p className="font-bold text-gray-900">{TESTIMONIALS[current].author}</p><p className="text-xs text-gray-400">{TESTIMONIALS[current].role}</p></div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-6 mt-10">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prev} className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-indigo-600 font-bold text-xl hover:bg-indigo-50 transition">←</motion.button>
          <div className="flex gap-2">{TESTIMONIALS.map((_, i) => <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-indigo-600" : "w-2 bg-gray-300"}`} />)}</div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={next} className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-indigo-600 font-bold text-xl hover:bg-indigo-50 transition">→</motion.button>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll(".hp-nl"); if (!items.length) return;
      gsap.fromTo(items, { y: 45, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="hp-nl text-5xl mb-5">✉️</div>
        <p className="hp-nl text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Stay in the Loop</p>
        <h2 className="hp-nl text-4xl font-black text-gray-900 mb-4">Get Deals Before<br />Anyone Else</h2>
        <p className="hp-nl text-gray-500 mb-10 leading-relaxed">Drop your email. Early access to sales, new arrivals, and member-only offers. No spam — ever.</p>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="hp-nl flex flex-col sm:flex-row gap-3 justify-center">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                className="flex-1 max-w-xs border-2 border-gray-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => email && setSubmitted(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/30 whitespace-nowrap">
                Subscribe Free →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
              <p className="font-bold text-gray-900 text-lg">You're in!</p>
              <p className="text-gray-500 text-sm">Check your inbox for a welcome gift 🎁</p>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="hp-nl text-xs text-gray-400 mt-5">Trusted by 2M+ shoppers. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

function CTABanner() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll(".hp-cta"); if (!items.length) return;
      gsap.fromTo(items, { y: 45, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="relative py-32 overflow-hidden mx-4 mb-4 rounded-3xl" style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 50%,#8b5cf6 100%)" }}>
      <ParticleField />
      <div className="absolute w-96 h-96 rounded-full bg-white/5 blur-3xl -top-20 -right-20" />
      <div className="absolute w-80 h-80 rounded-full bg-purple-400/20 blur-3xl -bottom-20 -left-20" />
      <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-6">
        <p className="hp-cta text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">Join the Community</p>
        <h2 className="hp-cta text-5xl font-black mb-6 leading-tight">Ready to Start<br />Shopping?</h2>
        <p className="hp-cta text-blue-100 text-lg mb-10">Join over 2 million happy customers and discover your next favourite thing.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }} className="hp-cta bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl text-lg shadow-2xl">Get Started Free</motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="hp-cta border-2 border-white/40 text-white font-semibold px-10 py-4 rounded-2xl text-lg hover:bg-white/10 transition backdrop-blur-sm">Browse All Products</motion.button>
        </div>
      </div>
    </section>
  );
}


// ─── Back to Top ──────────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min(scrollTop / docH, 1) : 0);
      setVisible(scrollTop > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => gsap.to(window, { duration: 1, scrollTo: { y: 0 }, ease: 'power2.inOut' });
  const r = 24, circ = 2 * Math.PI * r;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 30 }}
          transition={{ duration: 0.3, ease: 'backOut' }}
          onClick={scrollToTop}
          className="hp-back-top"
          aria-label="Back to top"
        >
          <svg className="absolute w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none" />
            <circle
              cx="28" cy="28" r={r}
              stroke="white" strokeWidth="3" fill="none"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - progress)}
              strokeLinecap="round"
            />
          </svg>
          <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── Deal of the Day ──────────────────────────────────────────────────────────
function DealOfTheDay({ product, isLoading }) {
  const ref = useRef(null);
  const [time, setTime] = useState({ h: 11, m: 34, s: 7 });
  const pad = (n) => String(n).padStart(2, '0');

  useEffect(() => {
    const id = setInterval(() => setTime((p) => {
      let { h, m, s } = p; s--;
      if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 11; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll('.hp-dotd');
      if (!items.length) return;
      gsap.fromTo(items, { y: 45, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: 'power3.out', clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, [product]);

  if (isLoading) return (
    <section className="py-20 max-w-7xl mx-auto px-6">
      <div className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
    </section>
  );
  if (!product) return null;

  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-8 md:p-14 shadow-2xl">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <FloatingOrbs dark />
        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          {/* Left — info */}
          <div className="text-white">
            <div className="hp-dotd flex items-center gap-3 mb-6">
              <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">🔥 Deal of the Day</span>
              <span className="text-gray-400 text-xs">Ends in:</span>
              <div className="flex gap-1.5">
                {[{ v: time.h, l: 'h' }, { v: time.m, l: 'm' }, { v: time.s, l: 's' }].map((t) => (
                  <span key={t.l} className="bg-white/10 text-white font-black text-sm px-2 py-1 rounded-lg min-w-[32px] text-center">{pad(t.v)}<span className="text-[9px] text-gray-400 ml-0.5">{t.l}</span></span>
                ))}
              </div>
            </div>
            <h2 className="hp-dotd text-4xl md:text-5xl font-black leading-tight mb-4">{product.name}</h2>
            <div className="hp-dotd flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-black text-white">{formatMoneyCents(product.priceCents)}</span>
              <span className="text-gray-500 line-through text-xl">{formatMoneyCents(Math.round(product.priceCents * 1.4))}</span>
              <span className="bg-green-500 text-white text-xs font-black px-2.5 py-1 rounded-full">−30% OFF</span>
            </div>
            <Stars rating={product.rating?.stars || 0} />
            {/* Progress bar */}
            <div className="hp-dotd mt-8">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>🔥 Selling fast</span>
                <span>74 sold · 26 left</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full hp-progress-bar" style={{ width: '74%' }} />
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="hp-dotd mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black px-10 py-4 rounded-2xl text-lg shadow-xl shadow-indigo-500/30">
              Grab This Deal →
            </motion.button>
          </div>
          {/* Right — product image */}
          <motion.div className="hp-dotd relative" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="relative w-full max-w-xs mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            {/* Pulse rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square rounded-3xl border border-indigo-500/30 hp-pulse-ring" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square rounded-3xl border border-blue-400/20 hp-pulse-ring" style={{ animationDelay: '0.8s' }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Auto-scroll product strip (infinite loop) ────────────────────────────────
function ProductScrollStrip({ products, isLoading, title, label }) {
  const trackRef = useRef(null);
  const wrapperRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const dragStartX = useRef(0);
  const animRef = useRef(null);
  const speed = useRef(0.6); // px per frame

  // Auto-scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf;
    const step = () => {
      if (!isDragging.current) {
        currentX.current -= speed.current;
        const half = track.scrollWidth / 2;
        if (Math.abs(currentX.current) >= half) currentX.current = 0;
        gsap.set(track, { x: currentX.current });
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [products]);

  // Drag
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const clamp = (v) => Math.min(0, v);
    const onDown = (e) => {
      isDragging.current = true;
      dragStartX.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      startX.current = currentX.current;
      track.style.cursor = 'grabbing';
    };
    const onMove = (e) => {
      if (!isDragging.current) return;
      const cx = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      currentX.current = clamp(startX.current + (cx - dragStartX.current));
      gsap.set(track, { x: currentX.current });
    };
    const onUp = () => { isDragging.current = false; track.style.cursor = 'grab'; };
    track.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    track.addEventListener('touchstart', onDown, { passive: true });
    track.addEventListener('touchmove', onMove, { passive: true });
    track.addEventListener('touchend', onUp);
    track.addEventListener('dragstart', (e) => e.preventDefault());
    return () => {
      track.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      track.removeEventListener('touchstart', onDown);
      track.removeEventListener('touchmove', onMove);
      track.removeEventListener('touchend', onUp);
    };
  }, []);

  const doubled = [...(products || []), ...(products || [])];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex items-end justify-between">
          <div>
            {label && <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">{label}</p>}
            <h2 className="text-3xl font-black text-gray-900">{title}</h2>
            <p className="text-sm text-gray-400 mt-1">← Drag or scroll to explore →</p>
          </div>
          <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
        </div>
      </div>
      <div ref={wrapperRef} className="overflow-hidden">
        <div ref={trackRef} className="flex gap-5 px-6 will-change-transform" style={{ width: 'max-content', cursor: 'grab' }}>
          {isLoading
            ? Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-52 h-72 bg-gray-100 rounded-3xl animate-pulse" />
            ))
            : doubled.map((p, i) => (
              <div key={i} className="flex-shrink-0 w-52">
                <ProductCard product={p} variant="minimal" />
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
}

// ─── Bento Product Grid ───────────────────────────────────────────────────────
function BentoProductGrid({ products, isLoading }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll('.hp-bento-cell');
      if (!cards.length) return;
      gsap.fromTo(cards, { scale: 0.88, opacity: 0 },
        {
          scale: 1, opacity: 1, stagger: { amount: 0.7, from: 'start' }, duration: 0.8,
          ease: 'power3.out', clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, [products]);

  if (isLoading) return (
    <section className="py-20 max-w-7xl mx-auto px-6">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[480px]">
        {Array(5).fill(0).map((_, i) => <div key={i} className="bg-gray-100 rounded-3xl animate-pulse" />)}
      </div>
    </section>
  );

  const [p0, p1, p2, p3, p4] = products;

  const BentoCard = ({ product, className = '' }) => {
    if (!product) return <div className={`${className} bg-gray-100 rounded-3xl`} />;
    return (
      <motion.div whileHover={{ scale: 1.02 }}
        className={`hp-bento-cell relative group overflow-hidden rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 ${className}`}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600 px-2 py-1 rounded-full">New</div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <p className="font-bold text-sm line-clamp-1 mb-1">{product.name}</p>
          <div className="flex items-center justify-between">
            <p className="font-black text-lg">{formatMoneyCents(product.priceCents)}</p>
            <motion.button whileTap={{ scale: 0.9 }} className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">+ Cart</motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Discover</p>
          <h2 className="text-3xl font-black text-gray-900">Top Picks for You</h2>
        </div>
        <motion.button whileHover={{ x: 4 }} className="text-indigo-600 font-bold text-sm hidden md:flex items-center gap-1">View All <span>→</span></motion.button>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4" style={{ gridTemplateRows: '240px 240px' }}>
        <BentoCard product={p0} className="col-span-2 row-span-2" />
        <BentoCard product={p1} className="col-span-1" />
        <BentoCard product={p2} className="col-span-1" />
        <BentoCard product={p3} className="col-span-1" />
        <BentoCard product={p4} className="col-span-1" />
      </div>
    </section>
  );
}

// ─── Recently Viewed (tag-filtered grid) ──────────────────────────────────────
function FilterableGrid({ products, isLoading }) {
  const ref = useRef(null);
  const [active, setActive] = useState('All');
  const tabs = ['All', 'Under $20', 'Top Rated', 'On Sale'];

  const filtered = useMemo(() => {
    if (!products.length) return [];
    if (active === 'Under $20') return products.filter((p) => p.priceCents < 2000);
    if (active === 'Top Rated') return products.filter((p) => (p.rating?.stars || 0) >= 4.5);
    if (active === 'On Sale') return products.slice(0, 4);
    return products.slice(0, 8);
  }, [products, active]);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const cards = el.querySelectorAll('.hp-fg-card');
    if (!cards.length) return;
    gsap.fromTo(cards, { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.6, ease: 'power2.out', clearProps: 'all' });
  }, [filtered]);

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Shop Smart</p>
            <h2 className="text-3xl font-black text-gray-900">Browse & Filter</h2>
          </div>
          {/* Tab filter */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <motion.button key={tab} whileTap={{ scale: 0.95 }} onClick={() => setActive(tab)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${active === tab
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}>
                {tab}
              </motion.button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xs gap-5">
            {isLoading
              ? Array(8).fill(0).map((_, i) => <Skeleton key={i} />)
              : filtered.length
                ? filtered.map((p) => <div key={p.id} className="hp-fg-card"><ProductCard product={p} /></div>)
                : <div className="col-span-4 text-center py-20 text-gray-400">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="font-semibold">No products match this filter</p>
                </div>
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Lookbook / Style Guide Section ──────────────────────────────────────────
function LookbookSection({ products, isLoading }) {
  const ref = useRef(null);
  const looks = [
    { title: 'Street Style', palette: ['from-gray-800 to-black'], tag: 'Urban', icon: '🧢' },
    { title: 'Resort Luxe', palette: ['from-sky-400 to-cyan-600'], tag: 'Vacation', icon: '🏖️' },
    { title: 'Power Dressing', palette: ['from-slate-700 to-slate-900'], tag: 'Office', icon: '💼' },
    { title: 'Weekend Casual', palette: ['from-amber-400 to-orange-500'], tag: 'Relax', icon: '☕' },
  ];

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll('.hp-look-card');
      if (!cards.length) return;
      gsap.fromTo(cards, { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.12, duration: 0.85, ease: 'back.out(1.4)', clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Style Inspiration</p>
          <h2 className="text-4xl font-black text-gray-900 mb-4">Shop the Look</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">Curated outfits and vibes for every occasion. Tap a look to explore the full collection.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {looks.map((look, i) => {
            const prod = products?.[i];
            return (
              <motion.div key={look.title} whileHover={{ y: -10 }}
                className="hp-look-card group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer" style={{ height: 360 }}>
                {prod && !isLoading ? (
                  <img src={prod.image} alt={look.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${look.palette[0]} flex items-center justify-center`}>
                    <span className="text-6xl">{look.icon}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30">{look.tag}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="font-black text-lg mb-3">{look.title}</h3>
                  <motion.button whileTap={{ scale: 0.95 }}
                    className="w-full bg-white text-gray-900 font-bold py-2.5 rounded-xl text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop This Look →
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Trust & Guarantee Strip ──────────────────────────────────────────────────
function TrustStrip() {
  const ref = useRef(null);
  const items = [
    { icon: '🛡️', title: 'Authentic Guarantee', desc: '100% genuine products or full refund' },
    { icon: '⚡', title: 'Same-Day Dispatch', desc: 'Order before 2pm for same-day shipping' },
    { icon: '🔄', title: '30-Day Free Returns', desc: 'No questions, hassle-free returns' },
    { icon: '🏆', title: 'Award-Winning Service', desc: 'Rated #1 customer support 3 years running' },
    { icon: '🌍', title: 'Ships Worldwide', desc: 'Delivery to 180+ countries' },
  ];
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll('.hp-trust-item');
      if (!cards.length) return;
      gsap.fromTo(cards, { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: 'power2.out', clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-14 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map((item) => (
            <div key={item.title} className="hp-trust-item flex flex-col items-center text-center group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{item.icon}</div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Recently Trending Tags ───────────────────────────────────────────────────
function TrendingTags() {
  const tags = [
    '#SummerDrop', '#LuxuryBags', '#StreetStyle', '#WatchOfTheYear',
    '#NewArrival', '#SaleFinds', '#TopRated', '#MemberExclusive',
    '#SustainableFashion', '#DesignerPicks', '#WeekendVibes', '#PowerDressing',
  ];
  return (
    <section className="py-10 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Trending Now</p>
      </div>
      <div className="flex whitespace-nowrap hp-scroll-x gap-4 px-6">
        {[...tags, ...tags].map((tag, i) => (
          <motion.button key={i} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm whitespace-nowrap">
            {tag}
          </motion.button>
        ))}
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const url = "/api/products";
  const { fetchedData, isLoading, error } = useFetchData(url);
  useShowErrorBoundary(error);

  const products = useMemo(() => fetchedData || [], [fetchedData]);

  // Product slices
  const heroFeatured = products[0] || null;
  const trending = products.slice(0, 6);
  const bestSellers = products.slice(2, 8);
  const newArrivals = products.slice(4, 8);
  const flashDeals = products.slice(1, 5);
  const editorsPicks = products.slice(3, 7);
  const dealOfDay = products[5] || products[0] || null;
  const scrollStrip = products.slice(0, 8);
  const bentoProducts = products.slice(0, 5);
  const filterGrid = products.slice(0, 12);
  const lookbook = products.slice(0, 4);

  // Hero animation refs
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroBtnRef = useRef(null);
  const heroImgRef = useRef(null);

  useEffect(() => {
    if (!heroTitleRef.current) return;
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(heroTitleRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", clearProps: "all" })
      .fromTo(heroSubRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "all" }, "-=0.65")
      .fromTo(heroBtnRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "back.out(2)", clearProps: "all" }, "-=0.45")
      .fromTo(heroImgRef.current, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: "power3.out", clearProps: "all" }, "-=1.0");
    return () => tl.kill();
  }, []);

  // Loading state
  if (isLoading && !products.length) {
    return (
      <div className="overflow-x-hidden">
        <style>{STYLES}</style>
        <MarqueeStrip />
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 min-h-[90vh] flex items-center justify-center animate-pulse">
          <div className="text-center space-y-6 px-6">
            <div className="h-20 bg-white/20 rounded-2xl w-96 mx-auto" />
            <div className="h-6  bg-white/10 rounded-xl w-64 mx-auto" />
            <div className="flex gap-4 justify-center mt-6">
              <div className="h-14 bg-white/20 rounded-2xl w-40" />
              <div className="h-14 bg-white/10 rounded-2xl w-40" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <style>{STYLES}</style>

      {/* Marquee */}
      <div className="pt-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800"  />
      <MarqueeStrip />
      

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 text-white min-h-[90vh] flex items-center">
        <ParticleField />
        <div className="absolute w-96 h-96 rounded-full bg-blue-400/25 blur-3xl -top-20 -left-20 hp-hero-glow" />
        <div className="absolute w-80 h-80 rounded-full bg-violet-500/25 blur-3xl bottom-0 -right-20 hp-hero-glow" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left */}
          <div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.35em] mb-6">New Season · New Drops 🔥</p>
            <h1 ref={heroTitleRef} className="text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-6">
              <span className="hp-shimmer">Discover</span><br />
              <span className="text-white">Products</span><br />
              <span className="hp-shimmer">You'll Love</span>
            </h1>
            <p ref={heroSubRef} className="text-blue-100 text-lg leading-relaxed mb-10 max-w-md">
              Premium quality. Curated luxury. Delivered to your door with white-glove care.
            </p>
            <div ref={heroBtnRef} className="flex flex-wrap gap-4">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }} whileTap={{ scale: 0.97 }}
                className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-base shadow-2xl">
                Shop Now →
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="border-2 border-white/40 text-white px-8 py-4 rounded-2xl font-semibold backdrop-blur-sm hover:bg-white/10 transition">
                View Collection
              </motion.button>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {["⭐ 4.9 Rating", "🚀 Free Shipping", "🔒 Secure Pay", "↩️ Easy Returns"].map((p) => (
                <span key={p} className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-blue-100 backdrop-blur-sm">{p}</span>
              ))}
            </div>
          </div>

          {/* Right — featured product */}
          <div ref={heroImgRef} className="relative flex justify-center md:justify-end md:-mt-20 lg:-mt-10">
            {heroFeatured ? (
              <div className="relative">
                <div className="relative w-72 md:w-80 h-96 rounded-3xl overflow-hidden shadow-2xl">
                  <img src={heroFeatured.image} alt={heroFeatured.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">Featured Drop</p>
                    <h3 className="font-black text-lg leading-tight mb-1 line-clamp-2">{heroFeatured.name}</h3>
                    <p className="text-2xl font-black">{formatMoneyCents(heroFeatured.priceCents)}</p>
                  </div>
                </div>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 font-black text-xs px-3 py-2 rounded-2xl shadow-xl">
                  NEW DROP ✦
                </motion.div>
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-4 -left-6 bg-white text-gray-900 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2">
                  <span className="text-yellow-400">★</span> {heroFeatured.rating?.stars || 4.9} · {heroFeatured.rating?.count || "2K"} reviews
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
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-0.5 h-8 bg-gradient-to-b from-white/50 to-transparent rounded-full" />
        </div>
      </section>

      {/* ── ALL SECTIONS ── */}
      <CategoriesSection />
      <TrendingSection products={trending} isLoading={isLoading} />
      <TrendingTags />
      <FlashSaleSection products={flashDeals} isLoading={isLoading} />
      <DealOfTheDay product={dealOfDay} isLoading={isLoading} />
      <BestSellersSection products={bestSellers} isLoading={isLoading} />
      <StatsBanner />
      <BentoProductGrid products={bentoProducts} isLoading={isLoading} />
      <TrustStrip />
      <NewArrivalsSection products={newArrivals} isLoading={isLoading} />
      <SplitShowcase />
      <ProductScrollStrip products={scrollStrip} isLoading={isLoading} title="You Might Also Like" label="Recommendations" />
      <EditorsPicks products={editorsPicks} isLoading={isLoading} />
      <LookbookSection products={lookbook} isLoading={isLoading} />
      <FilterableGrid products={filterGrid} isLoading={isLoading} />
      <HowItWorksSection />
      <PerksSection />

      {/* Brand marquee */}
      <section className="py-14 bg-white border-y border-gray-100 overflow-hidden">
        <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-8 font-medium">Trusted Brands</p>
        <div className="flex whitespace-nowrap hp-marquee-rev">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="text-gray-200 font-black text-2xl md:text-3xl tracking-tight px-10 hover:text-gray-400 transition-colors duration-300 cursor-default">{b}</span>
          ))}
        </div>
      </section>

      <TestimonialsCarousel />
      <NewsletterSection />
      <CTABanner />

      {/* Back to Top */}
      <BackToTop />
    </div>
  );
}