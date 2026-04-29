export function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 flex gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-8 bg-gray-100 rounded-xl w-24 mt-2" />
          </div>
          <div className="w-16 space-y-2 items-end flex flex-col pt-1">
            <div className="h-5 bg-gray-200 rounded w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
