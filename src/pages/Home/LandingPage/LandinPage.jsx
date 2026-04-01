

      
  


















import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useNavigate, useLoaderData } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ─── Testimonials Data ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    id: 1,
    text: "Absolutely amazing service and quality products. I'll definitely shop again!",
    author: "Sarah M.",
    role: "Verified Buyer",
    stars: 5,
  },
  {
    id: 2,
    text: "Fastest delivery I've ever experienced. The packaging was premium and the product exceeded expectations.",
    author: "James K.",
    role: "Loyal Customer",
    stars: 5,
  },
  {
    id: 3,
    text: "Returns were so easy. No questions asked, full refund in 2 days. This is how e-commerce should work.",
    author: "Amaka O.",
    role: "Verified Buyer",
    stars: 5,
  },
  {
    id: 4,
    text: "The curated product selection is spot on. Every item I've ordered has been exactly as described.",
    author: "Liu Wei",
    role: "Top Reviewer",
    stars: 5,
  },
  {
    id: 5,
    text: "Customer support actually picked up the phone. Rare these days. Refreshing experience overall.",
    author: "Carlos R.",
    role: "Verified Buyer",
    stars: 5,
  },
];

// ─── Animated Background ──────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
      });

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

// ─── Floating Orb BG ─────────────────────────────────────────────────────────
function FloatingOrbs({ dark = false }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w: 600, h: 600, top: "-10%", left: "-10%", delay: 0, dur: 18 },
        { w: 400, h: 400, top: "40%", right: "-8%", delay: 3, dur: 22 },
        { w: 300, h: 300, bottom: "-5%", left: "30%", delay: 6, dur: 16 },
        { w: 200, h: 200, top: "20%", left: "50%", delay: 2, dur: 20 },
      ].map((orb, i) => (
        <div
          key={i}
          style={{
            width: orb.w,
            height: orb.h,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.dur}s`,
          }}
          className={`absolute rounded-full blur-3xl animate-floatOrb ${
            dark
              ? "bg-indigo-900/40"
              : "bg-gradient-to-br from-blue-400/20 to-indigo-500/20"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Marquee Strip ────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = [
    "Free Shipping Over $50",
    "New Arrivals Daily",
    "30-Day Returns",
    "Secure Checkout",
    "24/7 Support",
    "Members Save 15%",
  ];
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 py-3 z-40">
      <div className="flex gap-0 animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-white text-sm font-medium tracking-wide px-8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-200 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Category Spotlight ───────────────────────────────────────────────────────
function CategorySpotlight() {
  const categories = [
    { label: "Women", bg: "from-rose-400 to-pink-600", emoji: "👗" },
    { label: "Men", bg: "from-sky-400 to-blue-600", emoji: "👔" },
    { label: "Kids", bg: "from-yellow-400 to-orange-500", emoji: "🧸" },
    { label: "Beauty", bg: "from-purple-400 to-violet-600", emoji: "💄" },
    { label: "Home", bg: "from-emerald-400 to-teal-600", emoji: "🏠" },
    { label: "Tech", bg: "from-gray-600 to-gray-900", emoji: "💻" },
  ];
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cat-card", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 80,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "back.out(1.5)",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 max-w-7xl mx-auto px-6">
      <h3 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Shop by Category
      </h3>
      <p className="text-center text-gray-500 mb-12 text-sm tracking-wide uppercase">
        Curated collections, just for you
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <motion.div
            key={cat.label}
            whileHover={{ scale: 1.06, y: -6 }}
            whileTap={{ scale: 0.97 }}
            className={`cat-card bg-gradient-to-br ${cat.bg} rounded-2xl p-6 text-white text-center cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300`}
          >
            <div className="text-4xl mb-3">{cat.emoji}</div>
            <p className="font-semibold text-sm">{cat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Stats Banner ─────────────────────────────────────────────────────────────
function StatsBanner() {
  const stats = [
    { value: "2M+", label: "Happy Customers", icon: "😊" },
    { value: "150K+", label: "Products Listed", icon: "📦" },
    { value: "4.9★", label: "Average Rating", icon: "⭐" },
    { value: "99%", label: "On-Time Delivery", icon: "🚀" },
  ];
  const sectionRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sectionRef.current) return;
      const items = sectionRef.current.querySelectorAll(".stat-item");
      gsap.fromTo(items,
        { scale: 0.4, opacity: 0, y: 30 },
        {
          scale: 1, opacity: 1, y: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "back.out(2)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
          clearProps: "all",
        }
      );
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white"
    >
      <FloatingOrbs dark />
      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">By the Numbers</p>
        <h3 className="text-center text-3xl font-black text-white mb-14">Trusted Worldwide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label} className="stat-item group">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                {s.icon}
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-gray-400 uppercase tracking-widest">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Flash Sale Banner ────────────────────────────────────────────────────────
function FlashSale() {
  const sectionRef = useRef(null);
  const [time, setTime] = useState({ h: 4, m: 59, s: 42 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 4; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sectionRef.current) return;
      const leftItems = sectionRef.current.querySelectorAll(".flash-item");
      const rightEl = sectionRef.current.querySelector(".flash-right");
      gsap.fromTo(leftItems,
        { x: -60, opacity: 0 },
        {
          x: 0, opacity: 1,
          stagger: 0.12,
          duration: 0.85,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: { trigger: sectionRef.current, start: "top 82%", once: true },
        }
      );
      if (rightEl) {
        gsap.fromTo(rightEl,
          { x: 60, opacity: 0 },
          {
            x: 0, opacity: 1,
            duration: 1,
            ease: "power3.out",
            clearProps: "all",
            scrollTrigger: { trigger: sectionRef.current, start: "top 82%", once: true },
          }
        );
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      className="py-20 max-w-7xl mx-auto px-6"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        {/* BG texture */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 text-white">
          <p className="flash-item text-sm font-bold uppercase tracking-widest text-orange-100 mb-2">
            ⚡ Limited Time Offer
          </p>
          <h3 className="flash-item text-4xl md:text-5xl font-black leading-tight">
            Flash Sale
            <br />
            Up to <span className="text-yellow-300">70% OFF</span>
          </h3>
          <p className="flash-item mt-4 text-orange-100 max-w-xs">
            Don't miss out. These deals vanish when the timer hits zero.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flash-item mt-8 bg-white text-red-600 font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition"
          >
            Shop the Sale →
          </motion.button>
        </div>
        <div className="flash-right relative z-10 flex gap-4">
          {[
            { label: "Hours", val: time.h },
            { label: "Mins", val: time.m },
            { label: "Secs", val: time.s },
          ].map((t) => (
            <div key={t.label} className="text-center">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl w-20 h-20 flex items-center justify-center text-4xl font-black text-white shadow-xl">
                {pad(t.val)}
              </div>
              <p className="mt-2 text-xs text-orange-100 font-semibold uppercase tracking-widest">
                {t.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Carousel ────────────────────────────────────────────────────
function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragDelta = useRef(0);
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const total = TESTIMONIALS.length;

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  // Auto-advance
  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  // GSAP section reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".testimonial-heading", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Drag handlers
  const handleDragStart = (e) => {
    setDragging(true);
    dragStartX.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    dragDelta.current = 0;
  };
  const handleDragMove = (e) => {
    if (!dragging) return;
    const x = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    dragDelta.current = x - dragStartX.current;
  };
  const handleDragEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragDelta.current < -50) next();
    else if (dragDelta.current > 50) prev();
  };

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f5f0ff 100%)" }}
    >
      <FloatingOrbs />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <p className="testimonial-heading text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">
          Real Reviews
        </p>
        <h3 className="testimonial-heading text-4xl font-black text-center mb-16 text-gray-900">
          What Our Customers Say
        </h3>

        {/* Carousel Track */}
        <div
          ref={trackRef}
          className="relative cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -80, scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              className="bg-white rounded-3xl shadow-2xl p-10 md:p-14 text-center mx-auto max-w-2xl"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array(TESTIMONIALS[current].stars).fill(0).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-2xl">★</span>
                ))}
              </div>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed italic font-light">
                "{TESTIMONIALS[current].text}"
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {TESTIMONIALS[current].author[0]}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">{TESTIMONIALS[current].author}</p>
                  <p className="text-xs text-gray-400">{TESTIMONIALS[current].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows + Dots */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-indigo-600 font-bold text-xl hover:bg-indigo-50 transition"
          >
            ←
          </motion.button>

          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 bg-indigo-600"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={next}
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-indigo-600 font-bold text-xl hover:bg-indigo-50 transition"
          >
            →
          </motion.button>
        </div>
      </div>
    </section>
  );
}

// ─── Brand Logos Strip ────────────────────────────────────────────────────────
function BrandStrip() {
  const brands = ["ZARA", "H&M", "GUCCI", "PRADA", "VERSACE", "DIOR", "FENDI", "BALENCIAGA"];
  const doubled = [...brands, ...brands];

  return (
    <section className="py-14 bg-white border-y border-gray-100 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-8 font-medium">
        Trusted Brands
      </p>
      <div className="flex gap-0 animate-marqueeReverse whitespace-nowrap">
        {doubled.map((b, i) => (
          <span
            key={i}
            className="text-gray-200 font-black text-2xl md:text-3xl tracking-tight px-10 hover:text-gray-400 transition-colors duration-300 cursor-default"
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}


// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the connector line growing
      gsap.from(".hiw-line", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.2,
        ease: "power3.out",
      });
      // Stagger step cards
      gsap.from(".hiw-step", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        y: 60,
        opacity: 0,
        stagger: 0.18,
        duration: 0.8,
        ease: "back.out(1.7)",
        clearProps: "opacity,transform",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const steps = [
    { num: "01", icon: "🔍", title: "Browse", desc: "Explore thousands of curated products across every category." },
    { num: "02", icon: "🛒", title: "Add to Cart", desc: "Pick your favorites and add them with one tap." },
    { num: "03", icon: "💳", title: "Checkout", desc: "Secure, fast payment in under 60 seconds." },
    { num: "04", icon: "📦", title: "Delivered", desc: "Your order arrives fast, tracked every step of the way." },
  ];

  return (
    <section ref={sectionRef} className="py-28 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Simple Process</p>
        <h3 className="text-4xl font-black text-center text-gray-900 mb-20">How It Works</h3>

        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hiw-line hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="hiw-step flex flex-col items-center text-center group">
                {/* Circle */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-indigo-500 text-indigo-600 text-xs font-black flex items-center justify-center shadow">
                    {step.num}
                  </span>
                </div>
                <h4 className="font-black text-lg text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[160px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Split Showcase ───────────────────────────────────────────────────────────
function SplitShowcase() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".split-left", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        x: -80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
      gsap.from(".split-right", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        x: 80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
      gsap.from(".split-badge", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
        scale: 0,
        opacity: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: "back.out(2)",
        clearProps: "opacity,transform",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left — image collage */}
          <div className="split-left relative h-[500px]">
            <div className="absolute top-0 left-0 w-64 h-80 rounded-3xl overflow-hidden shadow-2xl rotate-[-4deg] hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-8xl">
                👗
              </div>
            </div>
            <div className="absolute top-10 right-0 w-56 h-72 rounded-3xl overflow-hidden shadow-2xl rotate-[5deg] hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-8xl">
                👟
              </div>
            </div>
            <div className="absolute bottom-0 left-16 w-52 h-64 rounded-3xl overflow-hidden shadow-2xl rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-8xl">
                ⌚
              </div>
            </div>
            {/* Floating badges */}
            {[
              { label: "New Season", color: "bg-rose-500", top: "8%", left: "55%" },
              { label: "−40% OFF", color: "bg-indigo-600", top: "55%", left: "5%" },
              { label: "Trending 🔥", color: "bg-amber-500", top: "82%", left: "58%" },
            ].map((b) => (
              <div
                key={b.label}
                style={{ top: b.top, left: b.left }}
                className={`split-badge absolute ${b.color} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 whitespace-nowrap`}
              >
                {b.label}
              </div>
            ))}
          </div>

          {/* Right — copy */}
          <div className="split-right space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">New Collection</p>
            <h3 className="text-5xl font-black text-gray-900 leading-tight">
              Style That
              <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Speaks for You
              </span>
            </h3>
            <p className="text-gray-500 text-lg leading-relaxed max-w-md">
              From statement pieces to everyday essentials — our new season drop has something for every wardrobe and every mood.
            </p>
            <ul className="space-y-3">
              {[
                "500+ new arrivals this week",
                "Exclusive member-only discounts",
                "Sustainable & ethically sourced",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 font-medium">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
              >
                Explore Collection
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="border-2 border-gray-200 text-gray-700 px-8 py-3.5 rounded-2xl font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                See Lookbook
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── App Download Banner ──────────────────────────────────────────────────────
function AppBanner() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".app-text", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        x: -60,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
      gsap.from(".app-phone", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        y: 80,
        opacity: 0,
        duration: 1.1,
        ease: "back.out(1.4)",
        clearProps: "opacity,transform",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)" }}>
      <FloatingOrbs dark />
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
        {/* Text */}
        <div className="flex-1 text-white space-y-5">
          <p className="app-text text-xs font-bold uppercase tracking-widest text-indigo-400">Get the App</p>
          <h3 className="app-text text-5xl font-black leading-tight">
            Shop Smarter
            <span className="block text-transparent bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text">
              On the Go
            </span>
          </h3>
          <p className="app-text text-gray-400 text-lg leading-relaxed max-w-sm">
            Exclusive app-only deals, instant notifications, and one-tap reorders. Your store, in your pocket.
          </p>
          <div className="app-text flex flex-wrap gap-4 pt-2">
            {[
              { label: "App Store", sub: "Download on the", icon: "🍎" },
              { label: "Google Play", sub: "Get it on", icon: "▶" },
            ].map((btn) => (
              <motion.button
                key={btn.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-2xl hover:bg-white/15 transition"
              >
                <span className="text-2xl">{btn.icon}</span>
                <div className="text-left">
                  <p className="text-xs text-gray-400">{btn.sub}</p>
                  <p className="font-bold text-sm">{btn.label}</p>
                </div>
              </motion.button>
            ))}
          </div>
          <div className="app-text flex items-center gap-6 pt-2">
            {[["4.9★", "App Rating"], ["2M+", "Downloads"], ["#1", "Shopping App"]].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Phone mockup */}
        <div className="app-phone flex-shrink-0 float-y">
          <div className="relative w-56 mx-auto">
            {/* Phone shell */}
            <div className="relative w-full pt-[200%] rounded-[2.5rem] bg-gradient-to-b from-gray-700 to-gray-900 border-4 border-gray-600 shadow-2xl overflow-hidden">
              <div className="absolute inset-2 rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 overflow-hidden flex flex-col items-center justify-center gap-4 p-4">
                <div className="w-16 h-1.5 rounded-full bg-white/20 mb-2" />
                <div className="text-5xl">🛍️</div>
                <p className="text-white font-black text-lg">ShopEase</p>
                <div className="w-full space-y-2">
                  {[80, 60, 90, 70].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/20" />
                      <div className="flex-1 space-y-1">
                        <div className="h-2 rounded-full bg-white/30" style={{ width: `${w}%` }} />
                        <div className="h-1.5 rounded-full bg-white/15" style={{ width: `${w - 20}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Glow */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-indigo-500/20 blur-2xl -z-10 scale-110" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".nl-content", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = () => {
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="nl-content text-5xl mb-5">✉️</div>
        <p className="nl-content text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Stay in the loop</p>
        <h3 className="nl-content text-4xl font-black text-gray-900 mb-4">
          Get Deals Before<br />Anyone Else
        </h3>
        <p className="nl-content text-gray-500 mb-10 leading-relaxed">
          Drop your email. We'll send you early access to sales, new arrivals, and exclusive member-only offers. No spam — ever.
        </p>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="nl-content flex flex-col sm:flex-row gap-3 justify-center"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 max-w-xs border-2 border-gray-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/30 whitespace-nowrap"
              >
                Subscribe Free →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
                ✅
              </div>
              <p className="font-bold text-gray-900 text-lg">You're in!</p>
              <p className="text-gray-500 text-sm">Check your inbox for a welcome gift 🎁</p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="nl-content text-xs text-gray-400 mt-5">
          Trusted by 2M+ shoppers. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}


// ─── Animated Wave Divider ────────────────────────────────────────────────────
function WaveDivider({ flip = false, color = "#fff" }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""}`} style={{ height: 60 }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill={color} />
      </svg>
    </div>
  );
}

// ─── Bento Grid Perks ─────────────────────────────────────────────────────────
function BentoPerks() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sectionRef.current) return;
      const cards = sectionRef.current.querySelectorAll(".bento-card");
      gsap.fromTo(cards,
        { opacity: 0, y: 50, scale: 0.93 },
        {
          opacity: 1, y: 0, scale: 1,
          stagger: { amount: 0.6, from: "start" },
          duration: 0.75,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        }
      );
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
      }} />
      <FloatingOrbs dark />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Everything You Need</p>
        <h3 className="text-4xl font-black text-center text-white mb-14">Built for Shoppers</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 auto-rows-[180px]">
          {/* Large card */}
          <div className="bento-card col-span-2 row-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group cursor-default">
            <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-6xl relative z-10">🌍</span>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-white mb-2">Ship Worldwide</h4>
              <p className="text-blue-200 text-sm leading-relaxed">Deliver to 180+ countries with real-time tracking on every order.</p>
            </div>
          </div>

          {/* Small cards */}
          {[
            { icon: "⚡", title: "Same-Day", desc: "Order by 2pm", bg: "from-amber-500 to-orange-600" },
            { icon: "🔐", title: "Safe Pay", desc: "256-bit encryption", bg: "from-emerald-500 to-teal-600" },
            { icon: "🎁", title: "Gift Wrap", desc: "Free on orders $50+", bg: "from-rose-500 to-pink-600" },
            { icon: "💬", title: "24/7 Chat", desc: "Real human support", bg: "from-violet-500 to-purple-600" },
          ].map((card) => (
            <div key={card.title} className={`bento-card bg-gradient-to-br ${card.bg} rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group cursor-default`}>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
              <span className="text-3xl">{card.icon}</span>
              <div>
                <h4 className="font-black text-white text-sm">{card.title}</h4>
                <p className="text-white/70 text-xs mt-0.5">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Scroll Parallax Banner ───────────────────────────────────────────────────
function ParallaxBanner() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current || !bgRef.current) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });
    tl.to(bgRef.current, { y: "25%", ease: "none" });

    // Text reveal
    const timer = setTimeout(() => {
      const texts = sectionRef.current.querySelectorAll(".para-text");
      gsap.fromTo(texts,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1,
          stagger: 0.15,
          duration: 1,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        }
      );
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[500px] overflow-hidden flex items-center justify-center">
      {/* Parallax BG */}
      <div
        ref={bgRef}
        className="absolute inset-0 -top-[20%] -bottom-[20%]"
        style={{
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        }}
      >
        {/* Stars */}
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.1,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <p className="para-text text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4">Members Only</p>
        <h3 className="para-text text-5xl md:text-6xl font-black text-white leading-tight mb-6">
          Unlock <span className="text-transparent bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text">Premium</span>
          <br />Access Today
        </h3>
        <p className="para-text text-gray-300 text-lg mb-10 max-w-xl mx-auto">
          Members save an average of $340/year with exclusive pricing, early access drops, and free priority shipping on everything.
        </p>
        <motion.button
          whileHover={{ scale: 1.06, boxShadow: "0 0 40px rgba(251,191,36,0.4)" }}
          whileTap={{ scale: 0.97 }}
          className="para-text bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black px-10 py-4 rounded-2xl text-lg shadow-2xl"
        >
          Join Premium — Free for 30 Days ✨
        </motion.button>
      </div>
    </section>
  );
}

// ─── Horizontal Scroll Strip ──────────────────────────────────────────────────
function HorizontalScroll() {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);

  const items = [
    { emoji: "👗", label: "Women's Fashion", count: "12K+ items", color: "from-rose-400 to-pink-600" },
    { emoji: "👔", label: "Men's Style", count: "8K+ items", color: "from-sky-400 to-blue-600" },
    { emoji: "👟", label: "Sneakers", count: "3K+ items", color: "from-lime-400 to-green-600" },
    { emoji: "💄", label: "Beauty", count: "5K+ items", color: "from-fuchsia-400 to-purple-600" },
    { emoji: "📱", label: "Tech", count: "2K+ items", color: "from-cyan-400 to-teal-600" },
    { emoji: "🏠", label: "Home & Living", count: "9K+ items", color: "from-amber-400 to-orange-500" },
    { emoji: "🎮", label: "Gaming", count: "1K+ items", color: "from-indigo-400 to-violet-600" },
    { emoji: "🧸", label: "Kids", count: "6K+ items", color: "from-yellow-400 to-orange-400" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!trackRef.current || !sectionRef.current) return;
      gsap.to(trackRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom top",
          scrub: 1.2,
        },
        x: "-30%",
        ease: "none",
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Explore</p>
        <h3 className="text-4xl font-black text-gray-900">Shop Every Category</h3>
      </div>
      <div ref={trackRef} className="flex gap-5 px-6 will-change-transform" style={{ width: "max-content" }}>
        {[...items, ...items.slice(0, 3)].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8, scale: 1.03 }}
            className={`flex-shrink-0 w-52 h-64 bg-gradient-to-br ${item.color} rounded-3xl p-6 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300`}
          >
            <span className="text-6xl">{item.emoji}</span>
            <div>
              <h4 className="font-black text-white text-lg leading-tight">{item.label}</h4>
              <p className="text-white/70 text-sm mt-1">{item.count}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Animated Comparison Table ────────────────────────────────────────────────
function ComparisonTable() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sectionRef.current) return;
      const rows = sectionRef.current.querySelectorAll(".comp-row");
      gsap.fromTo(rows,
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "all",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        }
      );
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const rows = [
    { feature: "Free Shipping", us: true, others: false },
    { feature: "30-Day Returns", us: true, others: true },
    { feature: "Same-Day Delivery", us: true, others: false },
    { feature: "24/7 Support", us: true, others: false },
    { feature: "Price Match Guarantee", us: true, others: false },
    { feature: "Member Rewards", us: true, others: true },
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">See the Difference</p>
        <h3 className="text-4xl font-black text-center text-gray-900 mb-14">ShopEase vs The Rest</h3>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header row */}
          <div className="grid grid-cols-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
            <p className="font-bold text-sm">Feature</p>
            <p className="font-black text-center">ShopEase ✨</p>
            <p className="font-medium text-center text-blue-200 text-sm">Others</p>
          </div>

          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`comp-row grid grid-cols-3 px-6 py-4 items-center border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-indigo-50/40 transition-colors duration-200`}
            >
              <p className="text-sm font-medium text-gray-700">{row.feature}</p>
              <div className="flex justify-center">
                <span className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">✓</span>
              </div>
              <div className="flex justify-center">
                {row.others
                  ? <span className="w-7 h-7 rounded-full bg-green-50 text-green-400 flex items-center justify-center text-sm">✓</span>
                  : <span className="w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center text-sm font-bold">✕</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const cartIconRef = useRef(null);
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroBtnRef = useRef(null);
  const productsRef = useRef(null);

  const products = useLoaderData();
  const trendingProducts = useMemo(() => products?.slice(0, 6) || [], [products]);
  // ── Hero GSAP entrance ──────────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.1 });
    tl.from(heroTitleRef.current, {
      y: 80,
      opacity: 0,
      duration: 1.1,
      ease: "expo.out",
    })
      .from(heroSubRef.current, { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .from(heroBtnRef.current, { y: 20, opacity: 0, duration: 0.7, ease: "back.out(2)" }, "-=0.4");
  }, []);

  // ── Products GSAP ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!trendingProducts.length) return;

    // Delay so DOM is fully painted before ScrollTrigger measures positions
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();

      gsap.from(".product-card", {
        scrollTrigger: {
          trigger: productsRef.current,
          start: "top 85%",
          once: true,
        },
        y: 80,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });

      gsap.from(".feature-card", {
        scrollTrigger: { trigger: "#features", start: "top 80%", once: true },
        scale: 0.8,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "back.out(1.5)",
        clearProps: "opacity,transform",
      });

      gsap.from(".cta-content", {
        scrollTrigger: { trigger: "#cta", start: "top 85%", once: true },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [trendingProducts]);

  // ── Scroll progress ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setScrollProgress(progress);
      setShowTopBtn(scrollTop > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Cart ────────────────────────────────────────────────────────────────────
  const addToCart = (product, e) => {
    if (!product) return;

    // Find the card and its image via DOM traversal
    const card = e.currentTarget.closest(".product-card");
    const img = card?.querySelector("img");

    if (img && cartIconRef.current) {
      const imgRect = img.getBoundingClientRect();
      const cartRect = cartIconRef.current.getBoundingClientRect();

      // Create flying clone
      const clone = document.createElement("div");
      clone.style.cssText = `
        position: fixed;
        top: ${imgRect.top}px;
        left: ${imgRect.left}px;
        width: ${imgRect.width}px;
        height: ${imgRect.height}px;
        background-image: url('${img.src}');
        background-size: cover;
        background-position: center;
        border-radius: 16px;
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 8px 32px rgba(79,70,229,0.3);
      `;
      document.body.appendChild(clone);

      gsap.to(clone, {
        top: cartRect.top + cartRect.height / 2 - 20,
        left: cartRect.left + cartRect.width / 2 - 20,
        width: 40,
        height: 40,
        borderRadius: "50%",
        opacity: 0,
        duration: 0.75,
        ease: "power3.in",
        onComplete: () => {
          clone.remove();
          // Bounce the cart button
          if (cartIconRef.current) {
            gsap.fromTo(
              cartIconRef.current,
              { scale: 1.4 },
              { scale: 1, duration: 0.4, ease: "elastic.out(1.2, 0.5)" }
            );
          }
        },
      });
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, amount) => {
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const totalPrice = cart.reduce((acc, item) => acc + item.priceCents * item.quantity, 0);

  const renderStars = (rating = 0) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <div className="flex items-center gap-0.5">
        {Array(full).fill().map((_, i) => <span key={`f-${i}`} className="text-yellow-400 text-sm">★</span>)}
        {half && <span className="text-yellow-400 text-sm">⯪</span>}
        {Array(empty).fill().map((_, i) => <span key={`e-${i}`} className="text-gray-200 text-sm">★</span>)}
        <span className="ml-1.5 text-xs text-gray-400">{rating}</span>
      </div>
    );
  };

  const scrollToSection = (id) => {
    gsap.to(window, { duration: 1, scrollTo: id, ease: "power2.inOut" });
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    gsap.to(window, { duration: 1, scrollTo: { y: 0 }, ease: "power2.inOut" });
  };

  const navLinks = [
    { label: "Products", href: "#products" },
    { label: "Features", href: "#features" },
    { label: "Reviews", href: "#testimonials" },
    { label: "Contact", href: "#cta" },
  ];

  return (
    <div ref={pageRef} className="bg-gray-50 text-gray-800 overflow-x-hidden pt-0 md:pt-0">

      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 30px) scale(0.97); }
        }
        .animate-floatOrb { animation: floatOrb linear infinite; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 24s linear infinite; }

        @keyframes marqueeReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marqueeReverse { animation: marqueeReverse 20s linear infinite; }

        @keyframes heroGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .hero-glow { animation: heroGlow 6s ease-in-out infinite; }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #a5b4fc 30%, #fff 60%, #818cf8 90%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
        }
        .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }

        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        .float-y { animation: floatY 4s ease-in-out infinite; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.4); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>


      {/* Header Section */}
      <header className="flex md:flex-col flex-col-reverse">        

        {/* HEADER — fixed on md+, fixed on mobile, sits below marquee on mobile */}
        <section className="fixed  top-[36px] md:top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl shadow-sm border-b border-gray-100/80">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ShopEase
            </h1>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="relative hover:text-indigo-600 transition-colors duration-200 group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-indigo-500 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <button
                ref={cartIconRef}
                onClick={() => setCartOpen(true)}
                className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-200"
              >
                🛒 Cart
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.span
                      key={cart.length}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold"
                    >
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Hamburger - Mobile */}
              <button
                className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-gray-100 transition"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="block w-5 h-0.5 bg-gray-700 rounded-full origin-center"
                />
                <motion.span
                  animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                  className="block w-5 h-0.5 bg-gray-700 rounded-full"
                />
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="block w-5 h-0.5 bg-gray-700 rounded-full origin-center"
                />
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
              >
                <nav className="flex flex-col px-6 pb-6 pt-2 gap-1">
                  {navLinks.map((link, i) => (
                    <motion.button
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.3 }}
                      onClick={() => scrollToSection(link.href)}
                      className="text-left px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                    >
                      {link.label}
                    </motion.button>
                  ))}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.07 }}
                    onClick={() => navigate("/products")}
                    className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm"
                  >
                    Shop Now →
                  </motion.button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* MARQUEE TOP BAR —  on top on mobile, below on large screens */}
        <section className=" fixed md:sticky  top-0 left-0 right-0 z-40 md:mt-[80px]">
          <MarqueeStrip />
        </section>
      
      </header>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white py-32 text-center min-h-[85vh] flex flex-col items-center justify-center"
      >
        {/* Particle BG */}
        <ParticleField />

        {/* Glow blobs */}
        <div className="absolute w-96 h-96 rounded-full bg-blue-400/30 blur-3xl top-0 -left-20 hero-glow" />
        <div className="absolute w-80 h-80 rounded-full bg-violet-500/30 blur-3xl bottom-0 -right-20 hero-glow" style={{ animationDelay: "3s" }} />
        <div className="absolute w-60 h-60 rounded-full bg-indigo-300/20 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hero-glow" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <p className="text-blue-200 text-sm font-semibold tracking-[0.3em] uppercase mb-6">
            New Season. New Drops. 🔥
          </p>
          <h2
            ref={heroTitleRef}
            className="text-6xl md:text-7xl font-black leading-none mb-6"
          >
            <span className="shimmer-text">Discover</span>
            <br />
            <span className="text-white">Products You'll</span>
            <br />
            <span className="shimmer-text">Love</span>
          </h2>
          <p
            ref={heroSubRef}
            className="text-lg text-blue-100 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Premium quality. Curated styles. Delivered to your door faster than you can say "add to cart."
          </p>
          <div ref={heroBtnRef} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/products")}
              className="bg-white text-indigo-700 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl"
            >
              Shop Now →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToSection("#products")}
              className="border-2 border-white/40 text-white px-10 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm hover:bg-white/10 transition"
            >
              Trending ↓
            </motion.button>
          </div>

          {/* Social proof pills */}
          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            {["⭐ 4.9 Rating", "🚀 Free Shipping", "🔒 Secure Pay", "↩️ Easy Returns"].map((pill) => (
              <span key={pill} className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-blue-100 backdrop-blur-sm">
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-0.5 h-8 bg-gradient-to-b from-white/50 to-transparent rounded-full"
          />
        </div>
      </section>

      {/* CATEGORY SPOTLIGHT */}
      <CategorySpotlight />

      {/* PRODUCTS */}
      <section
        id="products"
        ref={productsRef}
        className="py-20 max-w-7xl mx-auto px-6"
      >
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">
          Curated For You
        </p>
        <h3 className="text-4xl font-black text-center mb-16 text-gray-900">
          Trending Right Now
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          {trendingProducts.map((item) => (
            <motion.div
              whileHover={{ y: -12, boxShadow: "0 32px 64px rgba(79, 70, 229, 0.15)" }}
              key={item.id}
              className="product-card group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600 px-2.5 py-1 rounded-full shadow-sm">
                  New
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-gray-900 mb-2">{item.name}</h4>
                {renderStars(item.rating?.stars || 0)}
                <div className="flex items-center justify-between mt-4">
                  <p className="font-black text-2xl text-gray-900">
                    {formatMoneyCents(item.priceCents)}
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={(e) => addToCart(item, e)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-indigo-500/40 hover:shadow-lg transition-all duration-200"
                  >
                    + Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-14">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/products")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow duration-300"
          >
            View All Products →
          </motion.button>
        </div>
      </section>

      {/* FLASH SALE */}
      <FlashSale />

      {/* FEATURES */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)" }}
        />
        <FloatingOrbs dark />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">
            Why We're Different
          </p>
          <h3 className="text-4xl font-black text-white mb-16">
            Why Shop With Us?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🚀", title: "Fast Delivery", desc: "Same-day shipping on thousands of items. Get your orders quickly and safely." },
              { icon: "🔒", title: "Secure Payments", desc: "Bank-grade encryption on every transaction. Your data stays yours." },
              { icon: "↩️", title: "Easy Returns", desc: "Hassle-free returns within 30 days. No questions, no drama." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8, scale: 1.02 }}
                className="feature-card bg-white/10 backdrop-blur-sm border border-white/20 p-10 rounded-3xl text-white hover:bg-white/15 transition-all duration-300"
              >
                <div className="text-5xl mb-5">{feature.icon}</div>
                <h4 className="font-bold text-xl mb-3">{feature.title}</h4>
                <p className="text-indigo-200 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <StatsBanner />

      {/* BRAND STRIP */}
      <BrandStrip />

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* SPLIT SHOWCASE */}
      <SplitShowcase />

      {/* TESTIMONIALS CAROUSEL */}
      <TestimonialsCarousel />

      {/* APP BANNER */}
      <AppBanner />

      {/* NEWSLETTER */}
      <Newsletter />

      {/* BENTO PERKS */}
      <BentoPerks />

      {/* PARALLAX BANNER */}
      <ParallaxBanner />

      {/* HORIZONTAL SCROLL */}
      <HorizontalScroll />

      {/* COMPARISON TABLE */}
      <ComparisonTable />

      {/* CTA */}
      <section
        id="cta"
        className="relative py-32 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)" }}
      >
        <ParticleField />
        <div className="absolute w-96 h-96 rounded-full bg-white/5 blur-3xl -top-20 -right-20" />
        <div className="absolute w-80 h-80 rounded-full bg-purple-400/20 blur-3xl -bottom-20 -left-20" />
        <div className="cta-content relative z-10 text-center text-white max-w-2xl mx-auto px-6">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">
            Join the Community
          </p>
          <h3 className="text-5xl font-black mb-6 leading-tight">
            Ready to Start
            <br />
            Shopping?
          </h3>
          <p className="text-blue-100 text-lg mb-10">
            Join over 2 million happy customers and discover your next favorite thing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl text-lg shadow-2xl"
            >
              Get Started Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="border-2 border-white/40 text-white font-semibold px-10 py-4 rounded-2xl text-lg hover:bg-white/10 transition backdrop-blur-sm"
            >
              Learn More
            </motion.button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <h2 className="text-2xl font-black text-white mb-2">ShopEase</h2>
        <p className="text-sm">© 2025 ShopEase. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-6 text-sm">
          {["Privacy", "Terms", "Support", "Careers"].map((l) => (
            <button key={l} className="hover:text-white transition">{l}</button>
          ))}
        </div>
      </footer>

      {/* CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-black">Your Cart</h3>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {cart.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4">🛒</div>
                    <p className="text-gray-400 font-medium">Your cart is empty</p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="mt-4 text-indigo-600 text-sm font-semibold"
                    >
                      Continue Shopping →
                    </button>
                  </div>
                )}
                {cart.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 60 }}
                    className="flex gap-4 p-4 bg-gray-50 rounded-2xl"
                  >
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatMoneyCents(item.priceCents)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 text-sm font-bold flex items-center justify-center hover:bg-gray-100"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 text-sm font-bold flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-400 transition text-lg self-start"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-medium">Total</span>
                    <span className="text-2xl font-black text-gray-900">{formatMoneyCents(totalPrice)}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/30"
                  >
                    Checkout →
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BACK TO TOP */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 40 }}
            transition={{ duration: 0.3, ease: "backOut" }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 transition-transform duration-200"
          >
            <svg className="absolute w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="transparent" />
              <circle
                cx="32" cy="32" r="28"
                stroke="white" strokeWidth="3" fill="transparent"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - scrollProgress)}
                strokeLinecap="round"
              />
            </svg>
            <span className="relative text-white font-bold text-lg">↑</span>
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}