import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { TAX_RATE } from "../Utils/checkoutConstants";
import {
  calculateCheckoutTotals,
  getCartItemImage,
  getCartItemKey,
  getCartItemLineTotal,
  getCartItemName,
  getCartItemQuantity,
} from "../Utils/checkoutUtils";
import { Icon } from "./CheckoutIcons";

function SummaryItem({ item }) {
  const image = getCartItemImage(item);
  const name = getCartItemName(item);

  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-white/10">
        {image ? (
          <img
            src={image}
            alt=""
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "https://placehold.co/100x100?text=Error";
            }}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[9px] font-black uppercase tracking-wider text-gray-300 dark:text-gray-600">Item</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{name}</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">x{getCartItemQuantity(item)}</p>
      </div>
      <p className="flex-shrink-0 text-xs font-black text-gray-900 dark:text-gray-100">{formatMoneyCents(getCartItemLineTotal(item))}</p>
    </div>
  );
}

function ShippingSelector({ shippingOptions, selectedShipping, onShippingChange }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Shipping Method</p>
      <div className="space-y-2">
        {shippingOptions.map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-150 ${
              selectedShipping === option.id 
                ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500/50" 
                : "border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            <input type="radio" name="shipping" value={option.id} checked={selectedShipping === option.id} onChange={() => onShippingChange(option.id)} className="accent-indigo-600" />
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{option.label}</span>
            <span className="text-sm font-black text-gray-900 dark:text-gray-100">{option.price === 0 ? "Free" : formatMoneyCents(option.price)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function PriceBreakdown({ totals, coupon }) {
  const rows = [
    { label: "Subtotal", value: totals.subtotal, style: "" },
    { label: "Shipping", value: totals.shipping, style: "", zero: "Free" },
    ...(totals.couponDiscount > 0 ? [{ label: `Coupon (${coupon.label})`, value: -totals.couponDiscount, style: "text-emerald-600" }] : []),
    { label: `Tax (${(TAX_RATE * 100).toFixed(1)}%)`, value: totals.tax, style: "text-gray-400 dark:text-gray-500" },
  ];

  return (
    <div className="space-y-2.5 border-t border-gray-100 dark:border-white/10 pt-4">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between text-sm">
          <span className={`text-gray-500 dark:text-gray-400 dark:text-gray-500 ${row.style}`}>{row.label}</span>
          <span className={`font-bold ${row.style || "text-gray-900 dark:text-gray-100"}`}>
            {row.value < 0 ? `-${formatMoneyCents(-row.value)}` : row.zero && row.value === 0 ? row.zero : formatMoneyCents(row.value)}
          </span>
        </div>
      ))}

      <div className="flex justify-between border-t border-gray-100 dark:border-white/10 pt-3">
        <span className="text-lg font-black text-gray-900 dark:text-gray-100">Total</span>
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-black text-transparent">{formatMoneyCents(totals.total)}</span>
      </div>
    </div>
  );
}

function TrustLines() {
  return (
    <div className="mt-5 flex flex-col gap-2">
      {[
        { icon: <Icon.Lock className="h-3.5 w-3.5" />, text: "SSL encrypted checkout" },
        { icon: <Icon.Truck className="h-3.5 w-3.5" />, text: "Real-time order tracking" },
        { icon: <Icon.Shield className="h-3.5 w-3.5" />, text: "Buyer protection guarantee" },
      ].map((badge) => (
        <div key={badge.text} className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
          <span className="text-indigo-400">{badge.icon}</span>
          {badge.text}
        </div>
      ))}
    </div>
  );
}

function SummaryContent({ cart, coupon, shippingOptions, selectedShipping, onShippingChange, step, totals }) {
  return (
    <>
      <h3 className="mb-5 flex items-center gap-2 text-lg font-black text-gray-900 dark:text-gray-100">
        <Icon.Bag className="h-5 w-5 text-indigo-500" /> Order Summary
        <span className="ml-auto text-sm font-bold text-indigo-600">
          {cart.length} item{cart.length !== 1 ? "s" : ""}
        </span>
      </h3>

      <div className="mb-5 max-h-52 space-y-3 overflow-y-auto pr-1">
        {cart.map((item) => (
          <SummaryItem key={getCartItemKey(item)} item={item} />
        ))}
      </div>

      {step === 1 && (
        <ShippingSelector shippingOptions={shippingOptions} selectedShipping={selectedShipping} onShippingChange={onShippingChange} />
      )}

      <PriceBreakdown totals={totals} coupon={coupon} />
      <TrustLines />
    </>
  );
}

export function OrderSummary({ cart, coupon, shippingOptions, selectedShipping, onShippingChange, step }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const totals = calculateCheckoutTotals(cart, selectedShipping, coupon, shippingOptions);

  return (
    <>
      <div className="sticky top-24 hidden rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm lg:block">
        <SummaryContent
          cart={cart}
          coupon={coupon}
          shippingOptions={shippingOptions}
          selectedShipping={selectedShipping}
          onShippingChange={onShippingChange}
          step={step}
          totals={totals}
        />
      </div>

      <div className="lg:hidden">
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <button type="button" onClick={() => setMobileOpen((open) => !open)} className="flex flex-1 items-center gap-2 text-left">
              <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                {cart.length} item{cart.length !== 1 ? "s" : ""}
              </span>
              <Icon.Bag className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600">{mobileOpen ? "Hide" : "Show"} summary</span>
              <motion.span animate={{ rotate: mobileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <svg className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </motion.span>
            </button>
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Total</p>
              <p className="text-lg font-black leading-tight text-gray-900 dark:text-gray-100">{formatMoneyCents(totals.total)}</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-white/5 pb-24 shadow-2xl"
              >
                <div className="p-5">
                  <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200" />
                  <SummaryContent
                    cart={cart}
                    coupon={coupon}
                    shippingOptions={shippingOptions}
                    selectedShipping={selectedShipping}
                    onShippingChange={onShippingChange}
                    step={step}
                    totals={totals}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
