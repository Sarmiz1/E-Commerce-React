import {
  SearchX,
  MousePointerClick,
  Brain,
  Zap,
  ShieldCheck,
  Globe2,
  Layers,
  CheckCircle2,
  ShoppingBag,
  Unlink,
  Package, 
  Search 
} from "lucide-react";

export const ABOUT_NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Brands", href: "/brands" },
  { label: "Support", href: "/support" },
  { label: "About", href: "/about" },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    text: "Users search or browse products across our curated marketplace.",
  },
  {
    step: "02",
    text: "The AI helps filter and compare options based on exact specifications.",
  },
  {
    step: "03",
    text: "Users make faster, better decisions with total confidence.",
  },
];

export const PROBLEMS = [
  {
    icon: SearchX,
    title: "Irrelevant Discovery",
    desc: "Too many irrelevant products cluttering the shopping experience.",
  },
  {
    icon: MousePointerClick,
    title: "Decision Fatigue",
    desc: "Endless scrolling leads to overwhelming choices and cart abandonment.",
  },
  {
    icon: Unlink,
    title: "Poor Connection",
    desc: "A fragmented ecosystem between genuine buyers and the right products.",
  },
];

export const DIFFERENCES = [
  {
    icon: Brain,
    title: "AI-Assisted Shopping",
    desc: "On-demand intelligence that understands your search intent.",
  },
  {
    icon: Zap,
    title: "Smart Comparison",
    desc: "Instantly evaluate products based on specs, price, and reviews.",
  },
  {
    icon: ShoppingBag,
    title: "Curated Ecosystem",
    desc: "A vetted network of premium brands and trusted sellers.",
  },
  {
    icon: Layers,
    title: "Fast Checkout",
    desc: "Frictionless, one-click purchase flows designed for conversion.",
  },
  {
    icon: Globe2,
    title: "Built for Scale",
    desc: "Designed mobile-first for Africa, engineered for global commerce.",
  },
];

export const TRUST_PILLARS = [
  {
    title: "Secure Payments",
    desc: "Bank-grade encryption powered by Paystack.",
    icon: ShieldCheck,
  },
  {
    title: "Verified Sellers",
    desc: "Every merchant undergoes strict KYC vetting.",
    icon: CheckCircle2,
  },
  {
    title: "Structured Logistics",
    desc: "Reliable, trackable nationwide delivery network.",
    icon: Package,
  },
  {
    title: "Transparent Transactions",
    desc: "No hidden fees. Full escrow protection.",
    icon: Search,
  },
];

