import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FloatingOrbs from "./FloatingOrbs";



gsap.registerPlugin(ScrollTrigger);


function BentoPerks() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const cards = el.querySelectorAll(".se-bc"); if (!cards.length) return;
      gsap.fromTo(cards, { y: 50, scale: 0.93, opacity: 0 }, { y: 0, scale: 1, opacity: 1, stagger: { amount: 0.55, from: "start" }, duration: 0.75, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px 200px" }} />
      <FloatingOrbs dark />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Everything You Need</p>
        <h3 className="text-4xl font-black text-center text-white mb-14">Built for Shoppers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ gridTemplateRows: "180px 180px" }}>
          <div className="se-bc col-span-2 row-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group cursor-default">
            <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-6xl relative z-10">🌍</span>
            <div className="relative z-10"><h4 className="text-2xl font-black text-white mb-2">Ship Worldwide</h4><p className="text-blue-200 text-sm leading-relaxed">Deliver to 180+ countries with real-time tracking on every order.</p></div>
          </div>
          {[
            { icon: "⚡", title: "Same-Day", desc: "Order by 2pm", bg: "from-amber-500 to-orange-600" },
            { icon: "🔐", title: "Safe Pay", desc: "256-bit encryption", bg: "from-emerald-500 to-teal-600" },
            { icon: "🎁", title: "Gift Wrap", desc: "Free on orders $50+", bg: "from-rose-500 to-pink-600" },
            { icon: "💬", title: "24/7 Chat", desc: "Real human support", bg: "from-violet-500 to-purple-600" },
          ].map((c) => (
            <div key={c.title} className={`se-bc bg-gradient-to-br ${c.bg} rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group cursor-default`}>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
              <span className="text-3xl">{c.icon}</span>
              <div><h4 className="font-black text-white text-sm">{c.title}</h4><p className="text-white/70 text-xs mt-0.5">{c.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BentoPerks
