import { NavLink } from "react-router-dom";
import { useContext } from "react";
import dataContext from "../../../Context/cartContext";
import largeScreenLogo from '../../../assets/logos/logo2.png'
import mobileLogo from '../../../assets/logos/logo.png'

function CheckoutHeader() {
  const { cart } = useContext(dataContext);

  let checkOutItems = 0;

  cart.forEach(({ quantity }) => {
    checkOutItems += quantity;
  });

  return (
    <div
      className=" h-[60px] px-[30px] bg-white   
      flex justify-center fixed top-0 left-0 right-0 z-[1000]"
    >
      <div className=" w-full max-w-[1100px] flex items-center">
        <div className=" w-[100px] sm:w-auto  ml-2 lg:ml-4 mr-4">
          <NavLink to="/">
            <div className="relative right-2 mt-1 hidden sm:flex">
              <img
              className=" size-20 invert block"
              src={largeScreenLogo}
              />
              <p className="text-blue-700 absolute left-full right-0 top-[40%]
              font-semibold ">Mart</p>
            </div>

            <img
              className=" inline-block sm:hidden size-14"
              src={mobileLogo}
            />
          </NavLink>
        </div>

        <div
          className=" flex-grow   
          shrink-0 text-center text-[22px] font-medium flex justify-center lg:text-xl mx-auto "
        >
          Checkout (
          <NavLink
            className="return-to-home-NavLink     
            text-greenPry
            no-underline cursor-pointer lg:text-xl"
            to="/"
          >
            {" "}
            {checkOutItems} items
          </NavLink>
          )
        </div>

        <div
          className=" text-right w-[100px] sm:w-[200px]
          flex items-center justify-end lg:w-auto"
        >
          <img src="images/icons/checkout-lock-icon.png" className="h-8" />
        </div>
      </div>
    </div>
  );
}

export default CheckoutHeader;
