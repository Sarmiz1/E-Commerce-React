import { NavLink } from "react-router-dom";
import { useContext } from "react";
import dataContext from "../../Context/cartContext";

export default function Cart() {
  const { cart } = useContext(dataContext);

  const cartQty = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  return (
    <div className="relative group">
      <NavLink
        to="/checkout"
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-700 transition text-white font-semibold"
      >
        <img src="images/icons/cart-icon.png" alt="Cart" className="w-7" />
        <span>Cart</span>
        {cartQty > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-limeGreen text-white w-5 h-5 text-xs rounded-full flex items-center justify-center font-bold">
            {cartQty}
          </span>
        )}
      </NavLink>

      {cartQty > 0 && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
          <p className="font-semibold mb-2">Cart Items ({cartQty})</p>
          <div className="divide-y divide-gray-200 max-h-56 overflow-y-auto">
            {cart.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-gray-500">{item.quantity} × ${item.product.price}</p>
                </div>
                <p className="font-semibold">${item.quantity * item.product.price}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between font-semibold text-gray-800">
            <span>Total:</span>
            <span>${totalPrice}</span>
          </div>
          <NavLink
            to="/checkout"
            className="block mt-3 text-center bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
          >
            Go to Checkout
          </NavLink>
        </div>
      )}
    </div>
  );
}