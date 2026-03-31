import { ButtonPrimary } from "../../../Components/Ui/ButtonPrimary";  
import { useState, useContext, useEffect } from "react";
import { postData } from "../../../api/postData";
import cartContext from "../../../Context/cartContext";
import { ErrorMessage } from "../../../Components/ErrorMessage";

function AddToCart({ productId }) {

  const [errorMessage, setErrorMessage] = useState('')
  const [quantity, setQuantity] = useState(1);
  const [addSuccesfully, setAddedSuccesfully] = useState(false);

  const { loadCart } = useContext(cartContext);

  const handleOnchange = (e) => {
    setQuantity(Number(e.target.value));
  };

  const handleOnclick = async (productID) => {

    try {
      setErrorMessage('');

      const productDetails = {
        productId: productID,
        quantity,
      };

      const addToCartUrl = `/api/cart-items`;

      await postData(addToCartUrl, productDetails);

      await loadCart();

      setAddedSuccesfully(true);

    } catch (error) {
      setErrorMessage("Failed to add item to cart. Please try again.");
    }
  };

  useEffect(() => {
    if (addSuccesfully) {
      const timer = setTimeout(() => {
        setAddedSuccesfully(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [addSuccesfully]);

  return (
    <>
      <div className=" mt-4 -mb-2">
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
        className={` text-greenPry text-base flex items-center mb-2 justify-center 
        ${addSuccesfully ? "opacity-100" : "opacity-0"}`}
      >
        <img className="h-5 mr-[6px]" src="images/icons/checkmark.png" />
        Added
      </div>

      <ButtonPrimary
        data-testid='add-to-cart-btn'
        variant='ok'
        size='xl'
        onClick={() => handleOnclick(productId)}
      >
        Add to Cart
      </ButtonPrimary>
      <ErrorMessage errorMessage={errorMessage} />
    </>
  );
}

export default AddToCart;
