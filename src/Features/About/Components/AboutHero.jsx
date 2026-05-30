import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSellerCtaHref } from "../Hooks/useSellerCtaHref";

export default function AboutHero() {
  const sellerCtaHref = useSellerCtaHref();

  return (
    <section className="relative px-4 pb-20 pt-32 flex flex-col items-center justify-center text-center overflow-hidden sm:px-6 sm:pb-24 sm:pt-40 lg:pb-32 lg:pt-48">
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--about-border)]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top, var(--about-hero-glow), var(--about-bg) 68%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 text-4xl font-black uppercase leading-[0.95] tracking-tighter text-[var(--about-text)] sm:text-6xl sm:leading-[0.9] md:mb-8 md:text-8xl"
        >
          Redefining <br className="hidden md:block" /> How People{" "}
          <br className="hidden md:block" /> Shop Online.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mx-auto mb-8 max-w-3xl text-base font-medium leading-relaxed text-[var(--about-muted)] sm:mb-12 sm:text-xl md:text-2xl"
        >
          Woosho is an AI-powered commerce platform that helps people discover,
          compare, and buy products faster and smarter.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/products"
            className="w-full bg-[var(--about-cta-bg)] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-[var(--about-cta-text)] transition-colors hover:bg-blue-600 hover:text-white sm:w-auto sm:px-8 sm:py-4 sm:text-sm"
          >
            Start Shopping
          </Link>
          <Link
            to={sellerCtaHref}
            className="w-full border border-[var(--about-border-strong)] bg-transparent px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-[var(--about-text)] transition-colors hover:border-[var(--about-text)] sm:w-auto sm:px-8 sm:py-4 sm:text-sm"
          >
            Start Selling
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
