import { motion } from "framer-motion";
import { FILTER_OPTIONS, SORT_OPTIONS } from "../Utils/ordersConstants";
import { Icons } from "./OrderIcons";

export default function FilterToolbar({
  search,
  onSearch,
  status,
  onStatus,
  sort,
  onSort,
}) {
  return (
    <div className="space-y-4 mb-8">
      <div className="relative">
        <Icons.Search c="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search by order number or product name..."
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#0D1421] border border-gray-200 dark:border-white dark:border-[#0D1421]/10 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition placeholder-gray-400 shadow-sm"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearch("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 transition"
          >
            <Icons.Close c="w-4 h-4" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 no-scrollbar">
          {FILTER_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onStatus(option.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all duration-200 border ${
                status === option.value
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-500/25"
                  : "bg-white dark:bg-[#0D1421] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white dark:border-[#0D1421]/10 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>

        <div className="relative flex-shrink-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icons.Sort c="w-3.5 h-3.5" />
          </div>
          <select
            value={sort}
            onChange={(event) => onSort(event.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white dark:bg-[#0D1421] border border-gray-200 dark:border-white dark:border-[#0D1421]/10 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-indigo-400 transition appearance-none shadow-sm cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icons.Chev
            dir="down"
            c="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
