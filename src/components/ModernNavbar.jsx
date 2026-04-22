import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ShoppingCart,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import ThemeToggle from "../Features/Marketting/ModernLanding/Components/ThemeToggle";
import { useCartState } from "../Context/cart/CartContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

const EXPO = [0.16, 1, 0.3, 1];

const DEFAULT_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Brands", href: "/brands" },
  { label: "Sell", href: "/sell" },
  { label: "About", href: "/about" },
  { label: "Sign up", href: "/auth" },
];

// Individual nav link with animated underline
function NavLink({ link, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === link.href;

  if (link.href.startsWith("#")) {
    return (
      <button
        onClick={onClick}
        className="relative text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
      >
        {link.label}
        <motion.span
          className="absolute -bottom-1 left-0 h-0.5 bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3, ease: EXPO }}
        />
      </button>
    );
  }

  return (
    <Link
      to={link.href}
      onClick={onClick}
      className="relative text-sm font-medium transition-colors group"
      style={{ color: isActive ? "#2563eb" : undefined }}
    >
      <span
        className={`${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"}`}
      >
        {link.label}
      </span>
      <motion.span
        className="absolute -bottom-1 left-0 h-0.5 bg-blue-600 rounded-full"
        initial={{ width: isActive ? "100%" : 0 }}
        animate={{ width: isActive ? "100%" : 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3, ease: EXPO }}
      />
    </Link>
  );
}

export default function ModernNavbar({
  navLinks = DEFAULT_LINKS,
  pageView = "isNotHome",
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCartState();
  const navigate = useNavigate();
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
  }, [location.pathname]);

  const handleHash = (href, e) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const openCart = () => {
    clearTimeout(cartTimer.current);
    setCartOpen(true);
  };
  const closeCart = () => {
    cartTimer.current = setTimeout(() => setCartOpen(false), 160);
  };
  const keepCart = () => clearTimeout(cartTimer.current);

  const cartCount = cart?.reduce((a, i) => a + (i.quantity || 1), 0) ?? 0;

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
          // Dark mode handled via Tailwind class below
        />
        <div className="dark:hidden">
          {/* light mode handled above via motion.div */}
        </div>
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
          {/* ── Logo ── */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            {pageView === "home" ? (
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
                >
                  <Sparkles className="text-white fill-white" size={19} />
                </motion.div>
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                  Woo<span className="text-blue-600">sho</span>
                </span>
              </div>
            ) : (
              <Link to="/" className="flex items-center gap-2.5">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
                >
                  <Sparkles className="text-white fill-white" size={19} />
                </motion.div>
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                  Woo<span className="text-blue-600">sho</span>
                </span>
              </Link>
            )}
          </motion.div>

          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.08 * i + 0.2,
                  duration: 0.4,
                  ease: EXPO,
                }}
              >
                <NavLink
                  link={link}
                  onClick={
                    link.href.startsWith("#")
                      ? (e) => handleHash(link.href, e)
                      : () => setMobileMenuOpen(false)
                  }
                />
              </motion.div>
            ))}
          </div>

          {/* ── Desktop Right ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: EXPO }}
            className="hidden md:flex items-center gap-3"
          >
            <ThemeToggle />

            {/* Cart */}
            <div
              className="relative"
              onMouseEnter={openCart}
              onMouseLeave={closeCart}
            >
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onFocus={openCart}
              >
                <ShoppingCart size={21} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 22,
                      }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-black"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Cart dropdown */}
              <AnimatePresence>
                {cartOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: EXPO }}
                    onMouseEnter={keepCart}
                    onMouseLeave={closeCart}
                    className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
                    style={{ zIndex: 50 }}
                  >
                    {cartCount > 0 ? (
                      <>
                        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            Cart{" "}
                            <span className="text-blue-600">({cartCount})</span>
                          </span>
                          <Link
                            to="/cart"
                            onClick={() => setCartOpen(false)}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            View all
                          </Link>
                        </div>
                        <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                          {cart.slice(0, 5).map((item, i) => (
                            <motion.div
                              key={item.id ?? i}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-3 px-5 py-3"
                            >
                              {(item.thumbnail ?? item.image) && (
                                <img
                                  src={item.thumbnail ?? item.image}
                                  alt={item.name ?? item.title}
                                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.name ?? item.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {item.quantity ?? 1} × ₦
                                  {(item.price ?? 0).toLocaleString()}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/[0.03]">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Link
                              to="/cart"
                              onClick={() => setCartOpen(false)}
                              className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors"
                            >
                              Checkout →
                            </Link>
                          </motion.div>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center">
                        <ShoppingBag
                          size={30}
                          className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          Your cart is empty
                        </p>
                        <Link
                          to="/products"
                          onClick={() => setCartOpen(false)}
                          className="mt-3 inline-block text-sm text-blue-600 font-semibold hover:underline"
                        >
                          Start shopping →
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: "0 0 20px rgba(37,99,235,0.4)",
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/ai-shop")}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-colors hover:bg-blue-700"
            >
              AI Shop
              <Sparkles size={15} className="animate-pulse" />
            </motion.button>
          </motion.div>

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

        {/* ── Mobile Menu ── */}
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
                        className={`text-base font-semibold ${location.pathname === link.href ? "text-blue-600" : "text-gray-900 dark:text-white"}`}
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
                      {cartCount > 0 && (
                        <span className="text-blue-600">{cartCount}</span>
                      )}
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
      </motion.nav>
    </>
  );
}
