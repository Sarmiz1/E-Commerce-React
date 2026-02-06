import CartItemDeliveryOption from "./CartItemDeliveryOption"
import CartItemDetails from "./CartItemDetails"


function CartItemContainer({cartProduct}) {

  return (
    <div class="cart-item-container border border-solid 
        border-[rgb(222, 222, 222)] rounded p-4 mt-3">
      <CartItemDetails cartProduct={cartProduct}>
        <CartItemDeliveryOption />
      </CartItemDetails>
    </div>
  )
}


export default CartItemContainer