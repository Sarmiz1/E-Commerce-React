import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatMoneyCurrency } from '../../../../Utils/formatMoneyCents';
import MagneticButton from '../../Components/MagneticButton';

const mockDatabase = [
  { id: 1, title: "Urban Black Kicks", price: formatMoneyCurrency(3500000).replace(".00", ""), img: "https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&w=400&q=80", tags: ["black", "sneakers", "urban"] },
  { id: 2, title: "Midnight Runners", price: formatMoneyCurrency(3850000).replace(".00", ""), img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80", tags: ["black", "running", "performance"] },
  { id: 3, title: "Stealth Trainers", price: formatMoneyCurrency(3990000).replace(".00", ""), img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80", tags: ["stealth", "training", "minimal", "black"] },
  { id: 4, title: "Ivory Classics", price: formatMoneyCurrency(4200000).replace(".00", ""), img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80", tags: ["white", "classic", "leather", "sneakers"] },
  { id: 5, title: "Crimson High-Tops", price: formatMoneyCurrency(4500000).replace(".00", ""), img: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=400&q=80", tags: ["red", "high-top", "canvas"] }
];

const HeroSection = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const intent = params.get('intent');
  
  const [searchQuery, setSearchQuery] = useState(intent || '');
  const [isTyping, setIsTyping] = useState(false);
  const [filteredResults, setFilteredResults] = useState(mockDatabase.slice(0, 3));

  // Handle live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults(mockDatabase.slice(0, 3));
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const timeoutId = setTimeout(() => {
      const lowerQuery = searchQuery.toLowerCase();
      const results = mockDatabase.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.tags.some(tag => tag.includes(lowerQuery))
      );
      setFilteredResults(results);
      setIsTyping(false);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <section className="w-full min-h-screen flex items-center justify-center pt-24 pb-12 px-6 md:px-12 bg-white dark:bg-[#0E0E10] overflow-hidden">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Stark Minimalist Text */}
        <div className="flex flex-col items-start space-y-8 z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black text-neutral-900 dark:text-white leading-[0.95] tracking-tighter"
          >
            {intent === 'sneakers' ? (
              <>The Perfect <br/><span className="text-neutral-400 dark:text-neutral-500">Kicks.</span></>
            ) : intent === 'tech' ? (
              <>The Latest <br/><span className="text-neutral-400 dark:text-neutral-500">Tech.</span></>
            ) : (
              <>Smarter. <br />Faster. <br /><span className="text-neutral-400 dark:text-neutral-500">Curated.</span></>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-md leading-snug font-medium"
          >
            Describe your exact style. Our neural engine finds it instantly. No scrolling required.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4"
          >
            <MagneticButton
              className="flex items-center justify-center gap-3 bg-neutral-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/ai-shop')}
            >
              Start Searching
              <ArrowRight className="w-5 h-5" />
            </MagneticButton>
            <MagneticButton
              className="flex items-center justify-center gap-3 bg-neutral-100 dark:bg-[#1A1A1E] text-neutral-900 dark:text-white px-8 py-4 rounded-xl font-bold border border-transparent dark:border-white/5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/products/categories')}
            >
              Browse Catalog
            </MagneticButton>
          </motion.div>
        </div>

        {/* Right: Live Interactive Terminal (No glow/bulb effects, brutalist & clean) */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-[550px] bg-neutral-50 dark:bg-[#111113] rounded-[32px] p-6 border border-neutral-200 dark:border-white/10 flex flex-col shadow-2xl"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Live AI Demo</span>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-3 relative">
            <AnimatePresence mode="popLayout">
              {isTyping ? (
                <motion.div 
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-neutral-400 font-mono text-sm h-12"
                >
                  <Search size={14} className="animate-pulse" /> Scanning inventory...
                </motion.div>
              ) : filteredResults.length > 0 ? (
                filteredResults.map((item, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={item.id}
                    className="flex items-center gap-4 bg-white dark:bg-[#1A1A1E] p-3 rounded-2xl border border-neutral-100 dark:border-white/5"
                  >
                    <img src={item.img} alt={item.title} className="w-16 h-16 object-cover rounded-xl" />
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900 dark:text-white text-sm">{item.title}</h4>
                      <p className="text-neutral-500 text-xs mt-1">{item.price}</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mr-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                      <ArrowRight size={14} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-neutral-400 font-mono text-sm h-12 flex items-center"
                >
                  No matches found. Try another term.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-white/10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try typing 'black sneakers' or 'classic'..."
                className="w-full bg-white dark:bg-[#1A1A1E] text-neutral-900 dark:text-white border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-4 pr-12 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors font-medium placeholder:text-neutral-400"
              />
              <div className="absolute right-4 text-neutral-400 pointer-events-none">
                <CornerDownLeft size={16} />
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
