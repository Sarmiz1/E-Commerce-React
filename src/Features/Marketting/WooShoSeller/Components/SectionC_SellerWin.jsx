/**
 * SectionC_SellerWin.jsx
 * ─────────────────────────────────────────────────────────────
 * Emotional victory section — solo seller celebrating her first
 * "Order sold successfully" notification.
 *
 * Placed just before Section9_Cta as the final emotional push.
 *
 * IMAGE: Replace the `src` below with your actual asset path.
 *   e.g. import sellerWinImg from "../../../../assets/images/seller-win.png";
 *
 * Animations: Framer Motion only. No GSAP.
 * ─────────────────────────────────────────────────────────────
 */

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom'
import { formatMoneyCurrency } from '../../../../Utils/formatMoneyCents';
import SELLER_WIN_IMG from  "../../../../assets/marketing/sellersImg3.png";



const STEPS = [
  { num: "01", title: "List your product", body: "Upload photos, set your price, add a description in under 5 minutes." },
  { num: "02", title: "Get discovered", body: "Woosho promotes your store to thousands of buyers across Nigeria." },
  { num: "03", title: "Get paid", body: "Funds hit your account automatically. No chasing, no delays." },
];

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
  },
});

const slideLeft = {
  hidden: { opacity: 0, x: -80, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function SectionC_SellerWin() {

  const scrollToPricing = useCallback(() => {
      const el = document.getElementById("seller-features");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
  }, []);


  return (
    <section className="relative w-full min-h-screen bg-[#0A0A0A] flex items-center overflow-hidden py-24 px-6 md:px-16 lg:px-24">
      {/* ── Ambient glow (right side) ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* ── LEFT: Image ───────────────────────────────────── */}
        <motion.div
          variants={slideLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative order-2 lg:order-1"
        >
          {/* Glow behind image */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                "radial-gradient(circle at 40% 60%, rgba(124,58,237,0.3) 0%, transparent 60%)",
              filter: "blur(40px)",
              transform: "scale(1.08)",
            }}
          />

          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src={SELLER_WIN_IMG}
              alt="Nigerian woman seller celebrating her first sale on Woosho"
              className="w-full h-full object-cover"
              style={{ aspectRatio: "4/3" }}
              loading="lazy"
            />

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />

            {/* ── Floating: "Order sold" card ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.7,
                duration: 0.6,
                type: "spring",
                stiffness: 220,
                damping: 14,
              }}
              viewport={{ once: true }}
              className="absolute top-6 right-6 bg-black/75 backdrop-blur-xl border border-violet-500/30 rounded-2xl px-5 py-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(124,58,237,0.6)",
                      "0 0 0 10px rgba(124,58,237,0)",
                      "0 0 0 0 rgba(124,58,237,0)",
                    ],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1 }}
                  className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0"
                >
                  <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-xs font-bold text-white">Order sold successfully</p>
                  <p className="text-[10px] text-white/50 mt-0.5">woosho</p>
                </div>
              </div>
            </motion.div>

            {/* ── Floating: earnings counter ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.5, type: "spring", stiffness: 180 }}
              viewport={{ once: true }}
              className="absolute bottom-6 left-6 bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3"
            >
              <p className="text-[10px] text-white/40 uppercase tracking-widest">This month</p>
              <p className="text-2xl font-black text-white mt-1">{formatMoneyCurrency(28400000)}</p>
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] text-emerald-400 font-semibold">+38% from last month</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── RIGHT: Copy ────────────────────────────────────── */}
        <div className="flex flex-col gap-8 order-1 lg:order-2">
          {/* Tag */}
          <motion.div
            variants={fadeUp(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              Your first sale is closer than you think
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={fadeUp(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-4xl md:text-5xl lg:text-[52px] font-extrabold leading-[1.1] tracking-tight text-white"
          >
            That feeling?{" "}
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              You deserve it.
            </span>
          </motion.h2>

          {/* Body */}
          <motion.p
            variants={fadeUp(0.2)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-lg text-white/55 max-w-md leading-relaxed"
          >
            Every successful Woosho seller started with zero orders.
            Three simple steps is all it takes to go from "just an idea"
            to "Order sold successfully."
          </motion.p>

          {/* Steps */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
            className="flex flex-col gap-4"
          >
            {STEPS.map(({ num, title, body }) => (
              <motion.div
                key={num}
                variants={fadeUp()}
                className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06]"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/20 flex items-center justify-center">
                  <span className="text-xs font-black text-violet-400">{num}</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{title}</p>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp(0.6)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link 
              to="/auth/signup?plan=free"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-violet-900/40"
            >
              Open your store today
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <button
              onClick={scrollToPricing}
              className="text-sm text-white/50 hover:text-white transition-colors underline underline-offset-4"
            >
              See all features
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
