function CartItemDeliveryOption() {

  return (
    <div className="delivery-options col-span-[1/2]">
      <div className="delivery-options-title font-bold mb-[10px] w-[200ch]">
        Choose a delivery option:
      </div>
      <div className="delivery-option flex mb-3 cursor-pointer gap-2">
        <input type="radio" checked
          className="delivery-option-input w-5"
          name="delivery-option-1" 
        />
        <div>
          <div className="delivery-option-date w-full">
            Tuesday, June 21
          </div>
          <div className="delivery-option-price">
            FREE Shipping
          </div>
        </div>
      </div>
      <div className="delivery-option">
        <input type="radio"
          className="delivery-option-input"
          name="delivery-option-1" />
        <div>
          <div className="delivery-option-date">
            Wednesday, June 15
          </div>
          <div className="delivery-option-price">
            $4.99 - Shipping
          </div>
        </div>
      </div>
      <div className="delivery-option">
        <input type="radio"
          className="delivery-option-input"
          name="delivery-option-1" />
        <div>
          <div className="delivery-option-date">
            Monday, June 13
          </div>
          <div className="delivery-option-price">
            $9.99 - Shipping
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItemDeliveryOption