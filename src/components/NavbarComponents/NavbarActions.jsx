import { AnimatePresence, motion as Motion } from "framer-motion";
import { useWishlist } from "../../hooks/useWishlist";
import { useAuth } from "../../Store/useAuthStore";
import { useLogout } from "../../hooks/auth/useLogout";
import { ThemeToggle } from "../Ui/ThemeToggle";
import { CartPreview } from "./CartPreview";
import {
  BagIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./Icons";

export function NavbarActions({
  isTop,
  searchOpen,
  searchTip,
  wishlistTip,
  accountTip,
  mobileOpen,
  cart,
  cartCount,
  cartRef,
  cartHover,
  cartBadgeKey,
  onToggleSearch,
  onSetSearchTip,
  onSetWishlistTip,
  onSetAccountTip,
  onSetCartHover,
  onNavigate,
  onToggleMobile,
  formatMoney,
}) {
  const iconTone = isTop
    ? "text-white/80 hover:text-white hover:bg-white/12"
    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100";
  const { wishlistCount } = useWishlist();
  const hasWishlistItems = wishlistCount > 0;
  const wishlistLabel = hasWishlistItems
    ? `Wishlist, ${wishlistCount} saved item${wishlistCount === 1 ? "" : "s"}`
    : "Wishlist";

  return (
    <div className="flex items-center gap-1 ml-auto flex-shrink-0">
      <div
        className="relative"
        onMouseEnter={() => onSetSearchTip(true)}
        onMouseLeave={() => onSetSearchTip(false)}
      >
        <button
          onClick={onToggleSearch}
          aria-label={searchOpen ? "Close search" : "Open search"}
          className={`nb-icon-btn ${iconTone} ${
            searchOpen
              ? isTop
                ? "bg-white/15 text-white"
                : "bg-indigo-50 !text-indigo-600"
              : ""
          }`}
        >
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <Motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CloseIcon />
              </Motion.span>
            ) : (
              <Motion.span
                key="s"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SearchIcon />
              </Motion.span>
            )}
          </AnimatePresence>
        </button>

        <Tooltip show={searchTip && !searchOpen} label="Search" />
      </div>

      <div
        className="relative hidden md:block"
        onMouseEnter={() => onSetWishlistTip(true)}
        onMouseLeave={() => onSetWishlistTip(false)}
      >
        <button
          onClick={() => onNavigate("/wishlist")}
          className={`nb-icon-btn ${hasWishlistItems ? "nb-wishlist-alert" : iconTone}`}
          aria-label={wishlistLabel}
          title={wishlistLabel}
        >
          <HeartIcon className="w-4 h-4" />
          <AnimatePresence>
            {hasWishlistItems && (
              <Motion.span
                key={wishlistCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="nb-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[10px] font-black text-red-600 shadow flex items-center justify-center"
              >
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </Motion.span>
            )}
          </AnimatePresence>
        </button>
        <Tooltip show={wishlistTip} label={wishlistLabel} />
      </div>

      <div
        className="relative hidden md:block"
        onMouseEnter={() => onSetAccountTip(true)}
        onMouseLeave={() => onSetAccountTip(false)}
      >
        <button
          onClick={() => onNavigate("/account")}
          className={`nb-icon-btn ${iconTone}`}
          aria-label="My Account"
        >
          <UserIcon />
        </button>
        <AccountDropdown show={accountTip} onNavigate={onNavigate} onClose={() => onSetAccountTip(false)} />
      </div>

      <div
        className={`hidden md:block w-px h-5 mx-1 ${isTop ? "bg-white/15" : "bg-gray-200"}`}
      />

      <div className="flex items-center">
        <ThemeToggle />
      </div>

      <div
        className="relative group"
        onMouseEnter={() => {
          if (typeof window !== "undefined" && window.innerWidth >= 768)
            onSetCartHover(true);
        }}
        onMouseLeave={() => {
          if (typeof window !== "undefined" && window.innerWidth >= 768)
            onSetCartHover(false);
        }}
      >
        <button
          ref={cartRef}
          onClick={(e) => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              e.preventDefault();
              onSetCartHover(!cartHover);
            }
          }}
          title={
            cartCount > 0
              ? `Shopping bag - ${cartCount} item${cartCount !== 1 ? "s" : ""}`
              : "Shopping bag - Empty"
          }
          className={`nb-icon-btn ${isTop ? "text-white hover:bg-white/12" : "text-gray-700 hover:bg-gray-100"}`}
          aria-label={`Shopping bag, ${cartCount} items`}
        >
          <BagIcon className="w-[22px] h-[22px]" />
          <AnimatePresence>
            {cartCount > 0 && (
              <Motion.span
                key={cartBadgeKey}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`nb-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white shadow ${
                  isTop ? "bg-indigo-400" : "bg-indigo-600"
                }`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </Motion.span>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {cartHover && (
            <Motion.div
              key="navbar-cart-dropdown"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "top right" }}
              className="absolute top-full right-0 pt-[14px] z-50 w-[calc(100vw-24px)] md:w-[360px] max-w-[360px]"
            >
              <div className="w-full max-h-[480px] rounded-[24px] overflow-hidden bg-white/98 shadow-[0_24px_80px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.08)] border border-black/5 backdrop-blur-[24px] flex flex-col">
                <CartPreview
                  cart={cart}
                  onNavigate={(href) => {
                    onNavigate(href);
                    onSetCartHover(false);
                  }}
                  formatMoney={formatMoney}
                />
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => onNavigate("/ai-shop")}
        className="hidden lg:flex items-center gap-1.5 font-bold text-[0.8125rem] px-4 py-2 rounded-full ml-1"
        style={
          isTop
            ? {
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.22)",
              }
            : {
                background: "linear-gradient(135deg,#2563eb,#6366f1)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(99,102,241,0.32)",
              }
        }
      >
        AI Shop
      </button>

      <button
        onClick={onToggleMobile}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        title={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        className={`nb-icon-btn flex lg:hidden ${isTop ? "text-white hover:bg-white/12" : "text-gray-700 hover:bg-gray-100"}`}
      >
        <AnimatePresence mode="wait">
          {mobileOpen ? (
            <Motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CloseIcon className="w-5 h-5" />
            </Motion.span>
          ) : (
            <Motion.span
              key="m"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MenuIcon />
            </Motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

function Tooltip({ show, label }) {
  return (
    <AnimatePresence>
      {show && (
        <Motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-50"
        >
          {label}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

function AccountDropdown({ show, onNavigate, onClose }) {
  const { user } = useAuth();
  const logout = useLogout();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : null;

  const handleLogout = async (e) => {
    e.stopPropagation();
    onClose();
    await logout();
  };

  return (
    <AnimatePresence>
      {show && (
        <Motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "top right" }}
          className="absolute top-full right-0 pt-3 z-50 w-56"
        >
          <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#0D1421] shadow-[0_16px_48px_rgba(0,0,0,0.16)] border border-black/8 dark:border-white/10">
            {user ? (
              <>
                {/* User info header */}
                <div className="px-4 py-3.5 border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Signed in as</p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Nav links */}
                <div className="py-1">
                  {[
                    { label: "My Account", path: "/account" },
                    { label: "My Orders", path: "/orders" },
                    { label: "Wishlist", path: "/wishlist" },
                  ].map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => { onNavigate(item.path); onClose(); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 dark:border-white/10 py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors font-semibold flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Guest state */}
                <div className="px-4 py-4 text-center border-b border-gray-100 dark:border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <UserIcon className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-0.5">Welcome to WooSho</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Sign in to access your account</p>
                </div>

                <div className="p-3 flex flex-col gap-2">
                  <Motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { onNavigate("/login"); onClose(); }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
                  >
                    Sign In
                  </Motion.button>
                  <button
                    type="button"
                    onClick={() => { onNavigate("/signup"); onClose(); }}
                    className="w-full text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition-colors"
                  >
                    Create Account →
                  </button>
                </div>
              </>
            )}
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

