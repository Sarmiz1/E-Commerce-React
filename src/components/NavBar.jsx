import Logo from "./navBarComponents/Logo";
import SearchBar from "./navBarComponents/SearchBar";
import Cart from "./navBarComponents/Cart";
import OrdersSection from "./navBarComponents/OrdersSection";
function NavBar() {

  return (
    <div className="bg-darkGreen text-white px-[15px] flex items-center  dark:text-slate-300
        justify-between fixed top-0 left-0 right-0 h-[60px]">
      <Logo />
      <SearchBar />
      <div className="w-auto shrink-0 flex justify-end ">
        <OrdersSection />
        <Cart />
      </div>

    </div>
  )
}

export default NavBar