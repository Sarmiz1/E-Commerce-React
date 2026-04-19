import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Section4_Features() {
  const [active, setActive] = useState(null);
  
  const features = ["AI Sales Assistant", "AI Listing Writer", "Smart Analytics", "Social Commerce Feed"];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0E0E10] pt-20">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">Features as Outcomes</h2>
      <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
        {features.map((f, i) => (
          <motion.div 
            key={i} 
            onHoverStart={() => setActive(i)}
            onHoverEnd={() => setActive(null)}
            className="h-40 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center cursor-pointer transition-colors hover:border-blue-500 overflow-hidden relative"
          >
            <span className="font-bold text-gray-300 z-10">{f}</span>
            <AnimatePresence>
                {active === i && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-blue-600/10 backdrop-blur-md flex items-center justify-center z-0">
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
