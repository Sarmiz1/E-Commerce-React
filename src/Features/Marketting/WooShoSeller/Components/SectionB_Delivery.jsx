/**
 * SectionB_Delivery.jsx
 * ─────────────────────────────────────────────────────────────
 * Logistics trust section — Woosho delivery truck in action.
 * Full-bleed cinematic layout with animated stat counters and
 * floating trust badges.
 *
 * IMAGE: Replace the `src` below with your actual asset path.
 *   e.g. import deliveryImg from "../../../../assets/images/delivery-truck.png";
 *
 * Animations: Framer Motion only. No GSAP.
 * ─────────────────────────────────────────────────────────────
 */

import React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

import DELIVERY_IMG from "../../../../assets/marketing/truck-delivery.png"
// ──────────────────────────────────────────────────────────────

const TRUST_BADGES = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l3 3h3m3-13h2l3 3v10h-1m-5-3a2 2 0 104 0 2 2 0 00-4 0M6 19a2 2 0 100-4 2 2 0 000 4z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Same-Day Pickup",
    sub: "We collect from your door",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13V7m0 13l6-3m-6-3l6 3m0 0l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Nationwide Coverage",
    sub: "All 36 states + FCT",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Insured Packages",
    sub: "Every order is protected",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Live Tracking",
    sub: "Real-time for you & buyers",
  },
];

const STATS = [
  { value: "1.2M+", label: "Deliveries Completed" },
  { value: "98.4%", label: "On-Time Rate" },
  { value: "36", label: "States Covered" },
];

// stagger container
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function SectionB_Delivery() {
  return (
    <section className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* ── Full-bleed image with parallax feel ────────────── */}
      <div className="absolute inset-0">
        <motion.img
          src={DELIVERY_IMG}
          alt="Woosho delivery team loading a purple branded truck"
          className="w-full h-full object-cover object-center"
          style={{ scale: 1.05 }}
          initial={{ scale: 1.08 }}
          whileInView={{ scale: 1.02 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          viewport={{ once: true }}
          loading="lazy"
        />

        {/* Multi-layer cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

        {/* Purple tint on right half (matches brand truck color) */}
        <div
          className="absolute inset-y-0 right-0 w-1/2"
          style={{
            background:
              "linear-gradient(to left, rgba(109,40,217,0.15) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 lg:px-24 min-h-screen flex flex-col justify-center py-24">
        <div className="max-w-xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Logistics You Can Trust
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-white"
          >
            We handle the{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              delivery.
            </span>
            <br />
            You collect the{" "}
            <span className="text-white">money.</span>
          </motion.h2>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            viewport={{ once: true }}
            className="mt-5 text-lg text-white/55 leading-relaxed"
          >
            Woosho's logistics network picks up from your location and
            delivers across Nigeria — so you never have to chase a
            dispatch rider again.
          </motion.p>

          {/* Stats row */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 flex flex-wrap gap-6"
          >
            {STATS.map(({ value, label }) => (
              <motion.div key={label} variants={item} className="flex flex-col gap-0.5">
                <span className="text-3xl font-black text-white">{value}</span>
                <span className="text-xs text-white/40">{label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust badges grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 grid grid-cols-2 gap-3"
          >
            {TRUST_BADGES.map(({ icon, title, sub }) => (
              <motion.div
                key={title}
                variants={item}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.08] transition-colors"
              >
                <div className="shrink-0 w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Bottom fade to next section ─────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
    </section>
  );
}
