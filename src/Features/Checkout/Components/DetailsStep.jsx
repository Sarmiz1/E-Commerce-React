import { motion } from "framer-motion";
import { SHIPPING_TIERS } from "../Utils/checkoutConstants";
import { CheckoutForm } from "./CheckoutForm";
import { Icon } from "./CheckoutIcons";
import { OrderSummary } from "./OrderSummary";

export function DetailsStep({
  cart,
  coupon,
  form,
  errors,
  submitting,
  onBack,
  onChange,
  onSubmit,
  selectedShipping,
  onShippingChange,
}) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center gap-3">
            <motion.button type="button" whileHover={{ x: -3 }} onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 transition-colors hover:text-indigo-600">
              <Icon.Back className="h-4 w-4" />
              Back to Bag
            </motion.button>
          </div>
          <CheckoutForm form={form} errors={errors} onChange={onChange} onSubmit={onSubmit} loading={submitting} />
        </div>

        <div className="lg:col-span-2">
          <OrderSummary
            cart={cart}
            coupon={coupon}
            shippingOptions={SHIPPING_TIERS}
            selectedShipping={selectedShipping}
            onShippingChange={onShippingChange}
            step={1}
          />
        </div>
      </div>
    </motion.div>
  );
}
