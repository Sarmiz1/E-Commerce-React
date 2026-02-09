import { NavLink } from "react-router-dom"

function ViewAllOrders() {

  return(
    <NavLink className="back-to-orders-link link-primary inline-block
    mb-8 cursor-pointer hover:opacity-70 active:opacity-50 text-greenPry underline text-base" 
    to="/orders">
      View all orders
    </NavLink >
  )
}

export default ViewAllOrders