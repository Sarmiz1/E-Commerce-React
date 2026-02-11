import { formatDateMonthDay } from "../../../../Utils/formatDate"
import { formatMoneyCents } from "../../../../Utils/formatMoneyCents"
function OrdersHeader({orderDate, orderTotal,orderId}) {
  

  return(
    <header className="order-header bg-secondary border border-solid
      border-borderColor flex sm:items-center justify-between py-5 px-6 rounded-t-md
      flex-col items-start sm:flex-row ">
      <section className="order-header-left-section flex shrink-0 flex-col sm:flex-row">

        <div className="order-date sm:mr-11 flex sm:flex-col mr-0">
          <div className="order-header-label sm:grid grid-cols-2 mr-1 sm:mr-0  shrink-0 font-bold">Order Placed:</div>
          <div>{formatDateMonthDay(orderDate)}</div>
        </div>

        <div className="order-total mr-0 flex sm:flex-col sm:mr-11 ">
          <div className="order-header-label mr-1 sm:flex-col  sm:mr-0 font-bold">
            Total:
          </div>
          <div> {formatMoneyCents(orderTotal)} </div>
        </div>

      </section>

      <section className="order-header-right-section shrink flex sm:flex-col ">
        <div className="order-header-label font-bold mr-1 sm:mr-0 shrink-0">Order ID:</div>
        <div>{orderId}</div>
      </section>

    </header>
  )
}

export default OrdersHeader