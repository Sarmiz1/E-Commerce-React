import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../../Context/theme/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative flex items-center justify-center w-14 h-8 px-1 rounded-full bg-gray-200 dark:bg-gray-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      aria-label="Toggle Theme"
    >
      <motion.div
        className="z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-blue-600 shadow-md"
        animate={{
          x: isDark ? 12 : -12,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={14} className="text-white fill-white" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={14} className="text-amber-500 fill-amber-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Decorative dots for space/sky feel */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pt-0.5 opacity-30 pointer-events-none">
        <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-blue-300" />
        <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-blue-300" />
      </div>
    </button>
  );
}
