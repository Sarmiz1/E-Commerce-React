import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { fetchLoader } from "../api/loaders";
import HomePage from "../Pages/Home/HomePage/HomePage"
import LandingPage from "../Pages/Home/LandingPage/LandinPage";
import CheckoutPage from "../Pages/Checkout/CheckoutPage";
import OrdersPage from "../Pages/orders/OrdersPage";
import ProductsPage from "../Pages/ProductPage/ProductsPage";
import TrackingPage from "../Pages/tracking/TrackingPage";
import ProductDetail from "../Pages/ProductDetails/ProductDetail";
import ProductsLayout from "../Layout/ProductsLayout";
import RootLayout from "../Layout/RootLayout";
import DefaultLayout from "../Layout/DefaultLayout";
import LandingLayout from "../Layout/LandingLayout";
import NotFoundPage from "../Components/NotFoundPage";
import FallbackPage from "../Components/FallbackPage";



const isLoggedIn = true; // Mock authentication state, replace with real auth logic as needed


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
            loader={fetchLoader}
          />
        )}
      </Route>

      {/* All app pages */}
      <Route element={<DefaultLayout />}>
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="tracking" element={<TrackingPage />} />

        <Route path="products" element={<ProductsLayout />} >
          <Route index element={<ProductsPage />} />
          <Route
            path=":productId"
            element={<ProductDetail />}
            loader={fetchLoader}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />

    </Route>
  )
)


export default router