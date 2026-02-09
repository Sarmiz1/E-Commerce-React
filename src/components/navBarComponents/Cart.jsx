import { NavLink } from "react-router-dom";
import { useContext } from "react";
import dataContext from "../../context/dataContext";

function Cart() {

  const{cart} = useContext(dataContext)
  
  let cartQty = 0

  cart.forEach(({quantity}) => {
    cartQty += quantity
  })
    



  return (

    <NavLink 
      className="text-white flex items-center relative
      py-[6px] px-[9.5px] hover:outline hover:outline-1 
      rounded-md cursor-pointer decoration-none hover:outline-[rgba(0, 0, 0, 0)]" 
      to="/checkout">
      <img className="w-9" src="images/icons/cart-icon.png" />
      <div className="text-darkGreen text-[14px] font-bold absolute top-[5px]
      right-[46px] w-[26px] text-center">{cartQty}</div>
      <div className="ml-[5px] text-sm font-bold">Cart</div>
    </NavLink>
    
  )
}

export default Cart