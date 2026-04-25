/**
 * SectionA_Community.jsx
 * ─────────────────────────────────────────────────────────────
 * Social-proof community section — group of Nigerian women
 * celebrating sales on Woosho.
 *
 * IMAGE: Replace the `src` below with your actual asset path.
 *   e.g. import communityImg from "../../../../assets/images/women-community.png";
 *
 * Animations: Framer Motion (scroll-triggered via whileInView).
 * No GSAP used — safe to place inside SellerLanding's GSAP page.
 * ─────────────────────────────────────────────────────────────
 */



import { useCallback } from "react";
import { motion } from "framer-motion";

import COMMUNITY_IMG from "../../../../assets/marketing/sellersImg2.png";
// ──────────────────────────────────────────────────────────────

const STATS = [
  { value: "47K+", label: "Active Sellers" },
  { value: "₦2.1B", label: "Paid Out Monthly" },
  { value: "4.9★", label: "Seller Satisfaction" },
];

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  },
});

const slideRight = {
  hidden: { opacity: 0, x: 80, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
  },
};




export default function SectionA_Community() {

  const scrollToPricing = useCallback(() => {
    const el = document.getElementById("seller-pricing");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-[#0A0A0A] flex items-center overflow-hidden py-24 px-6 md:px-16 lg:px-24">
      {/* ── Ambient glow ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* ── LEFT: Copy ────────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          {/* Tag */}
          <motion.div
            variants={fadeUp(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Real Sellers. Real Results.
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={fadeUp(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.1] tracking-tight text-white"
          >
            Build your lane.{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Own your income.
            </span>
          </motion.h2>

          {/* Body */}
          <motion.p
            variants={fadeUp(0.2)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-lg text-white/60 max-w-md leading-relaxed"
          >
            Thousands of sellers across Nigeria are already growing their
            businesses on Woosho — managing orders, tracking sales, and
            getting paid, all from one dashboard.
          </motion.p>

          {/* Stats row */}
          <motion.div
            variants={fadeUp(0.3)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-3 gap-4 mt-2"
          >
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col gap-1 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.07]"
              >
                <span className="text-2xl font-black text-white">{value}</span>
                <span className="text-xs text-white/40 leading-tight">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div
            variants={fadeUp(0.4)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex items-start gap-4 p-5 rounded-2xl bg-violet-500/[0.07] border border-violet-500/20"
          >
            <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-sm font-bold text-white">
              T
            </div>
            <div>
              <p className="text-sm text-white/80 italic leading-relaxed">
                "I listed my first bag on a Tuesday. By Thursday I had 4
                orders. Woosho just works."
              </p>
              <p className="mt-2 text-xs font-semibold text-violet-400">
                Tolu A. — Lagos Fashion Seller
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeUp(0.5)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <button
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
              onClick={scrollToPricing}
            >
              Start selling free
              <svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* ── RIGHT: Image ──────────────────────────────────── */}
        <motion.div
          variants={slideRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative"
        >
          {/* Outer glow ring */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                "radial-gradient(circle at 60% 40%, rgba(124,58,237,0.25) 0%, transparent 65%)",
              filter: "blur(30px)",
              transform: "scale(1.05)",
            }}
          />

          {/* Image frame */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src={COMMUNITY_IMG}
              alt="Group of Nigerian women sellers celebrating on Woosho"
              className="w-full h-full object-cover"
              style={{ aspectRatio: "4/3" }}
              loading="lazy"
            />

            {/* Subtle gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Floating badge — "Build Your Own Lane" echoing the neon sign in photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5, type: "spring", stiffness: 200 }}
              viewport={{ once: true }}
              className="absolute top-5 left-5 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Community of Builders</p>
                <p className="text-[10px] text-white/50">47,000+ sellers growing daily</p>
              </div>
            </motion.div>

            {/* Floating order notification */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5, type: "spring", stiffness: 180 }}
              viewport={{ once: true }}
              className="absolute bottom-5 right-5 bg-black/70 backdrop-blur-md border border-violet-500/30 rounded-2xl px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">New order received!</p>
                  <p className="text-[10px] text-violet-400 font-bold">₦48,500</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
