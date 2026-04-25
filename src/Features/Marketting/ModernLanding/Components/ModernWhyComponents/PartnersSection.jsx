import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { PARTNERS_ROW1, PARTNERS_ROW2, springSoft, springFast, staggerContainer, itemReveal } from "./whyConstants";
import MarqueeRow from "./MarqueeRow";

export default function PartnersSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [paused, setPaused] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...springSoft, delay: 0.1 }}
      className="mt-28"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.3em" }}
          animate={inView ? { opacity: 1, letterSpacing: "0.15em" } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3"
        >
          Trusted Infrastructure
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...springFast, delay: 0.3 }}
          className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight"
        >
          Built on world-class partners
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-3 text-[15px] text-gray-500 dark:text-gray-400 max-w-md mx-auto"
        >
          Woo Sho integrates with the platforms your business already trusts —
          for payments, logistics, and beyond.
        </motion.p>
      </div>

      {/* Marquee wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ ...springSoft, delay: 0.5 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative rounded-3xl overflow-hidden py-2"
        style={{
          background: "var(--marquee-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        {/* Top edge fade for the entire block */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(99,91,255,0.3), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(52,211,153,0.3), transparent)",
          }}
        />

        <div className="flex flex-col gap-1 py-3">
          <MarqueeRow
            partners={PARTNERS_ROW1}
            reverse={false}
            paused={paused}
          />
          <MarqueeRow partners={PARTNERS_ROW2} reverse={true} paused={paused} />
        </div>

        {/* Pause hint */}
        <motion.div
          animate={{ opacity: paused ? 1 : 0, y: paused ? 0 : 4 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-2 right-4 text-[10px] font-bold text-gray-400 dark:text-gray-600 pointer-events-none"
        >
          Paused ∙ hover to explore
        </motion.div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { stat: "16+", label: "Integration Partners" },
          { stat: "99.9%", label: "Payment Uptime" },
          { stat: "₦2.4B", label: "GMV Processed" },
          { stat: "48hrs", label: "Average Payout Speed" },
        ].map(({ stat, label }) => (
          <motion.div
            key={label}
            variants={itemReveal}
            className="group text-center p-5 rounded-2xl transition-all duration-300 cursor-default"
            style={{
              background: "var(--stat-bg)",
              border: "1px solid var(--card-border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#635BFF44";
              e.currentTarget.style.background = "#635BFF09";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--card-border)";
              e.currentTarget.style.background = "var(--stat-bg)";
            }}
          >
            <div
              className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
            >
              {stat}
            </div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">
              {label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
