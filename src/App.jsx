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
import { IconContext } from 'react-icons'


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
        <IconContext value={{ size: "80px", color: "green" }}>
          <NavBar />
          <Routes>
            <Route path="/checkout" element=
              {
                <CheckOutPage />
              } />

            <Route path="/" element=
              {
                <HomePage />
              } />

            <Route path="/orders" element=
              {
                <OrdersPage />
              } />

            <Route path="/tracking" element=
              {
                <TrackingPage />
              } />
          </Routes>
        </IconContext>
      </dataContext.Provider>

    </>
  )
}

export default App
