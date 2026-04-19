import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useCartState } from '../../../../Context/cart/CartContext';

export default function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useCartState();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Shop', href: '/products' },
    { label: 'Sell', href: '/seller' },
    { label: 'Categories', href: '#categories' },
    { label: 'About', href: '#why-woosho' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[99999] py-4 md:py-6 pointer-events-auto">
      {/* BACKGROUND OVERLAY (Eliminates Flash) */}
      <div
        className={`absolute inset-0 backdrop-blur-xl transition-all duration-200 ease-out border-b shadow-lg pointer-events-none ${isScrolled ? 'opacity-100 bg-white/90 dark:bg-black/90 border-gray-200/50 dark:border-white/10' : 'opacity-0 bg-transparent border-transparent'
          }`}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Sparkles className="text-white fill-white" size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Woo<span className="text-blue-600">sho</span>
          </span>
        </div>

        {/* MIDDLE LINKS (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </a>
          ))}
        </div>

        {/* RIGHT SECTION (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors group">
            <ShoppingCart size={22} />
            {cart?.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                {cart.length}
              </span>
            )}
          </button>

          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2">
            <span>AI Online Shop</span>
            <Sparkles size={16} className="animate-pulse" />
          </button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="md:hidden p-2 text-gray-900 dark:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 overflow-hidden relative z-50"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                <ThemeToggle />
                <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">
                  AI Online Shop
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
