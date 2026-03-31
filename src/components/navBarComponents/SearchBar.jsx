// src/components/NavBarComponents/SearchBar.jsx
import { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = forwardRef((props, ref) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter") submitSearch();
    setInputValue(e.target.value);

    // Mock suggestions for luxury feel
    if (e.target.value.length > 1) {
      setSuggestions([
        `${e.target.value} Bag`,
        `${e.target.value} Watch`,
        `${e.target.value} Sneakers`,
      ]);
    } else setSuggestions([]);
  };

  const submitSearch = () => {
    if (inputValue) navigate(`/products?search=${inputValue}`);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <div className="flex w-full">
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={handleSearch}
          onKeyDown={handleSearch}
          placeholder="Search premium products..."
          className="flex-1 px-4 py-2 rounded-l-full border border-gray-300 outline-none focus:ring-2 focus:ring-lime-500 text-gray-800 dark:bg-white dark:text-black"
        />
        <button
          onClick={submitSearch}
          className="bg-limeGreen px-4 py-2 rounded-r-full text-white font-semibold hover:bg-lime-600 transition"
        >
          🔍
        </button>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white rounded-xl shadow-lg mt-1 overflow-hidden z-50">
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setInputValue(s);
                submitSearch();
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default SearchBar;