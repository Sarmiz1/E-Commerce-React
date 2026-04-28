import { AnimatePresence, motion as Motion } from "framer-motion";
import { ArrowRight, BagIcon } from "./Icons";
import { DeleteFromCartBtn } from "../Ui/DeleteFromCartBtn";

export function CartPreview({ cart, onNavigate, formatMoney }) {
  const itemCount = cart.reduce((a, i) => a + i.quantity, 0);
  const totalPrice = cart.reduce((a, i) => a + (i.price ?? 0) * i.quantity, 0);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <BagIcon className="w-5 h-5 text-indigo-600" />
          <span className="font-black text-gray-900 dark:text-white text-sm">Your Bag</span>
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-full">
            {itemCount} items
          </span>
        </div>

        <Motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate("/cart")}
          className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:text-indigo-800 transition-colors flex items-center gap-1"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Motion.button>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <BagIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="font-bold text-gray-400 dark:text-gray-500 text-sm">Your bag is empty</p>
          <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Add some items to get started</p>
          <Motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("/products")}
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md"
          >
            Start Shopping
          </Motion.button>
        </div>
      ) : (
        <>
          <div className="nb-cart-scroll overflow-y-auto max-h-[260px] px-4 py-3 space-y-3">
            <AnimatePresence initial={false}>
              {cart.map((item, i) => (
                <Motion.div
                  key={item?.id || i}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex gap-3 items-start group"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-white/5">
                    {(item.thumbnail || item.image) && (
                      <img src={item.thumbnail || item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-xs leading-tight line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5">Qty: {item.quantity}</p>
                    <p className="font-black text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">
                      {formatMoney((item.price ?? 0) * item.quantity)}
                    </p>
                  </div>

                  <DeleteFromCartBtn itemId={item.id} />
                </Motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Subtotal</span>
              <span className="font-black text-gray-900 dark:text-white text-base">{formatMoney(totalPrice)}</span>
            </div>
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate("/checkout")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3 rounded-2xl text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </Motion.button>
            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">Secure checkout - Free returns</p>
          </div>
        </>
      )}
    </div>
  );
}
