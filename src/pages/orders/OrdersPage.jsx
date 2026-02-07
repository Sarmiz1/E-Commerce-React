import OrdersContainer from "./components/OrdersContainer"
import orders from "./_test_/testData"

function OrdersPage() {

  return(
    <>
      <title>Orders</title>

      <div className="orders-page max-w-[850px] mt-[90px] mb-[100px] px-5
        mx-auto">
        <div className="page-title mb-6 font-bold text-[26px]">
          <h1>Your Orders</h1>
        </div>

        <section className="orders-grid grid grid-cols-1 gap-12">
          {orders.map(order => {
            return <OrdersContainer
            key={order.details.ID}
            order={order}/>
            })
          }
          

        </section>
      </div>
    </>
  )
}

export default OrdersPage