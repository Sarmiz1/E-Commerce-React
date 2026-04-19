// Bento Card
import { motion } from "framer-motion";
import { formatMoneyCents } from "../../../../../Utils/formatMoneyCents";
import AddToCart from "../../../../../Components/Ui/AddToCart";

export const BentoCard = ({ product, className = '' }) => {
    if (!product) return <div className={`${className} bg-gray-100 rounded-3xl`} />;
    
    return (
      <motion.div
        data-cart-card
        whileHover={{ scale: 1.02 }}
        className={`hp-bento-cell relative group overflow-hidden rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 ${className}`}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600 px-2 py-1 rounded-full">New</div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <p className="font-bold text-sm line-clamp-1 mb-1">{product.name}</p>
          <div className="flex items-center justify-between">
            <p className="font-black text-lg">{formatMoneyCents(product.price_cents)}</p>
            <AddToCart productId={product.id} variant="ghost" />
          </div>
        </div>
      </motion.div>
    );
  };