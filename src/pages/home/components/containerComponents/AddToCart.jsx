import {ButtonPrimary} from "../../../../components/ButtonPrimary";
import { useState, useContext } from "react";
import { postData } from "../../../../api/postData";
import cartContext from "../../../../Context/cartContext";
import { useEffect } from "react";

function AddToCart({ productId }) {
  const [quantity, setQuantity] = useState(1);
  const [addSuccesfully, setAddedSuccesfully] = useState(false);

  const { loadCart } = useContext(cartContext);

  const handleOnchange = (e) => {
    setQuantity(Number(e.target.value));
  };

  const handleOnclick = (productID) => {
    const productDetails = {
      productId: productID,
      quantity,
    };

    const addToCartUrl = `/api/cart-items`;

    postData(addToCartUrl, productDetails);

    setAddedSuccesfully(true);

    loadCart();
  };

  useEffect(() => {
    if (addSuccesfully) {
      setTimeout(() => {
        setAddedSuccesfully(false);
      }, 3000);
    }
  }, [addSuccesfully]);

  return (
    <>
      <div className=" mb-4">
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
      <div
        className={` text-greenPry text-base flex items-center mb-2 
        ${addSuccesfully ? "opacity-100" : "opacity-0"}`}
      >
        <img className="h-5 mr-[6px]" src="images/icons/checkmark.png" />
        Added
      </div>

      <ButtonPrimary
        data-testid = 'add-to-cart-btn'
        variant='ok'
        size='xl'
        onClick={() => handleOnclick(productId)}
      >
        Add to Cart
      </ButtonPrimary>
    </>
  );
}

export default AddToCart;
