import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function ModernCTA() {
  return (
    <section className="py-24 bg-white dark:bg-[#0E0E10] transition-colors">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative rounded-[48px] bg-blue-600 p-12 md:p-20 text-center overflow-hidden shadow-[0_40px_100px_-20px_rgba(37,99,235,0.4)]"
        >
          {/* Background digital pattern */}
          <div className="absolute inset-0 opacity-10 bg-grid pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Experience <br className="hidden md:block" />
              Intelligent Commerce?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
                <span>Start Shopping</span>
                <Sparkles size={20} fill="currentColor" />
              </button>
              <button className="px-10 py-5 bg-blue-700/50 text-white font-bold rounded-2xl border border-white/20 hover:bg-blue-700/70 transition-all text-lg">
                Grow Your Sales
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function ModernFooter() {
  const links = {
    Marketplace: ["Browse", "Sellers", "Hot Deals", "Brands"],
    Company: ["About Us", "Sustainability", "Careers", "Press"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"]
  };

  return (
    <footer className="pt-24 pb-12 bg-white dark:bg-[#0E0E10] border-t border-gray-100 dark:border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2">
             <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="text-white fill-white" size={18} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Woo<span className="text-blue-600">sho</span>
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              Envisioning commerce that understands every individual path. Powered by AI, delivered with passion.
            </p>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6 underline decoration-blue-600/30 decoration-2 underline-offset-8">
                {title}
              </h4>
              <ul className="space-y-4">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-gray-100 dark:border-white/5 gap-6 text-sm text-gray-400">
          <p>© 2026 WOOSHO, THE INTEL DATA COMPANY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-blue-600 transition-colors">Twitter</a>
            <a href="#" className="hover:text-blue-600 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
