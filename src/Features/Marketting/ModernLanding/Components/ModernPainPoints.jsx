import { memo } from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { PAIN_POINTS } from '../Data/painPoints';

const ModernPainPoints = memo(function ModernPainPoints() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-[#131315] transition-colors relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="text-blue-600 font-bold tracking-widest text-xs uppercase"
          >
            The Status Quo
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mt-4 text-gray-900 dark:text-white"
          >
            Online Commerce is Broken.
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {PAIN_POINTS.map((point, idx) => {
            const Icon = point.icon;
            return (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: idx * 0.08 }}
              viewport={{ once: true }}
              className="glass-card p-10 rounded-[32px] relative overflow-hidden group"
            >
              {/* Background Glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 ${
                point.color === 'blue' ? 'bg-blue-600' : 'bg-purple-600'
              }`} />

              <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-2xl ${point.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-purple-100 dark:bg-purple-900/20'}`}>
                  <Icon className={point.color === 'blue' ? 'text-blue-600' : 'text-purple-600'} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{point.title}</h3>
              </div>

              {/* PAINS */}
              <div className="space-y-6 mb-10">
                <p className="text-sm font-bold uppercase tracking-widest text-red-500/80">The Traditional Way</p>
                {point.pains.map((pain, i) => (
                  <div key={i} className="flex gap-4 items-start opacity-60">
                    <XCircle className="text-red-500 mt-1 flex-shrink-0" size={18} />
                    <p className="text-gray-700 dark:text-gray-300">{pain}</p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gray-200 dark:bg-white/5 mb-10 w-full" />

              {/* SOLUTIONS */}
              <div className="space-y-6">
                <p className="text-sm font-bold uppercase tracking-widest text-green-500">The Woosho Way</p>
                {point.solutions.map((sol, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <p className="text-gray-900 dark:text-white font-medium">{sol}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
});

export default ModernPainPoints;
