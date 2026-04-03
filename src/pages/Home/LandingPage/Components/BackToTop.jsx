import { motion, AnimatePresence } from "framer-motion";

const BackToTop = ({ showTopBtn, scrollToTop, scrollProgress }) => {
  return (
    <AnimatePresence>
      {showTopBtn && (
        <motion.button initial={{ opacity: 0, scale: 0.7, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.7, y: 40 }} transition={{ duration: 0.3, ease: "backOut" }} onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 transition-transform duration-200">
          <svg className="absolute w-16 h-16 -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="transparent" />
            <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="3" fill="transparent" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - scrollProgress)} strokeLinecap="round" />
          </svg>
          <span className="relative text-white font-bold text-lg">↑</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default BackToTop
