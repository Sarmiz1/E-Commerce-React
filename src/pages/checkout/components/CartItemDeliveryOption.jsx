import { formatDate } from "../../../Utils/formatDate";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useContext } from "react";
import cartContext from "../../../Context/checkOutContext";

function CartItemDeliveryOption({cartId, cartDeliveryOptionId}) {

  const {deliveryOptions} = useContext(cartContext)
      

  return (
    <div className="delivery-options col-span-[1/2]">

      <div className="delivery-options-title font-bold mb-1 w-[200ch]">
        Choose a delivery option:
      </div>

      {
        deliveryOptions.length > 0 && deliveryOptions.map(deliveryOption => {
          return(
          
            <div className="delivery-option flex mb-1 cursor-pointer gap-2" key={deliveryOption.id}>
              <input type="radio" 
                checked={deliveryOption.id === cartDeliveryOptionId}
                className="delivery-option-input w-4 focus:outline focus:outline-2 focus:outline-offset-2
                focus:outline-greenPry"
                name={`delivery-option-${cartId}`}
              />
              <div>
                <div className="delivery-option-date w-full mb-1 font-medium text-[1rem]">
                  {formatDate(deliveryOption.estimatedDeliveryTimeMs)}
                </div>
                <div className="delivery-option-price  text-[1rem] text-[rgb(120, 120, 120)]">
                  {deliveryOption.priceCents === 0 ? 'FREE Shipping'
                      :
                    formatMoneyCents(deliveryOption.priceCents)
                  }
                </div>
              </div>
            </div>
          )
        })
      }
      
    </div>
  )
}

export default CartItemDeliveryOption