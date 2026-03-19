import { NavLink } from "react-router-dom";
import largeScreenLogo from '../../assets/logos/logo2.png'
import mobileLogo from '../../assets/logos/logo.png'

function Logo() {
  return (
    <div className="w-auto">
      <NavLink
        to="/"
        className="inline-block py-[6px] px-[9.5px]
        cursor-pointer rounded-md no-underline
        hover:outline hover:outline-1
        hover:outline-white"
      >
        <div className="relative right-2 mt-1 hidden lg:flex">
          <img
          className=" size-20 invert block"
          src={largeScreenLogo}
          />
          <p className="text-white absolute left-full right-0 top-[41%]
          font-semibold ">Mart</p>
        </div>
        <img
          className=" block lg:hidden size-14 mt-1"
          src={mobileLogo}
        />
      </NavLink>
    </div>
  );
}

export default Logo;
