import {
  BarChart2,
  Bot,
  CreditCard,
  Globe,
  Store,
  Truck,
  UploadCloud,
  Zap,
} from "lucide-react";
import { formatMoneyCurrency } from "../../../../Utils/formatMoneyCents";

export const SELLER_FEATURES = [
  {
    id: "analytics",
    icon: BarChart2,
    label: "Smart Analytics",
    color: "#10b981",
    headline: "Know exactly what to stock",
    desc: "Real-time demand signals and competitor tracking give you the edge. Stop guessing - start growing.",
    stat: { value: "40%", label: "Revenue lift" },
    url: "/sell/smart-analytics",
    colSpan: "lg:col-span-2",
    rowSpan: "lg:row-span-1",
  },
  {
    id: "writer",
    icon: Zap,
    label: "AI Listing Writer",
    color: "#f59e0b",
    headline: "Perfect listings in 10s",
    desc: "Snap a photo, describe it briefly, and WooSho AI writes a fully optimized listing that ranks and sells.",
    stat: { value: "10s", label: "To publish" },
    url: "/sell/ai-listing-writer",
    colSpan: "lg:col-span-1",
    rowSpan: "lg:row-span-2",
  },
  {
    id: "assistant",
    icon: Bot,
    label: "AI Sales Assistant",
    color: "#6366f1",
    headline: "Never miss a sale",
    desc: "Handles buyer questions about size, availability, and shipping instantly and accurately.",
    stat: { value: "3x", label: "More conversions" },
    url: "/sell/sales-assistant",
    colSpan: "lg:col-span-1",
    rowSpan: "lg:row-span-1",
  },
  {
    id: "social",
    icon: Globe,
    label: "Social Commerce",
    color: "#ec4899",
    headline: "Your products, everywhere",
    desc: "Automatically syncs to the WooSho social feed, reaching active buyers across channels.",
    stat: { value: "2.4M", label: "Active buyers" },
    url: "/sell/social-commerce-feed",
    colSpan: "lg:col-span-1",
    rowSpan: "lg:row-span-1",
  },
];

export const SELLER_PAIN_CARDS = [
  {
    title: "You wake up to 40 DMs",
    body: "asking the same 4 questions. You answer them one by one, every morning. It never gets easier.",
  },
  {
    title: "You post a product.",
    body: "200 people see it. 3 ask about it. You get 0 sales. You post again tomorrow and hope.",
  },
  {
    title: "Your prices are guesses.",
    body: "Somewhere, a competitor charges 30% more for the same product and sells more.",
  },
  {
    title: "You do 6 jobs at once.",
    body: "Photographer, copywriter, customer service rep, accountant. For the salary of zero.",
  },
];

export const SELLER_DREAM_NOTIFICATIONS = [
  {
    icon: "Order",
    title: `New Order - ${formatMoneyCurrency(2450000)}`,
    sub: "Nike Air Force 1 - Chidi O.",
    color: "#10b981",
    time: "6:47 AM",
    delay: 0.2,
  },
  {
    icon: "AI",
    title: "AI replied to DM",
    sub: '"When will it ship?" answered automatically',
    color: "#6366f1",
    time: "7:12 AM",
    delay: 0.7,
  },
  {
    icon: "Ship",
    title: "Order dispatched",
    sub: "Item #WS-0041 shipped to Abuja",
    color: "#f59e0b",
    time: "9:01 AM",
    delay: 1.2,
  },
  {
    icon: "Paid",
    title: "Payout credited",
    sub: `${formatMoneyCurrency(18240000)} sent to your account`,
    color: "#22d3ee",
    time: "12:00 PM",
    delay: 1.7,
  },
  {
    icon: "Hot",
    title: "47 visitors on your store",
    sub: "Sneakers collection is trending",
    color: "#ec4899",
    time: "3:30 PM",
    delay: 2.2,
  },
  {
    icon: "Order",
    title: `New Order - ${formatMoneyCurrency(6700000)}`,
    sub: "Premium Headset - Fatima B.",
    color: "#10b981",
    time: "6:00 PM",
    delay: 2.7,
  },
];

export const SELLER_DREAM_BENEFITS = [
  { icon: "AI", text: "AI answers customer questions 24/7" },
  { icon: "SEO", text: "Auto-generates product descriptions" },
  { icon: "Pay", text: "Payouts within 48 hours, automatically" },
];

export const SELLER_CITIES = [
  { name: "Lagos", cx: 72, cy: 310, sellers: "12,400", r: 10 },
  { name: "Abuja", cx: 215, cy: 218, sellers: "8,200", r: 8 },
  { name: "Kano", cx: 220, cy: 100, sellers: "5,600", r: 7 },
  { name: "Port Harcourt", cx: 175, cy: 340, sellers: "4,900", r: 7 },
  { name: "Ibadan", cx: 105, cy: 265, sellers: "3,700", r: 6 },
  { name: "Kaduna", cx: 200, cy: 145, sellers: "2,800", r: 6 },
  { name: "Enugu", cx: 210, cy: 300, sellers: "2,300", r: 5 },
  { name: "Warri", cx: 145, cy: 330, sellers: "1,900", r: 5 },
];

export const SELLER_MAP_STATS = [
  { value: "36", label: "States covered", color: "#6366f1" },
  { value: "60K+", label: "Active sellers", color: "#10b981" },
  { value: "2.4M", label: "Buyers reached", color: "#f59e0b" },
  { value: "48h", label: "Avg. payout", color: "#ec4899" },
];

export const SELLER_OLD_WAY = [
  "Answering DMs manually for hours",
  "Writing product descriptions by guessing",
  "No visibility into what buyers want",
  "Payments delayed 7-14 days",
  "Zero cross-platform reach",
  "Generic storefront that looks like everyone else",
];

export const SELLER_WOOSHO_WAY = [
  "AI answers every question instantly, 24/7",
  "AI writes optimized listings in 10 seconds",
  "Real-time analytics and demand signals",
  "Payouts in 48 hours, automatically",
  "Reach buyers on the social feed",
  "Premium branded storefront, instantly",
];

export const SELLER_PRICING_PLANS = [
  {
    name: "Starter",
    price: "Free",
    priceNote: "forever",
    color: "#6b7280",
    badge: null,
    perks: [
      "20 active listings",
      "50 AI credits / month",
      "4% transaction fee",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started Free",
    ctaBg: "rgba(255,255,255,0.07)",
    ctaColor: "#f9fafb",
    regLink: "/auth/signup?plan=free",
  },
  {
    name: "Growth",
    price: formatMoneyCurrency(500000).replace(".00", ""),
    priceNote: "/ month",
    color: "#6366f1",
    badge: "Most Popular",
    perks: [
      "Unlimited listings",
      "500 AI credits / month",
      "3.5% transaction fee",
      "AI pricing intelligence",
      "Social commerce feed",
      "Priority support",
    ],
    cta: "Start 14-Day Trial",
    ctaBg: "#6366f1",
    ctaColor: "#fff",
    featured: true,
    regLink: "/auth/signup?plan=growth",
  },
  {
    name: "Pro",
    price: formatMoneyCurrency(1200000).replace(".00", ""),
    priceNote: "/ month",
    color: "#f59e0b",
    badge: "Best Value",
    perks: [
      "Everything in Growth",
      "Unlimited AI credits",
      "3% transaction fee",
      "Custom storefront branding",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Go Pro",
    ctaBg: "rgba(245,158,11,0.15)",
    ctaColor: "#f59e0b",
    ctaBorder: "1px solid rgba(245,158,11,0.4)",
    regLink: "/auth/signup?plan=pro",
  },
];

export const SELLER_CTA_STEPS = [
  { icon: Store, label: "Create your store", sub: "2 minutes to set up", color: "#6366f1" },
  { icon: Zap, label: "AI lists your products", sub: "Upload a photo - done", color: "#f59e0b" },
  { icon: CreditCard, label: "Get paid in 48 hours", sub: "Automatic payouts", color: "#10b981" },
];

export const SELLER_CTA_AVATARS = [
  { bg: "#6366f1" },
  { bg: "#ec4899" },
  { bg: "#10b981" },
  { bg: "#f59e0b" },
  { bg: "#8b5cf6" },
];

export const SELLER_CTA_GUARANTEES = [
  "No credit card needed",
  "Cancel anytime",
  "Payout in 48hrs",
];

export const SELLER_PULSE_NOTIFICATIONS = [
  "Ngozi in Lagos just received an order",
  "Emeka in Abuja just listed 5 new products",
  "Amara's AI replied to 12 buyers",
  `A seller in Enugu just hit their first ${formatMoneyCurrency(50000000).replace(".00", "")} month`,
];

export const SELLER_COMMUNITY_STATS = [
  { value: "47K+", label: "Active Sellers" },
  { value: "NGN 2.1B", label: "Paid Out Monthly" },
  { value: "4.9", label: "Seller Satisfaction" },
];

export const SELLER_DELIVERY_BADGES = [
  {
    title: "Same-Day Pickup",
    sub: "We collect from your door",
  },
  {
    title: "Nationwide Coverage",
    sub: "All 36 states + FCT",
  },
  {
    title: "Insured Packages",
    sub: "Every order is protected",
  },
  {
    title: "Live Tracking",
    sub: "Real-time for you and buyers",
  },
];

export const SELLER_DELIVERY_STATS = [
  { value: "1.2M+", label: "Deliveries Completed" },
  { value: "98.4%", label: "On-Time Rate" },
  { value: "36", label: "States Covered" },
];

export const SELLER_WIN_STEPS = [
  { num: "01", title: "List your product", body: "Upload photos, set your price, add a description in under 5 minutes." },
  { num: "02", title: "Get discovered", body: "WooSho promotes your store to buyers across Nigeria." },
  { num: "03", title: "Get paid", body: "Funds hit your account automatically. No chasing, no delays." },
];

export const SELLER_OPERATIONS_UX = [
  {
    icon: UploadCloud,
    title: "Guided onboarding",
    body: "A checklist that walks sellers from store setup to first product, first order, and first payout.",
  },
  {
    icon: Truck,
    title: "Fulfillment clarity",
    body: "Show pickup windows, package requirements, delivery SLAs, and dispute rules before sellers commit.",
  },
  {
    icon: BarChart2,
    title: "Decision dashboard",
    body: "Surface stock alerts, demand forecasts, listing quality, conversion gaps, and payout health in one view.",
  },
];
