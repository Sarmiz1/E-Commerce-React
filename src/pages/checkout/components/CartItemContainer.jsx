import CartItemDeliveryOption from "./CartItemDeliveryOption";
import CartItemDetails from "./CartItemDetails";
import { ErrorMessage } from "../../../Components/ErrorMessage";
import { useState } from "react";

function CartItemContainer({ cartProduct }) {

    const [errorMessage, setErrorMessage] = useState('')

  return (
    <div
      className=" border border-solid 
        border-[rgb(222, 222, 222)] rounded p-4 mt-3"
    >
      <CartItemDetails cartProduct={cartProduct}>
        <CartItemDeliveryOption
          cartId={cartProduct.id}
          cartDeliveryOptionId={cartProduct.deliveryOptionId}
          setErrorMessage={setErrorMessage}
        />
        <ErrorMessage errorMessage={errorMessage} />

      </CartItemDetails>
    </div>
  );
}

export default CartItemContainer;
