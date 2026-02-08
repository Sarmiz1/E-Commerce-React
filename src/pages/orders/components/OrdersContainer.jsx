import OrdersHeader from "./containersComponents/OrdersHeader"
import OrderProductDetails from "./containersComponents/OrderProductDetails"

function OrdersContainer({order}) {

  return (
    <div className="order-container">

      <OrdersHeader orderDetails={order.details}/>

      <main className="order-details-grid py-11 px-6 border-t-0 rounded-b-md 
        border border-solid border-borderColor flex flex-col gap-8">

        {order.products.map(product => {
          return <OrderProductDetails 
          orderProduct ={product}
          key={crypto.randomUUID()}
          />
          })
        }

      </main>
    </div>
  )
}

export default OrdersContainer