import { memo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NewsletterHeroBand from "../../../../Components/NewsletterHeroBand";

export const ModernCTA = memo(function ModernCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white dark:bg-[#0E0E10] transition-colors">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative rounded-[48px] bg-blue-600 p-12 md:p-20 text-center overflow-hidden shadow-[0_40px_100px_-20px_rgba(37,99,235,0.4)]"
        >
          <div className="absolute inset-0 opacity-10 bg-grid pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Experience <br className="hidden md:block" />
              Intelligent Commerce?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
                  onClick={() => navigate('/auth')}
                >
                <span>Start Shopping</span>
                <Sparkles size={20} fill="currentColor" />
              </button>
              <button 
                className="px-10 py-5 bg-blue-700/50 text-white font-bold rounded-2xl border border-white/20 hover:bg-blue-700/70 transition-all text-lg"
                onClick={() => navigate('/auth')}
                >
                Grow Your Sales
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});