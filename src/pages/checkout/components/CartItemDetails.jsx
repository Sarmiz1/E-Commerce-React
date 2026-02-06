
function CartItemDetails({cartProduct, children}) {
  


  return(
    <>
      <div className="delivery-date text-greenPry font-bold text-sm mt-1 mb-5">
        Delivery date: {cartProduct.deliveryDate}
      </div>

      <div className="cart-item-details-grid  grid lg:grid-cols-3 lg:gap-8 gap-6    
        grid-cols-2">
        <img className="product-image w-[100px] max-w-full max-h-[120px] mx-auto"
          src={cartProduct.image} 
        />

        <div className="cart-item-details">
          <div className="product-name font-bold mb-[5px]">
            {cartProduct.name}
          </div>
          <div className="product-price font-bold mb-1">
            {cartProduct.price}
          </div>
          <div className="product-quantity">
            <span>
              Quantity: <span className="quantity-label">{cartProduct.quantity}</span>
            </span>
            <span className="update-quantity-link link-primary">
              Update
            </span>
            <span className="delete-quantity-link link-primary ml-1">
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