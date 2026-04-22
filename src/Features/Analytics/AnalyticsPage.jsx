import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Brain,
  TrendingUp,
  Search,
  Zap,
  ArrowRight,
  BarChart3,
  Users,
  RefreshCcw,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { useTheme } from "../../Context/theme/ThemeContext";
import ModernNavbar from "../../Components/ModernNavbar";

gsap.registerPlugin(ScrollTrigger);

export default function AnalyticsPage() {
  const mainRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal-up").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });
      gsap.fromTo(
        ".stat-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: "#ai-metrics", start: "top 80%" },
        },
      );
    }, mainRef);
    return () => ctx.revert();
  }, []);

  const bg = isDark ? "#050505" : "#f8fafc";
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textMuted = isDark ? "#6b7280" : "#64748b";
  const cardBg = isDark ? "rgba(39,39,42,0.5)" : "rgba(255,255,255,0.8)";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const sectionBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)";

  return (
    <div
      ref={mainRef}
      className="min-h-screen selection:bg-blue-600/30"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: bg,
        color: textPrimary,
      }}
    >
      <ModernNavbar
        navLinks={[
          { label: "Shop", href: "/products" },
          { label: "Brands", href: "/brands" },
          { label: "Sellers", href: "/seller" },
          { label: "Infrastructure", href: "/analytics" },
        ]}
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 min-h-[60vh] flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-500 font-semibold text-sm mb-8"
          >
            <Brain size={16} /> Woosho Intelligence API
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8"
          >
            Commerce Optimized by <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
              Intelligence.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Woosho leverages AI to improve product discovery, conversion rates,
            and marketplace performance. We are building the intelligence layer
            for African commerce.
          </motion.p>
        </div>
      </section>

      {/* 2. AI IMPACT METRICS */}
      <section
        id="ai-metrics"
        className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5"
      >
        <div className="mb-16">
          <h2 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-4">
            The AI Advantage
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white max-w-2xl">
            Measurable improvements across the entire funnel.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: TrendingUp,
              label: "Conversion Rate",
              value: "+27%",
              sub: "AI-assisted vs standard sessions",
            },
            {
              icon: Search,
              label: "Product Search Time",
              value: "-32%",
              sub: "Faster discovery through NLP",
            },
            {
              icon: DollarSign,
              label: "Average Order Value",
              value: "+18%",
              sub: "Driven by smart cross-selling",
            },
            {
              icon: Zap,
              label: "AI Search Engagement",
              value: "42%",
              sub: "Users actively utilizing AI filters",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="stat-card bg-zinc-900/50 border border-white/5 p-8 rounded-3xl hover:bg-zinc-900 transition-colors"
            >
              <stat.icon size={24} className="text-blue-500 mb-6" />
              <div className="text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="font-semibold text-gray-300 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DISCOVERY EFFICIENCY */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="reveal-up bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/20 rounded-[3rem] p-10 md:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-16 relative z-10">
            <div>
              <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">
                Frictionless Discovery
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                Less searching.
                <br />
                More purchasing.
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Traditional marketplaces rely on endless scrolling and rigid
                catalog filters. Our Neural Engine anticipates intent,
                drastically reducing the friction between desire and checkout.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-8">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                <div className="text-sm text-gray-400 mb-2 font-medium">
                  Before Woosho AI
                </div>
                <div className="flex items-end gap-4">
                  <div className="text-5xl font-bold text-gray-500">14</div>
                  <div className="text-gray-500 pb-1">
                    product views before purchase
                  </div>
                </div>
              </div>
              <div className="bg-blue-600/10 backdrop-blur-md border border-blue-500/30 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <div className="text-sm text-blue-400 mb-2 font-medium">
                  With Woosho AI
                </div>
                <div className="flex items-end gap-4">
                  <div className="text-5xl font-bold text-white">6</div>
                  <div className="text-gray-300 pb-1">
                    product views before purchase
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE PLATFORM METRICS */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="reveal-up mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Platform Growth
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Strong underlying marketplace fundamentals powered by our
            intelligent infrastructure.
          </p>
        </div>

        <div className="reveal-up grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          {[
            {
              icon: Users,
              label: "Monthly Active Users",
              val: "1.2M",
              growth: "+14% MoM",
            },
            {
              icon: BarChart3,
              label: "Annualized GMV",
              val: "$45M",
              growth: "+22% MoM",
            },
            {
              icon: ShoppingCart,
              label: "Orders / Month",
              val: "320k",
              growth: "+18% MoM",
            },
            {
              icon: RefreshCcw,
              label: "Repeat Purchase Rate",
              val: "68%",
              growth: "+5% MoM",
            },
          ].map((m, i) => (
            <div
              key={i}
              className="text-center border-l border-white/10 pl-6 first:border-0 md:first:pl-0"
            >
              <div className="flex justify-center mb-4">
                <m.icon size={24} className="text-gray-500" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">{m.val}</div>
              <div className="text-sm font-semibold text-gray-300 mb-1">
                {m.label}
              </div>
              <div className="text-xs text-green-400 font-medium">
                {m.growth}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MARKET POSITIONING & SCALABILITY */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="reveal-up">
            <h3 className="text-2xl font-bold text-white mb-6">
              The Infrastructure Evolution
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg mb-6">
              E-commerce in Nigeria remains largely catalog-based. Woosho
              introduces intelligent filtering and decision assistance to reduce
              friction in high-choice environments.
            </p>
            <p className="text-gray-400 leading-relaxed text-lg">
              We are not just building a storefront. We are deploying a
              proprietary technology layer that powers smarter commerce
              decisions at scale.
            </p>
          </div>

          <div className="reveal-up bg-zinc-900/50 border border-white/5 p-10 rounded-3xl">
            <h3 className="text-2xl font-bold text-white mb-6">
              The Intelligence Flywheel
            </h3>
            <ul className="space-y-6">
              {[
                "1. Vendor onboarding increases data density.",
                "2. AI model improves with broader marketplace data.",
                "3. Personalization accuracy rises, driving up conversion.",
                "4. Higher GMV attracts more premium brands.",
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="text-gray-300 font-medium pt-1">
                    {step.split(". ")[1]}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Build on the future of commerce.
        </h2>
        <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
          Partner With Woosho
        </button>
      </section>
    </div>
  );
}
