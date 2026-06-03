import { motion } from "framer-motion";
import { SavedForLater } from "./SavedForLater";
import { Ic } from "./CartConstants";

export function EmptyCart({ savedItems, onMoveToCart, isMovingItem, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center px-2 py-14 text-center sm:py-20"
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, -4, 4, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20 sm:mb-6 sm:h-24 sm:w-24"
      >
        <Ic.Bag c="h-10 w-10 sm:h-12 sm:w-12" />
      </motion.div>
      <h2 className="mb-3 text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">Your cart is empty</h2>
      <p className="mb-7 max-w-sm text-sm leading-relaxed text-gray-400 dark:text-neutral-500 sm:mb-8 sm:text-base">
        Looks like you haven't added anything yet. Let's fix that.
      </p>
      <motion.button
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/products")}
        className="rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-black text-white shadow-md shadow-indigo-500/15 transition-colors hover:bg-indigo-700 sm:px-10 sm:py-4 sm:text-base"
      >
        Browse Products
      </motion.button>
      {savedItems.length > 0 ? (
        <div className="mx-auto mt-12 w-full max-w-2xl sm:mt-16">
          <p className="text-gray-400 dark:text-neutral-500 text-sm mb-6">
            You have <span className="font-bold text-gray-700 dark:text-neutral-300">{savedItems.length}</span>{" "}
            item{savedItems.length !== 1 ? "s" : ""} saved for later.
          </p>
          <SavedForLater items={savedItems} onMoveToCart={onMoveToCart} isMovingItem={isMovingItem} />
        </div>
      ) : null}
    </motion.div>
  );
}
