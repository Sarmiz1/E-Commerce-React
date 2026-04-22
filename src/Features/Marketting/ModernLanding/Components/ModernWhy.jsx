import { memo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
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

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────

const springFast = { type: "spring", stiffness: 80, damping: 18 };
const springSoft = { type: "spring", stiffness: 55, damping: 20 };
const springBounce = { type: "spring", stiffness: 120, damping: 14 };

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { ...springSoft, duration: 0.7 },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -48, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { ...springSoft },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 48, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { ...springSoft },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.075, delayChildren: 0.15 } },
};

const itemReveal = {
  hidden: { opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { ...springFast },
  },
};

// ─── PARTNERS DATA ────────────────────────────────────────────────────────────

const PARTNERS_ROW1 = [
  { name: "Stripe", accent: "#635BFF" },
  { name: "Paystack", accent: "#00C3F7" },
  { name: "Flutterwave", accent: "#F5A623" },
  { name: "GIG Logistics", accent: "#E63946" },
  { name: "Sendbox", accent: "#6C63FF" },
  { name: "DHL Express", accent: "#FFCC00" },
  { name: "Mastercard", accent: "#EB001B" },
  { name: "Google", accent: "#4285F4" },
];

const PARTNERS_ROW2 = [
  { name: "Visa", accent: "#1A1F71" },
  { name: "Shopify", accent: "#96BF48" },
  { name: "MTN Business", accent: "#FFC415" },
  { name: "UPS", accent: "#351C15" },
  { name: "Meta Business", accent: "#1877F2" },
  { name: "Anthropic", accent: "#D97757" },
  { name: "Zenith Bank", accent: "#880000" },
  { name: "Access Bank", accent: "#F07216" },
];

// ─── BENEFIT DATA ─────────────────────────────────────────────────────────────

const BENEFITS = [
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

const COLOR = {
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

// ─── MARQUEE STRIP ────────────────────────────────────────────────────────────

function PartnerLogo({ name, accent }) {
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

function MarqueeRow({ partners, reverse = false, paused = false }) {
  const doubled = [...partners, ...partners, ...partners];
  return (
    <div className="relative overflow-hidden w-full">
      {/* Left fade */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
        style={{
          background:
            "linear-gradient(to right, var(--marquee-fade), transparent)",
        }}
      />
      {/* Right fade */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
        style={{
          background:
            "linear-gradient(to left, var(--marquee-fade), transparent)",
        }}
      />

      <div
        className="flex items-center gap-1 w-max"
        style={{
          animation: `marquee${reverse ? "Rev" : "Fwd"} 38s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {doubled.map((p, i) => (
          <PartnerLogo key={`${p.name}-${i}`} name={p.name} accent={p.accent} />
        ))}
      </div>
    </div>
  );
}

// ─── BENEFIT ITEM ─────────────────────────────────────────────────────────────

function BenefitItem({ item, color }) {
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

// ─── BENEFIT CARD ─────────────────────────────────────────────────────────────

function BenefitCard({ group, side }) {
  const C = COLOR[group.color];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      ref={ref}
      variants={side === "left" ? fadeLeft : fadeRight}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      className="relative overflow-hidden rounded-[32px] transition-shadow duration-500"
      style={{
        background: "var(--card-bg)",
        border: `1px solid ${hov ? C.hex + "33" : "var(--card-border)"}`,
        boxShadow: hov
          ? `0 24px 64px -12px ${C.hex}28, 0 0 0 1px ${C.hex}18`
          : "0 4px 24px -4px rgba(0,0,0,0.08)",
        transition:
          "box-shadow 0.45s cubic-bezier(.4,0,.2,1), border-color 0.35s",
      }}
    >
      {/* Corner gradient orb */}
      <motion.div
        animate={{ opacity: hov ? 1 : 0.4, scale: hov ? 1.1 : 1 }}
        transition={{ duration: 0.5 }}
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${C.hex}18 0%, transparent 65%)`,
        }}
      />

      {/* Bottom glow streak */}
      <motion.div
        animate={{ opacity: hov ? 0.7 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${C.hex}88, transparent)`,
        }}
      />

      <div className="relative p-9 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <motion.div
            animate={{ scale: hov ? 1.05 : 1 }}
            transition={springFast}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide ${C.bg} ${C.text} ring-1 ${C.ring}`}
          >
            {group.badge}
          </motion.div>
          <h3 className={`text-xl font-black tracking-tight ${C.text}`}>
            {group.group}
          </h3>
        </div>

        {/* Items grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {group.items.map((item) => (
            <BenefitItem key={item.title} item={item} color={group.color} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── PARTNERS SECTION ─────────────────────────────────────────────────────────

function PartnersSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [paused, setPaused] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...springSoft, delay: 0.1 }}
      className="mt-28"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.3em" }}
          animate={inView ? { opacity: 1, letterSpacing: "0.15em" } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3"
        >
          Trusted Infrastructure
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...springFast, delay: 0.3 }}
          className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight"
        >
          Built on world-class partners
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-3 text-[15px] text-gray-500 dark:text-gray-400 max-w-md mx-auto"
        >
          Woo Sho integrates with the platforms your business already trusts —
          for payments, logistics, and beyond.
        </motion.p>
      </div>

      {/* Marquee wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ ...springSoft, delay: 0.5 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative rounded-3xl overflow-hidden py-2"
        style={{
          background: "var(--marquee-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        {/* Top edge fade for the entire block */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(99,91,255,0.3), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(52,211,153,0.3), transparent)",
          }}
        />

        <div className="flex flex-col gap-1 py-3">
          <MarqueeRow
            partners={PARTNERS_ROW1}
            reverse={false}
            paused={paused}
          />
          <MarqueeRow partners={PARTNERS_ROW2} reverse={true} paused={paused} />
        </div>

        {/* Pause hint */}
        <motion.div
          animate={{ opacity: paused ? 1 : 0, y: paused ? 0 : 4 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-2 right-4 text-[10px] font-bold text-gray-400 dark:text-gray-600 pointer-events-none"
        >
          Paused ∙ hover to explore
        </motion.div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { stat: "16+", label: "Integration Partners" },
          { stat: "99.9%", label: "Payment Uptime" },
          { stat: "₦2.4B", label: "GMV Processed" },
          { stat: "48hrs", label: "Average Payout Speed" },
        ].map(({ stat, label }) => (
          <motion.div
            key={label}
            variants={itemReveal}
            className="group text-center p-5 rounded-2xl transition-all duration-300 cursor-default"
            style={{
              background: "var(--stat-bg)",
              border: "1px solid var(--card-border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#635BFF44";
              e.currentTarget.style.background = "#635BFF09";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--card-border)";
              e.currentTarget.style.background = "var(--stat-bg)";
            }}
          >
            <div
              className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
            >
              {stat}
            </div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">
              {label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const ModernWhy = memo(function ModernWhy() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');

        @keyframes marqueeFwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes marqueeRev {
          from { transform: translateX(-33.333%); }
          to   { transform: translateX(0); }
        }

        :root {
          --card-bg:      #ffffff;
          --card-border:  rgba(0,0,0,0.07);
          --marquee-bg:   rgba(0,0,0,0.02);
          --marquee-fade: #f9fafb;
          --stat-bg:      rgba(0,0,0,0.02);
        }
        .dark {
          --card-bg:      #19191C;
          --card-border:  rgba(255,255,255,0.06);
          --marquee-bg:   rgba(255,255,255,0.02);
          --marquee-fade: #131315;
          --stat-bg:      rgba(255,255,255,0.03);
        }

        #why-woosho * { font-family: 'Sora', sans-serif; }
      `}</style>

      <section
        id="why-woosho"
        className="relative py-28 bg-gray-50 dark:bg-[#131315] overflow-hidden transition-colors duration-500"
      >
        {/* Ambient background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-48 -left-32 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20"
            style={{
              background:
                "radial-gradient(circle, #3B82F618 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute -bottom-48 -right-32 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20"
            style={{
              background:
                "radial-gradient(circle, #34D39918 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10 dark:opacity-5"
            style={{
              background:
                "radial-gradient(ellipse, #635BFF18 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* ── Section Header ────────────────────────────────── */}
          <div ref={titleRef} className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={titleInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ ...springBounce, delay: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6
                text-purple-600 dark:text-purple-400
                bg-purple-50 dark:bg-purple-500/10
                ring-1 ring-purple-200 dark:ring-purple-500/20"
            >
              <Zap size={12} strokeWidth={2.5} />
              The Woo Sho Advantage
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={
                titleInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}
              }
              transition={{ ...springSoft, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.08]"
            >
              Why Woo Sho{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
                  Works
                </span>
                {/* Underline sweep */}
                <motion.span
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={titleInView ? { scaleX: 1 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.65,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full block"
                  style={{
                    background:
                      "linear-gradient(to right, #3B82F6, #8B5CF6, #34D399)",
                    originX: 0,
                  }}
                />
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              The first platform built around the relationship between buyer and
              seller — with AI woven into every interaction on both sides.
            </motion.p>
          </div>

          {/* ── Benefit Cards ─────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-8">
            {BENEFITS.map((group, i) => (
              <BenefitCard
                key={group.group}
                group={group}
                side={i === 0 ? "left" : "right"}
              />
            ))}
          </div>

          {/* ── Partners ──────────────────────────────────────── */}
          <PartnersSection />
        </div>
      </section>
    </>
  );
});

export default ModernWhy;
