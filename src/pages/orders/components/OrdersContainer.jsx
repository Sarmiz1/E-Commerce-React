import OrdersHeader from "./containersComponents/OrdersHeader"
import OrderProductDetails from "./containersComponents/OrderProductDetails"

function OrdersContainer({order}) {

  return (
    <div className="order-container">

      <OrdersHeader orderDetails={order.details}/>

      <main className="order-details-grid py-11 px-6 border-t-0 rounded-b-md 
        border border-solid border-borderColor grid grid-cols-1 sm:grid-cols-2
        column-gap-35 row-gap-0 items-center md:grid-cols-3 md:row-gap-60 md:pb-2">

        {order.products.map(product => {
          return <OrderProductDetails 
          orderProduct ={product} />
          })
        }

      </main>
    </div>
  )
}

export default OrdersContainer