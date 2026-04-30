import { memo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap } from "lucide-react";
import { springBounce, springSoft } from "./ModernWhyComponents/whyConstants";
import { BENEFITS } from "../Data/whyContent";
import BenefitCard from "./ModernWhyComponents/BenefitCard";
import PartnersSection from "./ModernWhyComponents/PartnersSection";

const ModernWhy = memo(function ModernWhy() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes marqueeFwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes marqueeRev {
          from { transform: translateX(-33.333%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <section
        id="why-woosho"
        className="relative py-28 bg-gray-50 dark:bg-[#131315] overflow-hidden transition-colors duration-500"
      >
        {/* Ambient background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-48 -left-32 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20"
            style={{
              background:
                "radial-gradient(circle, #3B82F618 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute -bottom-48 -right-32 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20"
            style={{
              background:
                "radial-gradient(circle, #34D39918 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10 dark:opacity-5"
            style={{
              background:
                "radial-gradient(ellipse, #635BFF18 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* ── Section Header ────────────────────────────────── */}
          <div ref={titleRef} className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={titleInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ ...springBounce, delay: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6
                text-purple-600 dark:text-purple-400
                bg-purple-50 dark:bg-purple-500/10
                ring-1 ring-purple-200 dark:ring-purple-500/20"
            >
              <Zap size={12} strokeWidth={2.5} />
              The Woo Sho Advantage
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={
                titleInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}
              }
              transition={{ ...springSoft, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.08]"
            >
              Why Woo Sho{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
                  Works
                </span>
                {/* Underline sweep */}
                <motion.span
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={titleInView ? { scaleX: 1 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.65,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full block"
                  style={{
                    background:
                      "linear-gradient(to right, #3B82F6, #8B5CF6, #34D399)",
                    originX: 0,
                  }}
                />
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              The first platform built around the relationship between buyer and
              seller — with AI woven into every interaction on both sides.
            </motion.p>
          </div>

          {/* ── Benefit Cards ─────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-8">
            {BENEFITS.map((group, i) => (
              <BenefitCard
                key={group.group}
                group={group}
                side={i === 0 ? "left" : "right"}
              />
            ))}
          </div>

          {/* ── Partners ──────────────────────────────────────── */}
          <PartnersSection />
        </div>
      </section>
    </>
  );
});

export default ModernWhy;
