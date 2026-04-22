import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { fetchProductsLoader, cartRecommendationsLoader } from "../loaders/fetchProductsLoader";
import { productDetailsLoader } from "../loaders/productDetailsLoader";
import { fetchOrdersLoader } from "../loaders/fetchOrdersLoader";

// ─── Layouts ──────────────────────────────────────────────────────────────────
import RootLayout from "../Layout/RootLayout";
import DefaultLayout from "../Layout/DefaultLayout";
import LandingLayout from "../Layout/LandingLayout";
import ProductsLayout from "../Layout/ProductsLayout";

// ─── Core Pages ───────────────────────────────────────────────────────────────
import HomePage from "../Features/Home/HomePage/HomePage";
import LandingPage from "../Features/Marketting/ModernLanding/ModernLanding";
import CheckoutPage from "../Features/Checkout/CheckOutPage";
import OrdersPage from "../Features/Orders/OrdersPage";
import ProductsPage from "../Features/Product/ProductsPage";
import TrackingPage from "../Features/Orders/Tracking/TrackingPage";
import ProductDetail from "../Features/Product/ProductDetails/ProductDetail";
import CartPage from "../Features/Cart/CartPage";
import AiShop from "../Features/AiShopping/AiShop";
import SellerLanding from "../Features/Marketting/WooShoSeller/SellerLanding";
import BuyerLanding from "../Features/Marketting/WooshoBuyer/BuyerLanding";
import SellerDashboard from "../Features/SellerDashboard/SellerDashboard";
import BuyerDashboard from "../Features/BuyerDashboard/BuyerDashboard";
import BrandsPage from "../Features/Brands/BrandsPage";
import BrandDetail from "../Features/Brands/BrandDetail";
import OtherPage from "../Features/OtherPage/OtherPage";
import AnalyticsPage from "../Features/Analytics/AnalyticsPage";
import SupportPage from "../Features/Support/SupportPage";
import AboutPage from "../Features/About/AboutPage";
import CareersPage from "../Features/Careers/CareersPage";
import ApplicationForm from "../Features/Careers/ApplicationForm";
import ContactPage from "../Features/Contact/ContactPage";
import PressPage from "../Features/Press/PressPage";
import AdminSimpleDashboard from "../Features/AdminDashboard/AdminSimpleDashboard/AdminSimpleDashboard";
import AdminModernDashboard from "../Features/AdminDashboard/AdminModernDashboard/AdminModernDashboard";

// ─── Collection Pages ─────────────────────────────────────────────────────────
import NewArrivalsPage from "../Features/Collections/pages/NewArrivalsPage";
import HotDealsPage from "../Features/Collections/pages/HotDealsPage";
import TrendingNowPage from "../Features/Collections/pages/TrendingNowPage";
import HighFashionPage from "../Features/Collections/pages/HighFashionPage";
import SneakersPage from "../Features/Collections/pages/SneakersPage";
import ElectronicsPage from "../Features/Collections/pages/ElectronicsPage";
import BeautyCarePage from "../Features/Collections/pages/BeautyCarePage";
import FlashSalesPage from "../Features/Collections/pages/FlashSalesPage";
import MembersOnlyPage from "../Features/Collections/pages/MembersOnlyPage";
import CategoriesPage from "../Features/Collections/pages/CategoriesPage";
import BlackFridayPage from "../Features/Collections/pages/BlackFridayPage";
import FashionPage from "../Features/Collections/pages/FashionPage";
import KidsToysPage from "../Features/Collections/pages/KidsToysPage";

// ─── Auth Page ────────────────────────────────────────────────────────────────
import AuthPage from "../Features/Auth/AuthPage";

// ─── Error / Fallback ─────────────────────────────────────────────────────────
import NotFoundPage from "../Components/NotFoundPage";
import FallbackPage from "../Components/FallbackPage";

// ─── Skeleton Fallbacks ───────────────────────────────────────────────────────
import {
  ProductsSkeleton,
  ProductDetailSkeleton,
  OrdersSkeleton,
  TrackingSkeleton,
  CartSkeleton,
} from "../Components/Fallback";

const isLoggedIn = false;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />} errorElement={<FallbackPage />} hydrateFallbackElement={<ProductsSkeleton />}>

      {/* ── Home (conditional) ── */}
      <Route
        path="/"
        element={isLoggedIn ? <DefaultLayout /> : <LandingLayout />}
      >
        {isLoggedIn ? (
          <Route index element={<HomePage />} loader={fetchProductsLoader} />
        ) : (
          <Route index element={<LandingPage />} />
        )}
      </Route>

      {/* ── Auth ── */}
      <Route path="auth" element={<AuthPage />} />
      <Route path="login" element={<AuthPage />} />
      <Route path="signup" element={<AuthPage />} />

      {/* ── Landing layout pages ── */}
      <Route element={<LandingLayout />}>
        <Route path="brands" element={<BrandsPage />}>
          <Route path=":brandId" element={<BrandDetail />} />
        </Route>
        <Route path="seller" element={<SellerLanding />} />
        <Route path="buyer" element={<BuyerLanding />} />
        <Route path="ai-shop" element={<AiShop />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="careers/apply" element={<ApplicationForm />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="press" element={<PressPage />} />
        <Route path="admin" element={<AdminModernDashboard />} />
        <Route path="adminsimp" element={<AdminSimpleDashboard />} />
        <Route path="dashboard/seller" element={<SellerDashboard />} />
        <Route path="dashboard/buyer" element={<BuyerDashboard />} />
      </Route>

      {/* ── Default layout pages ── */}
      <Route element={<DefaultLayout />}>
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} loader={fetchOrdersLoader} hydrateFallbackElement={<OrdersSkeleton />} />
        <Route path="tracking" element={<TrackingPage />} loader={fetchOrdersLoader} hydrateFallbackElement={<TrackingSkeleton />} />
        <Route path="cart" element={<CartPage />} loader={cartRecommendationsLoader} hydrateFallbackElement={<CartSkeleton />} />

        {/* ── Products ── */}
        <Route path="products" element={<ProductsLayout />}>
          <Route index element={<ProductsPage />} loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
          <Route path=":productId" element={<ProductDetail />} loader={productDetailsLoader} hydrateFallbackElement={<ProductDetailSkeleton />} />
        </Route>

        {/* ── Collections (all use fetchProductsLoader) ── */}
        <Route path="new-arrivals"   element={<NewArrivalsPage />}  loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="hot-deals"      element={<HotDealsPage />}     loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="trending"       element={<TrendingNowPage />}  loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="high-fashion"   element={<HighFashionPage />}  loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="sneakers"       element={<SneakersPage />}     loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="electronics"    element={<ElectronicsPage />}  loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="beauty-care"    element={<BeautyCarePage />}   loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="flash-sales"    element={<FlashSalesPage />}   loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="members-only"   element={<MembersOnlyPage />}  loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="categories"     element={<CategoriesPage />}   loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="black-friday"   element={<BlackFridayPage />}  loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="fashion"        element={<FashionPage />}      loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
        <Route path="kids-toys"      element={<KidsToysPage />}     loader={fetchProductsLoader} hydrateFallbackElement={<ProductsSkeleton />} />
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundPage />} />

    </Route>
  )
);

export default router;
