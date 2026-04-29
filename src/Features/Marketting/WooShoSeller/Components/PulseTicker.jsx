import React, { useEffect, useRef, useState, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatMoneyCurrency } from '../../../../Utils/formatMoneyCents';

const NOTIFICATIONS = [
  "Ngozi in Lagos just received an order ✓",
  "Emeka in Abuja just listed 5 new products",
  "Amara's AI replied to 12 buyers",
  `A seller in Enugu just hit their first ${formatMoneyCurrency(50000000).replace(".00", "")} month`,
];

const VISIBLE_DURATION = 5000;  // ms notification stays visible
const CYCLE_INTERVAL   = 20000; // ms between each appearance

function PulseTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible]       = useState(false);

  // Stable refs so timers never close over stale state
  const indexRef   = useRef(0);
  const hideTimer  = useRef(null);
  const cycleTimer = useRef(null);

  const showNext = () => {
    // Clear any pending hide before showing — prevents double-flash
    clearTimeout(hideTimer.current);

    setCurrentIndex(indexRef.current);
    setIsVisible(true);

    hideTimer.current = setTimeout(() => {
      setIsVisible(false);
      indexRef.current = (indexRef.current + 1) % NOTIFICATIONS.length;
    }, VISIBLE_DURATION);
  };

  useEffect(() => {
    // One initial delay then a single steady interval — no nested timers.
    // The original bug: setInterval was created inside setTimeout but never
    // assigned to a ref, so the cleanup only cleared the outer setTimeout.
    // The interval kept firing and stacking on every re-mount, causing the
    // erratic multi-flash behaviour.
    cycleTimer.current = setTimeout(() => {
      showNext();
      cycleTimer.current = setInterval(showNext, CYCLE_INTERVAL);
    }, 4000);

    return () => {
      clearTimeout(cycleTimer.current);
      clearInterval(cycleTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          // FIX: replaced spring (stiffness:300, damping:25) with a simple eased
          // tween. The spring was overshooting and fighting AnimatePresence's exit
          // animation, causing the visible flash on each cycle.
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-6 z-[99999] pointer-events-none"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[320px]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">WS</span>
            </div>
            <div>
              <p className="text-sm text-gray-200 font-medium leading-snug">
                {NOTIFICATIONS[currentIndex]}
              </p>
              <p className="text-xs text-indigo-400 mt-0.5">Just now</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default  memo(PulseTicker); // memo to prevent unnecessary re-renders when parent updates