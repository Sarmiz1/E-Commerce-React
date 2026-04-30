import {
  CreditCard,
  Frown,
  Heart,
  Infinity as InfinityIcon,
  MessageCircle,
  PackageCheck,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Truck,
  Zap,
} from "lucide-react";

export const BUYER_PROBLEMS = [
  { icon: InfinityIcon, text: "Too many products." },
  { icon: ShieldAlert, text: "Fake reviews." },
  { icon: Frown, text: "Endless scrolling." },
];

export const BUYER_SOLUTION_STEPS = [
  { num: "1", title: "Tell WooSho what you want", desc: "Just type it out naturally." },
  { num: "2", title: "AI understands your style and budget", desc: "We scan thousands of products." },
  { num: "3", title: "Get instant personalized results", desc: "Only the best matches, tailored for you." },
];

export const BUYER_SOLUTION_PROMPT = {
  budgetCents: 15000000,
  text: "I need an outfit for a tech conference, smart casual, budget",
};

export const BUYER_RESULT_PLACEHOLDERS = [1, 2, 3, 4];

export const BUYER_SMART_FEATURES = [
  {
    icon: "AI",
    title: "AI Personalization",
    desc: "Every result is tailored to your taste, budget, and browsing history. The more you shop, the smarter it gets.",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80",
    accent: "#818cf8",
  },
  {
    icon: "VS",
    title: "Instant Comparison",
    desc: "Compare prices, specs, and seller ratings across the entire catalog in real time - no tab switching.",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80",
    accent: "#38bdf8",
  },
  {
    icon: "OK",
    title: "Secure Payments",
    desc: "Bank-grade encryption on every transaction. Your payment details never leave our secure vault.",
    gradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80",
    accent: "#34d399",
  },
  {
    icon: "ETA",
    title: "Fast Delivery",
    desc: "Same-day delivery in Lagos. Nationwide in 48 hours. Live tracking from warehouse to doorstep.",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    img: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=400&q=80",
    accent: "#fbbf24",
  },
];

export const BUYER_CATEGORIES = [
  {
    title: "Fashion",
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
    colSpan: "col-span-1 md:col-span-2",
  },
  {
    title: "Sneakers",
    img: "https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&w=400&q=80",
    colSpan: "col-span-1",
  },
  {
    title: "Electronics",
    img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80",
    colSpan: "col-span-1",
  },
  {
    title: "Beauty",
    img: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&w=400&q=80",
    colSpan: "col-span-1",
  },
  {
    title: "Gadgets",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    colSpan: "col-span-1 md:col-span-2",
  },
  {
    title: "Accessories",
    img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=400&q=80",
    colSpan: "col-span-1",
  },
];

export const BUYER_DELIVERY_PROMISE = "48H";

export const BUYER_REVIEWS = [
  {
    quote:
      "WooSho's AI found the exact sneakers I wanted in under 10 seconds. Nothing else comes close.",
    author: "Michael O.",
    role: "Fashion Enthusiast",
    location: "Lagos",
    avatar: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=80&h=80&q=80&fit=crop",
    rating: 5,
  },
  {
    quote:
      "I used to spend hours comparing prices across different sites. Now I just ask the AI and it handles everything.",
    author: "Adaeze T.",
    role: "Frequent Shopper",
    location: "Abuja",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&q=80&fit=crop",
    rating: 5,
  },
  {
    quote:
      "Fastest checkout experience I've ever had. The recommendations are actually smart, not random.",
    author: "Chukwudi K.",
    role: "Tech Buyer",
    location: "Port Harcourt",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&q=80&fit=crop&face=center",
    rating: 5,
  },
];

export const BUYER_SOCIAL_STATS = [
  { value: "2.4M+", label: "Happy Shoppers" },
  { value: "4.9", label: "Average Rating" },
  { value: "98%", label: "Satisfaction Rate" },
];

export const BUYER_TRUST_ITEMS = [
  {
    icon: Shield,
    text: "Secure Payments",
    sub: "Paystack and Stripe payment rails",
    color: "#6366f1",
  },
  {
    icon: CreditCard,
    text: "NGN and USD Pricing",
    sub: "Naira and Dollar checkout supported",
    color: "#10b981",
  },
  {
    icon: Truck,
    text: "Fast Delivery",
    sub: "Same-day Lagos - 48h nationwide",
    color: "#f59e0b",
  },
  {
    icon: MessageCircle,
    text: "24/7 Support",
    sub: "WhatsApp and live chat, always on",
    color: "#ec4899",
  },
];

export const BUYER_TRUST_STEPS = [
  { icon: Shield, label: "Secure Payments" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Shield, label: "Trusted Service" },
];

export const BUYER_ORDERS_TODAY = [
  { label: "Orders today", value: "12,847", change: "18", color: "#059669" },
];

export const BUYER_SHOPPER_COUNT = "2.4M";

export const BUYER_SOCIAL_AVATARS = ["B1", "B2", "B3", "B4"];

export const BUYER_APP_STEPS = [
  {
    icon: Zap,
    title: "Fast",
    desc: "Find what you are looking for in seconds. Smart search gets you straight to the best products without the hassle.",
    color: "#2563eb",
  },
  {
    icon: Heart,
    title: "Easy",
    desc: "An intuitive, clean interface designed so everyone can browse and shop effortlessly.",
    color: "#0891b2",
  },
  {
    icon: ShieldCheck,
    title: "Reliable",
    desc: "Count on verified sellers, genuine products, and consistent delivery you can trust.",
    color: "#059669",
  },
];

export const BUYER_PREMIUM_UX = [
  {
    icon: PackageCheck,
    title: "Delivery confidence",
    body: "Show ETA, delivery partner, pickup status, and protection before checkout.",
  },
  {
    icon: ShieldCheck,
    title: "Verified trust layer",
    body: "Expose seller verification, return policy, buyer protection, and review quality signals.",
  },
  {
    icon: Smartphone,
    title: "Personal shopping memory",
    body: "Bring back sizes, brands, budget, wishlists, and recently compared products.",
  },
];

export const BUYER_FINAL_PROOF = {
  rating: "4.9",
  shopperCount: "2.4M+",
  finalNote: "Free to start",
};
