import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useProductBySlug,
  useProductRecommendations,
} from "../../../hooks/product/useProducts";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useProductDetail } from "./Hooks/useProductDetail";
import { DETAIL_STYLES } from "./Styles/DetailStyles";
import { ThumbnailGallery } from "./Components/ThumbnailGallery";
import { AddToCartPanel } from "./Components/AddToCartPanel";
import { ReviewsSection } from "./Components/ReviewsSection";
import { ProductTabs } from "./Components/ProductTabs";
import { PriceAlertModal } from "./Components/PriceAlertModal";
import { PredictivePairings } from "./Components/PredictivePairings";
import { StickyATCBar } from "./Components/StickyATCBar";
import ProductQAndA from "./Components/ProductQAndA";
import DetailPurchaseIntel from "./Components/DetailPurchaseIntel";
import { ProductNotFound } from "./Components/ProductNotFound";
import { getStoreInfo } from "../../../utils/getStoreInfo";
import { useProductInventory } from "../../../hooks/useProductInventory";
import { hasPriceAlert } from "./Utils/productHelpers";
import { useRecentlyViewed } from "../Hooks/useRecentlyViewed";
import { useAnalyticsEvent } from "../../../hooks/useAnalyticsEvent";
import { getProductImages } from "../../../utils/getProductImages";

// Atomic Details Components
import DetailBreadcrumb from "./Components/DetailBreadcrumb";
import DetailActionsRow from "./Components/DetailActionsRow";
import DetailMainInfo from "./Components/DetailMainInfo";
import DetailInventory from "./Components/DetailInventory";
import DetailSecondaryActions from "./Components/DetailSecondaryActions";
import DetailReassurance from "./Components/DetailReassurance";
import ProductSEO from "./Components/ProductSEO";
import { ProductDetailSkeleton } from "../../../components/Fallback";



export default function ProductDetail() {
  const { productSlug } = useParams();
  const { addProduct: addRecentlyViewed } = useRecentlyViewed();
  const trackEvent = useAnalyticsEvent();
  const [quantity, setQuantity] = useState(1);

  const imageRef = useRef(null)

  const { data: product, isFetchingProduct } = useProductBySlug(productSlug, {
    enabled: !!productSlug,
  });

  const productId = product?.id;
  const { data: predictiveProducts, isFetchingSimilar } =
    useProductRecommendations(productId, {
      enabled: !!productId,
    });

  const {
    isDark,
    user,
    wishlisted,
    reviews,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    alertOpen,
    setAlertOpen,
    hasAlert,
    setHasAlert,
    toggleWishlist,
    handleAddReview,
  } = useProductDetail(product);

  const atcRef = useRef(null);
  const atcInView = useInView(atcRef, { margin: "0px" });
  const atcOutOfView = !atcInView;

  useEffect(() => {
    if (!product) return;
    addRecentlyViewed(product);
    trackEvent("product_detail_viewed", { productId: product.id });
  }, [addRecentlyViewed, product, trackEvent]);

  // Global product inventory logic (Colors, Sizes, Systems)
  const {
    availableColors,
    displaySizes: availableSizes,
    sizeSystem,
    setSizeSystem,
    availableSystems,
    hasSizes,
    productType
  } = useProductInventory(product);

  const selectedVariant = useMemo(() => {
    const variants = product?.product_variants || product?.variants || [];
    if (!variants.length) return null;

    return (
      variants.find((variant) => {
        const colorMatches = !selectedColor || variant.color === selectedColor;
        const sizeMatches = !selectedSize || String(variant.size) === String(selectedSize);
        return colorMatches && sizeMatches;
      }) ||
      variants.find((variant) => !selectedColor || variant.color === selectedColor) ||
      variants[0]
    );
  }, [product, selectedColor, selectedSize]);

  if (isFetchingProduct && !product) return <ProductDetailSkeleton />;
  if (!product) return <ProductNotFound />;

  const sku = product.sku || product.id;
  
  // Real sales logic: backend must provide compare_at_price or original_price
  const origPrice = product.compare_at_price_cents || product.original_price_cents;
  const onSale = origPrice ? product.price_cents < origPrice : false;
  
  const lowStock = (product.rating_count || 0) < 50;
  const storeInfo = getStoreInfo(product);
  const variantId = selectedVariant?.id || null;

  // Map theme colors to StoreHeader requirements
  const storeHeaderColors = {
    text: {
      tertiary: "var(--mist)",
      accent: "var(--gold)"
    }
  };

  return (
    <div
      className="pd-root pd-grain min-h-screen pb-36 lg:pb-0"
      data-theme={isDark ? "dark" : "light"}
      style={{ background: "var(--pd-page)", color: "var(--cream)" }}
    >
      <ProductSEO product={product} reviews={reviews} />
      <style>{DETAIL_STYLES}</style>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div
        className="relative pt-20"
        style={{ background: "var(--pd-hero-grad)" }}
      >
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">
          {/* Breadcrumb */}
          <DetailBreadcrumb product={product} />



          {/* ── TWO-COLUMN GRID ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* LEFT: Gallery + Intel + Reviews (scrolls with page) */}
            <motion.div 
              className="lg:col-span-7"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <ThumbnailGallery product={product} imageRef={imageRef} />
              <ReviewsSection
                product={product}
                reviews={reviews}
                onAddReview={handleAddReview}
                user={user}
              />
              <ProductQAndA product={product} />
            </motion.div>

            {/* RIGHT: Sticky info + ATC panel */}
            <motion.div 
              className="lg:col-span-5"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div
                className="lg:sticky lg:top-[88px] max-h-[calc(100vh-100px)] overflow-y-auto space-y-5 pd-thumbs pr-2 pb-8"
              >
                {/* Top action row */}
                <DetailActionsRow 
                  product={product}
                  wishlisted={wishlisted}
                  toggleWishlist={toggleWishlist}
                />

                {/* Product Main Info */}
                <DetailMainInfo 
                  product={product}
                  sku={sku}
                  storeInfo={storeInfo}
                  storeHeaderColors={storeHeaderColors}
                  onSale={onSale}
                  origPrice={origPrice}
                />

                {lowStock && (
                  <div className="pd-r">
                    <span
                      className="pd-chip px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: "rgba(251,146,60,0.1)",
                        color: "#fb923c",
                        border: "1px solid rgba(251,146,60,0.2)",
                      }}
                    >
                      Low Stock
                    </span>
                  </div>
                )}

                <div className="pd-r pd-rule" />

                {/* Inventory Selection */}
                <DetailInventory 
                  availableColors={availableColors}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  hasSizes={hasSizes}
                  availableSystems={availableSystems}
                  sizeSystem={sizeSystem}
                  setSizeSystem={setSizeSystem}
                  availableSizes={availableSizes}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                  productType={productType}
                />

                {/* ATC */}
                <div className="pd-r">
                  <AddToCartPanel
                    productId={product.id}
                    variantId={variantId}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    atcRef={atcRef}
                  />
                </div>

                {/* Secondary actions */}
                <DetailSecondaryActions 
                  setAlertOpen={setAlertOpen}
                  hasAlert={hasAlert}
                  wishlisted={wishlisted}
                  toggleWishlist={toggleWishlist}
                />

                {/* Reassurance */}
                <DetailReassurance />

                <DetailPurchaseIntel
                  product={product}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  hasSizes={hasSizes}
                  lowStock={lowStock}
                />

                <div className="pd-r pd-rule" />

                {/* Tabs */}
                <div className="pd-r">
                  <ProductTabs product={product} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── PREDICTIVE PAIRINGS ──────────────────────────────────────── */}
      <PredictivePairings
        products={predictiveProducts}
        isFetching={isFetchingSimilar}
      />

      {/* ── PRICE ALERT MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {alertOpen && (
          <PriceAlertModal
            product={product}
            onClose={() => {
              setAlertOpen(false);
              setHasAlert(hasPriceAlert(product.id));
            }}
          />
        )}
      </AnimatePresence>

      {/* ── STICKY ATC BAR ───────────────────────────────────────────── */}
      <StickyATCBar
        key={atcOutOfView ? "visible-atc" : "hidden-atc"}
        product={product}
        productId={product.id}
        variantId={variantId}
        quantity={quantity}
        visible={atcOutOfView}
      />
    </div>
  );
}
