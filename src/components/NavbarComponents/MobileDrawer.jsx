import { AnimatePresence, motion as Motion } from "framer-motion";
import { useWishlist } from "../../hooks/useWishlist";
import { Logo } from "../Ui/Logo";
import { ThemeToggle } from "../Ui/ThemeToggle";
import { ArrowRight, BagIcon, CloseIcon, HeartIcon, UserIcon } from "./Icons";

const accountLinks = [
  { icon: <UserIcon className="w-4 h-4" />, label: "My Account", href: "/account" },
  { icon: <HeartIcon className="w-4 h-4" />, label: "Wishlist", href: "/product/wishlist" },
  { icon: <BagIcon className="w-4 h-4" />, label: "My Orders", href: "/tracking" },
];

export function MobileDrawer({ open, isDark, pathname, links, categories, offers, onClose, onNavigate }) {
  const { wishlistCount } = useWishlist();
  const hasWishlistItems = wishlistCount > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[97] bg-black/45 lg:hidden"
            style={{ backdropFilter: "blur(4px)" }}
          />

          <Motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-[98] lg:hidden flex flex-col"
            style={{
              width: "min(360px, 88vw)",
              background: isDark ? "rgba(10,10,12,0.98)" : "rgba(255,255,255,0.99)",
              backdropFilter: "blur(32px)",
              boxShadow: isDark ? "-20px 0 80px rgba(0,0,0,0.5)" : "-8px 0 60px rgba(0,0,0,0.2)",
            }}
          >
            <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
              <div className="flex items-center gap-2">
                <Logo isDark={isDark} />
              </div>
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                <CloseIcon className={`w-4 h-4 ${isDark ? "text-gray-300" : "text-gray-500"}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Menu</p>
                {links.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <Motion.button
                      key={link.label}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => onNavigate(link.href)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left font-semibold text-sm transition-all duration-180 mb-1 ${
                        isActive ? (isDark ? "bg-white/10 text-white" : "bg-indigo-50 text-indigo-700") : isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50"
                      } ${link.accent ? "!text-orange-500 font-black" : ""}`}
                    >
                      <span>{link.accent && "% "}{link.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </Motion.button>
                  );
                })}
              </div>

              <div className={`px-4 py-3 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-3">Shop by Category</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat, i) => (
                    <Motion.button
                      key={cat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      onClick={() => onNavigate("/products")}
                      className="relative overflow-hidden text-white p-4 rounded-2xl text-left flex flex-col gap-1 group"
                    >
                      <img src={cat.image} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                      <span className="relative z-10 text-2xl">{cat.emoji}</span>
                      <span className="relative z-10 font-bold text-sm drop-shadow-md">{cat.label}</span>
                    </Motion.button>
                  ))}
                </div>
              </div>

              <div className={`px-4 py-3 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-3">Offers</p>
                <div className="space-y-2">
                  {offers.map((offer, i) => (
                    <Motion.button
                      key={offer.label}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      onClick={() => onNavigate("/products")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all hover:scale-[1.01] ${isDark ? "bg-white/[0.03] border-white/5" : offer.color}`}
                    >
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${isDark ? "text-white" : offer.textColor}`}>{offer.label}</p>
                        <p className="text-gray-500 text-xs">{offer.desc}</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${isDark ? "text-white/40" : offer.textColor} opacity-60`} />
                    </Motion.button>
                  ))}
                </div>
              </div>

              <div className={`px-4 py-3 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Account</p>
                {accountLinks.map((item, i) => {
                  const isWishlist = item.href === "/product/wishlist";
                  const isActive = pathname === item.href;
                  const showWishlistState = isWishlist && hasWishlistItems;
                  const itemLabel = showWishlistState
                    ? `Wishlist (${wishlistCount > 99 ? "99+" : wishlistCount})`
                    : item.label;

                  return (
                    <Motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 + i * 0.05 }}
                      onClick={() => onNavigate(item.href)}
                      aria-label={isWishlist ? `Wishlist, ${wishlistCount} saved item${wishlistCount === 1 ? "" : "s"}` : item.label}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all mb-1 text-sm font-semibold text-left ${
                        isActive
                          ? isDark
                            ? "bg-white/10 text-white"
                            : "bg-indigo-50 text-indigo-700"
                          : isDark
                            ? "text-gray-300 hover:bg-white/5"
                            : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          showWishlistState
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/25 animate-pulse"
                            : isDark
                              ? "bg-white/5 text-white"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.icon}
                        {showWishlistState && (
                          <span className="absolute -right-1.5 -top-1.5 min-w-[17px] h-[17px] rounded-full bg-white px-1 text-[9px] font-black leading-[17px] text-red-600 shadow">
                            {wishlistCount > 99 ? "99+" : wishlistCount}
                          </span>
                        )}
                      </span>
                      <span className="flex-1">{itemLabel}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </Motion.button>
                  );
                })}
              </div>
            </div>

            <div className={`px-4 py-5 border-t ${isDark ? "border-white/5 bg-black/20" : "border-gray-100 bg-gray-50/50"}`}>
              <button onClick={() => onNavigate("/products")} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl text-sm shadow-lg shadow-indigo-500/30">
                Shop All Products
              </button>
              <p className="text-center text-gray-400 text-[11px] mt-2.5">Free shipping on orders over $50</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className={`text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
