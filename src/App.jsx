import './App.css'
import HomePage from './pages/home/HomePage'
import CheckOutPage from './pages/checkout/CheckOutPage'
import OrdersPage from './pages/orders/OrdersPage'
import TrackingPage from './pages/tracking/TrackingPage'
import NavBar from './components/NavBar'
import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import dataContext from './context/dataContext'
import { useFetchData } from './hooks/useFetch' 
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {

  const productUrl = '/api/products'
  const cartUrl = '/api/cart-items?expand=product'


  const {fetchedData:fetchedProduct, error:productFetchError} = useFetchData(productUrl)
  const products = useLocalStorage('products',fetchedProduct)

  const {fetchedData:fetchedCart, error:cartFetchError} = useFetchData(cartUrl)
  const cartFromLocalStorage = useLocalStorage('carts',fetchedCart)

  const [cart, setCart] = useState(cartFromLocalStorage)

  console.log(cart);
  console.log(products);
  






  return (
    <>
      <dataContext.Provider value={{
        products,
        productFetchError,
        cart,
        setCart,
        cartFetchError,
      }}>
        <NavBar />
        <Routes>
          <Route path="/checkout" element={<CheckOutPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
        </Routes>
      </dataContext.Provider>
    </>
  )
}

export default App
