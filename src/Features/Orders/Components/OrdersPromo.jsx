import { motion } from "framer-motion";
import FloatingOrbs from "./FloatingOrbs";

export default function OrdersPromo({ onShop }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mt-14 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 md:p-12 text-white text-center"
    >
      <FloatingOrbs />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative z-10">
        <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.3em] mb-3">
          More to Explore
        </p>
        <h2 className="text-3xl font-black mb-4">Ready to Shop Again?</h2>
        <p className="text-indigo-100 text-sm mb-8 max-w-md mx-auto">
          New arrivals added daily. Free shipping on orders over $50.
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onShop}
          className="bg-white dark:bg-[#0D1421] text-indigo-700 font-black px-10 py-4 rounded-2xl text-sm shadow-2xl hover:shadow-white/20 transition"
        >
          Browse All Products
        </motion.button>
      </div>
    </motion.div>
  );
}
