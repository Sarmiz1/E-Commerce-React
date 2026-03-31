import { useState, useMemo, useEffect } from "react";
import { useFetchData } from "../../Hooks/useFetch";
import { useSearchParams } from "react-router-dom";
import ProductsContainer from "./Components/ProuductsContainer";
import useShowErrorBoundary from "../../Hooks/useShowErrorBoundary";
import { TiShoppingCart } from "react-icons/ti";

// --- Mock Categories ---
const categoriesList = [
  "Electronics",
  "Kitchen",
  "Fashion",
  "Beauty",
  "Sports",
  "Toys",
];

// --- Mock Black Friday Section ---
// For demo, just take first 3 products
const blackFridayProducts = (products) => products.slice(0, 3);




export default function ProductsPage() {


  // --- Search & fetch ---
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");
  const url = search ? `/api/products?search=${search}` : "/api/products";
  const { fetchedData, isLoading, error } = useFetchData(url);

  useShowErrorBoundary(error);

  const products = useMemo(() => fetchedData || [], [fetchedData]);

  // State to delay "No products" message
  const [showNoProducts, setShowNoProducts] = useState(false);

  useEffect(() => {
    let timer;
    if (!isLoading && (!products || products.length === 0)) {
      // wait 3 seconds before showing the message
      timer = setTimeout(() => setShowNoProducts(true), 3000);
    } else {
      setShowNoProducts(false); // reset if products appear
    }

    return () => clearTimeout(timer);
  }, [isLoading, products]);


  // --- State for filtering ---
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    if (selectedCategory === "All") return products;

    return products.filter((p) =>
      Array.isArray(p.keywords) &&
      p.keywords.includes(selectedCategory.toLowerCase())
    );
  }, [products, selectedCategory]);


  

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Loading products...
      </div>
    );
  }

  if ((!products || products.length === 0) && showNoProducts) {
    return (
      <h1 className="text-center mt-20 text-2xl">
        No products available
      </h1>
    );
  }


  return (
    <div className="mt-[61px] max-w-7xl mx-auto px-4 space-y-20 mb-4">

      {/* --- Categories Filter --- */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Categories</h2>
        <div className="flex flex-wrap gap-4">
          <button
            className={`px-4 py-2 rounded-full font-semibold transition ${selectedCategory === "All"
                ? "bg-limeGreen text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          {categoriesList.map((cat, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-full font-semibold transition ${selectedCategory === cat
                  ? "bg-limeGreen text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* --- Black Friday Deals Section --- */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Black Friday Deals</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:grid-cols-5">
          <ProductsContainer products={blackFridayProducts(filteredProducts)} />
        </div>
      </section>

      {/* --- Best Selling Products Section --- */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Best Sellers</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:grid-cols-5">
          <ProductsContainer products={filteredProducts.slice(0, 8)} />
        </div>
      </section>

      {/* --- All Products Section --- */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">
          {selectedCategory === "All" ? "All Products" : selectedCategory}
        </h2>
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          <ProductsContainer products={filteredProducts} />
        </div>
      </section>

      {/* --- Newsletter / Call-to-Action --- */}
      <section className="bg-gray-900 text-white rounded-3xl py-16 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">Join Our Exclusive Newsletter</h2>
        <p className="text-gray-300 mb-6">
          Get early access to new products, special offers, and premium collections.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="p-3 rounded-full flex-1 outline-none text-black"
          />
          <button className="bg-limeGreen px-6 py-3 rounded-full font-semibold hover:bg-lime-600 transition">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
}