import { Outlet, useNavigation } from "react-router-dom";
import { CartAnimationProvider } from "../Context/cart/CartAnimationContext"; 
import Footer from "../Components/Footer";
import AiFloatingWidget from "../Features/AiAssistant/AiFloatingWidget";
import {
  ProductsSkeleton,
  ProductDetailSkeleton,
  OrdersSkeleton,
  TrackingSkeleton,
  CartSkeleton,
} from "../Components/Fallback";



/**
 * Pick the right skeleton based on the URL we're navigating TO.
 * This only fires during client-side navigation (useNavigation).
 */
function getSkeletonForPath(pathname) {
  if (!pathname) return null;

  // /products/:id
  if (/^\/products\/[^/]+/.test(pathname)) return <ProductDetailSkeleton />;
  // /products (index)
  if (/^\/products\/?$/.test(pathname)) return <ProductsSkeleton />;
  // /orders
  if (/^\/orders\/?/.test(pathname)) return <OrdersSkeleton />;
  // /tracking
  if (/^\/tracking\/?/.test(pathname)) return <TrackingSkeleton />;
  // /cart
  if (/^\/cart\/?/.test(pathname)) return <CartSkeleton />;

  return null;
}

export default function RootLayout() {
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  // When navigating, show the skeleton matching the target route
  const skeleton = isNavigating
    ? getSkeletonForPath(navigation.location?.pathname)
    : null;

  return (
    <CartAnimationProvider>
      {skeleton || <Outlet />}
      <Footer />
      <AiFloatingWidget />
    </CartAnimationProvider>
  );
}