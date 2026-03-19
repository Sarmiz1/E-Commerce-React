import { useContext, useState, useRef } from "react";
import checkOutContext from "../../../Context/checkOutContext";
import { formatDate } from "../../../Utils/formatDate";
import dataContext from "../../../Context/cartContext";
import { putData } from "../../../api/putData";
import { deleteData } from "../../../api/deleteData"

function CartItemDetails({ cartProduct, children }) {
  const { deliveryOptions, loadPaymentSumary } = useContext(checkOutContext);
  const selectedDeliveryOption = deliveryOptions;

  const { loadCart } = useContext(dataContext);

  const [update, setUpdate] = useState(false);

  const updateInputRef = useRef(null);

  const handleDelete = () => {
    const deleteCartItemUrl = `/api/cart-items/${cartProduct.id}`;

    deleteData(deleteCartItemUrl);

    loadCart();

    loadPaymentSumary();
  };

  const handleUpdateClick = () => {
    setUpdate(true);

    updateInputRef.current.focus();
  };

  const updateCartItem = (e) => {
    const cartUpdateUrl = `/api/cart-items/${cartProduct.id}`;

    const updatedQuantity = {
      quantity: Number(e.target.value),
    };

    if (e.key === "Enter") {
      if (updatedQuantity.quantity > 100) return;

      if (e.target.value === "") {
        setUpdate(false);

        e.target.value = "";

        return;
      }

      if (e.target.value === "0") {
        handleDelete();

        return;
      }

      putData(cartUpdateUrl, updatedQuantity);
      loadCart();
      loadPaymentSumary();
      setUpdate(false);
    }
  };

  return (
    <>
      <div className=" text-greenPry font-bold mt-1 mb-5 text-[1.19rem]">
        Delivery date:{" "}
        {formatDate(selectedDeliveryOption.estimatedDeliveryTimeMs)}
      </div>

      <div
        className="cart-item-details-grid  grid lg:grid-cols-3 lg:gap-4 gap-2    
        grid-cols-2"
      >
        <img
          className=" w-[100px] max-w-full max-h-[100px]"
          src={cartProduct.image}
        />

        <div className=" -ml-8 md:-ml-32 mb-2 lg:-ml-10">
          <div className="font-bold mb-1">{cartProduct.name}</div>
          <div className="font-bold mb-1">{cartProduct.price}</div>
          <div>
            <span>
              Quantity: <span>{cartProduct.quantity}</span>
            </span>

            <span
              onClick={handleUpdateClick}
              className={` ml-1 text-greenPry active:opacity-50 cursor-pointer hover:opacity-75 ${update ? "hidden" : ""}
              `}
            >
              Update
            </span>

            <input
              ref={updateInputRef}
              onKeyDown={updateCartItem}
              type="number"
              className={`w-20 border-2 mx-3 border-greenPry rounded-md pl-2 py-[1px]
              ${!update ? "hidden" : ""}`}
            />

            <span
              onClick={handleDelete}
              className="ml-1 text-greenPry active:opacity-50 cursor-pointer hover:opacity-75"
            >
              Delete
            </span>
          </div>
        </div>

        {children}
      </div>
    </>
  );
}

export default CartItemDetails;
