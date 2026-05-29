import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Sparkles } from "lucide-react";
import ThemeToggle from "../../Features/Marketting/ModernLanding/Components/ThemeToggle";
import CartDropdown from "./DesktopActionsComponents/CartDropdown";
import { EXPO } from "./navConstants";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Features/Auth/AuthContext";
import { User, LogOut, LogIn } from "lucide-react";

export default function DesktopActions({
  cartCount,
  cartItems,
  cartOpen,
  setCartOpen,
  openCart,
  closeCart,
  keepCart,
}) {
  const navigate = useNavigate();
  const { user, logOut } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: EXPO }}
      className="hidden md:flex items-center gap-3"
    >
      <ThemeToggle />

      {/* Cart */}
      <div className="relative" onMouseEnter={openCart} onMouseLeave={closeCart}>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="relative p-2 text-white hover:text-blue-400 transition-colors"
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
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-black"
              >
                {cartCount > 9 ? "9+" : cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <CartDropdown
          cartOpen={cartOpen}
          cartCount={cartCount}
          cartItems={cartItems}
          setCartOpen={setCartOpen}
          keepCart={keepCart}
          closeCart={closeCart}
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(37,99,235,0.4)" }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate("/ai-shop")}
        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-colors hover:bg-blue-700"
      >
        AI Shop
        <Sparkles size={15} className="animate-pulse" />
      </motion.button>

      {user ? (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/account")}
            className="p-2 text-white hover:text-blue-400 transition-colors flex items-center justify-center rounded-full"
            title="Account"
          >
            <User size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => logOut()}
            className="p-2 text-white hover:text-red-400 transition-colors flex items-center justify-center rounded-full"
            title="Logout"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:border-white/50 hover:bg-white/10 rounded-full transition-all"
        >
          <LogIn size={16} />
          Login
        </motion.button>
      )}
    </motion.div>
  );
}
