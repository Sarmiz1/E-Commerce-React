import CartItemDeliveryOption from "./CartItemDeliveryOption"
import CartItemDetails from "./CartItemDetails"


function CartItemContainer({cartProduct}) {

  
  

  return (
    <div className="cart-item-container border border-solid 
        border-[rgb(222, 222, 222)] rounded p-4 mt-3">
      <CartItemDetails 
        cartProduct={cartProduct}
        >
        <CartItemDeliveryOption 
          cartId={cartProduct.id}
          cartDeliveryOptionId={cartProduct.deliveryOptionId}
        />
      </CartItemDetails>
    </div>
  )
}


export default CartItemContainer