import { motion } from "framer-motion";
import { SavedForLater } from "./SavedForLater";

export function EmptyCart({ savedItems, onMoveToCart, navigate }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center">
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, -4, 4, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="text-8xl mb-6"
      >
        🛒
      </motion.div>
      <h2 className="text-3xl font-black text-gray-900 mb-3">Your cart is empty</h2>
      <p className="text-gray-400 text-base mb-8 max-w-sm leading-relaxed">
        Looks like you haven't added anything yet. Let's fix that.
      </p>
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/products")}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-10 py-4 rounded-2xl shadow-lg shadow-indigo-500/25 text-base">
        Browse Products →
      </motion.button>
      {savedItems.length > 0 && (
        <div className="mt-16 w-full max-w-2xl mx-auto">
          <p className="text-gray-400 text-sm mb-6">You have <span className="font-bold text-gray-700">{savedItems.length}</span> item{savedItems.length !== 1 ? "s" : ""} saved for later.</p>
          <SavedForLater items={savedItems} onMoveToCart={onMoveToCart} />
        </div>
      )}
    </motion.div>
  );
}
