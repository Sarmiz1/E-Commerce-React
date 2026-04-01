// src/pages/ProductDetailPage.jsx
import { useParams, useLoaderData } from "react-router-dom";
import ProductCard from "../../Components/Ui/ProductCard";
import { ratingCount } from "../../Utils/ratingsCount";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";


export default function ProductDetail() {
  const { productId } = useParams();

  // Products Data
  const products = useLoaderData();
  console.log("Products", products)

  // Product
  const product = products.find(
    (p) => p.id === productId
  );

  if (!product) {
    return (
      <h1 className="text-2xl h-screen flex items-center justify-center">
        Product does not exist
      </h1>
    );
  }

  // Similar products
  const similarProducts = products.filter(
    (p) =>
      p.id !== product.id &&
      p.keywords.some((keyword) =>
        product.keywords.includes(keyword)
      )
  );



  return (
    <div className="bg-gray-50 text-gray-800">
      {/* PRODUCT HERO */}
      <section className="max-w-6xl mx-auto py-20 px-6 md:flex md:gap-12">
        <div className="md:w-1/2 animate-fadeInProduct">
          <img
            src={product?.image}
            alt={product?.name}
            className="rounded-2xl shadow-lg w-full object-cover"
          />
          {/* Optional thumbnails could go here */}
        </div>

        <div className="md:w-1/2 mt-8 md:mt-0 animate-fadeInProduct">
          <h1 className="text-4xl font-bold">{product?.name}</h1>

          {/* Product Ratings */}
          {product?.rating &&
            <div className=" flex items-center mb-[10px]">
              <img
                className=" w-24 mr-[6px]"
                data-testid='product-stars-image'
                src={`images/ratings/rating-${ratingCount(product?.rating?.stars)}.png`}
              />
              <div className=" link-primary text-greenPry cursor-auto mt-[3px] hover:opacity-75 active:opacity-50">
                {product?.rating?.count}
              </div>
            </div>
          }

          {/* Product Price */}
          <p className="text-2xl font-semibold mt-4">{formatMoneyCents(product?.priceCents)}</p>

          <p className="mt-6 text-gray-600">{product?.description}</p>

          <button className="mt-8 mb-5 bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-800 transition font-semibold">
            Add to Cart
          </button>

          {/* Product Description */}
          <article className="flex flex-col gap-4">
            <h3 className="text-2xl font-bold mt-5">Description</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </article>
        </div>
      </section>

      {/* SIMILAR PRODUCTS */}
      {product && similarProducts.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center animate-fadeInFeature">
            You May Also Like
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}