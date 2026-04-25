import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { EXPO, DEFAULT_LINKS } from "./ModernNavbarComponents/navConstants";
import MondernNavLogo from "./ModernNavbarComponents/MondernNavLogo";
import DesktopLinks from "./ModernNavbarComponents/DesktopLinks";
import DesktopActions from "./ModernNavbarComponents/DesktopActions";
import MobileMenu from "./ModernNavbarComponents/MobileMenu";
import { useCartState } from "../Context/cart/CartContext";

export default function ModernNavbar({
  navLinks = DEFAULT_LINKS,
  pageView = "isNotHome",
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cart: cartItems, cartCount } = useCartState();
  const location = useLocation();
  const cartTimer = useRef(null);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCartOpen(false);
  }, [location.pathname, location.hash]);

  const openCart = () => {
    clearTimeout(cartTimer.current);
    setCartOpen(true);
  };
  const closeCart = () => {
    cartTimer.current = setTimeout(() => setCartOpen(false), 160);
  };
  const keepCart = () => clearTimeout(cartTimer.current);

  // Handle Hash properly on mobile
  const handleHash = useCallback((hash, e) => {
    if (e) e.preventDefault();

    // Close mobile menu first
    setMobileMenuOpen(false);
    setCartOpen(false);

    // Wait for menu animation to finish
    setTimeout(() => {
      const el = document.querySelector(hash);
      if (!el) return;

      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 200); // match your mobile menu animation duration
  }, [setMobileMenuOpen, setCartOpen]);

  return (
    <>
      {/* ── Navbar shell — z-index BELOW WooshoAI (2147483647) ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EXPO }}
        className="fixed top-0 left-0 right-0 z-[9000] py-3 md:py-4 pointer-events-auto"
      >
        {/* Animated backdrop */}
        <motion.div
          className="absolute inset-0 pointer-events-none border-b"
          animate={{
            background: isScrolled
              ? "rgba(255,255,255,0.92)"
              : pageView === 'sell' ? "rgba(255,255,255,0.7)"
                : "rgba(255,255,255,0.1)",
            borderColor: isScrolled ? "rgba(0,0,0,0.08)" : "transparent",
            boxShadow: isScrolled ? "0 8px 40px rgba(0,0,0,0.1)" : "none",
          }}
          transition={{ duration: 0.4 }}
          style={{
            backdropFilter: isScrolled
              ? "blur(20px) saturate(180%)"
              : "blur(8px)",
          }}
        />

        {/* Dark backdrop override */}
        <motion.div
          className="absolute inset-0 hidden dark:block pointer-events-none border-b"
          animate={{
            background: isScrolled ? "rgba(10,10,10,0.92)" : "rgba(0,0,0,0.2)",
            borderColor: isScrolled ? "rgba(255,255,255,0.08)" : "transparent",
          }}
          transition={{ duration: 0.4 }}
          style={{ backdropFilter: "blur(20px)" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 flex items-center justify-between gap-4">
          <MondernNavLogo pageView={pageView}  />

          <DesktopLinks 
            navLinks={navLinks} 
            handleHash={handleHash} 
            setMobileMenuOpen={setMobileMenuOpen} 
          />

          <DesktopActions 
            cartCount={cartCount}
            cartItems={cartItems}
            cartOpen={cartOpen}
            setCartOpen={setCartOpen}
            openCart={openCart}
            closeCart={closeCart}
            keepCart={keepCart}
          />

          {/* ── Mobile toggle ── */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-gray-900 dark:text-white"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileMenuOpen ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        <MobileMenu 
          mobileMenuOpen={mobileMenuOpen}
          navLinks={navLinks}
          handleHash={handleHash}
          setMobileMenuOpen={setMobileMenuOpen}
          cartCount={cartCount}
        />
      </motion.nav>
    </>
  );
}
