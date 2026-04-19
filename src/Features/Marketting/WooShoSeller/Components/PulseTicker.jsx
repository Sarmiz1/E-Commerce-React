import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const notifications = [
  "Ngozi in Lagos just received an order ✓",
  "Emeka in Abuja just listed 5 new products",
  "Amara's AI replied to 12 buyers",
  "A seller in Enugu just hit their first ₦500,000 month"
];

export default function PulseTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Ambient ticker logic: show a notification every 25 seconds for 5 seconds
    const cycle = () => {
      setCurrentIndex(prev => (prev + 1) % notifications.length);
      setIsVisible(true);
      
      setTimeout(() => {
        setIsVisible(false);
      }, 5000); // stay visible for 5s
    };

    // Initial delay before first popup
    const masterTimer = setTimeout(() => {
      cycle();
      setInterval(cycle, 25000);
    }, 5000);

    return () => {
      clearTimeout(masterTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-[99999] pointer-events-none"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-[320px]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
               <span className="text-white text-xs font-bold font-serif relative z-10">WS</span>
            </div>
            <div>
              <p className="text-sm text-gray-200 font-medium leading-snug">
                {notifications[currentIndex]}
              </p>
              <p className="text-xs text-blue-400 mt-1">Just now</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
