import { Link } from "react-router-dom"
function CheckoutHeader() {

  return (
    <div className="checkout-header h-[60px] px-[30px] bg-white flex
      justify-center fixed top-0 left-0 right-0 z-[1000]">
      <div className="header-content w-full max-w-[1100px] flex items-center">
        <div className="checkout-header-left-section w-[200px] sm:w-auto">
          <a href="index.html">
            <img className="logo h-[26px] mt-0 sm:hidden" 
              src="images/logo.png" />
            <img className="mobile-logo hidden sm:inline-block h-[26px]" 
              src="images/mobile-logo.png" />
          </a>
        </div>

        <div className="checkout-header-middle-section flex-1 shrink-0 text-center.
          text-[22px] font-medium flex justify-center lg:text-xl lg:mr-[60px]
          sm:mr-[5px]'">

          Checkout (<Link className="return-to-home-link text-greenPry
            no-underline cursor-pointer lg:text-xl"
            to="/">3 items</Link>)

        </div>

        <div className="checkout-header-right-section text-right w-[200px] 
          flex items-center justify-end lg:w-auto">
          <img 
            src="images/icons/checkout-lock-icon.png" 
            className="h-8"/>
        </div>
      </div>
    </div>
  )
}

export default CheckoutHeader