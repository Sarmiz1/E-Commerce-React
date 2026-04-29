import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useProductBySlug,
  useProductRecommendations,
} from "../../../Hooks/product/useProducts";
import { AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IconSpinner } from "../../../Components/Icons/IconSpinner";
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
import { getStoreInfo } from "../../../Utils/getStoreInfo";
import { useProductInventory } from "../../../Hooks/useProductInventory";
import { hasPriceAlert } from "./Utils/productHelpers";
import { useRecentlyViewed } from "../Hooks/useRecentlyViewed";
import { useAnalyticsEvent } from "../../../Hooks/useAnalyticsEvent";
import SEO from "../../../Components/SEO";
import { getProductImages } from "../../../Utils/getProductImages";

// Atomic Details Components
import DetailBreadcrumb from "./Components/DetailBreadcrumb";
import DetailActionsRow from "./Components/DetailActionsRow";
import DetailMainInfo from "./Components/DetailMainInfo";
import DetailInventory from "./Components/DetailInventory";
import DetailSecondaryActions from "./Components/DetailSecondaryActions";
import DetailReassurance from "./Components/DetailReassurance";

gsap.registerPlugin(ScrollTrigger);

const MAX_META_DESCRIPTION_LENGTH = 155;

function cleanSeoText(value) {
  if (!value) return "";

  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function clampMetaDescription(value) {
  const text = cleanSeoText(value);
  if (text.length <= MAX_META_DESCRIPTION_LENGTH) return text;

  const trimmed = text.slice(0, MAX_META_DESCRIPTION_LENGTH - 1).trimEnd();
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > 80 ? lastSpace : trimmed.length).trimEnd()}...`;
}

function getAbsoluteUrl(value) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (typeof window === "undefined") return value;

  return `${window.location.origin}${value.startsWith("/") ? value : `/${value}`}`;
}

export default function ProductDetail() {
  const { productSlug } = useParams();
  const { addProduct: addRecentlyViewed } = useRecentlyViewed();
  const trackEvent = useAnalyticsEvent();
  const [quantity, setQuantity] = useState(1);

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
  const [atcOutOfView, setAtcOutOfView] = useState(false);
  useEffect(() => {
    const el = atcRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setAtcOutOfView(!e.isIntersecting),
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!product) return;
    addRecentlyViewed(product);
    trackEvent("product_detail_viewed", { productId: product.id });
  }, [addRecentlyViewed, product, trackEvent]);

  const imageRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    if (!product || !imageRef.current || !rightRef.current) return;
    const tl = gsap.timeline({ delay: 0.05 });
    tl.fromTo(
      imageRef.current,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.85, ease: "expo.out", clearProps: "all" },
    ).fromTo(
      rightRef.current.querySelectorAll(".pd-r"),
      { x: 30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        stagger: 0.07,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "all",
      },
      "-=0.6",
    );
    return () => tl.kill();
  }, [product]);

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

  if (!product) return <ProductNotFound />;

  const sku =
    "SE-" +
    String(product.id || "")
      .slice(0, 8)
      .toUpperCase();
  const onSale = product.price_cents < 2000;
  const origPrice = onSale ? Math.round(product.price_cents * 1.35) : null;
  const lowStock = (product.rating_count || 0) < 50;
  const storeInfo = getStoreInfo(product);
  const variantId = selectedVariant?.id || null;
  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/products/${product.slug || product.id}`
      : undefined;
  const productImages = getProductImages(product);
  const productDescriptionSource =
    product.description ||
    product.full_description ||
    product.short_description ||
    "";
  const productDescription = cleanSeoText(productDescriptionSource);
  const productMetaDescription = clampMetaDescription(
    productDescription ||
      `Shop ${product.name} from ${storeInfo.name || "WooSho"} with reviews, product details, and personalized recommendations.`,
  );
  const productSchemaDescription =
    productDescription || productMetaDescription;
  const productSeoImage = getAbsoluteUrl(productImages[0] || product.image);
  const productBrandName =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || storeInfo.name || "WooSho";
  const productCategoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || product.category_name;
  const productKeywords = [
    product.name,
    storeInfo.name,
    productCategoryName,
    productBrandName,
    ...(Array.isArray(product.keywords) ? product.keywords : []),
  ].filter(Boolean).join(", ");
  const productAvailability =
    product.stock_quantity === 0
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productSchemaDescription,
    image: productImages.length
      ? productImages.map(getAbsoluteUrl).filter(Boolean)
      : productSeoImage,
    sku,
    brand: {
      "@type": "Brand",
      name: productBrandName,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: ((product.price_cents || 0) / 100).toFixed(2),
      availability: productAvailability,
      itemCondition: "https://schema.org/NewCondition",
      url: productUrl,
    },
  };

  if ((product.rating_stars || 0) > 0 && (product.rating_count || reviews.length || 0) > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating_stars,
      reviewCount: product.rating_count || reviews.length,
    };
  }

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
      <SEO
        title={`${product.name} | WooSho`}
        description={productMetaDescription}
        keywords={productKeywords}
        canonical={productUrl}
        image={productSeoImage}
        type="product"
        schema={productSchema}
      />
      <style>{DETAIL_STYLES}</style>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div
        className="relative pt-20"
        style={{ background: "var(--pd-hero-grad)" }}
      >
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">
          {/* Breadcrumb */}
          <DetailBreadcrumb product={product} />

          {/* Loading Spinner when Tanstack is updating fetch */}
          {isFetchingProduct && (
            <div className="flex justify-center mb-8">
              <IconSpinner />
            </div>
          )}

          {/* ── TWO-COLUMN GRID ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* LEFT: Gallery + Intel + Reviews (scrolls with page) */}
            <div className="lg:col-span-7">
              <ThumbnailGallery product={product} imageRef={imageRef} />
              <ReviewsSection
                product={product}
                reviews={reviews}
                onAddReview={handleAddReview}
                user={user}
              />
              <ProductQAndA product={product} />
            </div>

            {/* RIGHT: Sticky info + ATC panel */}
            <div className="lg:col-span-5">
              <div
                ref={rightRef}
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
            </div>
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
