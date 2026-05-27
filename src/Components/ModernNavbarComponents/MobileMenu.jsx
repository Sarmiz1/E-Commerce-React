import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Sparkles } from "lucide-react";
import ThemeToggle from "../../Features/Marketting/ModernLanding/Components/ThemeToggle";
import { EXPO } from "./navConstants";

export default function MobileMenu({
  mobileMenuOpen,
  navLinks,
  handleHash,
  setMobileMenuOpen,
  cartCount,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: EXPO }}
          className="md:hidden overflow-hidden relative"
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="dark:bg-black/95 px-6 py-6 flex flex-col gap-5">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: EXPO }}
              >
                {link.href.startsWith("#") ? (
                  <button
                    onClick={(e) => handleHash(link.href, e)}
                    className="text-base font-semibold text-gray-900 dark:text-white text-left w-full"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-semibold ${
                      location.pathname === link.href ? "text-blue-600" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-white/10"
            >
              <ThemeToggle />
              <div className="flex items-center gap-3">
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative p-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-xl flex items-center gap-1.5 text-sm font-bold"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && <span className="text-blue-600">{cartCount}</span>}
                </Link>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigate("/ai-shop");
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center gap-1.5"
                >
                  AI Shop <Sparkles size={14} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
