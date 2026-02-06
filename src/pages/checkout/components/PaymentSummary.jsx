import ButtonPrimary from "../../../components/ui/ButtonPrimary"
function PaymentSumary() {

  return (
    <div className="payment-summary lg:w-[400px] border border-solid 
        border-borderColor rounded px-5 pt-5 pb-2
        lg:grid-rows-1 lg:mt-3  order-1 lg:order-2 text-[15px]">
      <div className="payment-summary-title font-bold text-lg mb-1">
        Payment Summary
      </div>

      <div className="payment-summary-row  flex mb-2">
        <div>Items (3):</div>
        <div className="payment-summary-money ml-auto">$42.75</div>
      </div>

      <div className="payment-summary-row flex">
        <div>Shipping &amp; handling:</div>
        <div className="payment-summary-money ml-auto">$4.99</div>
      </div>

      <div className="payment-summary-row subtotal-row  flex mb-2">
        <div className="pt-2">Total before tax:</div>
        <div className="payment-summary-money ml-auto border border-solid 
          border-borderColor border-t-0 border-l-0 border-r-0 pt-2">
            $47.74
        </div>
      </div>

      <div className="payment-summary-row flex border border-t-0 border-l-0 
        border-r-0 border-borderColor">
        <div>Estimated tax (10%):</div>
        <div className="payment-summary-money ml-auto">$4.77</div>
      </div>

      <div className="payment-summary-row total-row text-greenPry font-bold text-lg
        pt-4 flex">
        <div>Order total:</div>
        <div className="payment-summary-money ml-auto">$52.51</div>
      </div>

      <ButtonPrimary 
        text={'Place your order'}
        className={'w-full py-3 rounded-md my-5  hover:outline-lime-400'}
      />
    </div>
  )
}


export default PaymentSumary