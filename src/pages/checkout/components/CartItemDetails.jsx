import { useContext, useState, useRef } from "react";
import checkOutContext from "../../../Context/checkOutContext";
import { formatDate } from "../../../Utils/formatDate";
import dataContext from "../../../Context/cartContext";
import { putData } from "../../../api/putData";
import { deleteData } from "../../../api/deleteData"
import { ErrorMessage } from "../../../Components/ErrorMessage";


function CartItemDetails({ cartProduct, children }) {

  const [errorMessage, setErrorMessage] = useState('');


  const { deliveryOptions, loadPaymentSumary } =
    useContext(checkOutContext);

  const { loadCart } = useContext(dataContext);

  const [update, setUpdate] = useState(false);
  const updateInputRef = useRef(null);

  const selectedDeliveryOption = deliveryOptions;


  // 🔹 DELETE HANDLER
  const handleDelete = async () => {
    try {
      setErrorMessage(null)

      const deleteCartItemUrl = `/api/cart-items/${cartProduct.id}`;

      await deleteData(deleteCartItemUrl);

      await loadCart();
      await loadPaymentSumary();
    } catch (error) {
      setErrorMessage('cant delete this, try again.')
    }
  };

  // 🔹 UPDATE CLICK
  const handleUpdateClick = () => {
    setUpdate(true);

    if (updateInputRef.current) {
      updateInputRef.current.focus();
    }
  };

  // 🔹 UPDATE QUANTITY
  const updateCartItem = async (e) => {
    if (e.key !== "Enter") return;

    try {
      setErrorMessage(null)

      const cartUpdateUrl = `/api/cart-items/${cartProduct.id}`;
      const value = e.target.value;

      if (!value) {
        setUpdate(false);
        return;
      }

      if (Number(value) === 0) {
        await handleDelete();
        return;
      }

      if (Number(value) > 100) return;

      const updatedQuantity = {
        quantity: Number(value),
      };

      await putData(cartUpdateUrl, updatedQuantity);

      await loadCart();
      await loadPaymentSumary();

      setUpdate(false);
    } catch (error) {
      setErrorMessage('cant update this item, try again.')
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
          <ErrorMessage errorMessage={errorMessage} />
          1
        </div>

        {children}
      </div>
    </>
  );
}

export default CartItemDetails;
