import ButtonPrimary from "../../../components/ButtonPrimary";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useContext } from "react";
import checkOutContext from "../../../Context/checkOutContext";
import { usePostData } from "../../../Hooks/usePost";
import cartContext from "../../../Context/cartContext";
import { useNavigate } from "react-router-dom";

function PaymentSumary({ deliveryOptions }) {
  const navigate = useNavigate();

  const { paymentSumary } = useContext(checkOutContext);
  const { loadCart } = useContext(cartContext);

  const placeOrderClick = () => {
    const placeOrderApiUrl = "/api/orders";

    usePostData(placeOrderApiUrl);

    loadCart();

    navigate("/orders");
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
            <div>Items ({paymentSumary.totalItems}):</div>
            <div className=" ml-auto">
              {formatMoneyCents(paymentSumary.productCostCents)}
            </div>
          </div>

          <div className=" flex">
            <div>Shipping &amp; handling:</div>
            <div className=" ml-auto">
              {formatMoneyCents(paymentSumary.shippingCostCents)}
            </div>
          </div>

          <div className="flex mb-2">
            <div className="pt-2">Total before tax:</div>
            <div
              className=" ml-auto border border-solid 
            border-borderColor border-t-0 border-l-0 border-r-0 pt-2"
            >
              {formatMoneyCents(paymentSumary.totalCostBeforeTaxCents)}
            </div>
          </div>

          <div
            className=" flex border border-t-0 border-l-0 
          border-r-0 border-borderColor"
          >
            <div>Estimated tax (10%):</div>
            <div className=" ml-auto">
              {formatMoneyCents(paymentSumary.taxCents)}
            </div>
          </div>

          <div
            className=" text-greenPry font-bold text-lg
          pt-4 flex"
          >
            <div>Order total:</div>
            <div className=" ml-auto">
              {formatMoneyCents(paymentSumary.totalCostCents)}
            </div>
          </div>

          <ButtonPrimary
            handleOnclick={placeOrderClick}
            text={"Place your order"}
            className={"w-full py-3 rounded-md my-5  hover:outline-lime-400"}
          />
        </div>
      )}
    </>
  );
}

export default PaymentSumary;
