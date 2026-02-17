import Logo from "./NavBarComponents/Logo";
import SearchBar from "./NavBarComponents/SearchBar";
import Cart from "./NavBarComponents/Cart";
import OrdersSection from "./NavBarComponents/OrdersSection";
import { useRef } from "react";
import useSearchFocus from "../Hooks/useSearchFocus";

function NavBar() {
  const searchBarInputRef = useRef(null);

  useSearchFocus(searchBarInputRef);

  return (
    <div
      className="bg-slate-400 text-white px-[15px] flex items-center  dark:text-slate-300
        justify-between fixed top-0 left-0 right-0 h-[60px]"
    >
      <Logo />
      <SearchBar ref={searchBarInputRef} />
      <div className="w-auto shrink-0 flex justify-end ">
        <OrdersSection />
        <Cart />
      </div>
    </div>
  );
}

export default NavBar;
