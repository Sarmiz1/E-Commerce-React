import { memo, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProductDisplay from "./ProductsSectionComponents/ProductDisplay";
import { CartActionsContext } from "../../../../Context/cartContext";

const ProductsSection = memo(({ productsRef, trendingProducts, cartIconRef }) => {

  

  const navigate = useNavigate()

  const { loadCart } = useContext(CartActionsContext) || null



  console.log("ProductsSection render");

  return (
    <section id="products" ref={productsRef} className="py-20 max-w-7xl mx-auto px-6">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Curated For You</p>
      <h3 className="text-4xl font-black text-center mb-16 text-gray-900">Trending Right Now</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {trendingProducts.map((item) => (
          <ProductDisplay 
            key={item.id} 
            item={item} 
            cartIconRef={cartIconRef} 
            loadCart={loadCart} 
          />
        ))}
      </div>
      <div className="text-center mt-14">
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/products")} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30">View All Products →</motion.button>
      </div>
    </section>
  )
})

export default ProductsSection
