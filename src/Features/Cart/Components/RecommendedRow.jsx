import ProductCard from "../../../Components/Ui/ProductCard";

export function RecommendedRow({ products, onAddToCart, cartProductIds }) {
  if (!products.length) return null;
  const filtered = products.filter((p) => !cartProductIds.has(String(p.id))).slice(0, 5);
  if (!filtered.length) return null;

  return (
    <section>
      <h2 className="text-xl font-black text-gray-900 mb-2">You Might Have Forgotten</h2>
      <p className="text-gray-400 text-sm mb-6">Frequently bought together with items in your cart.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {filtered.map((p) => (
          <ProductCard product={p} key={p.id} variant="compact" />
        ))}
      </div>
    </section>
  );
}
