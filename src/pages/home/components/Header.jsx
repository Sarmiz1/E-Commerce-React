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
        <input className="search-bar " type="text" placeholder="Search" />

        <button className="search-button">
          <img className="search-icon" src="images/icons/search-icon.png" />
        </button>
      </div>

      <div className="right-section">
        <a className="orders-link header-link" href="orders.html">

          <span className="orders-text">Orders</span>
        </a>

        <a className="cart-link header-link" href="checkout.html">
          <img className="cart-icon" src="images/icons/cart-icon.png" />
          <div className="cart-quantity">3</div>
          <div className="cart-text">Cart</div>
        </a>
      </div>
    </div>
  )
}

export default Header