// Skeleton fallback for /cart — matches CartPage layout:
// Page title → cart item rows (image + text + qty + price) + order summary sidebar
import { SkeletonStyles, SkBlock } from "./SkeletonBase";

export default function CartSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SkeletonStyles />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8 space-y-2">
          <SkBlock w="140px" h="28px" />
          <SkBlock w="200px" h="14px" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Cart items column ── */}
          <div className="flex-1 space-y-4">
            {/* Free shipping bar */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <SkBlock w="200px" h="14px" />
                <SkBlock w="30px" h="12px" />
              </div>
              <SkBlock w="100%" h="8px" rounded="99px" />
            </div>

            {/* Cart item rows */}
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                <div className="flex gap-4 items-start">
                  {/* Product image */}
                  <SkBlock w="80px" h="80px" rounded="16px" className="flex-shrink-0 sm:w-24 sm:h-24" />
                  {/* Details */}
                  <div className="flex-1 space-y-2 pt-1">
                    <SkBlock w="85%" h="14px" />
                    {/* Rating stars */}
                    <div className="flex gap-0.5">
                      {Array(5).fill(0).map((_, j) => (
                        <SkBlock key={j} w="12px" h="12px" rounded="3px" />
                      ))}
                    </div>
                    <SkBlock w="60px" h="16px" />
                    {/* Qty stepper */}
                    <SkBlock w="100px" h="32px" rounded="12px" />
                  </div>
                  {/* Line total + remove */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0 pt-1">
                    <SkBlock w="60px" h="16px" />
                    <SkBlock w="16px" h="16px" rounded="4px" />
                  </div>
                </div>
              </div>
            ))}

            {/* Order notes */}
            <SkBlock w="150px" h="14px" />
          </div>

          {/* ── Order summary sidebar ── */}
          <div className="lg:w-[340px] flex-shrink-0">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5 lg:sticky lg:top-24">
              <SkBlock w="110px" h="10px" />
              {/* Line items */}
              <div className="space-y-2.5">
                {["Subtotal", "Shipping"].map((label) => (
                  <div key={label} className="flex justify-between">
                    <SkBlock w="70px" h="14px" />
                    <SkBlock w="50px" h="14px" />
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                <SkBlock w="50px" h="16px" />
                <SkBlock w="80px" h="28px" />
              </div>
              {/* Promo code */}
              <div className="space-y-2">
                <SkBlock w="80px" h="10px" />
                <div className="flex gap-2">
                  <SkBlock w="100%" h="40px" rounded="16px" />
                  <SkBlock w="70px" h="40px" rounded="16px" className="flex-shrink-0" />
                </div>
              </div>
              {/* Checkout button */}
              <SkBlock w="100%" h="56px" rounded="16px" />
              {/* Trust */}
              <div className="flex justify-center gap-4">
                {Array(3).fill(0).map((_, i) => (
                  <SkBlock key={i} w="70px" h="10px" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
