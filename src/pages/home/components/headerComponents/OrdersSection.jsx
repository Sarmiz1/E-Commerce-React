import { Link } from "react-router-dom";

function OrdersSection() {

  return(
    <Link 
      className="text-white flex items-center px-[13px]
      py-[6px] border-[2px] cursor-pointer decoration-none border-solid
      border-[rgba(0, 0, 0, 0)]" 
      to="/orders">

      <span className="orders-text block text-base font-bold">Orders</span>
    </Link>
  )
}

export default OrdersSection