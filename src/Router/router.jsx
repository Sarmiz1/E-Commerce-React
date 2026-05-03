import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

// Loaders
import { fetchProductsLoader } from "../loaders/fetchProductsLoader";
import { productDetailsLoader } from "../loaders/productDetailsLoader";
import { fetchOrdersLoader } from "../loaders/fetchOrdersLoader";

// ─── Layouts ──────────────────────────────────────────────────────────────────
import RootLayout from "../Layout/RootLayout";
import DefaultLayout from "../Layout/DefaultLayout";
import MarkettingLayout from "../Layout/MarkettingLayout";
import ProductsLayout from "../Layout/ProductsLayout";
import TradeLayout from "../Layout/TradeLayout";


// ─── Core Pages ───────────────────────────────────────────────────────────────
import HomePage from "../Features/HomePage/HomePage";
import ProductsPage from "../Features/Product/ProductsPage";
import TrackingPage from "../Features/Orders/Tracking/TrackingPage";
import ProductDetail from "../Features/Product/ProductDetails/ProductDetail";
import OtherPage from "../Features/OtherPage/OtherPage";
import WishlistPage from "../Features/Wishlist/WishlistPage";
import CartPage from "../Features/Cart/CartPage";
import CheckoutPage from "../Features/Checkout/CheckoutPage";
import OrdersPage from "../Features/Orders/OrdersPage";

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
// Auth imports removed — now lazy loaded below

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
  LandingSkeleton,
  BuyerSkeleton,
  SellerSkeleton,
  GenericPageSkeleton,
  DashboardSkeleton,
  HomeSkeleton,
} from "../Components/Fallback";

// JUST TEsT

const isLoggedIn = true; // Simulate authentication status (replace with real auth logic)

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={<RootLayout />}
      // errorElement={<FallbackPage />}
      hydrateFallbackElement={<ProductsSkeleton />}
    >
      {/* ── Home (conditional) ── */}
      <Route
        path="/"
        element={isLoggedIn ? <DefaultLayout /> : <MarkettingLayout />}
      >
        {isLoggedIn ? (
          <Route
            index
            element={<HomePage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<HomeSkeleton />}
          />
        ) : (
          <Route
            index
            lazy={() =>
              import("../Features/Marketting/ModernLanding/ModernLanding").then(
                (m) => ({ Component: m.default }),
              )
            }
            hydrateFallbackElement={<LandingSkeleton />}
          />
        )}
      </Route>

      {/* ── Auth ── */}
      <Route
        path="auth"
        lazy={() =>
          import("../Features/Auth/AuthPage").then((m) => ({
            Component: m.default,
          }))
        }
        hydrateFallbackElement={<GenericPageSkeleton />}
      />
      <Route
        path="login"
        lazy={() =>
          import("../Features/Auth/AuthPage").then((m) => ({
            Component: m.default,
          }))
        }
        hydrateFallbackElement={<GenericPageSkeleton />}
      />
      <Route
        path="signup"
        lazy={() =>
          import("../Features/Auth/AuthPage").then((m) => ({
            Component: m.default,
          }))
        }
        hydrateFallbackElement={<GenericPageSkeleton />}
      />

      {/* ── Marketting layout pages ── */}
      <Route element={<MarkettingLayout />}>
        <Route
          path="brands"
          lazy={() =>
            import("../Features/Brands/BrandsPage").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<GenericPageSkeleton />}
        >
          <Route
            path=":brandId"
            lazy={() =>
              import("../Features/Brands/BrandDetail").then((m) => ({
                Component: m.default,
              }))
            }
            hydrateFallbackElement={<GenericPageSkeleton />}
          />
        </Route>

        <Route
          path="sell"
          lazy={() =>
            import("../Features/Marketting/WooShoSeller/SellerLanding").then(
              (m) => ({ Component: m.default }),
            )
          }
          hydrateFallbackElement={<SellerSkeleton />}
        />
        <Route
          path="buyer"
          lazy={() =>
            import("../Features/Marketting/WooshoBuyer/BuyerLanding").then(
              (m) => ({ Component: m.default }),
            )
          }
          hydrateFallbackElement={<BuyerSkeleton />}
        />
      </Route>

      {/* ── Default layout pages ── */}
      <Route element={<DefaultLayout />}>
        <Route
          path="ai-shop"
          lazy={() =>
            import("../Features/AiShopping/AiShop").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<GenericPageSkeleton />}
        />
        <Route
          path="support"
          lazy={() =>
            import("../Features/Support/SupportPage").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<GenericPageSkeleton />}
        />
        <Route
          path="analytics"
          lazy={() =>
            import("../Features/Analytics/AnalyticsPage").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<GenericPageSkeleton />}
        />
        <Route
          path="about"
          lazy={() =>
            import("../Features/About/AboutPage").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<GenericPageSkeleton />}
        />
        <Route
          path="careers"
          lazy={() =>
            import("../Features/Careers/CareersPage").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<GenericPageSkeleton />}
        />
        <Route
          path="careers/apply"
          lazy={() =>
            import("../Features/Careers/ApplicationForm").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<GenericPageSkeleton />}
        />
        <Route
          path="contact"
          lazy={() =>
            import("../Features/Contact/ContactPage").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<GenericPageSkeleton />}
        />
        <Route
          path="press"
          lazy={() =>
            import("../Features/Press/PressPage").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<GenericPageSkeleton />}
        />
        <Route
          path="admin"
          lazy={() =>
            import("../Features/AdminDashboard/AdminModernDashboard/AdminModernDashboard").then(
              (m) => ({ Component: m.default }),
            )
          }
          hydrateFallbackElement={<DashboardSkeleton />}
        />
        <Route
          path="adminsimp"
          lazy={() =>
            import("../Features/AdminDashboard/AdminSimpleDashboard/AdminSimpleDashboard").then(
              (m) => ({ Component: m.default }),
            )
          }
          hydrateFallbackElement={<DashboardSkeleton />}
        />
        <Route
          path="dashboard/seller"
          lazy={() =>
            import("../Features/SellerDashboard/SellerDashboard").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<DashboardSkeleton />}
        />
        <Route
          path="dashboard/buyer"
          lazy={() =>
            import("../Features/BuyerDashboard/BuyerDashboard").then((m) => ({
              Component: m.default,
            }))
          }
          hydrateFallbackElement={<DashboardSkeleton />}
        />

        {/* Trade Layout */}
        <Route element={<TradeLayout />}>
          <Route
            path="checkout"
            element={<CheckoutPage />}
            hydrateFallbackElement={<CartSkeleton />}
          />

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
            path="/wishlist"
            element={<WishlistPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="cart"
            element={<CartPage />}
            hydrateFallbackElement={<CartSkeleton />}
          />

          {/* ── Products  Layout── */}
          <Route
            path="products"
            element={<ProductsLayout />}
          >
            <Route
              index
              element={<ProductsPage />}
              loader={fetchProductsLoader}
              hydrateFallbackElement={<ProductsSkeleton />}
            />
            <Route
              path=":productSlug"
              element={<ProductDetail />}
              loader={productDetailsLoader}
              hydrateFallbackElement={<ProductDetailSkeleton />}
            />
          </Route>

          {/* ── Collections (all use fetchProductsLoader) ── */}
          <Route
            path="new-arrivals"
            element={<NewArrivalsPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="hot-deals"
            element={<HotDealsPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="trending"
            element={<TrendingNowPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="high-fashion"
            element={<HighFashionPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="sneakers"
            element={<SneakersPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="electronics"
            element={<ElectronicsPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="beauty-care"
            element={<BeautyCarePage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="flash-sales"
            element={<FlashSalesPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="members-only"
            element={<MembersOnlyPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="categories"
            element={<CategoriesPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="black-friday"
            element={<BlackFridayPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="fashion"
            element={<FashionPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
          <Route
            path="kids-toys"
            element={<KidsToysPage />}
            loader={fetchProductsLoader}
            hydrateFallbackElement={<ProductsSkeleton />}
          />
        </Route>
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);

export default router;
