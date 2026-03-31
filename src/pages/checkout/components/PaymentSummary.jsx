import { ButtonPrimary } from "../../../Components/Ui/ButtonPrimary"; 
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useContext, useState } from "react";
import checkOutContext from "../../../Context/checkOutContext";
import { postData } from "../../../api/postData";
import cartContext from "../../../Context/cartContext";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "../../../Components/ErrorMessage";

function PaymentSumary({ deliveryOptions }) {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState('')

  const { paymentSumary } = useContext(checkOutContext);
  const { loadCart, cart } = useContext(cartContext);

  const placeOrderClick = async () => {
    try {
      setErrorMessage(null);

      // Send order request
      const response = await postData("/api/orders");

      // Only navigate if response looks valid
      if (!response || Object.keys(response).length === 0) {
        // Backend returned nothing → treat as failure
        throw new Error("Order not created");
      }

      // ✅ At this point, order went through
      await loadCart();
      navigate("/orders");

    } catch (error) {
      if(cart.length === 0) setErrorMessage("Cart is Empty");
      else setErrorMessage("Order failed, try again.");
    }
  };

  
  return (
    <>
      {deliveryOptions.length > 0 && (
        <div
          className=" lg:w-[400px] border border-solid 
          border-borderColor rounded px-5 pt-5 pb-2
          lg:grid-rows-1 lg:mt-3  order-1 lg:order-2 text-[15px]"
        >
          <div className=" font-bold text-lg mb-1">Payment Summary</div>

          <div className="flex mb-2">
            <div>Items ({paymentSumary?.totalItems}):</div>
            <div className=" ml-auto">
              {formatMoneyCents(paymentSumary?.productCostCents)}
            </div>
          </div>

          <div className=" flex">
            <div>Shipping &amp; handling:</div>
            <div className=" ml-auto">
              {formatMoneyCents(paymentSumary?.shippingCostCents)}
            </div>
          </div>

          <div className="flex mb-2">
            <div className="pt-2">Total before tax:</div>
            <div
              className=" ml-auto border border-solid 
            border-borderColor border-t-0 border-l-0 border-r-0 pt-2"
            >
              {formatMoneyCents(paymentSumary?.totalCostBeforeTaxCents)}
            </div>
          </div>

          <div
            className=" flex border border-t-0 border-l-0 
          border-r-0 border-borderColor"
          >
            <div>Estimated tax (10%):</div>
            <div className=" ml-auto">
              {formatMoneyCents(paymentSumary?.taxCents)}
            </div>
          </div>

          <div
            className=" text-greenPry font-bold text-lg
          pt-4 flex"
          >
            <div>Order total:</div>
            <div className=" ml-auto">
              {formatMoneyCents(paymentSumary?.totalCostCents)}
            </div>
          </div>

          <ButtonPrimary
            onClick={placeOrderClick}
            size="full"
            variant="primary"
            className=" my-5 hover:bg-darkGreen shadow-md hover:opacity-90"
          >
            Place your order
          </ButtonPrimary>
          <ErrorMessage errorMessage={errorMessage} />
        </div>
      )}
    </>
  );
}

export default PaymentSumary;
