import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { COLOR, fadeLeft, fadeRight, staggerContainer, springFast } from "./whyConstants";
import BenefitItem from "./BenefitItem";

export default function BenefitCard({ group, side }) {
  const C = COLOR[group.color];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      ref={ref}
      variants={side === "left" ? fadeLeft : fadeRight}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      className="relative overflow-hidden rounded-[32px] transition-shadow duration-500"
      style={{
        background: "var(--card-bg)",
        border: `1px solid ${hov ? C.hex + "33" : "var(--card-border)"}`,
        boxShadow: hov
          ? `0 24px 64px -12px ${C.hex}28, 0 0 0 1px ${C.hex}18`
          : "0 4px 24px -4px rgba(0,0,0,0.08)",
        transition:
          "box-shadow 0.45s cubic-bezier(.4,0,.2,1), border-color 0.35s",
      }}
    >
      {/* Corner gradient orb */}
      <motion.div
        animate={{ opacity: hov ? 1 : 0.4, scale: hov ? 1.1 : 1 }}
        transition={{ duration: 0.5 }}
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${C.hex}18 0%, transparent 65%)`,
        }}
      />

      {/* Bottom glow streak */}
      <motion.div
        animate={{ opacity: hov ? 0.7 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${C.hex}88, transparent)`,
        }}
      />

      <div className="relative p-9 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <motion.div
            animate={{ scale: hov ? 1.05 : 1 }}
            transition={springFast}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide ${C.bg} ${C.text} ring-1 ${C.ring}`}
          >
            {group.badge}
          </motion.div>
          <h3 className={`text-xl font-black tracking-tight ${C.text}`}>
            {group.group}
          </h3>
        </div>

        {/* Items grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {group.items.map((item) => (
            <BenefitItem key={item.title} item={item} color={group.color} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
