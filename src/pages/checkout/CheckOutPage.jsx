import CheckoutHeader from "./Components/CheckoutHeader";
import CartItemContainer from "./Components/CartItemContainer";
import PaymentSumary from "./Components/PaymentSummary";
import { useContext, useState, useEffect } from "react";
import dataContext from "../../Context/cartContext";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import checkOutContext from "../../Context/checkOutContext";
import { useFetchData } from "../../Hooks/useFetch";
import axios from "axios";

function CheckOutPage() {
  const { cart } = useContext(dataContext);

  const deliveryApiUrl = "/api/delivery-options?expand=estimatedDeliveryTime";

  const {
    fetchedData: deliveryOptions,
    error: deliveryFetchError,
    isLoading,
  } = useFetchData(deliveryApiUrl);

  const [paymentSumary, setPaymentSumary] = useState(null);

  const loadPaymentSumary = async () => {
    const paymentSumUrl = "/api/payment-summary";
    const response = await axios.get(paymentSumUrl);

    setPaymentSumary(response.data);
  };

  useEffect(() => {
    loadPaymentSumary();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-slate-800 h-screen flex justify-center items-center overflow-hidden">
        <img
          src="/public/images/loading/loading-shopping-cart.png"
          alt="shopping-cart.png"
          className="animate-slide-x size-36"
        />
      </div>
    );
  }

  return (
    <>
      <title>Checkout</title>
      <checkOutContext.Provider
        value={{
          deliveryOptions,
          deliveryFetchError,
          loadPaymentSumary,
          paymentSumary,
        }}
      >
        <div className="m-0 p-0">
          <CheckoutHeader />
          <div className="md:w-full checkout-page mx-auto max-w-[1100px] mt-36 mb-24 px-8 overflow-x-hidden">
            <div className=" font-bold text-[22px] mb-[18px]">
              Review your order
            </div>

            <div
              className=" flex flex-col gap-3 lg:flex-row lg:items-start      
              "
            >
              <div className=" order-2 lg:order-1 lg:w-[80%]">
                {cart?.map((cartItem) => {
                  return (
                    <CartItemContainer
                      key={cartItem.productId}
                      cartProduct={{
                        name: cartItem.product.name,
                        price: formatMoneyCents(cartItem.product.priceCents),
                        quantity: cartItem.quantity,
                        deliveryOptionId: cartItem.deliveryOptionId,
                        image: cartItem.product.image,
                        id: cartItem.productId,
                      }}
                    />
                  );
                })}
              </div>
              <PaymentSumary deliveryOptions={deliveryOptions} />
            </div>
          </div>
        </div>
      </checkOutContext.Provider>
    </>
  );
}

export default CheckOutPage;
