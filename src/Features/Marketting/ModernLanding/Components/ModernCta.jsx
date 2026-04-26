import { memo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Premium Magnetic Button for CTA
const MagneticButton = ({ children, className, onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

export const ModernCTA = memo(function ModernCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-white dark:bg-[#0E0E10] transition-colors relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative rounded-[48px] p-12 md:p-24 text-center overflow-hidden border border-gray-200 dark:border-white/10"
        >
          {/* Animated Premium Background */}
          <div className="absolute inset-0 bg-[#0E0E10] dark:bg-black z-0" />
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-40 z-0 bg-[conic-gradient(from_0deg,theme(colors.blue.600)_0deg,theme(colors.purple.600)_120deg,theme(colors.cyan.400)_240deg,theme(colors.blue.600)_360deg)] mix-blend-screen blur-[100px]"
          />
          
          {/* Noise overlay for texture */}
          <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              viewport={{ once: true }}
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            >
              <Sparkles className="text-white" size={32} />
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Ready to Experience <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300">Intelligent Commerce?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
              Join thousands of buyers and sellers already using the world's most advanced AI matching engine.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg">
              <MagneticButton 
                className="flex-1 py-5 bg-white text-gray-900 font-bold rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-shadow text-lg flex items-center justify-center gap-2 group"
                onClick={() => navigate('/auth')}
              >
                <span>Start Shopping</span>
                <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <ArrowRight size={20} className="text-blue-600" />
                </motion.div>
              </MagneticButton>

              <MagneticButton 
                className="flex-1 py-5 bg-white/5 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/10 transition-colors text-lg"
                onClick={() => navigate('/auth')}
              >
                Grow Your Sales
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});