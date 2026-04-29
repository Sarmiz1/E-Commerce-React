import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLoaderData } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCartState, useCartActions } from "../../Context/cart/CartContext";
import useShowErrorBoundary from "../../Hooks/useShowErrorBoundary";

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

export default function CartPage() {
  const navigate = useNavigate();

  // ── Cart data from API ───o──────────────────────────────────────────────────
  const { updateQuantity, removeItem, addItem } = useCartActions();
  const { cart, loading, error } = useCartState();

  useShowErrorBoundary(error);

  // ── Recommendations from API ───────────────────────────────────────────────
  const cartRecommendations = useLoaderData();
  const recommendations = useMemo(() => cartRecommendations?.recommendations || [], [cartRecommendations]);

  // ── Local cart state (optimistic) ─────────────────────────────────────────
  const [localCart, setLocalCart] = useState([]);
  useEffect(() => {
    if (cart) setLocalCart(cart);
  }, [cart]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [pendingQtyId, setPendingQtyId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [undoItem, setUndoItem] = useState(null);
  const [savedForLater, setSavedForLater] = useState([]);
  const [promo, setPromo] = useState(null);
  const [orderNote, setOrderNote] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const cartProductIds = useMemo(
    () => new Set(localCart.map((i) => String(i.products?.id))),
    [localCart]
  );

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = useMemo(
    () => localCart.reduce((s, i) => s + (i.products?.price_cents || 0) * i.quantity, 0),
    [localCart]
  );
  const discount = useMemo(() => {
    if (!promo) return 0;
    if (promo.type === "percent") return Math.round(subtotal * promo.value / 100);
    if (promo.type === "fixed") return promo.value;
    return 0;
  }, [promo, subtotal]);
  const shipping = useMemo(() => {
    if (!localCart.length) return 0;
    if (promo?.type === "shipping") return 0;
    return subtotal - discount >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_COST;
  }, [promo, subtotal, discount, localCart.length]);
  const total = subtotal - discount + shipping;
  const savings = discount + (subtotal >= FREE_SHIP_THRESHOLD ? SHIPPING_COST : 0);

  // ── Update quantity — optimistic + API sync ────────────────────────────────
  const handleQtyChange = useCallback(async (itemId, newQty) => {
    if (newQty < 1 || newQty > 10) return;

    setLocalCart(prev =>
      prev.map(i =>
        i.id === itemId ? { ...i, quantity: newQty } : i
      )
    );

    setPendingQtyId(itemId);

    try {
      await updateQuantity(itemId, newQty);
    } catch {
      // rollback handled by provider
    } finally {
      setPendingQtyId(null);
    }
  }, [updateQuantity]);

  // ── Remove item — optimistic with undo window ──────────────────────────────
  const handleRemove = useCallback(async (itemId, itemName) => {
    const item = localCart.find(i => i.id === itemId);
    if (!item) return;

    setLocalCart(prev =>
      prev.filter(i => i.id !== itemId)
    );

    setUndoItem({ id: itemId, name: itemName, data: item });
    setRemovingId(itemId);

    try {
      await removeItem(itemId);
    } catch {
      // rollback handled by provider
    } finally {
      setRemovingId(null);
    }
  }, [localCart, removeItem]);

  // ── Undo remove ────────────────────────────────────────────────────────────
  const handleUndo = useCallback(async () => {
    if (!undoItem) return;

    const itemToRestore = undoItem;
    setUndoItem(null);

    try {
      await addItem(
        itemToRestore.data.products?.id,
        itemToRestore.data.quantity
      );
    } catch {
      // rollback handled by provider
    }
  }, [undoItem, addItem]);

  // ── Save for later ─────────────────────────────────────────────────────────
  const handleSaveLater = useCallback(async (item) => {
    const exists = savedForLater.some(i => i.id === item.id);
    if (exists) return;

    try {
      await handleRemove(item.id, item.products?.name);
      setSavedForLater(prev => [...prev, item]);
    } catch {
      // do nothing
    }
  }, [handleRemove, savedForLater]);

  // ── Move saved item back to cart ───────────────────────────────────────────
  const handleMoveToCart = useCallback(async (item) => {
    const removedItem = item;

    setSavedForLater(prev =>
      prev.filter(i => i.id !== item.id)
    );

    try {
      await addItem(
        item.products?.id,
        item.quantity
      );
    } catch {
      setSavedForLater(prev => [...prev, removedItem]);
    }
  }, [addItem]);

  // ── Add recommended product to cart ───────────────────────────────────────
  const handleAddRecommended = useCallback(async (product) => {
    try {
      await addItem(product.id);
    } catch {
      // optional: show toast
    }
  }, [addItem]);

  // ── Checkout ───────────────────────────────────────────────────────────────
  const handleCheckout = useCallback(() => {
    if (!localCart.length) return;
    setIsCheckingOut(true);
    setTimeout(() => navigate("/checkout"), 500);
  }, [localCart.length, navigate]);

  // ── Hero entrance animation ────────────────────────────────────────────────
  const headingRef = useRef(null);
  useEffect(() => {
    if (!headingRef.current) return;
    gsap.fromTo(headingRef.current.querySelectorAll(".ct-head-item"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: "power3.out", clearProps: "all" }
    );
  }, []);

  const isEmpty = !loading && localCart.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden pt-16">
      <style>{CT_STYLES}</style>

      {/* ════════════════════════════════════════════════════════════
          HERO HEADER
      ════════════════════════════════════════════════════════════ */}
      <div ref={headingRef} className="relative overflow-hidden bg-white border-b border-gray-100 px-6 py-10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.025] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at right center, #6366f1 0%, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto">
          <div className="ct-head-item flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <button onClick={() => navigate("/")} className="hover:text-indigo-600 transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate("/products")} className="hover:text-indigo-600 transition-colors">Products</button>
            <span>/</span>
            <span className="text-gray-700 font-bold">Cart</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="ct-head-item text-5xl font-black text-gray-900 leading-tight">
                Shopping Cart
              </h1>
              <p className="ct-head-item text-gray-400 mt-2 text-base">
                {loading
                  ? "Loading…"
                  : localCart.length === 0
                    ? "Your cart is empty"
                    : `${localCart.length} item${localCart.length !== 1 ? "s" : ""} ready to checkout`}
              </p>
            </div>
            {localCart.length > 0 && (
              <div className="ct-head-item flex items-center gap-2">
                <motion.div
                  key={localCart.length}
                  animate={{ scale: [1, 1.4, 0.9, 1] }}
                  transition={{ duration: 0.4 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/25"
                >
                  <span className="text-white font-black text-lg">{localCart.length}</span>
                </motion.div>
                <Ic.Bag c="w-6 h-6 text-gray-300" />
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
                    {localCart.map((item, i) => (
                      <CartRow
                        key={item.id}
                        item={item}
                        index={i}
                        onQtyChange={handleQtyChange}
                        onRemove={handleRemove}
                        onSaveLater={handleSaveLater}
                        pendingQty={pendingQtyId === item.id}
                        isRemoving={removingId === item.id}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                <OrderNotes value={orderNote} onChange={setOrderNote} />
              </div>

              <SavedForLater items={savedForLater} onMoveToCart={handleMoveToCart} />

              <RecommendedRow
                products={recommendations}
                onAddToCart={handleAddRecommended}
                cartProductIds={cartProductIds}
              />

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "🔒", title: "Secure Checkout", sub: "256-bit SSL" },
                  { icon: "↩️", title: "Free 30-Day Returns", sub: "No questions" },
                  { icon: "🚀", title: "Fast Dispatch", sub: "Within 24h" },
                ].map((t) => (
                  <div key={t.title} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
                    <div className="text-2xl mb-1.5">{t.icon}</div>
                    <p className="font-bold text-gray-900 text-xs">{t.title}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">{t.sub}</p>
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
                itemCount={localCart.length}
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
          itemCount={localCart.length}
          onCheckout={handleCheckout}
        />
      )}

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