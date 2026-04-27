import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../../../Context/theme/ThemeContext";
import ProductCard from "../../../../../Components/Ui/ProductCard";

export default function LookbookSection({ products, isLoading }) {
  const { isDark } = useTheme();
  const [activeProduct, setActiveProduct] = useState(null);

  if (isLoading || !products || products.length < 3) return null;

  // Simulate hotspots over a video/campaign image
  const hotspots = [
    { id: products[0].id, top: '40%', left: '30%', product: products[0] },
    { id: products[1].id, top: '65%', left: '55%', product: products[1] },
    { id: products[2].id, top: '30%', left: '75%', product: products[2] },
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden h-[90vh] min-h-[700px] flex items-center justify-center group/section">
      {/* Background Cinematic "Video" (Using panning image to simulate high-end reel) */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], x: [0, -20, 0] }} 
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2000" 
          alt="Cinematic Campaign" 
          className="w-full h-full object-cover opacity-60"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 h-full flex flex-col justify-between py-12 pointer-events-none">
        <div className="text-center mt-10">
          <p className="text-white/80 text-xs font-bold uppercase tracking-[0.3em] mb-4">Interactive Campaign</p>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            The Spring Edit
          </h2>
        </div>

        {/* Hotspots layer */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {hotspots.map((spot, i) => (
            <div 
              key={spot.id} 
              className="absolute pointer-events-auto"
              style={{ top: spot.top, left: spot.left }}
            >
              {/* Pulse Ring */}
              <div 
                className="relative flex items-center justify-center group cursor-pointer w-12 h-12 -ml-6 -mt-6"
                onMouseEnter={() => setActiveProduct(spot.product)}
                onMouseLeave={() => setActiveProduct(null)}
                onClick={() => window.dispatchEvent(new CustomEvent('open-quickview', { detail: spot.product }))}
              >
                <motion.div 
                  animate={{ scale: [1, 2], opacity: [0.8, 0] }} 
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className="absolute w-6 h-6 bg-white rounded-full opacity-50"
                />
                <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] z-10 transition-transform group-hover:scale-150" />
                
                {/* Tooltip / Preview */}
                <AnimatePresence>
                  {activeProduct?.id === spot.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute top-12 left-1/2 -translate-x-1/2 w-48 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl z-50 pointer-events-none"
                    >
                      <div className="relative rounded-xl overflow-hidden mb-2">
                        <img src={spot.product.image} className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                      <div className="px-1 pb-1 text-center">
                        <p className="text-xs font-black text-gray-900 line-clamp-1">{spot.product.name}</p>
                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">Tap to Shop</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-end pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors">
              <div className="w-3 h-3 bg-white rounded-sm" /> {/* Stop icon */}
            </div>
            <div className="w-48 h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div animate={{ scaleX: [0, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="h-full bg-white origin-left" />
            </div>
            <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest hidden md:inline-block">00:00 / 00:25</span>
          </div>
          
          <button className="text-white text-xs font-bold uppercase tracking-widest hover:text-white/70 transition-colors flex items-center gap-2">
            Watch Full Campaign <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
