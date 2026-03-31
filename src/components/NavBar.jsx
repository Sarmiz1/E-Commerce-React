// src/components/Navbar.jsx
import { useRef, useState } from "react";
import Logo from "./NavBarComponents/Logo";
import SearchBar from "./NavBarComponents/SearchBar";
import Cart from "./NavBarComponents/Cart";
import OrdersSection from "./NavBarComponents/OrdersSection";
import { NavLink } from "react-router-dom";

export default function NavBar() {
  const searchBarRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "products" },
    { name: "Collections", href: "/collections" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 ">
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md shadow-md px-6 py-2 flex items-center justify-between animate-fadeInHero">

          {/* LEFT: LOGO */}
          <Logo />

          {/* CENTER: SEARCH BAR */}
          <div className="flex-1 mx-4 max-w-xl">
            <SearchBar ref={searchBarRef} />
          </div>

          {/* RIGHT: ORDERS, CART, MOBILE MENU BUTTON */}
          <div className="flex items-center gap-4">
            <OrdersSection />
            <Cart />

            {/* Hamburger button only on mobile */}
            <button
              className="md:hidden text-white text-2xl focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex gap-6 text-white font-semibold ml-6">
            {menuLinks.map((link, idx) => (
              <NavLink
                key={idx}
                to={link.href}
                className="hover:text-gray-300 transition"
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {menuOpen && (
          <div className="md:hidden bg-gray-900/90 backdrop-blur-md px-6 py-4 flex flex-col gap-4 text-white animate-fadeInFeature">
            {menuLinks.map((link, idx) => (
              <NavLink
                key={idx}
                to={link.href}
                className="hover:text-gray-300 transition font-semibold text-lg"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Spacer so content doesn't get hidden behind navbar */}
      <div className="h-[60px] md:h-[60px]"></div>
    </>
  );
}