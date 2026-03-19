import { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = forwardRef((props, ref) => {
  const [inputValue, setInputValue] = useState("");
  const navigateToHomePage = useNavigate();

  const handleSearchBar = (e) => {
    if (e.key === "Enter") {
      handleSubmitSearch();
    }
    setInputValue(e.target.value);
  };

  const handleSubmitSearch = () => {
    if (inputValue) navigateToHomePage(`/?search=${inputValue}`);
  };

  return (
    <div className="flex w-full max-w-xl mx-auto">
      {/* INPUT */}
      <input
        ref={ref}
        value={inputValue}
        onChange={handleSearchBar}
        onKeyDown={handleSearchBar}
        type="text"
        placeholder="Search"
        className="flex-1 text-base px-4 pl-4 py-2 rounded-l-md w-full
          border border-gray-300 font-roboto outline-none
          dark:bg-slate-100 dark:text-black"
      />

      {/* BUTTON */}
      <button
        onClick={handleSubmitSearch}
        className="flex items-center justify-center bg-limeGreen
          rounded-r-md px-3 py-2 h-11 border border-l-0 cursor-pointer"
      >
        <img
          src="images/icons/search-icon.png"
          alt="search"
          className="h-5 w-5"
        />
      </button>
    </div>
  );
});

export default SearchBar;