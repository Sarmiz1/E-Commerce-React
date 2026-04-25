// Skeleton fallback for /products/:productId — matches ProductDetail layout:
// Left: thumbnail strip + main image area
// Right: SKU, title, rating, price, color/size selectors, add-to-cart, trust badges
import { SkeletonStyles, SkBlock } from "./SkeletonBase";
import NavbarSkeleton from "./NavbarSkeleton";

export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <SkeletonStyles />
      <NavbarSkeleton />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <SkBlock w="50px" h="12px" />
          <SkBlock w="8px" h="12px" rounded="4px" />
          <SkBlock w="80px" h="12px" />
          <SkBlock w="8px" h="12px" rounded="4px" />
          <SkBlock w="140px" h="12px" />
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

          {/* ── LEFT: Image gallery ── */}
          <div className="md:w-[55%] flex flex-col-reverse md:flex-row gap-3">
            {/* Thumbnail strip */}
            <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto">
              {Array(4).fill(0).map((_, i) => (
                <SkBlock key={i} w="72px" h="72px" rounded="12px" className="flex-shrink-0" />
              ))}
            </div>
            {/* Main image */}
            <div className="flex-1">
              <SkBlock w="100%" h="0" rounded="24px" style={{ paddingTop: "100%" }} />
              {/* Trust badges */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {Array(3).fill(0).map((_, i) => (
                  <SkBlock key={i} w="100%" h="80px" rounded="16px" />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="md:w-[45%] space-y-5">
            {/* SKU */}
            <SkBlock w="120px" h="10px" />
            {/* Title */}
            <SkBlock w="90%" h="22px" />
            <SkBlock w="60%" h="22px" />
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <SkBlock key={i} w="16px" h="16px" rounded="4px" />
                ))}
              </div>
              <SkBlock w="100px" h="14px" />
            </div>
            {/* Price */}
            <div className="flex items-center gap-3">
              <SkBlock w="100px" h="28px" rounded="8px" />
              <SkBlock w="60px" h="16px" />
            </div>

            <div className="h-px bg-gray-100" />

            {/* Color selector */}
            <div className="space-y-2">
              <SkBlock w="50px" h="10px" />
              <div className="flex gap-2.5">
                {Array(5).fill(0).map((_, i) => (
                  <SkBlock key={i} w="36px" h="36px" rounded="99px" />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="space-y-2">
              <SkBlock w="80px" h="10px" />
              <div className="flex gap-2 flex-wrap">
                {Array(6).fill(0).map((_, i) => (
                  <SkBlock key={i} w="52px" h="40px" rounded="12px" />
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <SkBlock w="60px" h="10px" />
              <SkBlock w="120px" h="40px" rounded="16px" />
            </div>

            {/* Add to cart button */}
            <SkBlock w="100%" h="56px" rounded="16px" />

            {/* Wishlist / Share */}
            <div className="flex gap-3">
              <SkBlock w="50%" h="44px" rounded="12px" />
              <SkBlock w="50%" h="44px" rounded="12px" />
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="mt-12 border-b border-gray-100">
          <div className="flex gap-8">
            {["Description", "Reviews", "Pairings"].map((tab) => (
              <SkBlock key={tab} w={`${tab.length * 9 + 16}px`} h="14px" style={{ marginBottom: 12 }} />
            ))}
          </div>
        </div>

        {/* Tab content placeholder */}
        <div className="mt-8 space-y-4">
          <SkBlock w="100%" h="14px" />
          <SkBlock w="85%" h="14px" />
          <SkBlock w="70%" h="14px" />
          <SkBlock w="90%" h="14px" />
        </div>
      </div>
    </div>
  );
}
