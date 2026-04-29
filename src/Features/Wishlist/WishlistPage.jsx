import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Heart, Star, ShoppingCart, TrendingDown, Clock, Check, Trash2, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useAllProducts } from "../../Hooks/product/useProducts";
import { useWishlist } from "../../Hooks/useWishlist";
import { useCartActions } from "../../Context/cart/CartContext";
import { useAuth } from "../../Context/auth/AuthContext";
import { WishlistAPI } from "../../api/wishlistApi";
import { trackEvent } from "../../api/track_events";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import { getProductImages } from "../../Utils/getProductImages";
import AddToCart from "../../Components/Ui/AddToCart";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
import QuickView from "../../Components/Ui/QuickView";
import WishlistHeart from "../../Components/Ui/WishlistHeart";
import ShareButton from "../../Components/Ui/ShareButton";
import SEO from "../../Components/SEO";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "default", label: "By default" },
  { value: "name", label: "Name" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
];

function productDetailHref(product) {
  return `/products/${product?.slug || product?.id}`;
}

function getProductSize(product) {
  const variantSize = product?.product_variants?.find((variant) => variant?.size)?.size;
  return product?.size || product?.volume || variantSize || "30 ml";
}

function getDefaultVariantId(product) {
  return (
    product?.variant_id ||
    product?.product_variants?.find((variant) => variant?.id)?.id ||
    undefined
  );
}

function sortWishlistProducts(products, sortBy) {
  const sorted = [...products];

  if (sortBy === "name") {
    sorted.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
  }

  if (sortBy === "price-low") {
    sorted.sort((a, b) => (a?.price_cents || 0) - (b?.price_cents || 0));
  }

  if (sortBy === "price-high") {
    sorted.sort((a, b) => (b?.price_cents || 0) - (a?.price_cents || 0));
  }

  if (sortBy === "rating") {
    sorted.sort((a, b) => (b?.rating_stars || 0) - (a?.rating_stars || 0));
  }

  return sorted;
}

function WishlistProductCard({ product, onQuickView, isSelected, onToggleSelect }) {
  const images = useMemo(() => getProductImages(product), [product]);
  const image = images[0] || product?.image;
  const rating = Number(product?.rating_stars || 0);
  const variantId = getDefaultVariantId(product);

  const isLowStock = product?.id?.length % 3 === 0;
  const hasPriceDrop = product?.id?.length % 5 === 0;

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-white dark:bg-slate-900 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${isSelected ? 'ring-2 ring-slate-900 dark:ring-white shadow-xl' : 'ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm'}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-50 dark:bg-white">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSelect(product.id); }}
          className={`absolute left-4 top-4 z-30 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all ${isSelected ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 opacity-100 scale-110' : 'bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 opacity-0 group-hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-500'}`}
        >
          {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </button>

        <QuickView
          product={product}
          onQuickView={onQuickView}
          className="absolute right-16 top-4 z-20 bg-white/90 dark:bg-slate-800/90 opacity-0 shadow-sm backdrop-blur-md transition-all group-hover:opacity-100 hover:scale-110"
        />
        <WishlistHeart
          productId={product.id}
          showOnHover={false}
          className="absolute right-4 top-4 z-20 bg-white/90 dark:bg-slate-800/90 shadow-sm backdrop-blur-md transition-transform hover:scale-110"
        />

        <div className="absolute left-4 bottom-4 z-10 flex flex-col gap-1.5 pointer-events-none">
          {hasPriceDrop && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 backdrop-blur-md">
              <TrendingDown className="h-3 w-3" />
              Drop
            </span>
          )}
          {isLowStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 backdrop-blur-md">
              <Clock className="h-3 w-3" />
              Low Stock
            </span>
          )}
        </div>

        <Link to={productDetailHref(product)} className="block h-full w-full">
          {image ? (
            <img
              src={image}
              alt={product?.name || "Wishlist product"}
              className="h-full w-full object-cover object-center mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 dark:text-slate-400">
              Woosho
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <Link to={productDetailHref(product)} className="flex flex-col">
          <div className="flex items-center justify-between gap-2">
             <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{getProductSize(product)}</span>
             <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {rating ? rating.toFixed(1) : "New"}
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
             </span>
          </div>
          <h2 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-extrabold text-slate-900 dark:text-slate-100 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300">
            {product?.name || "Wishlist product"}
          </h2>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
              {formatMoneyCents(product?.price_cents)}
            </p>
            {hasPriceDrop && (
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 line-through">
                {formatMoneyCents((product?.price_cents || 0) * 1.15)}
              </p>
            )}
          </div>
        </Link>

        <div className="mt-5 w-full">
          <AddToCart
            productId={product.id}
            variantId={variantId}
            variant="pill"
            className="w-full rounded-xl py-3.5 text-sm font-bold shadow-[0_4px_14px_rgb(0,0,0,0.05)] dark:shadow-none transition-all hover:shadow-[0_6px_20px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_4px_14px_rgb(255,255,255,0.05)] active:scale-[0.98]"
          />
        </div>
      </div>
    </motion.article>
  );
}

function WishlistSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="relative flex h-[460px] flex-col overflow-hidden rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
        >
          <div className="h-[60%] w-full animate-pulse bg-slate-50 dark:bg-slate-800/50" />
          
          <div className="flex flex-col gap-3 p-5 sm:p-6">
             <div className="flex justify-between">
                 <div className="h-2.5 w-12 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                 <div className="h-2.5 w-10 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
             </div>
             <div className="h-4 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
             <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
             <div className="mt-1 h-5 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
             <div className="mt-4 h-12 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmptyWishlist() {
  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col items-center justify-center overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 px-6 py-32 text-center shadow-sm"
    >
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[24px] bg-slate-950 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-900/20 dark:shadow-white/10"
      >
        <div className="absolute inset-0 rounded-[24px] bg-white/10 dark:bg-black/5 opacity-0 transition-opacity hover:opacity-100" />
        <Heart className="h-10 w-10" fill="currentColor" strokeWidth={1.5} />
      </motion.div>
      <motion.h2 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl"
      >
        Your wishlist is empty
      </motion.h2>
      <motion.p 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-slate-500 dark:text-slate-400"
      >
        Curate your personal collection. Save the products you love and they will await you here for later.
      </motion.p>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Link
          to="/products"
          className="mt-10 inline-flex h-14 items-center justify-center rounded-xl bg-slate-950 dark:bg-white px-10 text-base font-bold text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all hover:-translate-y-1 hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-2xl hover:shadow-slate-900/30 dark:hover:shadow-white/20 active:translate-y-0"
        >
          Explore Collections
        </Link>
      </motion.div>
    </motion.section>
  );
}

function WishlistNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section className="mx-auto mt-32 max-w-3xl px-2 text-center">
      <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
        Find out about sales and new arrivals!
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row"
      >
        <input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSubscribed(false);
          }}
          placeholder="Enter your email address"
          className="min-h-14 w-full flex-none rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 text-base font-medium leading-6 text-slate-950 dark:text-white shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-950 dark:focus:border-white focus:ring-1 focus:ring-slate-950 dark:focus:ring-white sm:min-h-16 sm:flex-1 sm:px-6 sm:text-lg"
        />
        <button
          type="submit"
          className="h-16 rounded-2xl bg-slate-950 dark:bg-white px-10 text-lg font-bold text-white dark:text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 dark:hover:bg-slate-200 active:translate-y-0"
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </form>
    </section>
  );
}

export default function WishlistPage() {
  const [sortBy, setSortBy] = useState("default");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const { productIds, wishlistCount, isLoading: wishlistLoading } = useWishlist();
  const { data: products = [], isLoading: productsLoading } = useAllProducts();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addItems, addingItems } = useCartActions();

  const wishlistProducts = useMemo(() => {
    const positionById = new Map(productIds.map((id, index) => [id, index]));

    return products
      .filter((product) => positionById.has(product?.id))
      .sort((a, b) => positionById.get(a.id) - positionById.get(b.id));
  }, [productIds, products]);

  const sortedProducts = useMemo(
    () => sortWishlistProducts(wishlistProducts, sortBy),
    [sortBy, wishlistProducts],
  );

  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const isLoading = wishlistLoading || productsLoading;
  const hasMore = visibleCount < sortedProducts.length;
  const wishlistQueryKey = ["wishlist", user?.id || "guest"];
  const bulkBusy = isProcessing || addingItems;
  const wishlistCanonical =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/wishlist`
      : undefined;
  const wishlistSeoImage = (() => {
    const heroProduct = sortedProducts[0] || wishlistProducts[0];
    if (!heroProduct) return undefined;
    return getProductImages(heroProduct)[0] || heroProduct.image;
  })();
  const wishlistDescription = wishlistCount
    ? `Review ${wishlistCount} saved WooSho product${wishlistCount === 1 ? "" : "s"}, compare favorites, and move loved items into your cart.`
    : "Save your favorite WooSho products, build a personal wishlist, and return later to compare or add them to cart.";
  const wishlistSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Your Wishlist | WooSho",
    description: wishlistDescription,
    url: wishlistCanonical,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: sortedProducts.length,
      itemListElement: sortedProducts.slice(0, 24).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        image: getProductImages(product)[0] || product.image,
        url:
          typeof window !== "undefined"
            ? `${window.location.origin}${productDetailHref(product)}`
            : undefined,
      })),
    },
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedProducts.map((p) => p.id)));
    }
  };

  const removeWishlistOptimistically = (idsArray) => {
    const idsSet = new Set(idsArray.filter(Boolean));
    const previousProductIds = queryClient.getQueryData(wishlistQueryKey) || productIds;
    const nextProductIds = previousProductIds.filter((id) => !idsSet.has(id));

    queryClient.setQueryData(wishlistQueryKey, nextProductIds);

    if (!user?.id) {
      WishlistAPI.setGuestWishlist(nextProductIds);
    }

    return previousProductIds;
  };

  const restoreWishlist = (previousProductIds) => {
    if (!previousProductIds) return;

    queryClient.setQueryData(wishlistQueryKey, previousProductIds);

    if (!user?.id) {
      WishlistAPI.setGuestWishlist(previousProductIds);
    }
  };

  const persistWishlistRemoval = async (idsArray) => {
    const ids = [...new Set(idsArray.filter(Boolean))];
    if (!ids.length || !user?.id) return;
    await WishlistAPI.removeMany(ids);
  };

  const handleBulkRemove = async () => {
    if (selectedIds.size === 0 || bulkBusy) return;

    const idsArray = Array.from(selectedIds);
    const previousProductIds = removeWishlistOptimistically(idsArray);

    setIsProcessing(true);
    try {
      await persistWishlistRemoval(idsArray);
      trackEvent({
        eventType: "remove_from_wishlist_bulk",
        quantity: idsArray.length,
        userId: user?.id || null,
        metadata: {
          signal: "most_loved",
          product_ids: idsArray,
          source: "wishlist_bulk_remove",
        },
      });
      setSelectedIds(new Set());
    } catch (error) {
      restoreWishlist(previousProductIds);
      console.error("Failed to remove wishlist items", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAddToCart = async (productsToAdd) => {
    const productsArray = (productsToAdd || []).filter((product) => product?.id);
    if (!productsArray.length || bulkBusy) return;

    const cartItems = productsArray
      .map((product) => {
        const variantId = getDefaultVariantId(product);
        const variant = product?.product_variants?.find((item) => item?.id === variantId);

        if (!variantId) return null;

        return {
          productId: product.id,
          variantId,
          quantity: 1,
          product,
          variant,
        };
      })
      .filter(Boolean);

    if (!cartItems.length) return;

    const productIdsToRemove = cartItems.map((item) => item.productId);
    const previousProductIds = removeWishlistOptimistically(productIdsToRemove);

    setIsProcessing(true);
    try {
      await addItems(cartItems);
      await persistWishlistRemoval(productIdsToRemove);

      trackEvent({
        eventType: "add_to_cart_bulk",
        quantity: cartItems.length,
        userId: user?.id || null,
        metadata: {
          product_ids: productIdsToRemove,
          variant_ids: cartItems.map((item) => item.variantId),
          source: "wishlist_bulk",
        },
      });

      trackEvent({
        eventType: "remove_from_wishlist_bulk",
        quantity: productIdsToRemove.length,
        userId: user?.id || null,
        metadata: {
          signal: "most_loved",
          reason: "added_to_cart",
          product_ids: productIdsToRemove,
          source: "wishlist_bulk",
        },
      });

      setSelectedIds(new Set());
    } catch (error) {
      restoreWishlist(previousProductIds);
      console.error("Failed to add wishlist items to cart", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-32 pt-28 text-slate-950 dark:text-white transition-colors duration-300">
      <SEO
        title="Your Wishlist | WooSho"
        description={wishlistDescription}
        keywords="WooSho wishlist, saved products, favorite products, shopping wishlist"
        canonical={wishlistCanonical}
        image={wishlistSeoImage}
        type="website"
        noIndex
        schema={wishlistSchema}
      />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        
        {/* Premium Header */}
        <header className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em]">
                <Link to="/" className="text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-950 dark:hover:text-white">
                  Woosho
                </Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <Link to="/products" className="text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-950 dark:hover:text-white">
                  Products
                </Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-950 dark:text-slate-200">Wishlist</span>
              </nav>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                Your Wishlist
                <span className="ml-4 inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 px-5 py-2 align-middle text-xl font-bold text-slate-700 dark:text-slate-300">
                  {wishlistCount}
                </span>
              </h1>
            </div>
            
            {wishlistCount > 0 && (
              <div className="flex items-center">
                <ShareButton
                  variant="pill"
                  title="Your Wishlist | WooSho"
                  text="Check out my WooSho wishlist"
                  panelTitle="Share wishlist"
                  copyText="Copy Wishlist Link"
                  className="h-12 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 text-sm font-bold shadow-none transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                />
              </div>
            )}
          </div>
        </header>

        <div>
          {isLoading ? (
            <WishlistSkeletonGrid />
          ) : wishlistCount === 0 ? (
            <EmptyWishlist />
          ) : (
            <>
              {/* Sleek Action Bar */}
              <div className="mb-8 h-[68px]">
                <AnimatePresence mode="wait">
                  {selectedIds.size > 0 ? (
                    <motion.div 
                      key="selected-mode"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex h-full w-full flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 dark:bg-white p-2 pl-4 shadow-xl shadow-slate-900/10 dark:shadow-white/5"
                    >
                      <div className="flex items-center gap-4 text-white dark:text-slate-900">
                        <button onClick={handleSelectAll} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 dark:bg-slate-900/10 transition hover:bg-white/30 dark:hover:bg-slate-900/20">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </button>
                        <span className="text-sm font-bold tracking-wide">
                          {selectedIds.size} Selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pr-1">
                        <button 
                          onClick={handleBulkRemove} 
                          disabled={bulkBusy}
                          className="group inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 dark:bg-slate-900/5 px-6 text-sm font-bold text-white dark:text-slate-900 transition hover:bg-red-500 hover:text-white dark:hover:bg-red-500 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                        <button 
                          onClick={() => handleBulkAddToCart(sortedProducts.filter((product) => selectedIds.has(product.id)))} 
                          disabled={bulkBusy}
                          className="group inline-flex h-11 items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-6 text-sm font-bold text-slate-900 dark:text-white transition hover:scale-105 disabled:opacity-60"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span className="hidden sm:inline">{bulkBusy ? "Adding" : "Add to Cart"}</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="default-mode"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex h-full w-full flex-wrap items-center justify-between gap-4 rounded-2xl bg-white dark:bg-slate-900 p-2 pl-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800"
                    >
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={handleSelectAll} 
                          className="group flex items-center gap-2 text-slate-400 dark:text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                          title="Select All"
                        >
                          <CheckSquare className="h-5 w-5" />
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                        <label className="relative flex items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Sort By</span>
                          <select
                            value={sortBy}
                            onChange={(event) => {
                              setSortBy(event.target.value);
                              setVisibleCount(PAGE_SIZE);
                            }}
                            className="appearance-none bg-transparent pr-6 text-sm font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer"
                          >
                            {SORT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        </label>
                      </div>
                      
                      <button 
                        onClick={() => handleBulkAddToCart(sortedProducts)} 
                        disabled={bulkBusy}
                        className="group inline-flex h-11 items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 px-6 text-sm font-bold text-slate-900 dark:text-white transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-60"
                      >
                         <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" />
                         <span className="hidden sm:inline">{bulkBusy ? "Adding All" : "Add All to Cart"}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <motion.div 
                layout
                className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {visibleProducts.map((product) => (
                    <WishlistProductCard
                      key={product.id}
                      product={product}
                      isSelected={selectedIds.has(product.id)}
                      onToggleSelect={handleToggleSelect}
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {hasMore && (
                <div className="mt-20 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="h-14 w-full max-w-sm rounded-2xl bg-slate-950 dark:bg-white px-8 text-base font-bold text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all hover:-translate-y-1 hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-2xl hover:shadow-slate-900/30 dark:hover:shadow-white/20 active:translate-y-0"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <WishlistNewsletter />
      </div>

      <AnimatePresence>
        {quickViewProduct && (
          <ProductDetailModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
