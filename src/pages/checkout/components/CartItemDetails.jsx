import { useContext } from "react"
import checkOutContext from "../../../Context/checkOutContext"
import { formatDate } from "../../../Utils/formatDate"

function CartItemDetails({cartProduct, children}) {

  const{deliveryOptions} = useContext(checkOutContext)
  const selectedDeliveryOption = deliveryOptions

  find((deliveryOption) => {    
    return deliveryOption.id === cartProduct.deliveryOptionId
  })




  return(
    <>
      <div className="delivery-date text-greenPry font-bold mt-1 mb-5 text-[1.19rem]">
        Delivery date: {
        formatDate(selectedDeliveryOption.estimatedDeliveryTimeMs)
        }
      </div>

      <div className="cart-item-details-grid  grid lg:grid-cols-3 lg:gap-4 gap-2    
        grid-cols-2">
        <img className="product-image w-[100px] max-w-full max-h-[100px]"
          src={cartProduct.image} 
        />

        <div className="cart-item-details -ml-16 sm:-ml-[170px] md:-ml-[100px] mb-2">
          <div className="product-name font-bold mb-1">
            {cartProduct.name}
          </div>
          <div className="product-price font-bold mb-1">
            {cartProduct.price}
          </div>
          <div className="product-quantity">
            <span>
              Quantity: <span className="quantity-label">{cartProduct.quantity}</span>
            </span>
            <span className="update-quantity-link link-primary    
              ml-1 text-greenPry active:opacity-50 cursor-pointer hover:opacity-75">
              Update
            </span>
            <span className="delete-quantity-link link-primary  
              ml-1 text-greenPry active:opacity-50 cursor-pointer hover:opacity-75">
              Delete
            </span>
          </div>
        </div>

        {children}
      </div>

    </>
  )
}

export default CartItemDetails