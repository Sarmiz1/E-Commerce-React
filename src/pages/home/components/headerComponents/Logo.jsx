import { Link } from "react-router-dom";

function Logo () {

  return(
    <div className="w-52 md:w-auto">
      <Link 
        to="/" 
        className="inline-block py-[6px] px-[9.5px]
        cursor-pointer rounded-sm no-underline border border-solid 
        border-[rgba(0, 0, 0, 0)] hover:border hover:border-solid
        hover:border-white"
      >
        <img className="h-[26px] mt-[1px] sm:hidden"
          src="images/logo-white.png" />
        <img className="hidden sm:block h-[26px] mt-[1px]"
          src="images/mobile-logo-white.png" />
      </Link>
    </div>
  )
}

export default Logo