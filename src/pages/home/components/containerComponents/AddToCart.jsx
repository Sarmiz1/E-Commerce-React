import ButtonPrimary from "../../../../components/ButtonPrimary";
import { useContext, useState } from "react";
import dataContext from "../../../../context/dataContext";
import Cart from "../../../../components/navBarComponents/Cart";

function AddToCart({ productId }) {
  const { setCart, products, cart } = useContext(dataContext);

  const [quantity, setQuantity] = useState(1)

  const handleOnchange = (e) => {
    setQuantity(Number(e.target.value))
  }

  const handleOnclick = (ID) => {

    const check = cart.some(item => item.id === ID)

    if (check === true) {
      cart.forEach(( product) => {
        if(product.id === ID) product.quantity += quantity
      })
    } 
    
    else {
      const pickedProduct = products.find(( product) => product.id === ID);
      pickedProduct.quantity = quantity

      setCart((prev) => [
      ...prev,
        pickedProduct,
    ]);
    }
    
  };

  

  return (
    <>
      <div className="product-quantity-container mb-4">
        <select
          className="text-[rgb(33, 33, 33)] bg-white border border-solid
        border-[rgb(200, 200, 200)] rounded-md py-[3px] px-[5px] text-base
        cursor-pointer [box-shadow: 0 1px 3px rgba(200, 200, 200, 0.2)]
        focus:outline-2 focus:outline focus:outline-greenPry"
          value={quantity}
          onChange={(e) => handleOnchange(e)}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>
      <div className="added-to-cart text-greenPry text-base flex items-center mb-2 opacity-0">
        <img className="h-5 mr-[6px]" src="images/icons/checkmark.png" />
        Added
      </div>

      <ButtonPrimary
        text={"Add to Cart"}
        className={`text-base w-full mt-[1px]  border border-solid rounded-md 
      [box-shadow: 0 2px 5px rgba(220, 220, 220, 0.5)] 
      hover:bg-greenPy/75 hover:border hover:border-solid
      hover:border-transparent`}
        handleOnclick={() => handleOnclick(productId)}
      />
    </>
  );
}

export default AddToCart;
