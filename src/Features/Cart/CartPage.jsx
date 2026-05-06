import { motion, AnimatePresence } from "framer-motion";
import ProductDetailModal from "../../components/Ui/ProductDetailModal";
import { CT_STYLES, Ic } from "./Components/CartConstants";
import { CartRow } from "./Components/CartRow";
import { OrderSummary } from "./Components/OrderSummary";
import { FreeShippingBar } from "./Components/FreeShippingBar";
import { SavingsTicker } from "./Components/SavingsTicker";
import { EmptyCart } from "./Components/EmptyCart";
import { SavedForLater } from "./Components/SavedForLater";
import { RecommendedRow } from "./Components/RecommendedRow";
import { BundleOptimizer } from "./Components/BundleOptimizer";
import { StickyMobileBar } from "./Components/StickyMobileBar";
import { OrderNotes } from "./Components/OrderNotes";
import { CartSkeleton } from "./Components/CartSkeleton";
import { UndoToast } from "./Components/UndoToast";
import { TrustBadges } from "./Components/TrustBadges";
import useCartPageController from "./Hooks/useCartPageController";

export default function CartPage() {
  const {
    addItemAsync,
    cartItems,
    checkoutError,
    discount,
    displayRecommendations,
    handleCheckout,
    handleCloseQuickView,
    handleMoveToCart,
    handleQtyChange,
    handleRemove,
    handleRemovePromo,
    handleSaveLater,
    handleUndo,
    headingRef,
    isCheckingOut,
    isEmpty,
    loading,
    navigate,
    orderNote,
    promo,
    quickViewProduct,
    recommendationsFetching,
    removingItemId,
    savedForLater,
    savings,
    setOrderNote,
    setUndoItem,
    shipping,
    subtotal,
    total,
    undoItem,
    updatingQuantityItemId,
    applyPromo,
  } = useCartPageController();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 overflow-x-hidden pt-16 transition-colors duration-300">
      <style>{CT_STYLES}</style>

      <div
        ref={headingRef}
        className="relative overflow-hidden bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 px-6 py-10 transition-colors duration-300"
      >
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.025] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at right center, #6366f1 0%, transparent 70%)" }}
        />

        <div className="max-w-6xl mx-auto">
          <div className="ct-head-item flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Products
            </button>
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
                  ? "Loading..."
                  : cartItems.length === 0
                    ? "Your cart is empty"
                    : `${cartItems.length} item${cartItems.length !== 1 ? "s" : ""} ready to checkout`}
              </p>
            </div>
            {cartItems.length > 0 ? (
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
            ) : null}
          </div>
        </div>
      </div>

      <SavingsTicker savings={savings} />

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
                  <CartSkeleton count={cartItems.length} />
                ) : (
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item, index) => (
                      <CartRow
                        key={item.id}
                        item={item}
                        index={index}
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

              <BundleOptimizer
                cartItems={cartItems}
                recommendations={displayRecommendations}
                onAddItem={addItemAsync}
              />

              <SavedForLater items={savedForLater} onMoveToCart={handleMoveToCart} />

              <RecommendedRow
                products={displayRecommendations}
                isRefreshing={recommendationsFetching}
              />

              <TrustBadges />
            </div>

            <div className="hidden lg:block sticky top-24">
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                shipping={shipping}
                total={total}
                itemCount={cartItems.length}
                promo={promo}
                onApplyPromo={applyPromo}
                onRemovePromo={handleRemovePromo}
                onCheckout={handleCheckout}
                isCheckingOut={isCheckingOut}
                checkoutError={checkoutError}
              />
            </div>
          </div>
        )}
      </div>

      {!isEmpty ? (
        <StickyMobileBar
          total={total}
          itemCount={cartItems.length}
          onCheckout={handleCheckout}
          isCheckingOut={isCheckingOut}
          checkoutError={checkoutError}
        />
      ) : null}

      <AnimatePresence>
        {quickViewProduct ? (
          <ProductDetailModal product={quickViewProduct} onClose={handleCloseQuickView} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {undoItem ? (
          <UndoToast
            key={undoItem.id}
            item={{ name: undoItem.name }}
            onUndo={handleUndo}
            onExpire={() => setUndoItem(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
