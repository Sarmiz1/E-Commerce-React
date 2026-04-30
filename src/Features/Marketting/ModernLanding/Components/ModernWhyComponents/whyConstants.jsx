export const springFast = { type: "spring", stiffness: 80, damping: 18 };
export const springSoft = { type: "spring", stiffness: 55, damping: 20 };
export const springBounce = { type: "spring", stiffness: 120, damping: 14 };

export const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { ...springSoft, duration: 0.7 },
  },
};

export const fadeLeft = {
  hidden: { opacity: 0, x: -48, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { ...springSoft },
  },
};

export const fadeRight = {
  hidden: { opacity: 0, x: 48, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { ...springSoft },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.075, delayChildren: 0.15 } },
};

export const itemReveal = {
  hidden: { opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { ...springFast },
  },
};

export const COLOR = {
  blue: {
    text: "text-blue-500",
    ring: "ring-blue-500/20",
    bg: "bg-blue-500/10",
    hex: "#3B82F6",
    grad: "from-blue-500/10 to-transparent",
  },
  emerald: {
    text: "text-emerald-400",
    ring: "ring-emerald-400/20",
    bg: "bg-emerald-400/10",
    hex: "#34D399",
    grad: "from-emerald-400/10 to-transparent",
  },
};
