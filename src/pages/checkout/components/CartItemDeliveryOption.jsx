import { useContext } from "react"
import dataContext from '../../../context/dataContext'

function CartItemDeliveryOption() {
  const {cart} = useContext(dataContext)
  

  return(
  <>
    {cart.map(product => {
        return (
        <div className="delivery-options col-span-[1/2]" key={product.id}>
          <div className="delivery-options-title font-bold mb-1 w-[200ch]">
            Choose a delivery option:
          </div>
          
          <div className="delivery-option flex mb-1 cursor-pointer gap-2">
            <input type="radio" checked
              className="delivery-option-input w-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-greenPry"
              name={`delivery-option-${product.id}`} 
            />
            <div>
              <div className="delivery-option-date w-full mb-1 font-medium text-[1rem]">
                Tuesday, June 21
              </div>
              <div className="delivery-option-price  text-[1rem] text-[rgb(120, 120, 120)]">
                FREE Shipping
              </div>
            </div>
          </div>
          <div className="delivery-option flex mb-3 cursor-pointer gap-2">
            <input type="radio"
              className="delivery-option-input w-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-greenPry"
              name={`delivery-option-${product.id}`} />
            <div>
              <div className="delivery-option-date w-full mb-1 font-medium text-[1rem]">
                Wednesday, June 15
              </div>
              <div className="delivery-option-price  text-[1rem] text-[rgb(120, 120, 120)]">
                $4.99 - Shipping
              </div>
            </div>
          </div>
          <div className="delivery-option flex mb-1 cursor-pointer gap-2">
            <input type="radio"
              className="delivery-option-input w-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-greenPry"
              name={`delivery-option-${product.id}`}/>
            <div>
              <div className="delivery-option-date w-full mb-1 font-medium text-[1rem]">
                Monday, June 13
              </div>
              <div className="delivery-option-price  text-[1rem] text-[rgb(120, 120, 120)]">
                $9.99 - Shipping
              </div>
            </div>
          </div>
        </div>
      )
    })}
  </>
  )
  
}

export default CartItemDeliveryOption