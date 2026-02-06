import CheckoutHeader from './components/CheckoutHeader'
import CartItemContainer from './components/CartItemContainer'
import PaymentSumary from './components/PaymentSummary'


function CheckOutPage() {

  return(
    <>

      <title>Checkout</title>


      <CheckoutHeader />
      <div className="checkout-page max-w-{1100px] px-[30px] mt-[140px]
        mb-[100px] mx-auto">
        <div className="page-title font-bold text-[22px] mb-[18px]">
          Review your order
        </div>

        <div className="checkout-grid grid gap-3 lg:grid-cols-2 items-start grid-cols-1">
          <div className="order-summary order-2 lg:order-1">
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
    </>
  )
}

export default CheckOutPage