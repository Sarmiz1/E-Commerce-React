import { motion } from "framer-motion";

const ProductsSection = ({
  productsRef,
  trendingProducts,
  renderStars,
  formatMoneyCents,
  addToCart,
  navigate
}) => {
  return (
    <section id="products" ref={productsRef} className="py-20 max-w-7xl mx-auto px-6">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Curated For You</p>
      <h3 className="text-4xl font-black text-center mb-16 text-gray-900">Trending Right Now</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {trendingProducts.map((item) => (
          <motion.div whileHover={{ y: -12, boxShadow: "0 32px 64px rgba(79,70,229,0.15)" }} key={item.id} className="se-pc group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="relative overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600 px-2.5 py-1 rounded-full shadow-sm">New</div>
            </div>
            <div className="p-6">
              <h4 className="font-bold text-gray-900 mb-2">{item.name}</h4>
              {renderStars(item.rating?.stars || 0)}
              <div className="flex items-center justify-between mt-4">
                <p className="font-black text-2xl text-gray-900">{formatMoneyCents(item.priceCents)}</p>
                <motion.button whileTap={{ scale: 0.93 }} onClick={(e) => addToCart(item, e)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-indigo-500/40 hover:shadow-lg transition-all duration-200">+ Cart</motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-14">
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/products")} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30">View All Products →</motion.button>
      </div>
    </section>
  )
}

export default ProductsSection
