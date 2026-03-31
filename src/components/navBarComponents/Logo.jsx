// src/components/NavBarComponents/Logo.jsx
import { NavLink } from "react-router-dom";
import largeScreenLogo from '../../assets/logos/logo2.png';
import mobileLogo from '../../assets/logos/logo.png';

export default function Logo() {
  return (
    <NavLink
      to="/"
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      {/* Large screens */}
      <div className="hidden lg:flex items-center gap-2">
        <img src={largeScreenLogo} alt="Logo" className="h-10 w-auto" />
        <span className="text-white font-bold text-xl">Mart</span>
      </div>

      {/* Mobile */}
      <img
        src={mobileLogo}
        alt="Logo"
        className="block lg:hidden h-12 w-12"
      />
    </NavLink>
  );
}