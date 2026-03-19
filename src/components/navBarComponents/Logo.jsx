import { NavLink } from "react-router-dom";
import largeScreenLogo from '../../assets/logos/logo2.png';
import mobileLogo from '../../assets/logos/logo.png';

function Logo() {
  return (
    <div className="flex items-center w-auto">
      <NavLink
        to="/"
        className="flex items-center cursor-pointer no-underline rounded-md
          hover:outline hover:outline-1 hover:outline-white"
      >
        {/* LARGE SCREEN LOGO */}
        <div className="hidden lg:flex items-center gap-2">
          <img
            src={largeScreenLogo}
            alt="Logo"
            className="h-10 w-auto"
          />
          <span className="text-white font-semibold text-lg">Mart</span>
        </div>

        {/* MOBILE LOGO */}
        <img
          src={mobileLogo}
          alt="Logo"
          className="block lg:hidden h-14 w-14 mr-2 -ml-2"
        />
      </NavLink>
    </div>
  );
}

export default Logo;