function SearchBar() {

  return (
    <div className="flex-1 max-w-[850px] mx-[10px] 
            flex"
      >
      <input className="flex flex-1 w-0 text-base pl-[15px]
        border-none border-tl-[5px] border-bl-[5px] border-tr-[0] border-br-[0]
        font-roboto focus:outline-2 focus:outline focus:outline-[rgb(25, 135, 84)]" 
        type="text" 
        placeholder="Search" />

      <button className="bg-limeGreen border-none w-11 h-10 cursor-pointer 
        border-tr-[5px] border-br-[5px] shrink-0 text-[14px]">
        <img 
          className="search-icon h-5 ml-0 mt-1" 
          src="images/icons/search-icon.png" />
      </button>
    </div>
  )
}

export default SearchBar