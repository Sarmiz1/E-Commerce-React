import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

// ─── Seller How to Start — timeline steps + final CTA ────────────────────────
function SellerHowToStart() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => {
      const line  = el.querySelector(".se-shs-line");
      const steps = el.querySelectorAll(".se-shs-step");
      const cta   = el.querySelector(".se-shs-cta");

      if (line)
        gsap.fromTo(line,
          { scaleY: 0 },
          { scaleY: 1, duration: 1.4, ease: "power3.out", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 78%", once: true } });

      if (steps.length)
        gsap.fromTo(steps,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.18, duration: 0.85, ease: "power3.out", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 78%", once: true } });

      if (cta)
        gsap.fromTo(cta,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 60%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const steps = [
    {
      num: "01",
      icon: "📝",
      title: "Create Your Seller Account",
      desc: "Sign up in 3 minutes. Just your name, email, and bank details for payouts. No credit card required.",
      time: "3 mins",
      color: "from-blue-500 to-indigo-600",
    },
    {
      num: "02",
      icon: "📸",
      title: "List Your First Product",
      desc: "Upload photos, add a description, set your price. Our AI auto-suggests the best category and tags to maximise discovery.",
      time: "10 mins",
      color: "from-indigo-500 to-violet-600",
    },
    {
      num: "03",
      icon: "🚀",
      title: "Go Live & Get Found",
      desc: "Your listing goes live instantly across the platform, email campaigns, and recommendation feeds to 2M+ buyers.",
      time: "Instant",
      color: "from-violet-500 to-purple-600",
    },
    {
      num: "04",
      icon: "💰",
      title: "Sell & Get Paid",
      desc: "Orders come in, you fulfil them. We handle payments, fraud protection, and currency conversion. Payout every Wednesday.",
      time: "Weekly",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "Free",
      sub: "forever",
      highlight: false,
      perks: ["Unlimited listings", "8% commission per sale", "Basic analytics", "Email support", "Standard reach"],
    },
    {
      name: "Growth",
      price: "$29",
      sub: "/ month",
      highlight: true,
      badge: "Most Popular",
      perks: ["Everything in Starter", "5% commission per sale", "Advanced analytics", "Priority support 24/7", "Boosted placement", "Early access to features"],
    },
    {
      name: "Pro",
      price: "$99",
      sub: "/ month",
      highlight: false,
      perks: ["Everything in Growth", "3% commission per sale", "Dedicated account manager", "Custom storefront branding", "API access", "Bulk listing tools"],
    },
  ];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f4ff 50%,#f8fafc 100%)" }}
    >
      {/* Steps */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500 mb-3">Getting Started</p>
          <h2 className="text-4xl font-black text-gray-900">From Sign-Up to First Sale</h2>
          <p className="text-gray-500 mt-4">Four steps. Zero friction. Real revenue.</p>
        </div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 overflow-hidden">
            <div className="se-shs-line h-full w-full bg-gradient-to-b from-blue-400 via-indigo-400 to-emerald-400 origin-top" />
          </div>

          <div className="space-y-12">
            {steps.map((step, i) => {
              const isRight = i % 2 !== 0;
              return (
                <div key={step.num}
                  className={`se-shs-step relative flex items-center gap-8 ${isRight ? "md:flex-row-reverse" : "md:flex-row"} flex-row`}>
                  {/* Step card */}
                  <div className={`flex-1 ${isRight ? "md:text-right" : ""}`}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="bg-white rounded-3xl p-7 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 ml-12 md:ml-0"
                    >
                      <div className={`flex items-center gap-3 mb-4 ${isRight ? "md:justify-end" : ""}`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r ${step.color} text-white`}>
                          {step.num}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">⏱ {step.time}</span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                    </motion.div>
                  </div>

                  {/* Centre node */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-xl shadow-xl z-10 flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, var(--g1, #3b82f6), var(--g2, #6366f1))` }}
                  >
                    {step.icon}
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="flex-1 hidden md:block" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing tiers */}
      <div className="bg-gray-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400 mb-3">Flexible Pricing</p>
            <h2 className="text-4xl font-black text-white">Pick Your Plan. Scale at Any Time.</h2>
            <p className="text-gray-400 mt-4">All plans include zero setup fees and a 30-day money-back guarantee.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div key={plan.name}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? "bg-gradient-to-br from-indigo-600 to-blue-700 shadow-2xl shadow-indigo-500/30 border border-indigo-400/30"
                    : "bg-white/5 border border-white/10 hover:bg-white/8"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.highlight ? "text-indigo-200" : "text-gray-400"}`}>{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black ${plan.highlight ? "text-white" : "text-white"}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? "text-indigo-200" : "text-gray-500"}`}>{plan.sub}</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-indigo-200" : "text-indigo-400"}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${plan.highlight ? "text-indigo-100" : "text-gray-400"}`}>{p}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full font-black py-3.5 rounded-2xl text-sm transition-all ${
                    plan.highlight
                      ? "bg-white text-indigo-700 shadow-lg hover:shadow-xl"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                  }`}
                >
                  {plan.price === "Free" ? "Start Free →" : `Get ${plan.name} →`}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="se-shs-cta relative overflow-hidden py-28"
        style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#0f0c29 50%,#1a0533 100%)" }}>

        {/* Animated gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { s: 400, top: "-20%", left: "-5%",  c: "rgba(99,102,241,0.2)" },
            { s: 350, bottom: "-20%", right: "-5%", c: "rgba(139,92,246,0.15)" },
          ].map((o, i) => (
            <div key={i}
              style={{ width: o.s, height: o.s, top: o.top, left: o.left, right: o.right, bottom: o.bottom,
                background: o.c, animationDelay: `${i * 4}s`, animationDuration: "20s" }}
              className="absolute rounded-full blur-3xl se-float-orb" />
          ))}
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">Ready to Start?</p>
          <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
            Your First Sale Is<br />
            <span className="se-shimmer">Closer Than You Think</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Join 48,000+ sellers already earning on WooSho. Free forever to start.
            No credit card. No contracts. Just results.
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              "✅ Free to start",
              "⚡ Live in 48 hours",
              "🔒 Secure payments",
              "💰 Weekly payouts",
              "🌍 Global reach",
            ].map((t) => (
              <span key={t} className="px-4 py-2 rounded-full bg-white/8 border border-white/15 text-white/70 text-xs font-semibold backdrop-blur-sm">
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 50px rgba(99,102,241,0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-black px-12 py-5 rounded-2xl text-lg shadow-2xl shadow-indigo-500/30"
            >
              Start Selling Free Today →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="border border-white/20 text-white/80 hover:text-white px-10 py-5 rounded-2xl font-semibold hover:bg-white/8 transition backdrop-blur-sm"
            >
              Talk to Seller Support
            </motion.button>
          </div>

          <p className="text-gray-600 text-xs mt-6">
            30-day money-back guarantee on paid plans · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

export default SellerHowToStart
