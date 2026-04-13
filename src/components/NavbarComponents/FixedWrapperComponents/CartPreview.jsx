import { motion, AnimatePresence } from "framer-motion";
import { useContext } from "react";
import { CartStateContext, CartActionsContext } from "../../../Context/cartContext";
import { deleteData } from "../../../api/deleteData";
import { formatMoneyCents as formatMoney} from "../../../Utils/formatMoneyCents";

function CartPreview(
  {
    onNavigate,
    BagIcon,
    ArrowRight
  }) {

  const { cart } = useContext(CartStateContext) || [];
  const { loadCart } = useContext(CartActionsContext) || null;

  console.log("Cart: ", cart);


  const totalPrice = cart.reduce((a, i) => a + i?.product?.priceCents * i?.quantity, 0);

  const TrashIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );

  const onRemove = async (productID) => {
    try {

      const deleteCartItemUrl = `/api/cart-items/${productID}`;

      // Only continues if deleteData succeeds (status 2xx)
      await deleteData(deleteCartItemUrl);

      // Reload cart and payment summary
      await loadCart();

    } catch (error) {
      console.error("Delete cart item failed:", error);
    }
  };

  return (
    <div className="nb-cart-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BagIcon className="w-5 h-5 text-indigo-600" />
          <span className="font-black text-gray-900 text-sm">Your Bag</span>
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full">
            {cart.reduce((a, i) => a + i.quantity, 0)} items
          </span>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onNavigate("/cart")}
          className="text-indigo-600 text-xs font-bold hover:text-indigo-800 transition-colors flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </motion.button>
      </div>

      {/* Items */}
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <BagIcon className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-gray-400 text-sm">Your bag is empty</p>
          <p className="text-gray-300 text-xs mt-1">Add some items to get started</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("/products")}
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md">
            Start Shopping →
          </motion.button>
        </div>
      ) : (
        <>
          <div className="nb-cart-scroll overflow-y-auto max-h-[260px] px-4 py-3 space-y-3">
            <AnimatePresence initial={false}>
              {cart.map((item) => (
                <motion.div key={item?.product?.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex gap-3 items-start group">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {console.log(item)}
                    {item?.product?.image && <img src={item?.product?.image} alt={item?.product?.name} className="w-full h-full object-cover" />}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-xs leading-tight line-clamp-1">{item?.product?.name}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">Qty: {item?.quantity}</p>
                    <p className="font-black text-indigo-600 text-sm mt-0.5">{formatMoney(Number(item?.product?.priceCents) * Number(item?.quantity))}</p>
                  </div>
                  {/* Remove */}
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => onRemove(item?.product?.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrashIcon className="w-3 h-3 text-red-400" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 text-xs font-medium">Subtotal</span>
              <span className="font-black text-gray-900 text-base">{formatMoney(totalPrice)}</span>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate("/checkout")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3 rounded-2xl text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
              Checkout  <ArrowRight className="w-4 h-4" />
            </motion.button>
            <p className="text-center text-[10px] text-gray-400 mt-2">🔒 Secure checkout · Free returns</p>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPreview
