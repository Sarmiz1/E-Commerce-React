import { AnimatePresence, motion as Motion } from "framer-motion";
import { ArrowRight, CloseIcon, SearchIcon } from "./Icons";

export function SearchPanel({
  open,
  searchRef,
  resultsRef,
  query,
  results,
  loading,
  error,
  focusedIdx,
  recentSearches,
  popularSearches,
  categories,
  onClose,
  onSubmit,
  onQueryChange,
  onKeyDown,
  onCommitSearch,
  onClearRecent,
  onRemoveRecent,
  onNavigate,
  formatMoney,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[98] bg-black/40"
            style={{ backdropFilter: "blur(6px)" }}
          />

          <Motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            className="fixed z-[99] left-0 right-0 flex justify-center px-3 sm:px-4"
            style={{ top: 76 }}
          >
            <div
              className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl shadow-black/25 border border-gray-100/80"
              style={{ background: "rgba(255,255,255,0.99)", backdropFilter: "blur(40px)", maxHeight: "calc(100vh - 100px)" }}
            >
              <form onSubmit={onSubmit} className="flex items-center px-4 sm:px-5 py-4 gap-3 border-b border-gray-100">
                <div className="flex-shrink-0 w-5 h-5">
                  {loading ? (
                    <svg className="w-5 h-5 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search products, brands, categories..."
                  className="nb-search-input flex-1 text-gray-900 text-[15px] placeholder-gray-400 bg-transparent font-medium min-w-0"
                  autoComplete="off"
                  spellCheck="false"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      onQueryChange("");
                      searchRef.current?.focus();
                    }}
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <CloseIcon className="w-3 h-3 text-gray-500" />
                  </button>
                )}

                <Motion.button
                  type="submit"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm px-4 sm:px-5 py-2.5 rounded-2xl shadow-md shadow-indigo-500/25 transition-all"
                >
                  Search
                </Motion.button>
              </form>

              <div ref={resultsRef} className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 190px)" }}>
                {query.trim() ? (
                  <SearchResults
                    query={query}
                    results={results}
                    loading={loading}
                    error={error}
                    focusedIdx={focusedIdx}
                    popularSearches={popularSearches}
                    onQueryChange={onQueryChange}
                    onCommitSearch={onCommitSearch}
                    onNavigate={onNavigate}
                    formatMoney={formatMoney}
                  />
                ) : (
                  <SearchSuggestions
                    recentSearches={recentSearches}
                    popularSearches={popularSearches}
                    categories={categories}
                    onQueryChange={onQueryChange}
                    onClearRecent={onClearRecent}
                    onRemoveRecent={onRemoveRecent}
                    onNavigate={onNavigate}
                  />
                )}
              </div>
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SearchResults({ query, results, loading, error, focusedIdx, popularSearches, onQueryChange, onCommitSearch, onNavigate, formatMoney }) {
  return (
    <div className="px-4 sm:px-5 py-4">
      <AnimatePresence mode="wait">
        {loading && (
          <Motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={`search-skeleton-${i}`} className="flex items-center gap-3 px-3 py-2 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-14" />
                </div>
              ))}
          </Motion.div>
        )}

        {!loading && error && (
          <Motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-8 text-center">
            <div className="text-4xl mb-3">!</div>
            <p className="font-bold text-gray-700 text-sm">Search unavailable</p>
            <p className="text-gray-400 text-xs mt-1">Check your connection and try again.</p>
            <button onClick={() => onQueryChange(`${query} `)} className="mt-4 text-indigo-600 text-xs font-bold hover:underline">
              Retry
            </button>
          </Motion.div>
        )}

        {!loading && !error && results.length === 0 && (
          <Motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-8 text-center">
            <div className="text-5xl mb-3">?</div>
            <p className="font-black text-gray-800 text-base">
              No results for <span className="text-indigo-600">"{query}"</span>
            </p>
            <p className="text-gray-400 text-xs mt-1 max-w-xs">Try a shorter keyword, check spelling, or browse a category below.</p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {popularSearches.slice(0, 4).map((search, i) => (
                <button
                  key={search || i}
                  onClick={() => onQueryChange(search)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </Motion.div>
        )}

        {!loading && !error && results.length > 0 && (
          <Motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              <button onClick={() => onCommitSearch(query)} className="text-[10px] text-indigo-500 font-bold hover:text-indigo-700 transition-colors">
                See all
              </button>
            </div>
            <div className="space-y-1">
              {results.map((product, i) => (
                <Motion.button
                  key={product?.id || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.035 }}
                  onClick={() => onNavigate(`/products/${product.slug || product.id}`)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 group text-left ${
                    focusedIdx === i ? "bg-indigo-50 ring-2 ring-inset ring-indigo-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">[]</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">{product.name}</p>
                    {product.keywords?.length > 0 && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{product.keywords.slice(0, 3).join(" - ")}</p>}
                  </div>

                  <p className="font-black text-gray-900 text-sm flex-shrink-0">{formatMoney(product.priceCents)}</p>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100" />
                </Motion.button>
              ))}
            </div>

            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCommitSearch(query)}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md shadow-indigo-500/20"
            >
              View all results for "{query}"
              <ArrowRight className="w-4 h-4" />
            </Motion.button>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchSuggestions({ recentSearches, popularSearches, categories, onQueryChange, onClearRecent, onRemoveRecent, onNavigate }) {
  return (
    <div className="px-4 sm:px-5 py-4 space-y-5">
      {recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recent</p>
            <button onClick={onClearRecent} className="text-[10px] text-gray-400 hover:text-red-500 font-bold transition-colors">
              Clear all
            </button>
          </div>
          <div className="space-y-0.5">
            {recentSearches.slice(0, 5).map((term, i) => (
              <div key={term || i} className="flex items-center gap-2 group">
                <Motion.button whileHover={{ x: 2 }} onClick={() => onQueryChange(term)} className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <SearchIcon className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  <span className="text-sm text-gray-700 font-medium">{term}</span>
                </Motion.button>
                <button onClick={() => onRemoveRecent(term)} className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all text-gray-400">
                  <CloseIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">{recentSearches.length > 0 ? "Trending" : "Popular Searches"}</p>
        <div className="space-y-0.5">
          {popularSearches.slice(0, recentSearches.length > 0 ? 4 : 6).map((search, i) => (
            <Motion.button
              key={search || i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onQueryChange(search)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition-all duration-150 group text-left"
            >
              <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <SearchIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              </span>
              <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium flex-1">{search}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
            </Motion.button>
          ))}
        </div>
      </div>

      <div className="pb-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Browse Categories</p>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => (
            <Motion.button
              key={cat.label}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(`/products?search=${cat.query}`)}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 border border-gray-100 transition-all group"
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-[10px] font-bold text-gray-600 group-hover:text-indigo-700 transition-colors">{cat.label}</span>
            </Motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
