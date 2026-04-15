import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";


// ─── Seller Hero — full-bleed "Sell on ShopEase" pitch ───────────────────────
function SellerHero() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => {
      const badge    = el.querySelectorAll(".se-sh-badge");
      const heading  = el.querySelectorAll(".se-sh-head");
      const body     = el.querySelectorAll(".se-sh-body");
      const cards    = el.querySelectorAll(".se-sh-card");

      if (badge.length)
        gsap.fromTo(badge,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "back.out(2)", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 82%", once: true } });

      if (heading.length)
        gsap.fromTo(heading,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: "expo.out", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 80%", once: true } });

      if (body.length)
        gsap.fromTo(body,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.75, ease: "power3.out", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 78%", once: true } });

      if (cards.length)
        gsap.fromTo(cards,
          { y: 60, opacity: 0, scale: 0.93 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.8, ease: "back.out(1.4)", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 75%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const quickStats = [
    { value: "2M+", label: "Active Buyers", icon: "👥" },
    { value: "$0", label: "Setup Fee", icon: "🎁" },
    { value: "48h", label: "Go Live Time", icon: "⚡" },
    { value: "95%", label: "Seller Satisfaction", icon: "⭐" },
  ];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-32"
      style={{ background: "linear-gradient(160deg,#0f0c29 0%,#1a1040 35%,#0d1f4e 70%,#0a0a1a 100%)" }}
    >
      {/* Particle-like dot grid */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { w: 500, h: 500, top: "-15%", left: "-10%",  delay: 0,  dur: 20, color: "rgba(99,102,241,0.18)" },
          { w: 400, h: 400, top: "50%",  right: "-8%",  delay: 4,  dur: 24, color: "rgba(59,130,246,0.14)" },
          { w: 300, h: 300, bottom: "0", left: "40%",   delay: 8,  dur: 18, color: "rgba(139,92,246,0.12)" },
        ].map((o, i) => (
          <div key={i}
            style={{ width: o.w, height: o.h, top: o.top, left: o.left, right: o.right, bottom: o.bottom,
              background: o.color, animationDelay: `${o.delay}s`, animationDuration: `${o.dur}s` }}
            className="absolute rounded-full blur-3xl se-float-orb" />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Badge */}
        <div className="se-sh-badge flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-[0.25em] px-5 py-2.5 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse inline-block" />
            Seller Programme · Now Open
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-6">
          <h2 className="se-sh-head text-5xl md:text-7xl font-black leading-none text-white mb-2">
            Turn Your Products Into
          </h2>
          <h2 className="se-sh-head text-5xl md:text-7xl font-black leading-none">
            <span className="se-shimmer">Serious Revenue</span>
          </h2>
        </div>

        {/* Subtext */}
        <p className="se-sh-body text-center text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
          Join thousands of sellers already growing their business on ShopEase.
          Access 2 million ready-to-buy customers from day one — with zero setup fees.
        </p>

        {/* CTA row */}
        <div className="se-sh-body flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(99,102,241,0.45)" }}
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-black px-10 py-4 rounded-2xl text-lg shadow-2xl shadow-indigo-500/30"
          >
            Start Selling Free →
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="border border-white/20 text-white/80 hover:text-white px-10 py-4 rounded-2xl font-semibold hover:bg-white/8 transition backdrop-blur-sm"
          >
            Watch How It Works ▶
          </motion.button>
        </div>

        {/* Quick stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((s) => (
            <div key={s.label} className="se-sh-card group bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-gray-400 text-xs uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SellerHero