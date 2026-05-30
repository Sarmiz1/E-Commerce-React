import ProductCard from "../../Product/Components/ProductCard";

export default function CurationProductGrid({ onQuickView, products }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          onQuickView={onQuickView}
          product={product}
        />
      ))}
    </div>
  );
}
