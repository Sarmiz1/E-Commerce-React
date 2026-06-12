import { useEffect } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { CartAnimationProvider } from "../context/cart/CartAnimationContext"; 
import WooshoAI from "../Features/AiAssistant/WooshoAi";
import { useAuth } from "../Store/useAuthStore";
import { trackEvent } from "../api/track_events";
import {
  ProductsSkeleton,
  ProductDetailSkeleton,
  OrdersSkeleton,
  TrackingSkeleton,
  CartSkeleton,
} from "../Components/Fallback";
import { CheckoutLoading } from "../Features/Checkout/Components/CheckoutLoading";



/**
 * Pick the right skeleton based on the URL we're navigating TO.
 * This only fires during client-side navigation (useNavigation).
 */
function getSkeletonForPath(pathname) {
  if (!pathname) return null;

  // /products listing endpoints
  if (/^\/products\/(?:brands|categories|collections|curations)(?:\/|$)/.test(pathname)) return <ProductsSkeleton />;
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
  // /checkout
  if (/^\/checkout\/?/.test(pathname)) return <CheckoutLoading />;

  return null;
}

let lastTrackedPageView = "";

export default function RootLayout() {
  const navigation = useNavigation();
  const location = useLocation();
  const { user } = useAuth();
  const isNavigating = navigation.state === "loading";

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;

    const page = `${location.pathname}${location.search}${location.hash}`;
    if (lastTrackedPageView === page) return;

    lastTrackedPageView = page;
    trackEvent({
      eventType: "page_view",
      userId: user?.id || null,
      metadata: {
        path: location.pathname,
        search: location.search,
        hash: location.hash,
        routeKey: location.key,
      },
    });
  }, [location.hash, location.key, location.pathname, location.search, user?.id]);

  // When navigating, show the skeleton matching the target route
  const isRouteChange =
    isNavigating &&
    navigation.location?.pathname &&
    navigation.location.pathname !== location.pathname;
  const skeleton = isRouteChange
    ? getSkeletonForPath(navigation.location?.pathname)
    : null;

  return (
    <CartAnimationProvider>
      {skeleton || <Outlet />}
      <WooshoAI />
    </CartAnimationProvider>
  );
}
