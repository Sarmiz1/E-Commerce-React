export function CartSkeleton({ count = 2 }) {
  // If count is 0, default to 2 for the initial skeleton
  const skeletonCount = count > 0 ? count : 2;
  
  return (
    <div className="animate-pulse space-y-4">
      {Array(skeletonCount).fill(0).map((_, i) => (
        <div key={i} className="bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-neutral-800 flex gap-4 transition-colors duration-300">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-neutral-800 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded-md w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded-md w-1/2" />
            <div className="h-8 bg-gray-100 dark:bg-neutral-800 rounded-xl w-24 mt-2" />
          </div>
          <div className="w-16 space-y-2 items-end flex flex-col pt-1 flex-shrink-0">
            <div className="h-5 bg-gray-200 dark:bg-neutral-700 rounded w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
