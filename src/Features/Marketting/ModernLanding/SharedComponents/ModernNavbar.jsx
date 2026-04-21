import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Sparkles, ShoppingBag } from 'lucide-react';
import ThemeToggle from '../Components/ThemeToggle';
import { useCartState } from '../../../../Context/cart/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const EXPO = [0.16, 1, 0.3, 1];

const DEFAULT_LINKS = [
  { label: 'Shop', href: '/products' },
  { label: 'Brands', href: '/brands' },
  { label: 'Support', href: '/support' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Sell', href: '/seller' },
  { label: 'About', href: '/about' },
];

export default function ModernNavbar({ navLinks = DEFAULT_LINKS, pageView = 'isNotHome' }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCartState();
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleHash = (href, e) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const renderLink = (link, mobile = false) => {
    const cls = mobile
      ? 'text-lg font-semibold text-gray-900 dark:text-white text-left'
      : 'text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group';

    return link.href.startsWith('#') ? (
      <button key={link.label} onClick={(e) => handleHash(link.href, e)} className={cls}>
        {link.label}
        {!mobile && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />}
      </button>
    ) : (
      <Link key={link.label} to={link.href} onClick={() => setMobileMenuOpen(false)} className={cls}>
        {link.label}
        {!mobile && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[99999] py-4 md:py-5 pointer-events-auto">
      {/* Backdrop */}
      <div className={`absolute inset-0 backdrop-blur-xl transition-all duration-300 border-b pointer-events-none ${isScrolled
          ? 'bg-white/90 dark:bg-black/90 border-gray-200/50 dark:border-white/10 shadow-lg'
          : 'bg-white/20 dark:bg-black/30 border-transparent'
        }`} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        {
          pageView === 'home' ? (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Sparkles className="text-white fill-white" size={22} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Woo<span className="text-blue-600">sho</span>
              </span>
            </div>
          ) :

            (
              <Link
                className="flex items-center gap-2 group cursor-pointer"
                to="/"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="text-white fill-white" size={22} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Woo<span className="text-blue-600">sho</span>
                </span>
              </Link>
            )
        }

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => renderLink(l))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {/* ── Cart with hover dropdown ── */}
          <div
            className="relative"
            onMouseEnter={() => setCartOpen(true)}
            onMouseLeave={() => setCartOpen(false)}
          >
            <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
              <ShoppingCart size={22} />
              {cart?.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Cart dropdown */}
            <AnimatePresence>
              {cartOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: EXPO }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden"
                >
                  {cart?.length > 0 ? (
                    <>
                      {/* Header */}
                      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          Cart <span className="text-blue-600">({cart.length})</span>
                        </span>
                        <Link to="/cart" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
                      </div>

                      {/* Items */}
                      <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                        {cart.map((item) => (
                          <div key={item.id ?? item._id} className="flex items-center gap-3 px-5 py-3">
                            {(item.thumbnail ?? item.image) && (
                              <img
                                src={item.thumbnail ?? item.image}
                                alt={item.name ?? item.title}
                                className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {item.name ?? item.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.quantity ?? 1} × ₦{(item.price ?? 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer CTA */}
                      <div className="p-4 bg-gray-50 dark:bg-white/[0.03]">
                        <Link
                          to="/cart"
                          className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
                        >
                          Checkout
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <ShoppingBag size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Your cart is empty</p>
                      <Link to="/products" className="mt-4 inline-block text-sm text-blue-600 font-semibold hover:underline">
                        Start shopping →
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2"
          onClick = {()=> navigate('/ai-shop')}
          >
            <span>AI Online Shop</span>
            <Sparkles size={16} className="animate-pulse" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-gray-900 dark:text-white" onClick={() => setMobileMenuOpen((v) => !v)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EXPO }}
            className="md:hidden bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 overflow-hidden z-50 relative"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((l) => renderLink(l, true))}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                <ThemeToggle />
                <Link to="/cart" className="relative px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Cart {cart?.length > 0 && `(${cart.length})`}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
