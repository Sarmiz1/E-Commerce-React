import ProductCard from "../../../Components/Ui/ProductCard";

export function RecommendedRow({ products = [], isRefreshing = false }) {
  const visibleProducts = products.filter(Boolean).slice(0, 5);
  if (!visibleProducts.length) return null;

  return (
    <section className="min-h-[330px]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">You Might Have Forgotten</h2>
          <p className="text-gray-400 dark:text-neutral-500 text-sm">Frequently bought together with items in your cart.</p>
        </div>

        {isRefreshing && (
          <span
            aria-label="Updating recommendations"
            className="mt-1 h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-indigo-500"
          />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {visibleProducts.map((p) => (
          <ProductCard product={p} key={p.id} variant="compact" />
        ))}
      </div>
    </section>
  );
}
