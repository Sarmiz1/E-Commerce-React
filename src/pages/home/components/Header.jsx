import Logo from "./headerComponents/Logo";
import SearchBar from "./headerComponents/SearchBar";
import Cart from "./headerComponents/Cart";
import OrdersSection from "./headerComponents/OrdersSection";
function Header() {

  return (
    <div className="bg-darkGreen text-white px-[15px] flex items-center 
        justify-between fixed top-0 left-0 right-0 h-[60px]">
      <Logo />
      <SearchBar />
      <div className="w-[180px] shrink-0 flex justify-end">
        <OrdersSection />
        <Cart />
      </div>

    </div>
  )
}

export default Header