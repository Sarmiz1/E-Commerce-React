import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatMoneyCents } from "../../../../Utils/formatMoneyCents";
import { calculateTotalPrice } from "../Utils/calculateTotalPrice";
import { deleteData } from "../../../../api/deleteData";
import { putData } from "../../../../api/putData";
import { useContext, useState } from "react";
import { CartStateContext, CartActionsContext } from "../../../../Context/cartContext222";




const CartDrawer = ({
  cartOpen,
  setCartOpen,
}) => {

  const navigate = useNavigate()

  const [removeCartErrorMessage, setRemoveCartErrorMessage] = useState('')
  const [qtyUpdateErrorMessage, setQtyUpdateErrorMessage] = useState('')

  const { cart } = useContext(CartStateContext) || [];
  const { loadCart } = useContext(CartActionsContext) || null

  const totalPrice = calculateTotalPrice(cart);
  console.log("Cart Drawer")

  //  DELETE HANDLER
  const removeFromCart = async (productID) => {
    try {
      setRemoveCartErrorMessage(null);

      const deleteCartItemUrl = `/api/cart-items/${productID}`;

      // Only continues if deleteData succeeds (status 2xx)
      await deleteData(deleteCartItemUrl);

      // Reload cart and payment summary
      await loadCart();

    } catch (error) {
      console.error("Delete cart item failed:", error);
      setRemoveCartErrorMessage("Can't delete this item, try again.");
    }
  };

  const updateQuantity = async (productID, qty) => {

    try {
      setQtyUpdateErrorMessage(null)

      const cartUpdateUrl = `/api/cart-items/${productID}`;

      if (Number(qty) > 100) {
        setQtyUpdateErrorMessage('Quantity cant be more than 100')
        return;
      }

      if(Number(qty) < 1) return;

      const updatedQuantity = {
        quantity: qty,
      };

      await putData(cartUpdateUrl, updatedQuantity);

      await loadCart();

    } catch (error) {
      setQtyUpdateErrorMessage('Quantity update failed, try again.')
      console.log(error)
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <motion.div initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl z-[70] flex flex-col">

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black">Your Cart</h3>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">✕</button>
            </div>

            {
              qtyUpdateErrorMessage || removeCartErrorMessage && (
                <p className="text-red-500 text-sm font-medium flex justify-center items-center mt-2">
                  {qtyUpdateErrorMessage ? qtyUpdateErrorMessage : removeCartErrorMessage}
                </p>
              )
            }

            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {cart?.length === 0 && (<div className="text-center py-20"><div className="text-5xl mb-4">🛒</div><p className="text-gray-400 font-medium">Your cart is empty</p><button onClick={() => setCartOpen(false)} className="mt-4 text-indigo-600 text-sm font-semibold">Continue Shopping →</button></div>)}

              {cart?.map((item) => (
                <motion.div layout key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                  {item?.product?.image && <img src={item?.product?.image} alt={item.product?.name} className="w-16 h-16 object-cover rounded-xl" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item?.product?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatMoneyCents(item?.product?.priceCents)}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item?.product?.id, Number(item?.quantity - 1))} className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 text-sm font-bold flex items-center justify-center hover:bg-gray-100">−</button>

                      <span className="text-sm font-bold w-4 text-center">{item?.quantity}</span>
                      <button onClick={() => updateQuantity(item?.product?.id, Number(item?.quantity + 1))} className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 text-sm font-bold flex items-center justify-center hover:bg-gray-100">+</button>
                    </div>
                  </div>

                  <button onClick={() => removeFromCart(item?.product?.id)} className="text-gray-300 hover:text-red-400 transition text-lg self-start">✕</button>
                </motion.div>
              ))}
            </div>
            {cart?.length > 0 && (
              <div className="p-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4"><span className="text-gray-500 font-medium">Total</span><span className="text-2xl font-black text-gray-900">{formatMoneyCents(totalPrice)}</span></div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/30"
                onClick={()=> navigate('/checkout')}
                >Checkout →</motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
