import './App.css'
import HomePage from './pages/home/HomePage'
import CheckOutPage from './pages/checkout/CheckOutPage'
import OrdersPage from './pages/orders/OrdersPage'
import TrackingPage from './pages/tracking/TrackingPage'
import NavBar from './components/NavBar'
import { Routes, Route } from 'react-router-dom'
import dataContext from './Context/cartContext'
import { useEffect, useState } from 'react' 
import axios from 'axios'
import ErrorBoundary from './ErrorHandling/ErrorBoundary'

function App() {



  const [cart, setCart] = useState([])

  const loadCart = async () => {
    const cartUrl = '/api/cart-items?expand=product'
    const response = await axios.get(cartUrl)
    
    setCart(response.data)
  }

  




  useEffect(() => {

    loadCart()

  }, [])
    


  return (
    <>
      <dataContext.Provider value={{
        cart,
        loadCart,
      }}>
        <NavBar />
        <Routes>
          <Route path="/checkout" element =
          {
            <ErrorBoundary>   
              <CheckOutPage />
            </ErrorBoundary>
            } />
          <Route path="/" element =
          {
            <ErrorBoundary>   
              <HomePage />
            </ErrorBoundary>
            } />
          <Route path="/orders" element =
          {
            <ErrorBoundary>   
              <OrdersPage />
            </ErrorBoundary>
          } />
          <Route path="/tracking" element =
          {
            <ErrorBoundary>   
              <TrackingPage />
            </ErrorBoundary>
          } />
        </Routes>
      </dataContext.Provider>
      
    </>
  )
}

export default App
