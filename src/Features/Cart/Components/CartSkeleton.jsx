import { SkeletonStyles, SkBlock } from "../../../Components/Fallback/SkeletonBase";

export function CartSkeleton({ count = 2 }) {
  const skeletonCount = count > 0 ? count : 2;

  return (
    <div className="space-y-4">
      <SkeletonStyles />
      {Array(skeletonCount).fill(0).map((_, index) => (
        <div
          key={index}
          className="flex gap-3 sm:gap-4 rounded-3xl border border-slate-800/80 bg-slate-950 p-3.5 shadow-sm sm:p-5"
        >
          <SkBlock w="80px" h="80px" rounded="16px" dark className="flex-shrink-0 sm:w-24 sm:h-24" />
          <div className="flex-1 space-y-3 pt-1">
            <SkBlock w="75%" h="16px" dark />
            <SkBlock w="50%" h="12px" dark />
            <SkBlock w="96px" h="32px" rounded="12px" dark />
          </div>
          <div className="flex w-16 flex-shrink-0 flex-col items-end space-y-2 pt-1">
            <SkBlock w="56px" h="18px" dark />
          </div>
        </div>
      ))}
    </div>
  );
}
