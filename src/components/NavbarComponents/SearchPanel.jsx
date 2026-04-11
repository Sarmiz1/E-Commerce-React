import { motion, AnimatePresence } from "framer-motion";
import Search_Input from "./SearchPanelComponents/Search_Input";
import Suggestions_Section from "./SearchPanelComponents/Suggestions_Section";


const SearchPanel = ({
  searchOpen,
  setSearchOpen,
  navigate,
  SearchIcon,
  CloseIcon,
  ArrowRight,
  searchQuery,
  setSearchQuery,
  suggestions,
  searchRef,
  handleSearch
}) => {
  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-[98] bg-black/35" style={{ backdropFilter: "blur(4px)" }} />

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            className="fixed z-[99] left-0 right-0 flex justify-center px-4"
            style={{ top: 76 }}
          >
            <div className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-gray-100"
              style={{ background: "rgba(255,255,255,0.99)", backdropFilter: "blur(32px)" }}>

              {/* Search input */}
              <Search_Input
                handleSearch={handleSearch}
                searchRef={searchRef}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                SearchIcon={SearchIcon}
                CloseIcon={CloseIcon}
              />

              {/* Suggestions */}
              <Suggestions_Section
                searchQuery={searchQuery}
                suggestions={suggestions}
                setSearchQuery={setSearchQuery}
                searchRef={searchRef}
                SearchIcon={SearchIcon}
                ArrowRight={ArrowRight}
                navigate={navigate}
                setSearchOpen={setSearchOpen}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SearchPanel
