import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ic, Spinner } from "./CartConstants";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";

export function BundleOptimizer({ cartItems, recommendations, onAddItem }) {
  const [isAdding, setIsAdding] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Find the highest rated recommendation that is relatively cheap to act as an upsell
  const bundleSuggestion = useMemo(() => {
    if (!recommendations || recommendations.length === 0 || cartItems.length === 0) return null;
    
    // Sort by price ascending, but ensure rating is decent, to find an easy upsell (like a case, cable, or small accessory)
    const candidates = [...recommendations]
      .filter(p => p.price_cents < 5000) // Under $50
      .sort((a, b) => b.recommendation_score - a.recommendation_score);

    return candidates.length > 0 ? candidates[0] : recommendations[0];
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
          className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-3xl p-5 shadow-sm overflow-hidden relative"
        >
          {/* Background decoration */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-20 dark:opacity-30 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Ic.Sparkles c="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
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

            <div className="flex-1 flex items-center gap-4 bg-white dark:bg-neutral-800/50 p-2.5 rounded-2xl w-full">
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
                  {formatMoneyCents(bundleSuggestion.price_cents)}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                disabled={isAdding}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                {isAdding ? <Spinner c="w-4 h-4 mx-auto" /> : "Add to Bundle"}
              </motion.button>
            </div>
            
            <button 
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
