import { formatDate } from "../../../Utils/formatDate";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useContext, useState } from "react";
import cartContext from "../../../Context/checkOutContext";
import dataContext from "../../../Context/cartContext";
import { putData } from '../../../api/putData'
import { ErrorMessage } from "../../../Components/ErrorMessage";


function CartItemDeliveryOption({ cartId, cartDeliveryOptionId }) {
  const { deliveryOptions, loadPaymentSumary } = useContext(cartContext);
  const { loadCart } = useContext(dataContext);

  const [errorMessage, setErrorMessage] = useState('')


  const handleOnClick = async (productId, deliveryOptionID) => {
    try {
      setErrorMessage(null)

      const cartUpdateUrl = `/api/cart-items/${productId}`;

      const deliveryDetails = {
        deliveryOptionId: deliveryOptionID,
      };

      await putData(cartUpdateUrl, deliveryDetails);

      await loadCart();
      await loadPaymentSumary();
    }

    catch (error) {
      setErrorMessage('Cant place an order, try again.')

    }

  };

  return (
    <div className="col-span-[1/2]">
      <div className=" font-bold mb-1 w-[200ch]">Choose a delivery option:</div>

      {deliveryOptions.length > 0 &&
        deliveryOptions.map((deliveryOption) => {
          return (
            <div
              className="flex mb-1 cursor-pointer gap-2"
              key={deliveryOption.id}
              onClick={() => handleOnClick(cartId, deliveryOption.id)}
            >
              <input
                type="radio"
                checked={deliveryOption.id === cartDeliveryOptionId}
                className=" w-4 focus:outline focus:outline-2 focus:outline-offset-2
                focus:outline-greenPry"
                name={`delivery-option-${cartId}`}
                onChange={() => { }}
              />
              <div>
                <div className=" w-full mb-1 font-medium text-[1rem]">
                  {formatDate(deliveryOption.estimatedDeliveryTimeMs)}
                </div>
                <div className="delivery-option-price  text-[1rem] text-[rgb(120, 120, 120)]">
                  {deliveryOption.priceCents === 0
                    ? "FREE Shipping"
                    : formatMoneyCents(deliveryOption.priceCents)}
                </div>
              </div>
              <ErrorMessage errorMessage={errorMessage} />

            </div>

          );
        })}
    </div>
  );
}

export default CartItemDeliveryOption;
