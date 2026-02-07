function OrderProductDetails({orderProduct}) {

  return (
    <>
      <div class="product-image-container">
        <img src={orderProduct.productImage}/>
      </div>

      <div class="product-details">
        <div class="product-name">
          {orderProduct.productName}
        </div>
        <div class="product-delivery-date">
          Arriving on: {orderProduct.arrivalDate}
        </div>
        <div class="product-quantity">
          Quantity: {orderProduct.quantity}
        </div>
        <button class="buy-again-button button-primary">
          <img class="buy-again-icon" src="images/icons/buy-again.png" />
          <span class="buy-again-message">Add to Cart</span>
        </button>
      </div>

      <div class="product-actions">
        <a href="/tracking">
          <button class="track-package-button button-secondary">
            Track package
          </button>
        </a>
      </div>
    </>
  )
}

export default OrderProductDetails