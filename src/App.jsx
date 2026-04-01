import './App.css'
import { fetchLoader } from "./api/loaders"
import HomePage from './Pages/Home/HomePage/HomePage'
import LandingPage from './Pages/Home/LandingPage/LandinPage'
import CheckOutPage from './pages/checkout/CheckOutPage'
import OrdersPage from './pages/orders/OrdersPage'
import ProductsPage from './Pages/ProductPage/ProductsPage'
import TrackingPage from './pages/tracking/TrackingPage'
import ProductDetail from './Pages/ProductDetails/ProductDetail'
import ProductsLayout from './Layout/ProductsLayout'
import { createBrowserRouter, Route, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import dataContext from './Context/cartContext'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { IconContext } from 'react-icons'
import RootLayout from './Layout/RootLayout'
import DefaultLayout from './Layout/DefaultLayout'
import LandingLayout from './Layout/LandingLayout'
import NotFoundPage from './Components/NotFoundPage'
import FallbackPage from './Components/FallbackPage'




export default function App() {

  const [cart, setCart] = useState([])

  const loadCart = async () => {
    const cartUrl = '/api/cart-items?expand=product'
    const response = await axios.get(cartUrl)

    setCart(response.data)
  }


  useEffect(() => {

    loadCart()

  }, [])

  const productsUrl = "/api/products";



  const isLoggedIn = false; // Mock authentication state, replace with real auth logic as needed

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<RootLayout />} errorElement={<FallbackPage />}>

        {/* Conditional home route */}
        <Route
          path='/'
          element={
            isLoggedIn ? (
              <DefaultLayout />
            ) : (
              <LandingLayout />
            )
          }
        >
          {isLoggedIn ? (
            <Route index element={<HomePage />} />
          ) : (
            <Route
              index
              element={<LandingPage />}
              loader={fetchLoader(productsUrl)}
            />
          )}
        </Route>

        {/* All app pages */}
        <Route element={<DefaultLayout />}>
          <Route path="checkout" element={<CheckOutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="tracking" element={<TrackingPage />} />

          <Route path="products" element={<ProductsLayout />} >
            <Route index element={<ProductsPage />} />
            <Route
              path=":productId"
              element={<ProductDetail />}
              loader={fetchLoader(productsUrl)}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />

      </Route>
    )
  )



  return (
    <>
      <dataContext.Provider value={{
        cart,
        loadCart,
      }}>
        <IconContext value={{ size: "80px", color: "green" }}>
          <RouterProvider router={router} />
        </IconContext>
      </dataContext.Provider>
    </>

  )
}

