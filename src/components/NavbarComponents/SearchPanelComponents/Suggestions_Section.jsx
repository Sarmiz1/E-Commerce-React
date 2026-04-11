import { motion, AnimatePresence } from "framer-motion";


const Suggestions_Section = ({
  searchQuery,
  suggestions,
  setSearchQuery,
  searchRef,
  SearchIcon,
  ArrowRight,
  navigate, 
  setSearchOpen
}) => {

  const categories = ["👜 Bags", "⌚ Watches", "🧣 Scarves", "🕶️ Sunglasses", "👠 Shoes", "🧴 Perfumes", "🏀 Sports", "📱 Tech"]

  return (
    <div className="px-5 py-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
        {searchQuery ? "Suggestions" : "Popular Searches"}
      </p>
      <AnimatePresence mode="wait">
        <motion.div key={searchQuery} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="space-y-0.5">
          {suggestions.map((s, i) => (
            <motion.button key={s} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => { setSearchQuery(s); searchRef.current?.focus(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition-all duration-150 group text-left">
              <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <SearchIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500" />
              </span>
              <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium flex-1">{s}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      {!searchQuery && (
        <div className="mt-4 pt-4 border-t border-gray-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Browse Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => { navigate("/products"); setSearchOpen(false); }}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-600 text-xs font-semibold transition-all duration-150">
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Suggestions_Section
