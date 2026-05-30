import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { useCartActions } from "../../../context/cart/CartContext";
import { formatMoneyMinor } from "../../../utils/formatMoneyMinor";

const getDropdownItemKey = (item) =>
  item?.variant_id || item?.product_id || item?.products?.id || item?.id;

const getDropdownItemName = (item) =>
  item?.products?.name || item?.product?.name || item?.name || item?.title || "Cart item";

const getDropdownItemImage = (item) =>
  item?.thumbnail || item?.image || item?.products?.image || item?.product?.image;

const getDropdownItemPrice = (item) =>
  item?.unit_price_minor ??
  item?.price_minor ??
  item?.priceMinor ??
  item?.price ??
  item?.variant?.price_minor ??
  item?.products?.price_minor ??
  item?.product?.price_minor ??
  0;

export default function CartDropdownContent({ cartItems = [], cartCount, setCartOpen }) {
  const { removeItem, removingItem, removingItemId } = useCartActions();

  return (
    <div
      className="flex w-full flex-col"
      style={{ height: "min(352px, calc(100vh - 112px))" }}
    >
      {cartCount > 0 ? (
        <>
          <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-white/10">
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
          <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
            <AnimatePresence initial={false}>
              {cartItems.slice(0, 5).map((item, i) => {
                const itemKey = getDropdownItemKey(item);
                const itemMutationKey = item?.id || itemKey;
                const itemName = getDropdownItemName(item);
                const itemImage = getDropdownItemImage(item);
                const isRemoving =
                  removingItem === true ||
                  removingItem === itemMutationKey ||
                  removingItemId === itemMutationKey ||
                  removingItem === itemKey ||
                  removingItemId === itemKey;

                return (
                  <motion.div
                    key={itemKey || i}
                    layout="position"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: isRemoving ? 0.55 : 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    {itemImage && (
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {itemName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.quantity ?? 1} x {formatMoneyMinor(getDropdownItemPrice(item))}
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeItem(item);
                      }}
                      disabled={!itemKey || isRemoving}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      aria-label={`Remove ${itemName} from cart`}
                      title="Remove from cart"
                    >
                      {isRemoving ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-white/[0.03]">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors"
              >
                Checkout &rarr;
              </Link>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
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
            Start shopping &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
