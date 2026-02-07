import { Link } from "react-router-dom";

function OrdersSection() {

  return(
    <Link 
      className="text-white flex items-center px-[13px]
      py-[6px] hover:outline-1 cursor-pointer decoration-none hover:outline rounded-md
      hover:outline-[rgba(0, 0, 0, 0)]" 
      to="/orders">

      <span className="orders-text block text-sm font-bold">Orders</span>
    </Link>
  )
}

export default OrdersSection