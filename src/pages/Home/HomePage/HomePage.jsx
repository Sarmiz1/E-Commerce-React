
import { useFetchData } from "../../../Hooks/useFetch";
import useShowErrorBoundary from "../../../Hooks/useShowErrorBoundary";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useMemo } from "react";


export default function HomePage() {

  const url = "/api/products";
  const { fetchedData, isLoading, error } = useFetchData(url);

  useShowErrorBoundary(error);

  const products = useMemo(() => fetchedData || [], [fetchedData]);


  const trendingProducts = products.slice(0, 3);
  const bestSellers = products.slice(1, 4);
  const categories = ["Bags", "Watches", "Scarves", "Sunglasses"];

  if (isLoading) {
  return (
    <div className="h-screen flex justify-center items-center">
      Loading...
    </div>
  );
}

  return (
    <div className="space-y-20 -mt-1 mb-4">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-b-3xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-6 animate-fadeInHero">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-wide">
              Discover Premium Luxury
            </h1>
            <p className="text-lg lg:text-xl text-gray-300">
              Curated collection of designer products just for you.
            </p>
            <button className="bg-limeGreen text-white px-6 py-3 rounded-full font-semibold hover:bg-lime-600 transition">
              Shop Now
            </button>
          </div>
          <img
            src="/images/hero/hero-product.png"
            alt="Hero Product"
            className="w-full max-w-md animate-fadeInFeature"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl flex items-center justify-center font-semibold hover:scale-105 transition"
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Trending Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {trendingProducts.map((prod) => (
            <div
              key={prod?.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-xl transition"
            >
              <img
                src={prod?.image}
                alt={prod?.name}
                className="rounded-xl w-full h-48 object-cover mb-4"
              />
              <h3 className="font-semibold text-lg">{prod?.name}</h3>
              <p className="text-limeGreen font-bold flex items-end ">{formatMoneyCents(prod?.priceCents)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Best Sellers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {bestSellers.map((prod) => (
            <div
              key={prod?.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-xl transition"
            >
              <img
                src={prod?.image}
                alt={prod?.name}
                className="rounded-xl w-full h-48 object-cover mb-4"
              />
              <h3 className="font-semibold text-lg">{prod?.name}</h3>
              <div className="text-limeGreen font-bold">{formatMoneyCents(prod?.priceCents)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collection / Brands */}
      <section className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Featured Collections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 flex items-center justify-center font-semibold hover:scale-105 transition"
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter / Call-to-Action */}
      <section className="bg-gray-900 text-white rounded-3xl py-16 px-6 text-center max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-4">
          Join Our Exclusive Newsletter
        </h2>
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