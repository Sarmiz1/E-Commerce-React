import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

// ─── Seller Stats — animated number counters + social proof ──────────────────
function SellerStats() {
  const ref = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll(".se-ss-item");
      if (items.length) {
        gsap.fromTo(items,
          { scale: 0.7, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.1, duration: 0.75, ease: "back.out(2)", clearProps: "all",
            scrollTrigger: {
              trigger: el, start: "top 82%", once: true,
              onEnter: () => setAnimated(true),
            } });
      }
      const quotes = el.querySelectorAll(".se-ss-quote");
      if (quotes.length) {
        gsap.fromTo(quotes,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.15, duration: 0.85, ease: "power3.out", clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 78%", once: true } });
      }
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const metrics = [
    { end: 48000, suffix: "+", label: "Active Sellers", icon: "🏪", color: "from-blue-400 to-indigo-500" },
    { end: 2,     suffix: "M+", label: "Buyers Reached", icon: "👥", color: "from-violet-400 to-purple-500" },
    { end: 94,    suffix: "%",  label: "Seller Retention Rate", icon: "🔄", color: "from-emerald-400 to-teal-500" },
    { end: 72,    suffix: "h",  label: "Avg. First Sale Time", icon: "⚡", color: "from-amber-400 to-orange-500" },
    { end: 340,   suffix: "%",  label: "Avg. Revenue Increase YoY", icon: "📈", color: "from-rose-400 to-pink-500" },
    { end: 4.9,   suffix: "★",  label: "Avg. Seller Rating", icon: "⭐", color: "from-yellow-400 to-amber-500" },
  ];

  // Simple animated counter hook
  function AnimatedNumber({ end, suffix, active }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
      if (!active) return;
      const isDecimal = end < 10;
      const duration = 1500;
      const start = Date.now();
      const tick = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = isDecimal ? (end * eased).toFixed(1) : Math.round(end * eased);
        setVal(current);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, [active, end]);
    return <>{val}{suffix}</>;
  }

  const sellerQuotes = [
    { quote: "I went from 0 to $12,000/month in my first 3 months. The buyer reach is insane.", name: "Tunde A.", role: "Fashion Seller · Lagos", avatar: "T" },
    { quote: "The dashboard shows me exactly what's working. I've tripled my revenue in 6 months.", name: "Sarah Chen", role: "Electronics Reseller · Dubai", avatar: "S" },
    { quote: "Zero fees to start, and their seller support team actually responds in 10 minutes.", name: "Marco R.", role: "Artisan Goods · Milan", avatar: "M" },
  ];

  return (
    <section
      ref={ref}
      className="py-24 bg-gray-50 relative overflow-hidden"
    >
      {/* Subtle wave divider top */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden -mt-1">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,32 C360,64 1080,0 1440,32 L1440,0 L0,0 Z" fill="#0d0d22" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500 mb-3">The Numbers Speak</p>
          <h2 className="text-4xl font-black text-gray-900">Proven Results for Real Sellers</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">These aren't projections. This is what our sellers actually achieve.</p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-20">
          {metrics.map((m) => (
            <div key={m.label} className="se-ss-item group bg-white rounded-3xl p-7 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center border border-gray-100">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{m.icon}</div>
              <p className={`text-4xl font-black bg-gradient-to-r ${m.color} bg-clip-text text-transparent leading-tight`}>
                <AnimatedNumber end={m.end} suffix={m.suffix} active={animated} />
              </p>
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-2 leading-relaxed">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Seller testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {sellerQuotes.map((q) => (
            <motion.div key={q.name}
              whileHover={{ y: -6 }}
              className="se-ss-quote bg-white rounded-3xl p-7 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array(5).fill(0).map((_, i) => <span key={i} className="text-yellow-400 text-base">★</span>)}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">"{q.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {q.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{q.name}</p>
                  <p className="text-gray-400 text-xs">{q.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


export default SellerStats
