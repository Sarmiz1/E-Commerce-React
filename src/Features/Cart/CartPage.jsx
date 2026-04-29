import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CartAPI } from "../../api/cartApi";
import { useCartState, useCartActions } from "../../Context/cart/CartContext";
import useShowErrorBoundary from "../../Hooks/useShowErrorBoundary";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";

// Atomic Components
import { CT_STYLES, Ic, FREE_SHIP_THRESHOLD, SHIPPING_COST } from "./Components/CartConstants";
import { CartRow } from "./Components/CartRow";
import { OrderSummary } from "./Components/OrderSummary";
import { FreeShippingBar } from "./Components/FreeShippingBar";
import { SavingsTicker } from "./Components/SavingsTicker";
import { EmptyCart } from "./Components/EmptyCart";
import { SavedForLater } from "./Components/SavedForLater";
import { RecommendedRow } from "./Components/RecommendedRow";
import { StickyMobileBar } from "./Components/StickyMobileBar";
import { OrderNotes } from "./Components/OrderNotes";
import { CartSkeleton } from "./Components/CartSkeleton";
import { UndoToast } from "./Components/UndoToast";

gsap.registerPlugin(ScrollTrigger);

const getItemProductId = (item) => item?.product_id || item?.products?.id || item?.product?.id;
const getItemVariantId = (item) => item?.variant_id || item?.variant?.id || null;

export default function CartPage() {
  const navigate = useNavigate();

  // ── Cart data from API ───o──────────────────────────────────────────────────
  const {
    updateQuantity,
    removeItem,
    addItem,
    removingItemId,
    updatingQuantityItemId,
  } = useCartActions();
  const { cart, loading, error } = useCartState();
  const cartItems = useMemo(() => (Array.isArray(cart) ? cart : []), [cart]);

  useShowErrorBoundary(error);

  // ── Recommendations from API ───────────────────────────────────────────────
  const cartRecommendationProductIds = useMemo(
    () => cartItems.map((item) => getItemProductId(item)).filter(Boolean),
    [cartItems]
  );
  const {
    data: recommendations = [],
    isFetching: recommendationsFetching,
  } = useQuery({
    ...CartAPI.cartRecommendations(cartRecommendationProductIds, 8),
    enabled: !loading && cartRecommendationProductIds.length > 0,
    placeholderData: (previousData) => previousData ?? [],
  });

  // ── UI state ───────────────────────────────────────────────────────────────
  const [undoItem, setUndoItem] = useState(null);
  const [savedForLater, setSavedForLater] = useState([]);
  const [promo, setPromo] = useState(null);
  const [orderNote, setOrderNote] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [displayRecommendations, setDisplayRecommendations] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    if (cartRecommendationProductIds.length === 0) {
      setDisplayRecommendations([]);
      return;
    }

    if (!recommendationsFetching) {
      setDisplayRecommendations(recommendations);
    }
  }, [cartRecommendationProductIds.length, recommendations, recommendationsFetching]);

  useEffect(() => {
    const handleQuickView = (event) => {
      if (event.detail) setQuickViewProduct(event.detail);
    };

    window.addEventListener("open-quickview", handleQuickView);
    return () => window.removeEventListener("open-quickview", handleQuickView);
  }, []);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = useMemo(
    () => cartItems.reduce((s, i) => s + (i.products?.price_cents || 0) * i.quantity, 0),
    [cartItems]
  );
  const discount = useMemo(() => {
    if (!promo) return 0;
    if (promo.type === "percent") return Math.round(subtotal * promo.value / 100);
    if (promo.type === "fixed") return promo.value;
    return 0;
  }, [promo, subtotal]);
  const shipping = useMemo(() => {
    if (!cartItems.length) return 0;
    if (promo?.type === "shipping") return 0;
    return subtotal - discount >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_COST;
  }, [promo, subtotal, discount, cartItems.length]);
  const total = subtotal - discount + shipping;
  const savings = discount + (subtotal >= FREE_SHIP_THRESHOLD ? SHIPPING_COST : 0);

  // ── Update quantity through cart context ───────────────────────────────────
  const handleQtyChange = useCallback((itemId, newQty) => {
    if (newQty < 1 || newQty > 10) return;
    updateQuantity(itemId, newQty);
  }, [updateQuantity]);

  // ── Remove item with undo window ───────────────────────────────────────────
  const handleRemove = useCallback((item) => {
    setUndoItem({ id: item.id, name: item.products?.name, data: item });
    removeItem(item);
  }, [removeItem]);

  // ── Undo remove ────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (!undoItem) return;

    const itemToRestore = undoItem.data;
    setUndoItem(null);

    addItem(
      getItemProductId(itemToRestore),
      getItemVariantId(itemToRestore),
      itemToRestore.quantity
    );
  }, [undoItem, addItem]);

  // ── Save for later ─────────────────────────────────────────────────────────
  const handleSaveLater = useCallback((item) => {
    setSavedForLater(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });

    removeItem(item);
  }, [removeItem]);

  // ── Move saved item back to cart ───────────────────────────────────────────
  const handleMoveToCart = useCallback((item) => {
    setSavedForLater(prev =>
      prev.filter(i => i.id !== item.id)
    );

    addItem(
      getItemProductId(item),
      getItemVariantId(item),
      item.quantity
    );
  }, [addItem]);

  // ── Checkout ───────────────────────────────────────────────────────────────
  const handleCheckout = useCallback(() => {
    if (!cartItems.length) return;
    setIsCheckingOut(true);
    setTimeout(() => navigate("/checkout"), 500);
  }, [cartItems.length, navigate]);

  // ── Hero entrance animation ────────────────────────────────────────────────
  const headingRef = useRef(null);
  useEffect(() => {
    if (!headingRef.current) return;
    gsap.fromTo(headingRef.current.querySelectorAll(".ct-head-item"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: "power3.out", clearProps: "all" }
    );
  }, []);

  const isEmpty = !loading && cartItems.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 overflow-x-hidden pt-16 transition-colors duration-300">
      <style>{CT_STYLES}</style>

      {/* ════════════════════════════════════════════════════════════
          HERO HEADER
      ════════════════════════════════════════════════════════════ */}
      <div ref={headingRef} className="relative overflow-hidden bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 px-6 py-10 transition-colors duration-300">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.025] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at right center, #6366f1 0%, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto">
          <div className="ct-head-item flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <button onClick={() => navigate("/")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate("/products")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Products</button>
            <span>/</span>
            <span className="text-gray-700 dark:text-neutral-300 font-bold">Cart</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="ct-head-item text-5xl font-black text-gray-900 dark:text-white leading-tight">
                Shopping Cart
              </h1>
              <p className="ct-head-item text-gray-400 dark:text-neutral-500 mt-2 text-base">
                {loading
                  ? "Loading…"
                  : cartItems.length === 0
                    ? "Your cart is empty"
                    : `${cartItems.length} item${cartItems.length !== 1 ? "s" : ""} ready to checkout`}
              </p>
            </div>
            {cartItems.length > 0 && (
              <div className="ct-head-item flex items-center gap-2">
                <motion.div
                  key={cartItems.length}
                  animate={{ scale: [1, 1.4, 0.9, 1] }}
                  transition={{ duration: 0.4 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/25"
                >
                  <span className="text-white font-black text-lg">{cartItems.length}</span>
                </motion.div>
                <Ic.Bag c="w-6 h-6 text-gray-300 dark:text-neutral-700" />
              </div>
            )}
          </div>
        </div>
      </div>

      <SavingsTicker savings={savings} />

      {/* ════════════════════════════════════════════════════════════
          MAIN GRID
      ════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28 lg:pb-8">
        {isEmpty ? (
          <EmptyCart savedItems={savedForLater} onMoveToCart={handleMoveToCart} navigate={navigate} />
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            <div className="space-y-8">
              <div className="ct-clip-wipe" style={{ animationDelay: "0.1s" }}>
                <FreeShippingBar subtotal={subtotal} discount={discount} />
              </div>

              <div className="space-y-4">
                {loading ? (
                  <CartSkeleton />
                ) : (
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item, i) => (
                      <CartRow
                        key={item.id}
                        item={item}
                        index={i}
                        onQtyChange={handleQtyChange}
                        onRemove={handleRemove}
                        onSaveLater={handleSaveLater}
                        pendingQty={updatingQuantityItemId === item.id}
                        isRemoving={removingItemId === item.id}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 p-5 shadow-sm transition-colors duration-300">
                <OrderNotes value={orderNote} onChange={setOrderNote} />
              </div>

              <SavedForLater items={savedForLater} onMoveToCart={handleMoveToCart} />

              <RecommendedRow
                products={displayRecommendations}
                isRefreshing={recommendationsFetching}
              />

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "🔒", title: "Secure Checkout", sub: "256-bit SSL" },
                  { icon: "↩️", title: "Free 30-Day Returns", sub: "No questions" },
                  { icon: "🚀", title: "Fast Dispatch", sub: "Within 24h" },
                ].map((t) => (
                  <div key={t.title} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 text-center shadow-sm transition-colors duration-300">
                    <div className="text-2xl mb-1.5">{t.icon}</div>
                    <p className="font-bold text-gray-900 dark:text-white text-xs">{t.title}</p>
                    <p className="text-gray-400 dark:text-neutral-500 text-[10px] mt-0.5">{t.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block sticky top-24">
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                shipping={shipping}
                total={total}
                itemCount={cartItems.length}
                promo={promo}
                onApplyPromo={setPromo}
                onRemovePromo={() => setPromo(null)}
                onCheckout={handleCheckout}
                isCheckingOut={isCheckingOut}
              />
            </div>
          </div>
        )}
      </div>

      {!isEmpty && (
        <StickyMobileBar
          total={total}
          itemCount={cartItems.length}
          onCheckout={handleCheckout}
        />
      )}

      <AnimatePresence>
        {quickViewProduct && (
          <ProductDetailModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {undoItem && (
          <UndoToast
            key={undoItem.id}
            item={{ name: undoItem.name }}
            onUndo={handleUndo}
            onExpire={() => setUndoItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
