import { Link } from "react-router-dom";

function Cart() {

  return (

    <Link 
      className="text-white flex items-center relative
      py-[6px] px-[9.5px] border-[2px] cursor-pointer decoration-none border-[rgba(0, 0, 0, 0)]" 
      to="/checkout">
      <img className="w-9" src="images/icons/cart-icon.png" />
      <div className="text-darkGreen text-[14px] font-bold absolute top-2
      right-[46px] w-[26px] text-center">3</div>
      <div className="ml-[5px] text-base font-bold">Cart</div>
    </Link>
    
  )
}

export default Cart