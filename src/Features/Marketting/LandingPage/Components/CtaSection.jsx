import { motion } from "framer-motion";
import ParticleField from "./ParticleField";

const CtaSection = () => {
  return (
    <section id="cta" className="relative py-32 overflow-hidden" style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 50%,#8b5cf6 100%)" }}>
      <ParticleField />
      <div className="absolute w-96 h-96 rounded-full bg-white/5 blur-3xl -top-20 -right-20" />
      <div className="absolute w-80 h-80 rounded-full bg-purple-400/20 blur-3xl -bottom-20 -left-20" />
      <div className="se-cc relative z-10 text-center text-white max-w-2xl mx-auto px-6">
        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">Join the Community</p>
        <h3 className="text-5xl font-black mb-6 leading-tight">Ready to Start<br />Shopping?</h3>
        <p className="text-blue-100 text-lg mb-10">Join over 2 million happy customers and discover your next favorite thing.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }} className="bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl text-lg shadow-2xl">Get Started Free</motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="border-2 border-white/40 text-white font-semibold px-10 py-4 rounded-2xl text-lg hover:bg-white/10 transition backdrop-blur-sm">Learn More</motion.button>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
