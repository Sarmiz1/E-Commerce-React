import {
  ShieldCheck,
  Zap,
  Lock,
  Globe,
  BarChart3,
  Users,
  Sparkles,
  TrendingUp,
  Clock,
  BadgeCheck,
} from "lucide-react";

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

export const PARTNERS_ROW1 = [
  { name: "Stripe", accent: "#635BFF" },
  { name: "Paystack", accent: "#00C3F7" },
  { name: "Flutterwave", accent: "#F5A623" },
  { name: "GIG Logistics", accent: "#E63946" },
  { name: "Sendbox", accent: "#6C63FF" },
  { name: "DHL Express", accent: "#FFCC00" },
  { name: "Mastercard", accent: "#EB001B" },
  { name: "Google", accent: "#4285F4" },
];

export const PARTNERS_ROW2 = [
  { name: "Visa", accent: "#1A1F71" },
  { name: "Shopify", accent: "#96BF48" },
  { name: "MTN Business", accent: "#FFC415" },
  { name: "UPS", accent: "#351C15" },
  { name: "Meta Business", accent: "#1877F2" },
  { name: "Anthropic", accent: "#D97757" },
  { name: "Zenith Bank", accent: "#880000" },
  { name: "Access Bank", accent: "#F07216" },
];

export const BENEFITS = [
  {
    group: "For Buyers",
    color: "blue",
    badge: "Buyer Experience",
    items: [
      {
        title: "AI Personalization",
        desc: "Your taste, perfectly learned over time. The more you shop, the smarter it gets.",
        icon: Sparkles,
      },
      {
        title: "Saves You Hours",
        desc: "Less scrolling, more discovery. Find exactly what you want by simply describing it.",
        icon: Clock,
      },
      {
        title: "Secure Checkout",
        desc: "Every payment flows through Stripe escrow. Your money is protected until delivery.",
        icon: Lock,
      },
      {
        title: "Global Reach",
        desc: "Shop from verified sellers nationwide with AI-assisted delivery routing.",
        icon: Globe,
      },
    ],
  },
  {
    group: "For Sellers",
    color: "emerald",
    badge: "Seller Growth",
    items: [
      {
        title: "Predictive Demand",
        desc: "Know what will sell before you stock it. AI surfaces demand signals weekly.",
        icon: BarChart3,
      },
      {
        title: "Lower Ad Spend",
        desc: "High-intent buyer matching dramatically reduces your cost of acquisition.",
        icon: TrendingUp,
      },
      {
        title: "Verified Customers",
        desc: "Every buyer is verified. Goodbye fraudulent orders, chargebacks, and disputes.",
        icon: ShieldCheck,
      },
      {
        title: "AI Sales Assistant",
        desc: "Your 24/7 sales rep. Responds to buyers, writes listings, and prices intelligently.",
        icon: BadgeCheck,
      },
    ],
  },
];

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
