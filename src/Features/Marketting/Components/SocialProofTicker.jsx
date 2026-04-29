import { memo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SOCIAL_PROOF_EVENTS = [
  { name: "Adaeze O.", city: "Lagos", action: "just signed up" },
  { name: "Tunde B.", city: "Abuja", action: "just placed an order" },
  { name: "Kemi A.", city: "Ibadan", action: "listed 5 new products" },
  { name: "Chidi N.", city: "Port Harcourt", action: "just signed up" },
  { name: "Amara E.", city: "Enugu", action: "just placed an order" },
  { name: "Bola F.", city: "Benin City", action: "just signed up" },
  { name: "Yusuf M.", city: "Kano", action: "listed 3 new products" },
  { name: "Ngozi U.", city: "Owerri", action: "just placed an order" },
];

function getRandomTime() {
  const mins = Math.floor(Math.random() * 12) + 1;
  return `${mins} min ago`;
}

const SocialProofTicker = memo(function SocialProofTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Show after 4 seconds
    const showTimer = setTimeout(() => setIsVisible(true), 4000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SOCIAL_PROOF_EVENTS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const current = SOCIAL_PROOF_EVENTS[currentIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-50 max-w-xs"
        >
          <div className="bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/10 dark:shadow-black/40 backdrop-blur-xl flex items-center gap-3">
            {/* Avatar dot */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-500/30">
              {current.name.charAt(0)}
            </div>

            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {current.name} <span className="font-normal text-gray-500 dark:text-gray-400">{current.action}</span>
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {current.city} · {getRandomTime()}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors flex-shrink-0 ml-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Subtle pulse indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3">
            <div className="w-full h-full bg-green-500 rounded-full animate-ping opacity-75" />
            <div className="absolute inset-0 w-full h-full bg-green-500 rounded-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default SocialProofTicker;
