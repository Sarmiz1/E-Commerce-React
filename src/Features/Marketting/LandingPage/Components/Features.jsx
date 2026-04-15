import { motion } from "framer-motion";
import FloatingOrbs from "./FloatingOrbs";

const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e40af 100%)" }} />
        <FloatingOrbs dark />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Why We're Different</p>
          <h3 className="text-4xl font-black text-white mb-16">Why Shop With Us?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[{ icon: "🚀", title: "Fast Delivery", desc: "Same-day shipping on thousands of items. Get your orders quickly and safely." }, { icon: "🔒", title: "Secure Payments", desc: "Bank-grade encryption on every transaction. Your data stays yours." }, { icon: "↩️", title: "Easy Returns", desc: "Hassle-free returns within 30 days. No questions, no drama." }].map((f, i) => (
              <motion.div key={i} whileHover={{ y: -8, scale: 1.02 }} className="se-fc bg-white/10 backdrop-blur-sm border border-white/20 p-10 rounded-3xl text-white hover:bg-white/15 transition-all duration-300">
                <div className="text-5xl mb-5">{f.icon}</div>
                <h4 className="font-bold text-xl mb-3">{f.title}</h4>
                <p className="text-indigo-200 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  )
}

export default Features
