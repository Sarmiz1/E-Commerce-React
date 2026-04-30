import { memo, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { LANDING_STATS } from "../Data/stats";

function AnimatedCounter({ target, suffix = "", prefix = "", duration = 2, decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const val = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest);
    return `${prefix}${Number(val).toLocaleString()}${suffix}`;
  });

  useEffect(() => {
    if (inView) {
      animate(count, target, { duration, ease: "easeOut" });
    }
  }, [inView, target, count, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const AnimatedStats = memo(function AnimatedStats() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-white dark:bg-[#0E0E10] transition-colors overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">
            By The Numbers
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mt-4 text-gray-900 dark:text-white tracking-tight">
            Built for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Scale.
            </span>
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {LANDING_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group"
            >
              <div className="bg-gray-50 dark:bg-[#1A1A1E] border border-gray-200 dark:border-white/10 rounded-[28px] p-8 text-center hover:border-blue-500/30 transition-colors overflow-hidden relative">
                {/* Background glow */}
                <div
                  className={`absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${stat.color}`}
                />

                <div className="relative z-10">
                  <p
                    className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3 tabular-nums`}
                  >
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      decimals={stat.decimals}
                    />
                  </p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {stat.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {stat.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default AnimatedStats;
