import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SHIPPING_TIERS } from "../Utils/checkoutConstants";
import { getCartItemKey } from "../Utils/checkoutUtils";
import { CartItemRow } from "./CartItemRow";
import { CouponInput } from "./CouponInput";
import { EmptyCart } from "./EmptyCart";
import { Icon } from "./CheckoutIcons";
import { OrderSummary } from "./OrderSummary";

export function CartReviewStep({
  cart,
  coupon,
  onCoupon,
  onNext,
  onRemove,
  onUpdateQty,
  removingItemId,
  updatingQuantityItemId,
  selectedShipping,
  onShippingChange,
}) {
  return (
    <motion.div
      key="step0"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
    >
      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">Your Bag</h2>
              <Link to="/products" className="text-sm font-bold text-indigo-600 hover:underline">
                + Add more
              </Link>
            </div>

            <AnimatePresence>
              {cart.map((item) => {
                const itemKey = getCartItemKey(item);

                return (
                  <CartItemRow
                    key={itemKey}
                    item={item}
                    onUpdateQty={onUpdateQty}
                    onRemove={onRemove}
                    removing={removingItemId === itemKey}
                    updating={updatingQuantityItemId === itemKey}
                  />
                );
              })}
            </AnimatePresence>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Icon.Tag className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-black text-gray-900">Coupon / Promo Code</h3>
              </div>
              <CouponInput onApply={onCoupon} appliedCoupon={coupon} />
              <p className="mt-2 text-[10px] text-gray-400">Try: SAVE10 · WELCOME20 · FLAT5 · FREESHIP</p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, boxShadow: "0 16px 40px rgba(99,102,241,0.3)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-black text-white shadow-xl shadow-indigo-500/25"
            >
              Proceed to Checkout <Icon.Arrow className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="lg:col-span-2">
            <OrderSummary
              cart={cart}
              coupon={coupon}
              shippingOptions={SHIPPING_TIERS}
              selectedShipping={selectedShipping}
              onShippingChange={onShippingChange}
              step={0}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
