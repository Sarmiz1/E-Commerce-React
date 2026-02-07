import { Link } from "react-router-dom";

function Logo () {

  return(
    <div className="w-auto">
      <Link 
        to="/" 
        className="inline-block py-[6px] px-[9.5px]
        cursor-pointer rounded-md no-underline
        hover:outline hover:outline-1
        hover:outline-white"
      >
        <img className="h-[26px] mt-1 hidden sm:block"
          src="images/logo-white.png" />
        <img className=" block sm:hidden h-[26px] mt-1"
          src="images/mobile-logo-white.png" />
      </Link>
    </div>
  )
}

export default Logo