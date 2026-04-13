import { motion, AnimatePresence } from "framer-motion";
import CartPreview from "./CartPreview";

const RightActions = ({
  setSearchTip, 
  setSearchOpen, 
  searchOpen, 
  isTop, 
  searchTip, 
  setWishlistTip, 
  wishlistTip, 
  setAccountTip, 
  accountTip, 
  openCart, 
  closeCart, 
  cartRef, 
  cartCount, 
  cartBadgeKey, 
  cartHover, 
  keepCart, 
  BagIcon, 
  ArrowRight,
  SearchIcon, 
  navigate, 
  setMobileOpen, 
  mobileOpen,
  setCartHover,
  HeartIcon,
  UserIcon,
  CloseIcon,
}) => {
  return (
    <div className="flex items-center gap-1 ml-auto flex-shrink-0"> 

      {/* Search */}
      <div className="relative"
        onMouseEnter={() => setSearchTip(true)}
        onMouseLeave={() => setSearchTip(false)}>
        <button
          onClick={() => setSearchOpen((o) => !o)}
          aria-label={searchOpen ? "Close search" : "Open search"}
          className={`nb-icon-btn transition-all duration-200 ${isTop ? "text-white/80 hover:text-white hover:bg-white/12" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            } ${searchOpen ? (isTop ? "bg-white/15 text-white" : "bg-indigo-50 !text-indigo-600") : ""}`}>
          <AnimatePresence mode="wait">
            {searchOpen
              ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><CloseIcon /></motion.span>
              : <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><SearchIcon /></motion.span>
            }
          </AnimatePresence>
        </button>
        <AnimatePresence>
          {searchTip && !searchOpen && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-50">
              Search
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search tooltip — mobile hint */}
      <div className="relative md:hidden"
        onMouseEnter={() => setSearchTip(true)}
        onMouseLeave={() => setSearchTip(false)}>
        <AnimatePresence>
          {searchTip && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg">
              Search
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wishlist — desktop */}
      <div className="relative hidden md:block"
        onMouseEnter={() => setWishlistTip(true)}
        onMouseLeave={() => setWishlistTip(false)}>
        <button
          onClick={() => navigate("/wishlist")}
          className={`nb-icon-btn transition-all duration-200 ${isTop ? "text-white/80 hover:text-white hover:bg-white/12" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
          aria-label="Wishlist">
          <HeartIcon />
        </button>
        <AnimatePresence> 
          {wishlistTip && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-50">
              Wishlist
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account — desktop */} 
      <div className="relative hidden md:block"
        onMouseEnter={() => setAccountTip(true)}
        onMouseLeave={() => setAccountTip(false)}>
        <button
          onClick={() => navigate("/account")}
          className={`nb-icon-btn transition-all duration-200 ${isTop ? "text-white/80 hover:text-white hover:bg-white/12" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
          aria-label="My Account">
          <UserIcon />
        </button>
        <AnimatePresence>
          {accountTip && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-50">
              My Account
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className={`hidden md:block w-px h-5 mx-1 transition-colors duration-300 ${isTop ? "bg-white/15" : "bg-gray-200"}`} />

      {/* Cart bag — with hover preview */} 
      <div className="relative" onMouseEnter={openCart} onMouseLeave={closeCart}>
        <button
          ref={cartRef}
          className={`nb-icon-btn transition-all duration-200 md:-ml-5 lg:-ml-0 ${isTop ? "text-white hover:bg-white/12" : "text-gray-700 hover:bg-gray-100"
            }`}
          aria-label={`Cart, ${cartCount} items`}
        >
          <BagIcon className="w-[22px] h-[22px]" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key={cartBadgeKey}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`nb-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white shadow ${isTop ? "bg-indigo-400" : "bg-indigo-600"}`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Cart hover panel — From Tablet upward */}
        <div className="md:block">
          <AnimatePresence> 
            {cartHover && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                onMouseEnter={keepCart}
                onMouseLeave={closeCart}
              >
                <CartPreview
                  onNavigate={(href) => { navigate(href); setCartHover(false); }}
                  BagIcon={BagIcon}
                  ArrowRight={ArrowRight}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CTA button — desktop */}
      <button
        onClick={() => navigate("/products")}
        className="hidden lg:flex items-center gap-1.5 font-bold text-[0.8125rem] px-4 py-2 rounded-full transition-all duration-300 ml-1"
        style={
          isTop
            ? { background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)" }
            : { background: "linear-gradient(135deg,#2563eb,#6366f1)", color: "#fff", boxShadow: "0 4px 16px rgba(99,102,241,0.32)" }
        }
      >
        Shop Now
      </button>

      {/* Hamburger — mobile & tablet */} 
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className={` md:hidden transition-all duration-200 ${isTop ? "text-white hover:bg-white/12" : "text-gray-700 hover:bg-gray-100"} `}
      >
        <AnimatePresence mode="wait">
          {mobileOpen
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><CloseIcon className="w-5 h-5" /></motion.span>
            : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="16" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </motion.span>
          }
        </AnimatePresence>
      </button>
    </div>
  )
}

export default RightActions
