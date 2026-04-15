// src/Pages/Products/Components/ProductsContainer.jsx
//
// Bug fixed: original passed setViewProduct to ProductCard but ProductCard
// never used it — removed the dead prop to keep things clean.
// ProductCard handles navigation via <Link> internally.

import { motion } from "framer-motion";
import ProductCard from "../../../Components/Ui/ProductCard";
import AddToCart from "./AddToCart";

// Skeleton card shown during loading
function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-md animate-pulse">
      <div className="bg-gray-200" style={{ aspectRatio: "4/3" }} />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="h-5 bg-gray-200 rounded-full w-1/3 mt-2" />
        <div className="h-10 bg-gray-100 rounded-2xl mt-3" />
      </div>
    </div>
  );
}

function ProductsContainer({ products = [], isLoading = false, skeletonCount = 8 }) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </>
    );
  }

  return (
    <>
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.5), ease: "power3.out" }}
          className="flex flex-col"
        >
          <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100/80 hover:shadow-xl hover:shadow-indigo-500/10 transition-shadow duration-300">
            {/* Card (handles navigation) */}
            <div className="flex-1">
              <ProductCard product={product} />
            </div>
            {/* Add to cart — outside the Link so clicks don't navigate */}
            <div className="px-4 pb-4">
              <AddToCart productId={product.id} />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

export default ProductsContainer;
