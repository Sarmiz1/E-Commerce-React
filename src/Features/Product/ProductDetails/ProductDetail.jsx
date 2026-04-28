import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useProductBySlug,
  useProductRecommendations,
} from "../../../Hooks/product/useProducts";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IconSpinner } from "../../../Components/Icons/IconSpinner";
import { useProductDetail } from "./Hooks/useProductDetail";
import { DETAIL_STYLES } from "./Styles/DetailStyles";
import { StarRating } from "./Components/StarRating";
import { ThumbnailGallery } from "./Components/ThumbnailGallery";
import { AddToCartPanel } from "./Components/AddToCartPanel";
import { ReviewsSection } from "./Components/ReviewsSection";
import { ProductTabs } from "./Components/ProductTabs";
import { PriceAlertModal } from "./Components/PriceAlertModal";
import { PredictivePairings } from "./Components/PredictivePairings";
import { ProductNotFound } from "./Components/ProductNotFound";
import { getStoreInfo } from "../../../Utils/getStoreInfo";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { useProductInventory } from "../../../Hooks/useProductInventory";
import { hasPriceAlert } from "./Utils/productHelpers";

// Atomic Details Components
import DetailBreadcrumb from "./Components/DetailBreadcrumb";
import DetailActionsRow from "./Components/DetailActionsRow";
import DetailMainInfo from "./Components/DetailMainInfo";
import DetailInventory from "./Components/DetailInventory";
import DetailSecondaryActions from "./Components/DetailSecondaryActions";
import DetailReassurance from "./Components/DetailReassurance";

gsap.registerPlugin(ScrollTrigger);

export default function ProductDetail() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();

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
    shareOpen,
    copied,
    copyLabel,
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
    handleShare,
    handleCopyLink,
    shareToURL,
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

  if (!product) return <ProductNotFound />;

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
  const sku =
    "SE-" +
    String(product.id || "")
      .slice(0, 8)
      .toUpperCase();
  const onSale = product.price_cents < 2000;
  const origPrice = onSale ? Math.round(product.price_cents * 1.35) : null;
  const lowStock = (product.rating_count || 0) < 50;
  const storeInfo = getStoreInfo(product);

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
            </div>

            {/* RIGHT: Sticky info + ATC panel */}
            <div className="lg:col-span-5">
              <div
                ref={rightRef}
                className="lg:sticky lg:top-[88px] max-h-[calc(100vh-100px)] overflow-y-auto space-y-5 pd-thumbs pr-2 pb-8"
              >
                {/* Top action row */}
                <DetailActionsRow 
                  wishlisted={wishlisted}
                  toggleWishlist={toggleWishlist}
                  shareOpen={shareOpen}
                  handleShare={handleShare}
                  shareToURL={shareToURL}
                  handleCopyLink={handleCopyLink}
                  copied={copied}
                  copyLabel={copyLabel}
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
                  <AddToCartPanel productId={product.id} atcRef={atcRef} />
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
      {/* <StickyATCBar product={product} productId={product.id} variantId={product.variants?.[0]?.id || null} visible={atcOutOfView} /> */}
    </div>
  );
}
