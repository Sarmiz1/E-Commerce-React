import { memo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Target } from 'lucide-react';
import neuralImg from '../../../../assets/marketing/neural-preview.png';

const ModernPlatform = memo(function ModernPlatform() {
  const features = [
    {
      title: "Intent Mapping",
      desc: "Buy and sell based on needs, not just keywords. Our AI understands naturally spoken requests.",
      icon: <Target className="text-blue-600" />
    },
    {
      title: "Neural Analysis",
      desc: "Every product choice is backed by deep behavioral analysis to ensure it fits your lifestyle.",
      icon: <Cpu className="text-blue-500" />
    },
    {
      title: "The Perfect Match",
      desc: "We connect the right buyer to the right seller instantly, maximizing conversion and satisfaction.",
      icon: <Zap className="text-amber-500" />
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0E0E10] transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
        
        {/* TEXT CONTENT */}
        <div>
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-blue-600 font-bold tracking-widest text-xs uppercase"
          >
            Built for the Future
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mt-4 mb-12 text-gray-900 dark:text-white leading-tight"
          >
            One Intelligent Platform.
          </motion.h2>

          <div className="space-y-12">
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* MOCKUP / GRAPHIC */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative z-10 p-4 bg-gray-100 dark:bg-[#19191C] rounded-[48px] border-[8px] border-white dark:border-[#2C2C30] shadow-2xl">
            <img 
              src={neuralImg} 
              alt="Neural Matching Engine" 
              className="rounded-[36px] w-full"
            />
            
            {/* Overlay Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute top-1/4 -left-12 glass-card p-4 rounded-2xl shadow-xl border-l-[4px] border-blue-600"
            >
              <p className="text-[10px] uppercase font-bold text-blue-600">Prediction</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">99% Match Rate</p>
            </motion.div>

            <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ repeat: Infinity, duration: 5, delay: 1 }}
               className="absolute bottom-1/4 -right-8 glass-card p-4 rounded-2xl shadow-xl border-r-[4px] border-green-500"
            >
              <p className="text-[10px] uppercase font-bold text-green-500">Inventory</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Optimized Yield</p>
            </motion.div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 dark:bg-blue-600/5 blur-[100px] -z-10 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
});

export default ModernPlatform;
