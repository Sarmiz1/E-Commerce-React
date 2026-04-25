import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { EXPO } from "../navConstants";
import { useCartState } from "../../../Context/cart/CartContext";

export default function CartDropdown({
  cartOpen,
  setCartOpen,
  keepCart,
  closeCart,
}) {
  const { cart: cartItems, cartCount } = useCartState();
  console.log("Cart items in dropdown:", cartItems);
  console.log("Cart count in dropdown:", cartCount);

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
          {cartCount > 0 ? (
            <>
              <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  Cart <span className="text-blue-600">({cartCount})</span>
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
                {cartItems.slice(0, 5).map((item, i) => (
                  <motion.div
                    key={item?.id || i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    {(item?.thumbnail ?? item?.image) && (
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
  );
}
