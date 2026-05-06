import { memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MousePointer2, ArrowRight, Sparkles } from 'lucide-react';
import MagneticButton from '../../Components/MagneticButton';
import { formatMoneyCurrency } from '../../../../utils/FormatMoneyCents';
import heroImg from '../../../../assets/marketing/hero-blur.png';
import { DEFAULT_HERO_VARIANT, HERO_VARIANTS } from '../Data/heroContent';



const ModernHero = memo(function ModernHero() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  const hero = HERO_VARIANTS[ref] || HERO_VARIANTS[DEFAULT_HERO_VARIANT];

  // Mouse Parallax Setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Parallax Transforms
  const imgX = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
  const imgY = useTransform(smoothMouseY, [-1, 1], [-20, 20]);
  
  const card1X = useTransform(smoothMouseX, [-1, 1], [30, -30]);
  const card1Y = useTransform(smoothMouseY, [-1, 1], [30, -30]);
  
  const card2X = useTransform(smoothMouseX, [-1, 1], [-40, 40]);
  const card2Y = useTransform(smoothMouseY, [-1, 1], [-40, 40]);

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center pt-32 overflow-hidden bg-white dark:bg-[#0E0E10]"
    >
      {/* Background Gradients with subtle parallax */}
      <motion.div 
        style={{ x: imgX, y: imgY }}
        className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" 
      />
      <motion.div 
        style={{ x: card2X, y: card2Y }}
        className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-400/10 dark:bg-blue-500/5 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4" 
      />
      
      {/* Abstract Background Grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* TEXT CONTENT */}
        <div className="text-left relative z-20">
          <div className="flex flex-wrap text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.9] text-gray-900 dark:text-white mb-8 select-none">
            {hero.titleWords.map((word, index) => (
              <motion.span
                key={`${ref}-${index}`}
                initial={{ opacity: 0, y: 60, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  type: "spring",
                  damping: 14,
                  stiffness: 100
                }}
                className={`mr-4 mb-2 inline-block origin-bottom ${
                  index > 1 
                    ? 'text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 drop-shadow-sm' 
                    : ''
                }`}
              >
                {word}
                {index === 1 && <div className="w-full h-0 md:h-4" />} {/* Line break */}
              </motion.span>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed relative"
          >
            <span className="absolute -left-8 top-1 text-blue-500/50 hidden md:block animate-pulse">
              <Sparkles size={24}/>
            </span>
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <MagneticButton 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 flex items-center gap-2 group transition-colors"
              onClick={()=> navigate(hero.primaryLink)}
            >
              <span>{hero.primaryCta}</span>
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ArrowRight size={20} />
              </motion.div>
            </MagneticButton>
            
            <MagneticButton 
              className="px-8 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold rounded-2xl transition-colors border border-transparent dark:border-white/10"
              onClick={()=> navigate(hero.secondaryLink)}
            >
              {hero.secondaryCta}
            </MagneticButton>
          </motion.div>

          {/* Social Proof / Tiny Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-16 flex items-center gap-6"
          >
            <div className="flex -space-x-3">
              {['#6366F1', '#EC4899', '#F59E0B', '#10B981'].map((color, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0E0E10] flex items-center justify-center overflow-hidden transition-transform hover:-translate-y-1 hover:z-10 relative cursor-pointer" style={{ background: color }}>
                  <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.5c-3.3 0-9.8 1.6-9.8 4.9v2.4h19.6v-2.4c0-3.3-6.5-4.9-9.8-4.9z"/></svg>
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
        <div className="relative flex justify-center items-center pointer-events-none">
          <motion.div 
            style={{ x: imgX, y: imgY }}
            className="relative w-full aspect-square max-w-lg z-10"
          >
            {/* The actual AI Sphere Image */}
            <motion.img 
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0, 0.71, 0.2, 1.01] }}
              src={heroImg} 
              alt="Woosho AI" 
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_80px_rgba(37,99,235,0.4)]"
            />
            
            {/* Decorative background circle */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-blue-400/10 rounded-full blur-[80px] animate-pulse" />
            
            {/* Floating UI Elements (Parallaxed) */}
            <motion.div 
              style={{ x: card1X, y: card1Y }}
              className="absolute -top-10 -right-4 glass-card p-4 rounded-2xl z-20 flex shadow-2xl bg-white/70 dark:bg-[#1A1A1E]/80 backdrop-blur-md border border-white/20 dark:border-white/10"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/30">
                💰
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Live Sale</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatMoneyCurrency(4850000)}</p>
              </div>
            </motion.div>

            <motion.div 
              style={{ x: card2X, y: card2Y }}
              className="absolute bottom-10 -left-10 glass-card p-4 rounded-2xl z-20 flex items-center gap-3 shadow-2xl bg-white/70 dark:bg-[#1A1A1E]/80 backdrop-blur-md border border-white/20 dark:border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <MousePointer2 size={16} />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">AI Matched</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
      >
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-blue-600 to-transparent" />
      </motion.div>
    </section>
  );
});

export default ModernHero;

