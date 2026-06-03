import { motion, AnimatePresence } from "framer-motion";
import ProductDetailModal from "../../Components/Ui/ProductDetailModal";
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
    isItemActionPending,
    isEmpty,
    loading,
    navigate,
    noteStatus,
    orderNote,
    promo,
    quickViewProduct,
    recommendationsFetching,
    savedForLater,
    savingsTickerMessage,
    shippingProgress,
    handleOrderNoteChange,
    setUndoItem,
    shipping,
    subtotal,
    total,
    undoItem,
    undoPending,
    applyPromo,
  } = useCartPageController();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 overflow-x-hidden  transition-colors duration-300">
      <style>{CT_STYLES}</style>

      <div
        ref={headingRef}
        className="relative overflow-hidden border-b border-gray-100 bg-white px-4 pb-7 pt-20 transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900 sm:px-6 sm:pb-10 sm:pt-24"
      >
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-1/3 opacity-[0.025] sm:block"
          style={{ background: "radial-gradient(ellipse at right center, #6366f1 0%, transparent 70%)" }}
        />

        <div className="max-w-6xl mx-auto">
          <div className="ct-head-item mb-4 flex items-center gap-2 text-xs font-medium text-gray-400 sm:mb-6">
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

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="ct-head-item text-3xl font-black leading-tight text-gray-900 dark:text-white sm:text-5xl">
                Shopping Cart
              </h1>
              <p className="ct-head-item mt-1.5 text-sm text-gray-400 dark:text-neutral-500 sm:mt-2 sm:text-base">
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-indigo-500/25 sm:h-12 sm:w-12 sm:rounded-2xl"
                >
                  <span className="text-base font-black text-white sm:text-lg">{cartItems.length}</span>
                </motion.div>
                <Ic.Bag c="h-6 w-6 text-gray-300 dark:text-neutral-700" />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <SavingsTicker message={savingsTickerMessage} />

      <div className="mx-auto max-w-6xl px-3 py-5 pb-32 sm:px-6 sm:py-8 lg:px-4 lg:pb-8">
        {isEmpty ? (
          <EmptyCart
            savedItems={savedForLater}
            onMoveToCart={handleMoveToCart}
            isMovingItem={(itemId) => isItemActionPending("move", itemId)}
            navigate={navigate}
          />
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px] lg:gap-8">
            <div className="space-y-5 sm:space-y-8">
              <div className="ct-clip-wipe" style={{ animationDelay: "0.1s" }}>
                <FreeShippingBar progress={shippingProgress} />
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
                        pendingQty={isItemActionPending("quantity", item.id)}
                        isRemoving={isItemActionPending("remove", item.id)}
                        isSaving={isItemActionPending("save", item.id)}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
                <OrderNotes value={orderNote} onChange={handleOrderNoteChange} status={noteStatus} />
              </div>

              <div className="lg:hidden">
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

              <BundleOptimizer
                cartItems={cartItems}
                recommendations={displayRecommendations}
                onAddItem={addItemAsync}
              />

              <SavedForLater
                items={savedForLater}
                onMoveToCart={handleMoveToCart}
                isMovingItem={(itemId) => isItemActionPending("move", itemId)}
              />

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
            isPending={undoPending}
            onExpire={() => setUndoItem(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
