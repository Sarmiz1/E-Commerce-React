import CheckoutHeader from './components/CheckoutHeader'
import CartItemContainer from './components/CartItemContainer'
import PaymentSumary from './components/PaymentSummary'


function CheckOutPage() {

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
              <CartItemContainer cartProduct={
                {
                  name: 'Black and Gray Athletic Cotton Socks - 6 Pairs',
                  price: '$10.90',
                  quantity: 2,
                  deliveryDate: 'Tuesday, June 21',
                  image: "images/products/athletic-cotton-socks-6-pairs.jpg",
                }
              } 
              />

              <CartItemContainer cartProduct={
                {
                  name: 'Intermediate Size Basketball',
                  price: '$10.90',
                  quantity: 1,
                  deliveryDate: 'Wednesday, June 15',
                  image: "images/products/intermediate-composite-basketball.jpg",
                }
              } 
              />
            </div>
            <PaymentSumary />
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckOutPage