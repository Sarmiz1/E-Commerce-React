import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";


const MobileView = ({ mobileMenuOpen, navLinks, handleNavButtonClick }) => {
  const navigate = useNavigate()
  
  return (
    <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }} className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100">
              <nav className="flex flex-col px-6 pb-6 pt-2 gap-1">
                {navLinks.map((link, i) => (
                  <motion.button key={link.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07, duration: 0.3 }} onClick={() => handleNavButtonClick(link)} className="text-left px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200">{link.label}</motion.button>
                ))}
                <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.07 }} onClick={() => navigate("/products")} className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm">Shop Now →</motion.button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
  )
}

export default MobileView
