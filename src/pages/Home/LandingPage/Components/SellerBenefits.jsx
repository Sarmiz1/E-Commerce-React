// ─── Seller Benefits — alternating split layout ───────────────────────────────
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

function SellerBenefits() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => {
      const rows = el.querySelectorAll(".se-sb-row");
      rows.forEach((row) => {
        const left  = row.querySelector(".se-sb-left");
        const right = row.querySelector(".se-sb-right");
        const isEven = row.dataset.even === "true";
        if (left)
          gsap.fromTo(left,
            { x: isEven ? -70 : 70, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all",
              scrollTrigger: { trigger: row, start: "top 82%", once: true } });
        if (right)
          gsap.fromTo(right,
            { x: isEven ? 70 : -70, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all",
              scrollTrigger: { trigger: row, start: "top 82%", once: true } });
      });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const benefits = [
    {
      tag: "Zero Barriers",
      icon: "🎁",
      title: "List for Free. Earn from Day One.",
      desc: "No monthly fees. No listing fees. No setup costs. Create your store in 10 minutes and start earning immediately. We only earn when you do — our commission model means your success is literally our business.",
      points: ["No upfront costs, ever", "Instant store activation", "List unlimited products", "Keep 92% of every sale"],
      visual: {
        type: "fee-compare",
        items: [
          { label: "ShopEase",   fee: "0%",   color: "from-emerald-400 to-teal-500",  width: "8%" },
          { label: "Amazon",     fee: "15%",  color: "from-orange-400 to-red-500",    width: "45%" },
          { label: "Etsy",       fee: "6.5%", color: "from-yellow-400 to-orange-400", width: "25%" },
          { label: "Shopify",    fee: "~$79", color: "from-gray-400 to-gray-600",     width: "62%" },
        ],
      },
      gradient: "from-emerald-500/10 to-teal-500/5",
      accent: "emerald",
    },
    {
      tag: "Massive Reach",
      icon: "🌍",
      title: "2 Million Buyers. All Yours.",
      desc: "Stop chasing customers. On ShopEase, they're already here. Our 2M+ active buyers browse daily with credit on file and one-tap checkout. Your products get discovered through our AI-powered recommendation engine.",
      points: ["AI product recommendations", "SEO-optimised storefronts", "Targeted email campaigns", "Social media amplification"],
      visual: {
        type: "reach-map",
        regions: ["🌎 Americas · 680K", "🌍 Europe · 520K", "🌏 Asia & Africa · 800K"],
      },
      gradient: "from-blue-500/10 to-indigo-500/5",
      accent: "blue",
    },
    {
      tag: "Seller Tools",
      icon: "⚡",
      title: "A Dashboard Built for Growth.",
      desc: "Real-time analytics, inventory alerts, automated order management, and one-click payouts. Everything you need to scale from your first sale to your first million — in one place, no tech skills needed.",
      points: ["Live sales dashboard", "Automated fulfilment alerts", "Weekly payout to any bank", "24/7 seller support chat"],
      visual: {
        type: "dashboard-preview",
      },
      gradient: "from-violet-500/10 to-purple-500/5",
      accent: "violet",
    },
  ];

  const accentColors = {
    emerald: { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", check: "bg-emerald-500", bar: "bg-gradient-to-r from-emerald-400 to-teal-400" },
    blue:    { badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",          check: "bg-blue-500",    bar: "bg-gradient-to-r from-blue-400 to-indigo-400" },
    violet:  { badge: "bg-violet-500/15 text-violet-400 border-violet-500/30",    check: "bg-violet-500",  bar: "bg-gradient-to-r from-violet-400 to-purple-400" },
  };

  return (
    <section
      ref={ref}
      className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0a0a1a 0%,#0d0d22 100%)" }}
    >
      {/* Subtle horizontal rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 space-y-28">
        {/* Section label */}
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400 mb-3">Why Sellers Choose Us</p>
          <h2 className="text-4xl font-black text-white">Every Advantage. One Platform.</h2>
        </div>

        {benefits.map((b, i) => {
          const isEven = i % 2 === 0;
          const colors = accentColors[b.accent];
          return (
            <div key={b.title}
              data-even={String(isEven)}
              className={`se-sb-row grid md:grid-cols-2 gap-12 md:gap-20 items-center`}>

              {/* Text side */}
              <div className={`se-sb-${isEven ? "left" : "right"} ${!isEven ? "md:order-2" : ""} space-y-6`}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-[0.25em] px-3 py-1.5 rounded-full border ${colors.badge}`}>
                    {b.tag}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">{b.title}</h3>
                <p className="text-gray-400 text-base leading-relaxed">{b.desc}</p>
                <ul className="space-y-3">
                  {b.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-3 text-gray-300 text-sm font-medium">
                      <span className={`w-5 h-5 rounded-full ${colors.check} flex items-center justify-center flex-shrink-0`}>
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.04, x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`inline-flex items-center gap-2 ${colors.badge.split(" ").slice(0,2).join(" ")} border ${colors.badge.split(" ")[2]} text-sm font-bold px-5 py-3 rounded-2xl backdrop-blur-sm hover:brightness-110 transition`}
                >
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>

              {/* Visual side */}
              <div className={`se-sb-${isEven ? "right" : "left"} ${!isEven ? "md:order-1" : ""}`}>
                <div className={`relative rounded-3xl p-7 border border-white/8 bg-gradient-to-br ${b.gradient} backdrop-blur-sm overflow-hidden`}>

                  {/* Noise grain */}
                  <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

                  <div className="relative z-10 text-3xl mb-5">{b.icon}</div>

                  {/* Fee comparison visual */}
                  {b.visual.type === "fee-compare" && (
                    <div className="relative z-10 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Platform fee comparison</p>
                      {b.visual.items.map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className={`text-xs font-bold w-20 flex-shrink-0 ${item.label === "ShopEase" ? "text-white" : "text-gray-500"}`}>
                            {item.label}
                          </span>
                          <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: item.width }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.2, ease: "power2.out" }}
                              className={`h-full rounded-full bg-gradient-to-r ${item.color} ${item.label === "ShopEase" ? "opacity-100" : "opacity-50"}`}
                            />
                          </div>
                          <span className={`text-xs font-black w-10 text-right flex-shrink-0 ${item.label === "ShopEase" ? "text-emerald-400" : "text-gray-500"}`}>
                            {item.fee}
                          </span>
                        </div>
                      ))}
                      <p className="text-[10px] text-gray-600 mt-3">*ShopEase charges 8% commission only when you sell. No monthly fee.</p>
                    </div>
                  )}

                  {/* Reach map visual */}
                  {b.visual.type === "reach-map" && (
                    <div className="relative z-10 space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Buyer distribution</p>
                      {b.visual.regions.map((r, ri) => (
                        <div key={r} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/8">
                          <span className="text-2xl">{r.split(" ")[0]}</span>
                          <span className="text-sm text-gray-300 font-medium">{r.split(" ").slice(1).join(" ")}</span>
                        </div>
                      ))}
                      <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <p className="text-xs text-blue-300 font-bold">📈 +340K new buyers joined this quarter</p>
                      </div>
                    </div>
                  )}

                  {/* Dashboard preview visual */}
                  {b.visual.type === "dashboard-preview" && (
                    <div className="relative z-10 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Your seller dashboard</p>
                      {/* Mock metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Revenue Today", value: "$1,247", trend: "+12%", up: true },
                          { label: "Orders",        value: "38",      trend: "+5",   up: true },
                          { label: "Avg Rating",    value: "4.9★",    trend: "",     up: true },
                          { label: "Payout Due",    value: "$3,820",  trend: "Wed",  up: true },
                        ].map((m) => (
                          <div key={m.label} className="bg-white/5 rounded-xl p-3 border border-white/8">
                            <p className="text-[10px] text-gray-500 mb-1">{m.label}</p>
                            <p className="text-white font-black text-lg leading-tight">{m.value}</p>
                            {m.trend && <p className={`text-[10px] font-bold ${m.up ? "text-emerald-400" : "text-red-400"}`}>{m.trend}</p>}
                          </div>
                        ))}
                      </div>
                      {/* Mini chart bars */}
                      <div className="flex items-end gap-1 h-12 mt-2 px-1">
                        {[40, 65, 50, 80, 60, 90, 75, 95, 70, 100, 85, 110].map((h, i) => (
                          <motion.div key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04, duration: 0.5, ease: "power2.out" }}
                            className="flex-1 rounded-sm bg-gradient-to-t from-violet-500 to-purple-400 opacity-60"
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-600 text-center">7-day revenue trend</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


export default SellerBenefits
