import { useEffect } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { CartAnimationProvider } from "../Context/cart/CartAnimationContext"; 
import AiFloatingWidget from "../Features/AiAssistant/AiFloatingWidget";
import WooshoAI from "../Features/AiAssistant/WooshoAI";
import { useAuth } from "../store/useAuthStore";
import { trackEvent } from "../api/track_events";
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

let lastTrackedPageView = "";

export default function RootLayout() {
  const navigation = useNavigation();
  const location = useLocation();
  const { user } = useAuth();
  const isNavigating = navigation.state === "loading";

  useEffect(() => {
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
  const skeleton = isNavigating
    ? getSkeletonForPath(navigation.location?.pathname)
    : null;

  return (
    <CartAnimationProvider>
      {skeleton || <Outlet />}
      <WooshoAI />
    </CartAnimationProvider>
  );
}
