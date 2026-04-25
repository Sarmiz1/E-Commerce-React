import { useState } from "react";
import { motion } from "framer-motion";
import { COLOR, springBounce, itemReveal } from "./whyConstants";

export default function BenefitItem({ item, color }) {
  const [hov, setHov] = useState(false);
  const C = COLOR[color];
  const Icon = item.icon;
  return (
    <motion.div
      variants={itemReveal}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      className="group relative flex flex-col gap-3 p-4 rounded-2xl transition-colors duration-300"
      style={{
        background: hov ? `${C.hex}09` : "transparent",
        border: `1px solid ${hov ? C.hex + "28" : "transparent"}`,
      }}
    >
      {/* Icon */}
      <motion.div
        animate={{ scale: hov ? 1.1 : 1, rotate: hov ? 6 : 0 }}
        transition={springBounce}
        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${C.bg} ring-1 ${C.ring}`}
        style={{
          boxShadow: hov ? `0 0 18px ${C.hex}33` : "none",
          transition: "box-shadow 0.3s",
        }}
      >
        <Icon size={18} className={C.text} strokeWidth={1.8} />
      </motion.div>

      <div>
        <h4 className="font-bold text-[15px] text-gray-900 dark:text-white leading-snug mb-1">
          {item.title}
        </h4>
        <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
          {item.desc}
        </p>
      </div>

      {/* Hover glow corner */}
      <motion.div
        animate={{ opacity: hov ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none`}
        style={{
          background: `radial-gradient(circle, ${C.hex}1A 0%, transparent 70%)`,
          transform: "translate(30%, -30%)",
        }}
      />
    </motion.div>
  );
}
