import CheckoutHeader from './components/CheckoutHeader'
import CartItemContainer from './components/CartItemContainer'
import PaymentSumary from './components/PaymentSummary'
import { useContext } from 'react'
import dataContext from '../../context/dataContext'
import { formatMoneyCents } from '../../utils/formatMoneyCents'

function CheckOutPage() {

  const {cart} = useContext(dataContext)

  console.log(cart);
  
  

  return(
    <>

      <title>Checkout</title>

      <div className='m-0 p-0'>
        <CheckoutHeader />
        <div className="md:w-full checkout-page mx-auto max-w-[1100px] mt-36 mb-24 px-8 overflow-x-hidden">
          <div className="page-title font-bold text-[22px] mb-[18px]">
            Review your order
          </div>

          <div className="checkout-grid flex flex-col gap-3 lg:flex-row lg:items-start      
            ">
            <div className="order-summary order-2 lg:order-1 lg:w-[80%]">

              {cart.map(cartItem => {
                return (
                  <CartItemContainer key={cartItem.productId}
                  cartProduct={
                {
                  name: cartItem.product.name,
                  price: formatMoneyCents(cartItem.product.priceCents),
                  quantity: cartItem.quantity,
                  deliveryDate: cartItem.product.deliveryDate,
                  image: cartItem.product.image,
                }
              } 
              />
                )
              })}
              
            </div>
            <PaymentSumary />
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckOutPage