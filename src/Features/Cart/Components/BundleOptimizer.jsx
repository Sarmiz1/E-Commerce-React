import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ic, Spinner } from "./CartConstants";
import { formatMoneyMinor } from "../../../utils/formatMoneyMinor";

export function BundleOptimizer({ cartItems, recommendations, onAddItem }) {
  const [isAdding, setIsAdding] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const bundleSuggestion = useMemo(() => {
    if (!recommendations || recommendations.length === 0 || cartItems.length === 0) return null;

    return [...recommendations].sort(
      (a, b) => b.recommendation_score - a.recommendation_score,
    )[0];
  }, [recommendations, cartItems]);

  if (!bundleSuggestion || dismissed) return null;

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAddItem(bundleSuggestion.id, null, 1);
      setDismissed(true); // Hide after adding
    } catch (e) {
      console.error("Failed to add bundle item", e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
          className="bg-indigo-50/70 dark:bg-indigo-900/15 border border-indigo-100 dark:border-indigo-800/50 rounded-3xl p-4 sm:p-5 shadow-sm overflow-hidden relative"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 relative z-10">
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Ic.Sparkles c="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="flex flex-wrap items-center gap-1.5 text-sm font-black text-gray-900 dark:text-white sm:gap-2">
                  Bundle Match Found
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] uppercase tracking-widest rounded-full font-bold">
                    Smart
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  Frequently bought with your items.
                </p>
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white p-2 dark:bg-neutral-800/50 sm:gap-4 sm:p-2.5">
              <img 
                src={bundleSuggestion.image} 
                alt={bundleSuggestion.name} 
                className="w-12 h-12 rounded-xl object-cover"
                onError={(e) => { e.target.src = "https://placehold.co/100?text=No+Image" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {bundleSuggestion.name}
                </p>
                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {formatMoneyMinor(bundleSuggestion.price_minor)}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                disabled={isAdding}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                {isAdding ? <Spinner c="w-4 h-4 mx-auto" /> : "Add to Bundle"}
              </motion.button>
            </div>
            
            <button 
              type="button"
              onClick={() => setDismissed(true)}
              className="absolute -top-2 -right-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors hidden sm:block"
            >
              <Ic.Close c="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
