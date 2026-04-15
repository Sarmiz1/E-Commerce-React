import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);



function ComparisonTable() {
  const ref = useRef(null);
  const rows = [
    { feature: "Free Shipping", us: true, others: false },
    { feature: "30-Day Returns", us: true, others: true },
    { feature: "Same-Day Delivery", us: true, others: false },
    { feature: "24/7 Support", us: true, others: false },
    { feature: "Price Match Guarantee", us: true, others: false },
    { feature: "Member Rewards", us: true, others: true },
  ];
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const rowEls = el.querySelectorAll(".se-cr"); if (!rowEls.length) return;
      gsap.fromTo(rowEls, { x: -40, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.07, duration: 0.6, ease: "power2.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">See the Difference</p>
        <h3 className="text-4xl font-black text-center text-gray-900 mb-14">ShopEase vs The Rest</h3>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
            <p className="font-bold text-sm">Feature</p><p className="font-black text-center">ShopEase ✨</p><p className="font-medium text-center text-blue-200 text-sm">Others</p>
          </div>
          {rows.map((row, i) => (
            <div key={row.feature} className={`se-cr grid grid-cols-3 px-6 py-4 items-center border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-indigo-50/40 transition-colors duration-200`}>
              <p className="text-sm font-medium text-gray-700">{row.feature}</p>
              <div className="flex justify-center"><span className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">✓</span></div>
              <div className="flex justify-center">{row.others ? <span className="w-7 h-7 rounded-full bg-green-50 text-green-400 flex items-center justify-center text-sm">✓</span> : <span className="w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center text-sm font-bold">✕</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ComparisonTable
