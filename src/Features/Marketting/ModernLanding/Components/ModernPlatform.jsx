import { memo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Target, Search, BarChart3, Fingerprint } from 'lucide-react';
import neuralImg from '../../../../assets/marketing/neural-preview.png';
import { PLATFORM_CONTENT } from '../Data/platformContent';

const BentoCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    viewport={{ once: true, margin: "-100px" }}
    className={`relative overflow-hidden rounded-[32px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1E]/80 backdrop-blur-xl group hover:border-blue-500/30 transition-colors ${className}`}
  >
    {children}
  </motion.div>
);

const ModernPlatform = memo(function ModernPlatform() {
  return (
    <section className="py-32 bg-white dark:bg-[#0E0E10] transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-blue-600 font-bold tracking-widest text-xs uppercase"
          >
            {PLATFORM_CONTENT.eyebrow}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mt-4 mb-6 text-gray-900 dark:text-white leading-tight tracking-tight"
          >
            {PLATFORM_CONTENT.heading.lineOne} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{PLATFORM_CONTENT.heading.highlight}</span>
          </motion.h2>
          <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl mx-auto">
            {PLATFORM_CONTENT.description}
          </p>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 md:auto-rows-[400px]">
          
          {/* Main Large Card */}
          <BentoCard className="md:col-span-2 flex flex-col gap-8 p-8 sm:p-10 md:p-12 md:flex-row md:items-center shadow-2xl shadow-blue-500/5">
            <div className="flex-1 space-y-6 z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
                <Target className="text-blue-600" size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{PLATFORM_CONTENT.intent.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {PLATFORM_CONTENT.intent.body}
              </p>
            </div>
            <div className="flex-1 relative w-full min-h-[220px] md:h-full rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/50">
               {/* Abstract Mock UI */}
               <div className="absolute inset-0 p-4 sm:p-6 flex flex-col gap-4">
                  <div className="w-full h-12 rounded-full bg-white dark:bg-[#2C2C30] border border-gray-200 dark:border-white/10 flex items-center px-4 gap-3 shadow-sm">
                     <Search size={18} className="text-gray-400 flex-shrink-0"/>
                     <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/10 rounded overflow-hidden">
                        <motion.div 
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="h-full w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
                        />
                     </div>
                  </div>
                  <div className="flex gap-4 flex-1 min-h-0">
                    <div className="flex-1 rounded-xl bg-white/50 dark:bg-[#2C2C30]/50 border border-gray-200/50 dark:border-white/5" />
                    <div className="flex-1 rounded-xl bg-white/50 dark:bg-[#2C2C30]/50 border border-gray-200/50 dark:border-white/5" />
                  </div>
               </div>
            </div>
          </BentoCard>

          {/* Small Card 1 */}
          <BentoCard delay={0.1} className="md:col-span-1 p-10 flex flex-col justify-between shadow-xl shadow-purple-500/5 bg-gradient-to-br from-white to-gray-50 dark:from-[#1A1A1E] dark:to-[#131315]">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center border border-purple-200 dark:border-purple-500/20">
                <Cpu className="text-purple-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{PLATFORM_CONTENT.neural.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {PLATFORM_CONTENT.neural.body}
              </p>
            </div>
            
            <motion.div 
              className="mt-8 flex items-end gap-2 h-20 opacity-80"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
            >
               {PLATFORM_CONTENT.neural.bars.map((h, i) => (
                 <motion.div 
                    key={i}
                    variants={{
                      hidden: { height: 0 },
                      visible: { height: `${h}%`, transition: { type: "spring", bounce: 0.4 } }
                    }}
                    className="flex-1 bg-purple-500/20 rounded-t-sm border-t border-purple-500/50"
                 />
               ))}
            </motion.div>
          </BentoCard>

          {/* Small Card 2 */}
          <BentoCard delay={0.2} className="md:col-span-1 p-10 flex flex-col justify-between shadow-xl shadow-amber-500/5">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
                <Zap className="text-amber-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{PLATFORM_CONTENT.matching.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {PLATFORM_CONTENT.matching.body}
              </p>
            </div>
            <div className="mt-8 relative h-24 overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                 className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(245,158,11,0.4)_360deg)] mix-blend-screen"
               />
               <div className="absolute inset-[2px] bg-white dark:bg-[#1A1A1E] rounded-xl flex items-center justify-center z-10">
                  <Fingerprint size={40} className="text-amber-500/50" />
               </div>
            </div>
          </BentoCard>

          {/* Medium Card (Image) */}
          <BentoCard delay={0.3} className="md:col-span-2 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img 
              src={neuralImg} 
              alt="Neural Engine Interface" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 w-full p-10 z-20 flex justify-between items-end">
               <div>
                  <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{PLATFORM_CONTENT.analytics.title}</h3>
                  <p className="text-gray-300 max-w-md">{PLATFORM_CONTENT.analytics.body}</p>
               </div>
               <div className="hidden md:flex items-center gap-3 glass-card px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                 <span className="text-white text-sm font-bold">{PLATFORM_CONTENT.analytics.status}</span>
               </div>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
});

export default ModernPlatform;
