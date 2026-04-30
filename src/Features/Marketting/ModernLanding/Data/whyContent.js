import {
  ShieldCheck,
  Lock,
  Globe,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  BadgeCheck,
} from "lucide-react";

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

export const PARTNER_STATS = [
  { stat: "16+", label: "Integration Partners" },
  { stat: "99.9%", label: "Payment Uptime" },
  { stat: "NGN 2.4B", label: "GMV Processed" },
  { stat: "48hrs", label: "Average Payout Speed" },
];

export const BENEFITS = [
  {
    group: "For Buyers",
    color: "blue",
    badge: "Buyer Experience",
    items: [
      {
        title: "AI Personalization",
        desc: "Your taste, learned over time. The more you shop, the smarter it gets.",
        icon: Sparkles,
      },
      {
        title: "Saves You Hours",
        desc: "Less scrolling, more discovery. Find what you want by describing it.",
        icon: Clock,
      },
      {
        title: "Secure Checkout",
        desc: "Payments are designed around protection, verification, and delivery confidence.",
        icon: Lock,
      },
      {
        title: "Global Reach",
        desc: "Shop from verified sellers with assisted delivery routing.",
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
        desc: "Surface demand signals before buying inventory or scaling campaigns.",
        icon: BarChart3,
      },
      {
        title: "Lower Ad Spend",
        desc: "High-intent matching reduces wasted traffic and improves acquisition quality.",
        icon: TrendingUp,
      },
      {
        title: "Verified Customers",
        desc: "Verification flows reduce low-quality orders, fraud, and disputes.",
        icon: ShieldCheck,
      },
      {
        title: "AI Sales Assistant",
        desc: "A 24/7 assistant for listings, buyer responses, and pricing guidance.",
        icon: BadgeCheck,
      },
    ],
  },
];
