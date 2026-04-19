import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { fetchProductsLoader, cartRecommendationsLoader } from "../loaders/fetchProductsLoader";
import { productDetailsLoader } from "../loaders/productDetailsLoader";
import { fetchOrdersLoader } from "../loaders/fetchOrdersLoader";
import HomePage from "../Features/Home/HomePage/HomePage"
import LandingPage from "../Features/Marketting/ModernLanding/ModernLanding";
import CheckoutPage from "../Features/Checkout/CheckOutPage";
import OrdersPage from "../Features/Orders/OrdersPage";
import ProductsPage from "../Features/Product/ProductsPage";
import TrackingPage from "../Features/Orders/Tracking/TrackingPage";
import ProductDetail from "../Features/Product/ProductDetails/ProductDetail";
import ProductsLayout from "../Layout/ProductsLayout";
import RootLayout from "../Layout/RootLayout";
import DefaultLayout from "../Layout/DefaultLayout";
import LandingLayout from "../Layout/LandingLayout";
import NotFoundPage from "../Components/NotFoundPage";
import FallbackPage from "../Components/FallbackPage";
import CartPage from "../Features/Cart/CartPage";
import SellerLanding from "../Features/Marketting/WooShoSeller/SellerLanding";

// Per-page skeleton fallbacks
import {
  ProductsSkeleton,
  ProductDetailSkeleton,
  OrdersSkeleton,
  TrackingSkeleton,
  CartSkeleton,
} from "../Components/Fallback";

const isLoggedIn = false; // Mock authentication state, replace with real auth logic as needed


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />} errorElement={<FallbackPage />} hydrateFallbackElement={<ProductsSkeleton />}>

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
          <Route
            index
            element={<HomePage />}
            loader={fetchProductsLoader}
          />
        ) : (
          <Route
            index
            element={<LandingPage />}
          />
        )}
      </Route>

      {/* Seller landing page */}
      <Route path="/seller" element={<LandingLayout />}>
        <Route index element={<SellerLanding />} />
      </Route>

      {/* All app pages */}
      <Route element={<DefaultLayout />}>
        <Route path="checkout" element={<CheckoutPage />} />

        <Route
          path="orders"
          element={<OrdersPage />}
          loader={fetchOrdersLoader}
          hydrateFallbackElement={<OrdersSkeleton />}
        />

        <Route
          path="tracking"
          element={<TrackingPage />}
          loader={fetchOrdersLoader}
          hydrateFallbackElement={<TrackingSkeleton />}
        />

        <Route
          path="cart"
          element={<CartPage />}
          loader={cartRecommendationsLoader}
          hydrateFallbackElement={<CartSkeleton />}
        />

        <Route path="products" element={<ProductsLayout />} >
          <Route
            index
            element={<ProductsPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />

          <Route
            path=":productId"
            element={<ProductDetail />}
            loader={productDetailsLoader}
            hydrateFallbackElement={<ProductDetailSkeleton />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />

    </Route>
  )
)


export default router