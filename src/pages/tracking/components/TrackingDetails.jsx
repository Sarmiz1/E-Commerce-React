
import { Fragment } from "react";
import { formatDate } from '../../../Utils/formatDate'

function TrackingDetails({ order }) {


  return (
    <>
      {
        order.products.map((product) => {
          return (
            <Fragment key={product.productId}>
              <div className="font-bold text-2xl mb-3">
                Arriving on, {formatDate(product.estimatedDeliveryTimeMs)}
              </div>

              <div className="mb-1">
                {product.product.name}
              </div>

              <div className=" mb-1">
                Quantity: {product.quantity}
              </div>

              <img className=" max-h-[150px] max-w-[150px] mt-6 mb-14" 
                src={product.product.image} />
            </Fragment>
          )
        })
      }
    </>
  )
}

export default TrackingDetails


