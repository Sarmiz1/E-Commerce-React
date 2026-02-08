import ButtonPrimary from '../../../../components/ButtonPrimary'
import { Link } from 'react-router-dom'

function OrderProductDetails({orderProduct}) {

  return (
    <section className='grid grid-cols-1 md:grid-cols-2'>
      <div className='flex gap-8 md:mr-5 self-start md:justify-normal md:items-start'>
        <div className="product-image-container text-center mb-6">
          <img src={orderProduct.productImage}
            className="max-w-28 max-h-28"/>
        </div>

        <div className="product-details mt-0">
          <div className="product-name font-bold mb-px md:w-[100ch]">
            {orderProduct.productName}
          </div>
          <div className="product-delivery-date mb-px ">
            <span className="letterSpacingSm">Arriving</span> on: {orderProduct.arrivalDate}
          </div>
          <div className="product-quantity mb-px sm:mb-4">
            Quantity: {orderProduct.quantity}
          </div>

          <ButtonPrimary 
            children={
            <img className="buy-again-icon w-5 mr-3" src="images/icons/buy-again.png" />
            }
            text={<span className="buy-again-message">Add to Cart</span>}
            className={`text-base w-36 h-9 rounded-md flex items-center justify-center hover:opacity-80
              mb-3`}
          />
        </div>
      </div>

      <div className="product-actions flex justify-center ml-5 md:ml-auto md:mr-0
      sm:-ml-3 md:block">
        <Link to="/tracking">
          <ButtonPrimary 
            text={'Track package'}
            className={`bg-white text-black w-36 text-base p-[8px] border 
              border-solid rounded-md mb-2 md:w-[180px] hover:bg-slate-50
              hover:outline-[0.5px]
              shadow-sm
              `}
          /> 
        </Link>
      </div>
    </section>
  )
}

export default OrderProductDetails