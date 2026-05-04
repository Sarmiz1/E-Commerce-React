import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Icon } from "./CheckoutIcons";

export function EmptyCart() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md py-24 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
        <Icon.Bag className="h-10 w-10" />
      </div>
      <h2 className="mb-4 text-3xl font-black text-gray-900 dark:text-gray-100">Your bag is empty</h2>
      <p className="mb-8 leading-relaxed text-gray-400 dark:text-gray-500">Looks like you have not added anything yet. Start browsing our products.</p>
      <motion.button
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/products")}
        className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-4 text-base font-black text-white shadow-lg shadow-indigo-500/30"
      >
        Browse Products
      </motion.button>
    </motion.div>
  );
}
