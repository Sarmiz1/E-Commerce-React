import { motion, AnimatePresence } from "framer-motion";
import { EXPO } from "../navConstants";
import { useCartState } from "../../../context/cart/CartContext";
import CartDropdownContent from "./CartDropdownContent";

export default function CartDropdown({
  cartOpen,
  setCartOpen,
  keepCart,
  closeCart,
}) {
  const { cart: cartItems, cartCount } = useCartState();

  return (
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
          <CartDropdownContent 
            cartItems={cartItems}
            cartCount={cartCount}
            setCartOpen={setCartOpen}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
