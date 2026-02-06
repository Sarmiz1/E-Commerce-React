function PaymentSumary() {

  return (
    <div className="payment-summary lg:w-[350px] border border-solid 
        border-[rgb(222, 222, 222)] rounded px-5 pt-5 pb-2
        lg:grid-rows-1 lg:mb-3 order-1 lg:order-2">
      <div className="payment-summary-title">
        Payment Summary
      </div>

      <div className="payment-summary-row">
        <div>Items (3):</div>
        <div className="payment-summary-money">$42.75</div>
      </div>

      <div className="payment-summary-row">
        <div>Shipping &amp; handling:</div>
        <div className="payment-summary-money">$4.99</div>
      </div>

      <div className="payment-summary-row subtotal-row">
        <div>Total before tax:</div>
        <div className="payment-summary-money">$47.74</div>
      </div>

      <div className="payment-summary-row">
        <div>Estimated tax (10%):</div>
        <div className="payment-summary-money">$4.77</div>
      </div>

      <div className="payment-summary-row total-row">
        <div>Order total:</div>
        <div className="payment-summary-money">$52.51</div>
      </div>

      <button className="place-order-button button-primary">
        Place your order
      </button>
    </div>
  )
}


export default PaymentSumary