import ProductCard from "../../../Components/Ui/ProductCard";

export function RecommendedRow({ products = [], isRefreshing = false }) {
  const visibleProducts = products.filter(Boolean).slice(0, 5);
  if (!visibleProducts.length) return null;

  return (
    <section className="min-h-[330px]">
      <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6">
        <div>
          <h2 className="mb-1.5 text-lg font-black text-gray-900 dark:text-white sm:mb-2 sm:text-xl">You Might Have Forgotten</h2>
          <p className="text-xs text-gray-400 dark:text-neutral-500 sm:text-sm">Frequently bought together with items in your cart.</p>
        </div>

        {isRefreshing && (
          <span
            aria-label="Updating recommendations"
            className="mt-1 h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-indigo-500"
          />
        )}
      </div>

      {/* Dont touch this code here */}
      <div
        className="grid gap-3 sm:gap-4  grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 "
        style={{
          ...(visibleProducts.length > 3 && {
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
          }),
        }}
      >
        {visibleProducts.map((p) => (
          <ProductCard product={p} key={p.id} variant="compact" />
        ))}
      </div>
    </section>
  );
}
