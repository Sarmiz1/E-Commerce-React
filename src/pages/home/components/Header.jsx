function Header() {

  return (
    <div className="bg-darkGreen text-white px-[15px] flex items-center 
        justify-between fixed top-0 left-0 right-0 h-[60px]">
      <div className="w-52 md:w-auto">
        <a 
          href="index.html" 
          className="inline-block py-[6px] px-[9.5px]
          cursor-pointer rounded-sm no-underline border border-solid 
          border-[rgba(0, 0, 0, 0)] hover:border hover:border-solid
          hover:border-white"
        >
          <img className="h-[26px] mt-[1px] sm:hidden"
            src="images/logo-white.png" />
          <img className="hidden sm:block h-[26px] mt-[1px]"
            src="images/mobile-logo-white.png" />
        </a>
      </div>

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

      <div className="w-[180px] shrink-0 flex justify-end">
        <a 
          className="text-white flex items-center px-[13px]
          py-[6px] border-[2px] cursor-pointer decoration-none border-solid
          border-[rgba(0, 0, 0, 0)]" 
          href="orders.html">

          <span className="orders-text block text-base font-bold">Orders</span>
        </a>

        <a 
          className="text-white flex items-center relative
          py-[6px] px-[9.5px] border-[2px] cursor-pointer decoration-none border-[rgba(0, 0, 0, 0)]" 
          href="checkout.html">
          <img className="w-9" src="images/icons/cart-icon.png" />
          <div className="text-darkGreen text-[14px] font-bold absolute top-2 ,
          right-[46px] w-[26px] text-center">3</div>
          <div className="ml-[5px] text-base font-bold">Cart</div>
        </a>
      </div>
    </div>
  )
}

export default Header