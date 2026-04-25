// Skeleton fallback for /products — matches the ProductsPage layout:
// Dark live-ticker bar → search bar → category pills → 4-col product card grid
import { SkeletonStyles, SkBlock, skCls } from "./SkeletonBase";
import NavbarSkeleton from "./NavbarSkeleton";

export default function ProductsSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <SkeletonStyles />
      <NavbarSkeleton />
      <div className="pt-20">

      {/* ── Live ticker bar ── */}
      <div className="bg-gray-900 py-2.5 overflow-hidden">
        <div className="flex gap-8 px-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-green-800" />
              <SkBlock w={`${90 + (i % 3) * 25}px`} h="10px" dark />
            </div>
          ))}
        </div>
      </div>

      {/* ── Search / header bar ── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <SkBlock w="100%" h="40px" rounded="12px" />
          <SkBlock w="40px" h="40px" rounded="12px" className="flex-shrink-0 lg:hidden" />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex gap-6 items-start">

          {/* ── Desktop sidebar skeleton ── */}
          <aside className="hidden lg:block w-52 xl:w-56 flex-shrink-0">
            <div className="rounded-xl p-5 bg-gray-50 border border-gray-100 space-y-5">
              {/* Filters header */}
              <SkBlock w="60px" h="14px" />
              {/* Sort */}
              <div className="space-y-2">
                <SkBlock w="50px" h="10px" />
                <SkBlock w="100%" h="36px" rounded="10px" />
              </div>
              {/* Category list */}
              <div className="space-y-1.5">
                <SkBlock w="60px" h="10px" />
                {Array(8).fill(0).map((_, i) => (
                  <SkBlock key={i} w="100%" h="28px" rounded="6px" />
                ))}
              </div>
              {/* Budget range */}
              <div className="space-y-2">
                <SkBlock w="70px" h="10px" />
                <SkBlock w="100%" h="3px" rounded="99px" />
                <div className="flex gap-1.5">
                  {Array(4).fill(0).map((_, i) => (
                    <SkBlock key={i} w="50px" h="26px" rounded="99px" />
                  ))}
                </div>
              </div>
              {/* Rating */}
              <div className="space-y-2">
                <SkBlock w="70px" h="10px" />
                <div className="grid grid-cols-4 gap-1">
                  {Array(4).fill(0).map((_, i) => (
                    <SkBlock key={i} w="100%" h="30px" rounded="6px" />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Content column ── */}
          <div className="flex-1 min-w-0 w-full">

            {/* Category pills */}
            <div className="flex gap-1.5 pb-3 mb-3 overflow-hidden">
              {["All", "Electronics", "Fashion", "Sports", "Home", "Beauty", "Toys", "Books"].map((cat) => (
                <SkBlock key={cat} w={`${cat.length * 9 + 20}px`} h="30px" rounded="99px" />
              ))}
            </div>

            {/* Result count */}
            <SkBlock w="120px" h="12px" style={{ marginBottom: 16 }} />

            {/* ── Product card grid skeleton ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array(24).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden flex flex-col bg-gray-50 border border-gray-100"
                >
                  {/* Image placeholder */}
                  <div className={skCls()} style={{ paddingTop: "128%" }} />
                  {/* Text lines */}
                  <div className="p-3 space-y-2">
                    <SkBlock w={`${60 + (i % 3) * 12}%`} h="10px" />
                    <SkBlock w="45%" h="8px" />
                    <div className="flex items-center justify-between pt-1">
                      <SkBlock w="38%" h="12px" />
                      <SkBlock w="32px" h="28px" rounded="8px" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
