import { memo } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, ArrowRight } from 'lucide-react';
import heroImg from '../../../../assets/marketing/hero-blur.png';

const ModernHero = memo(function ModernHero() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 overflow-hidden bg-white dark:bg-[#0E0E10]">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-400/10 dark:bg-blue-500/5 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4" />
      
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* TEXT CONTENT */}
        <div className="text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.9] text-gray-900 dark:text-white">
              Smarter <br />
              Shopping. <br />
              <span className="text-blue-600">Smarter </span>
              <span className="text-blue-600">Selling.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-8 text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed"
          >
            Woosho uses built-in AI to match the right products with the right people — instantly. Experience commerce that understands you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 flex items-center gap-2 group transition-all">
              <span>Start Shopping</span>
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ArrowRight size={20} />
              </motion.div>
            </button>
            
            <button className="px-8 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold rounded-2xl transition-all border border-transparent dark:border-white/10">
              Start Selling
            </button>
          </motion.div>

          {/* Social Proof / Tiny Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex items-center gap-6"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0E0E10] bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                   <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-bold text-gray-900 dark:text-white">Join 12,000+ users</p>
              <p className="text-gray-500 dark:text-gray-500">Already smarter commerce</p>
            </div>
          </motion.div>
        </div>

        {/* HERO IMAGE / AI SPHERE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1.2, 
            delay: 0.1, 
            ease: [0, 0.71, 0.2, 1.01] 
          }}
          className="relative flex justify-center items-center"
        >
          <div className="relative w-full aspect-square max-w-lg">
            {/* The actual AI Sphere Image */}
            <img 
              src={heroImg} 
              alt="Woosho AI" 
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_50px_rgba(37,99,235,0.3)]"
            />
            
            {/* Decorative background circle */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-blue-400/10 rounded-full blur-3xl animate-pulse" />
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0], x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -top-10 -right-4 glass-card p-4 rounded-2xl z-20 flex shadow-2xl"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                ₦
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Live Sale</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">₦48,500</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0], x: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 -left-10 glass-card p-4 rounded-2xl z-20 flex items-center gap-3 shadow-2xl"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <MousePointer2 size={16} />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">AI Matched</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-gray-400">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-blue-600 to-transparent" />
      </motion.div>
    </section>
  );
});

export default ModernHero;
