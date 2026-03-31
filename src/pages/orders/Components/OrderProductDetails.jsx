import { ButtonPrimary } from "../../../Components/Ui/ButtonPrimary"; 
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../../../Utils/formatDate";
import { postData } from "../../../api/postData";
import { useContext, useState } from "react";
import cartContext from "../../../Context/cartContext";
import { ErrorMessage } from "../../../Components/ErrorMessage"; 

function OrderProductDetails({ orderedProduct }) {
  const navigateToCheckOut = useNavigate();
  const [errorMessage, setErrorMessage] = useState('')
  const { loadCart } = useContext(cartContext);

  const {
    quantity,
    estimatedDeliveryTimeMs,
    product: { image, name, id },
  } = orderedProduct;

  const handleAddToCart = async (id) => {
    try {
      setErrorMessage(null);
      await postData(`/api/cart-items`, {
        productId: id,
        quantity: 1,
      });

      await loadCart();
      navigateToCheckOut("/checkout");

    } catch (error) {
      setErrorMessage("Failed to add item to cart. Please try again.");
    }
  };

  return (
    <section className="border p-4 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

        {/* LEFT: IMAGE + INFO */}
        <div className="flex gap-4 flex-1 min-w-0">
          <img
            src={image}
            alt={name}
            className="w-20 h-20 object-contain flex-shrink-0"
          />

          <div className="flex flex-col gap-1 min-w-0">
            <div className="font-semibold break-words">
              {name}
            </div>

            <div className="text-sm">
              <span className="letterSpacingSm">Arriving</span> on:{" "}
              {formatDate(estimatedDeliveryTimeMs)}
            </div>

            <div className="text-sm">
              Quantity: {quantity}
            </div>
          </div>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">

          <ButtonPrimary
            size="xxl"
            variant="secondary"
            onClick={() => handleAddToCart(id)}
            className="w-full md:w-48 flex items-center justify-center"
          >
            <img
              src="images/icons/buy-again.png"
              className="w-5 mr-2"
              alt="buy again"
            />
            Add to Cart
          </ButtonPrimary>

          <Link to="/tracking" className="w-full md:w-48">
            <ButtonPrimary
              variant="purity"
              size="custom"
              className="w-full flex items-center justify-center"
            >
              Track package
            </ButtonPrimary>
          </Link>

        </div>
        <ErrorMessage  errorMessage={errorMessage}/>
      </div>
    </section>
  );
}

export default OrderProductDetails;