import './App.css'
import HomePage from './pages/home/HomePage'
import CheckOutPage from './pages/checkout/CheckOutPage'
import OrdersPage from './pages/orders/OrdersPage'
import TrackingPage from './pages/tracking/TrackingPage'
import NavBar from './components/NavBar'
import { Routes, Route } from 'react-router-dom'
import dataContext from './Context/dataContext'
import { useFetchData } from './Hooks/useFetch' 

function App() {

  const cartUrl = '/api/cart-items?expand=product'

  const {fetchedData:cart, error:cartFetchError} = useFetchData(cartUrl)
    


  return (
    <>
      <dataContext.Provider value={{
        cart,
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
