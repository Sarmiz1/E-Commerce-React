import { motion, AnimatePresence } from "framer-motion";


const LeftSection = ({
  navLinks,
  scrollToSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  cart,
  setCartOpen,
  cartIconRef,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ShopEase</h1>
      <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
        {navLinks.map((link) => (
          <button key={link.label} onClick={() => scrollToSection(link.href)} className="relative hover:text-indigo-600 transition-colors duration-200 group">
            {link.label}<span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-indigo-500 group-hover:w-full transition-all duration-300" />
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <button ref={cartIconRef} onClick={() => setCartOpen(true)} className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-200">
          🛒 Cart
          <AnimatePresence>{cart.length > 0 && (<motion.span key={cart.length} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-2 -right-2 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">{cart.reduce((a, b) => a + b.quantity, 0)}</motion.span>)}</AnimatePresence>
        </button>
        <button className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-gray-100 transition" onClick={() => setMobileMenuOpen((o) => !o)} aria-label="Toggle menu">
          <motion.span animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="block w-5 h-0.5 bg-gray-700 rounded-full origin-center" />
          <motion.span animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.2 }} className="block w-5 h-0.5 bg-gray-700 rounded-full" />
          <motion.span animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="block w-5 h-0.5 bg-gray-700 rounded-full origin-center" />
        </button>
      </div>
    </div>
  )
}

export default LeftSection
