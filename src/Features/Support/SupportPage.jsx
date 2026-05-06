import React, { useState } from "react";
import { useTheme } from "../../Store/useThemeStore";
import { Link } from "react-router-dom";
import {
  Search,
  Package,
  CreditCard,
  User,
  RotateCcw,
  Store,
  Brain,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageCircle,
  Bot,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import ModernNavbar from "../../components/ModernNavbar";

const CATEGORIES = [
  {
    icon: Package,
    title: "Orders & Delivery",
    desc: "Track, delay, or manage deliveries",
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    desc: "Transactions, refunds, and payment issues",
  },
  {
    icon: User,
    title: "Account Management",
    desc: "Login, profile, security settings",
  },
  {
    icon: RotateCcw,
    title: "Returns & Refunds",
    desc: "How to return items and get refunds",
  },
  {
    icon: Store,
    title: "Seller Support",
    desc: "Help for vendors and store owners",
  },
  {
    icon: Brain,
    title: "AI Shopping Assistant",
    desc: "Help using Woosho AI features",
  },
];

const FAQS = [
  {
    q: "How do I track my order?",
    a: "You can track your order using the Order Support Lookup below, or by navigating to the Orders section in your Buyer Dashboard.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 2-5 business days. Premium express delivery guarantees next-day arrival for eligible regions.",
  },
  {
    q: "How do refunds work?",
    a: "Once a return is approved and the item is received at our facility, refunds are processed within 3-5 business days directly to your original payment method.",
  },
  {
    q: "Why was my payment declined?",
    a: "Payments can be declined due to insufficient funds, incorrect billing details, or bank security blocks. Please contact your bank or try an alternative payment method.",
  },
  {
    q: "How does AI search work?",
    a: 'Our Neural Engine interprets natural language. You can type complex requests like "black sneakers under 50k for running" and it will filter results instantly.',
  },
];

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "Email Support",
    time: "Response time: 24–48 hours",
    desc: "For complex inquiries and documentation.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Support",
    time: "Fast response for urgent issues",
    desc: "Real-time text support with our operations team.",
  },
  {
    icon: Bot,
    title: "AI Support Assistant",
    time: "Guided help for instant answers",
    desc: "Immediate automated resolution for common issues.",
  },
];

const SYSTEM_STATUS = [
  { label: "Payments", status: "Operational" },
  { label: "Orders", status: "Operational" },
  { label: "AI Assistant", status: "Operational" },
  { label: "Delivery Network", status: "Operational" },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const { isDark, colors } = useTheme();

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: isDark ? "#0a0a0a" : "#FAFAFA",
        color: isDark ? "#f9fafb" : "#111827",
      }}
    >
      <ModernNavbar
        navLinks={[
          { label: "Shop", href: "/products" },
          { label: "Brands", href: "/brands" },
          { label: "Sellers", href: "/seller" },
          { label: "Support", href: "/support" },
        ]}
      />

      {/* 1. HERO SECTION */}
      <section className="pt-40 pb-20 px-6 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Support Center
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Find answers, resolve issues, or contact our support team.
        </p>

        <div className="relative max-w-2xl mx-auto shadow-sm rounded-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search for help articles, orders, or issues..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-base transition-all bg-white"
          />
        </div>
      </section>

      {/* 2. SUPPORT CATEGORIES */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 p-6 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
            >
              <cat.icon size={28} className="text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {cat.title}
              </h3>
              <p className="text-sm text-gray-500">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-12 py-16 border-t border-gray-100">
        <div className="lg:col-span-2 space-y-16">
          {/* 3. POPULAR HELP ARTICLES */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Most Common Requests
            </h2>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {FAQS.map((faq, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 4. ORDER SUPPORT LOOKUP */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Track or Resolve an Order
            </h2>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <p className="text-sm text-gray-500 mb-6">
                Enter your details below to check order status, request refunds,
                or cancel shipments instantly.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Order ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WSH-84920"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Email / Phone
                  </label>
                  <input
                    type="text"
                    placeholder="Email or Phone number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                  />
                </div>
              </div>
              <button className="bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors w-full md:w-auto">
                Find Order
              </button>
            </div>
          </section>

          {/* 5. CONTACT SUPPORT */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Support
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {CONTACT_CHANNELS.map((channel, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col h-full"
                >
                  <channel.icon size={24} className="text-gray-900 mb-4" />
                  <h3 className="font-bold text-gray-900 mb-1">
                    {channel.title}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 mb-3">
                    {channel.time}
                  </p>
                  <p className="text-sm text-gray-500 mb-4 flex-grow">
                    {channel.desc}
                  </p>
                  <button className="text-sm font-semibold text-gray-900 flex items-center gap-1 hover:text-blue-600 transition-colors mt-auto">
                    Connect <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-8">
          {/* 6. SYSTEM STATUS */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Platform Status</h3>
            <div className="space-y-4">
              {SYSTEM_STATUS.map((sys, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {sys.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                      {sys.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-50 text-xs text-gray-400 flex justify-between items-center">
              <span>Last updated: Just now</span>
              <button className="hover:text-gray-600 transition-colors">
                View history
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-2">
              Need Enterprise SLA?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Dedicated account management and 24/7 priority operations support
              for Woosho Plus merchants.
            </p>
            <button className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors">
              Learn about Plus <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
