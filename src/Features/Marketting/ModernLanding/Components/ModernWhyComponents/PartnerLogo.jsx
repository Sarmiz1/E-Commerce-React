import { useState } from "react";
import { motion } from "framer-motion";

export default function PartnerLogo({ name, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      animate={{ opacity: hov ? 1 : 0.38, scale: hov ? 1.06 : 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2.5 px-5 py-3 rounded-2xl cursor-default select-none whitespace-nowrap"
      style={{
        background: hov ? `${accent}14` : "transparent",
        border: `1px solid ${hov ? accent + "44" : "transparent"}`,
        transition: "background 0.25s, border 0.25s",
      }}
    >
      {/* Dot accent */}
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: accent,
          boxShadow: hov ? `0 0 8px ${accent}99` : "none",
          transition: "box-shadow 0.25s",
        }}
      />
      <span
        className="text-sm font-bold tracking-tight text-gray-900 dark:text-white"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {name}
      </span>
    </motion.div>
  );
}
