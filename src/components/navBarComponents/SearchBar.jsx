import { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = forwardRef((props, ref) => {
  const [inptValue, setInputValue] = useState("");

  const navigateToHomePage = useNavigate();

  const handleSearchBar = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmitSearch = () => {
    navigateToHomePage("/?search=${search}");
  };

  return (
    <div
      className="flex-1  mx-8
      flex w-[850px]"
    >
      <input
        onChange={handleSearchBar}
        value={inptValue}
        ref={ref}
        className="flex text-base pl-
        [15px] px-4 rounded-s-md w-full
        border-none font-roboto outline-none dark:bg-slate-100 dark:text-black"
        type="text"
        placeholder="Search"
      />

      <button
        onClick={handleSubmitSearch}
        className="bg-limeGreen border-none w-11 h-10 cursor-pointer 
        border-tr-[5px] border-br-[5px] shrink-0 text-[14px] rounded-e-md"
      >
        <img
          className="search-icon h-5 ml-3"
          src="images/icons/search-icon.png"
        />
      </button>
    </div>
  );
});

export default SearchBar;
