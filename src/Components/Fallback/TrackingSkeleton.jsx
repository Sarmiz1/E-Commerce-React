// Skeleton fallback for /tracking — matches TrackingPage's dark theme layout:
// Dark hero with starfield → headline → search bar → recent order pills
import { SkeletonStyles, SkBlock } from "./SkeletonBase";
import NavbarSkeleton from "./NavbarSkeleton";

export default function TrackingSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: "#070a18" }}>
      <SkeletonStyles />
      <NavbarSkeleton dark />

      {/* ── Hero section ── */}
      <div className="relative overflow-hidden pt-32" style={{ minHeight: 500, background: "linear-gradient(180deg,#0c0e26 0%,#070a18 100%)" }}>
        {/* Star field dots */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "52px 52px" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-14 pb-10">
          {/* Headline */}
          <div className="text-center mb-12 space-y-4">
            <SkBlock w="200px" h="10px" dark style={{ margin: "0 auto" }} />
            <SkBlock w="320px" h="44px" dark style={{ margin: "0 auto" }} />
            <SkBlock w="260px" h="44px" dark style={{ margin: "0 auto" }} />
            <SkBlock w="280px" h="14px" dark style={{ margin: "0 auto", marginTop: 16 }} />
          </div>

          {/* Search bar */}
          <div className="max-w-xl mx-auto space-y-5">
            <div className="flex gap-3">
              <SkBlock w="100%" h="52px" rounded="16px" dark />
              <SkBlock w="100px" h="52px" rounded="16px" dark className="flex-shrink-0" />
            </div>

            {/* Recent orders pills */}
            <div className="space-y-2.5">
              <SkBlock w="100px" h="10px" dark />
              <div className="flex gap-2 overflow-hidden">
                {Array(6).fill(0).map((_, i) => (
                  <SkBlock key={i} w={`${100 + (i % 3) * 20}px`} h="40px" rounded="16px" dark className="flex-shrink-0" />
                ))}
              </div>
            </div>
          </div>

          {/* Radar placeholder */}
          <div className="flex justify-center mt-12">
            <div className="w-40 h-40 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-indigo-500/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
