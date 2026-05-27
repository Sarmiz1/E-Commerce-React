// Skeleton fallback for /orders — matches OrdersPage layout:
// 4 stat cards → search + filter pills → order cards
import { SkeletonStyles, SkBlock } from "./SkeletonBase";

export default function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SkeletonStyles />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Page title */}
        <div className="mb-8 space-y-2">
          <SkBlock w="160px" h="28px" />
          <SkBlock w="240px" h="14px" />
        </div>

        {/* ── Stat cards (2×2 grid on mobile, 4-col on lg) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
              <SkBlock w="40px" h="40px" rounded="16px" />
              <SkBlock w="80px" h="28px" />
              <SkBlock w="90px" h="10px" />
            </div>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="mb-4">
          <SkBlock w="100%" h="48px" rounded="16px" />
        </div>

        {/* ── Status filter pills + sort ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex gap-2 flex-1 overflow-hidden">
            {["All Orders", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
              <SkBlock key={s} w={`${s.length * 8 + 24}px`} h="36px" rounded="99px" className="flex-shrink-0" />
            ))}
          </div>
          <SkBlock w="140px" h="36px" rounded="16px" className="flex-shrink-0" />
        </div>

        {/* ── Order cards ── */}
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Top colour strip */}
              <div className={`h-1 ${["bg-amber-200", "bg-blue-200", "bg-emerald-200", "bg-red-200", "bg-blue-200"][i % 5]}`} />
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <SkBlock w="80px" h="10px" />
                    <SkBlock w="140px" h="14px" />
                  </div>
                  <SkBlock w="90px" h="28px" rounded="99px" />
                </div>
                {/* Product image strip */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-3">
                    {Array(3).fill(0).map((_, j) => (
                      <SkBlock key={j} w="40px" h="40px" rounded="12px" style={{ border: "2px solid white" }} />
                    ))}
                  </div>
                  <SkBlock w="50px" h="10px" />
                </div>
                {/* Meta row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <SkBlock w="50px" h="8px" />
                    <SkBlock w="90px" h="14px" />
                  </div>
                  <div className="space-y-1 text-right">
                    <SkBlock w="40px" h="8px" style={{ marginLeft: "auto" }} />
                    <SkBlock w="70px" h="18px" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
