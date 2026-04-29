export default function OrderSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-200" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-36" />
          </div>
          <div className="h-7 bg-gray-200 rounded-full w-24" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="w-10 h-10 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <div className="space-y-1.5">
            <div className="h-2 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-28" />
          </div>
          <div className="space-y-1.5 items-end flex flex-col">
            <div className="h-2 bg-gray-100 rounded w-12" />
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
