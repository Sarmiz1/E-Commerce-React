import React from 'react'

const Search_Input = ({ 
  handleSearch, 
  searchRef, 
  searchQuery, 
  setSearchQuery,
  SearchIcon,
  CloseIcon
}) => {
  return (
    <form onSubmit={handleSearch} className="flex items-center px-5 py-4 gap-3 border-b border-gray-100">
      <SearchIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <input ref={searchRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search products, brands, categories…"
        className="nb-search-input flex-1 text-gray-900 text-[15px] placeholder-gray-400 bg-transparent font-medium" />
      {searchQuery && (
        <button type="button" onClick={() => setSearchQuery("")}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition flex-shrink-0">
          <CloseIcon className="w-3 h-3 text-gray-400" />
        </button>
      )}
      <button type="submit"
        className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm px-5 py-2 rounded-2xl shadow-md shadow-indigo-500/20">
        Search
      </button>
    </form>
  )
}

export default Search_Input
