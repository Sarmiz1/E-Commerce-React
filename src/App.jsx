import './App.css'
import HomePage from './pages/home/HomePage'
import CheckOutPage from './pages/checkout/CheckOutPage'
import OrdersPage from './pages/orders/OrdersPage'
import TrackingPage from './pages/tracking/TrackingPage'
import NavBar from './components/NavBar'
import { Routes, Route } from 'react-router-dom'
import { products } from './data/products'
import { useState } from 'react'
import dataContext from './context/dataContext'

function App() {
  const [cart, setCart] = useState([])
  

  return (
    <>
      <dataContext.Provider value={{
        products,
        cart,
        setCart,
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
