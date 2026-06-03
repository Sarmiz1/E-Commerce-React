import { SkeletonStyles, SkBlock } from "./SkeletonBase";

export default function CartSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SkeletonStyles />

      <div className="border-b border-slate-800 bg-slate-950 px-4 pb-8 pt-24 sm:px-6 sm:pb-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <SkBlock w="170px" h="12px" dark />
          <div className="space-y-3">
            <SkBlock w="min(280px, 80vw)" h="48px" dark />
            <SkBlock w="220px" h="16px" dark />
          </div>
        </div>
      </div>

      <div className="border-y border-slate-800 bg-slate-950 px-4 py-2.5">
        <SkBlock w="100%" h="10px" dark />
      </div>

      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
          <div className="flex-1 space-y-4">
            <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between">
                <SkBlock w="min(200px, 60vw)" h="14px" dark />
                <SkBlock w="30px" h="12px" dark />
              </div>
              <SkBlock w="100%" h="8px" rounded="99px" dark />
            </div>

            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="rounded-3xl border border-slate-800 bg-slate-900 p-3.5 shadow-sm sm:p-5">
                <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-4">
                  <SkBlock w="64px" h="64px" rounded="16px" dark className="flex-shrink-0 sm:w-24 sm:h-24" />
                  <div className="flex-1 space-y-2 pt-1">
                    <SkBlock w="85%" h="14px" dark />
                    <div className="flex gap-0.5">
                      {Array(5).fill(0).map((_, starIndex) => (
                        <SkBlock key={starIndex} w="12px" h="12px" rounded="3px" dark />
                      ))}
                    </div>
                    <SkBlock w="60px" h="16px" dark />
                    <SkBlock w="100px" h="32px" rounded="12px" dark />
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-3 pl-[4.625rem] sm:col-span-1 sm:flex-col sm:items-end sm:justify-start sm:pl-0">
                    <SkBlock w="60px" h="16px" dark />
                    <SkBlock w="16px" h="16px" rounded="4px" dark />
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
              <SkBlock w="150px" h="14px" dark />
            </div>
          </div>

          <div className="flex-shrink-0 lg:w-[340px]">
            <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:p-6 lg:sticky lg:top-24">
              <SkBlock w="110px" h="10px" dark />
              <div className="space-y-2.5">
                {["subtotal", "shipping"].map((label) => (
                  <div key={label} className="flex justify-between">
                    <SkBlock w="70px" h="14px" dark />
                    <SkBlock w="50px" h="14px" dark />
                  </div>
                ))}
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-800 pt-4">
                <SkBlock w="50px" h="16px" dark />
                <SkBlock w="80px" h="28px" dark />
              </div>
              <div className="space-y-2">
                <SkBlock w="80px" h="10px" dark />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <SkBlock w="100%" h="40px" rounded="16px" dark />
                  <SkBlock w="70px" h="40px" rounded="16px" dark className="flex-shrink-0" />
                </div>
              </div>
              <SkBlock w="100%" h="56px" rounded="16px" dark />
              <div className="flex justify-center gap-4">
                {Array(3).fill(0).map((_, index) => (
                  <SkBlock key={index} w="70px" h="10px" dark />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
