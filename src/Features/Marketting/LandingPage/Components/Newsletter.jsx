import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";


gsap.registerPlugin(ScrollTrigger);


function Newsletter() {
  const ref = useRef(null);
  const [email, setEmail] = useState(""); const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => {
      const items = el.querySelectorAll(".se-nl"); if (!items.length) return;
      gsap.fromTo(items, { y: 45, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: el, start: "top 83%", once: true } });
    }, 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="se-nl text-5xl mb-5">✉️</div>
        <p className="se-nl text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Stay in the loop</p>
        <h3 className="se-nl text-4xl font-black text-gray-900 mb-4">Get Deals Before<br />Anyone Else</h3>
        <p className="se-nl text-gray-500 mb-10 leading-relaxed">Drop your email. We'll send you early access to sales, new arrivals, and exclusive member-only offers. No spam — ever.</p>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="se-nl flex flex-col sm:flex-row gap-3 justify-center">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 max-w-xs border-2 border-gray-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => email && setSubmitted(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/30 whitespace-nowrap">Subscribe Free →</motion.button>
            </motion.div>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
              <p className="font-bold text-gray-900 text-lg">You're in!</p>
              <p className="text-gray-500 text-sm">Check your inbox for a welcome gift 🎁</p>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="se-nl text-xs text-gray-400 mt-5">Trusted by 2M+ shoppers. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
export default Newsletter
