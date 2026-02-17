import { ButtonPrimary } from "../../../components/ButtonPrimary";
import { Link } from "react-router-dom";
import { formatDate } from "../../../Utils/formatDate";
import { postData } from "../../../api/postData";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import cartContext from "../../../Context/cartContext";

function OrderProductDetails({ orderedProduct }) {
  const navigateToCheckOut = useNavigate();
  const { loadCart } = useContext(cartContext);

  const {
    quantity,
    estimatedDeliveryTimeMs,
    product: { image, name, id },
  } = orderedProduct;

  const handleAddToCart = (id) => {
    const productDetails = {
      productId: id,
      quantity: 1,
    };

    const addToCartUrl = `/api/cart-items`;

    postData(addToCartUrl, productDetails);

    loadCart();

    navigateToCheckOut("/checkout");
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      <div className="flex gap-8 md:mr-5 self-start md:justify-normal md:items-start">
        <div className=" text-center mb-6">
          <img src={image} className="max-w-28 max-h-28" />
        </div>

        <div className=" mt-0">
          <div className=" font-bold mb-px md:w-[100ch]">{name}</div>
          <div className=" mb-px ">
            <span className="letterSpacingSm">Arriving</span> on:{" "}
            {formatDate(estimatedDeliveryTimeMs)}
          </div>
          <div className="product-quantity mb-px sm:mb-4">
            Quantity: {quantity}
          </div>

          <ButtonPrimary
            size="xxl"
            variant="secondary"
            onClick={() => handleAddToCart(id)}
          >
            <img className="w-5 mr-3" src="images/icons/buy-again.png" />
            <span>Add to Cart</span>
          </ButtonPrimary>
        </div>
      </div>

      <div
        className=" flex justify-center ml-5 md:ml-auto md:mr-0
      sm:-ml-3 md:block"
      >
        <Link to="/tracking">
          <ButtonPrimary variant="purity" size="custom">
            Track package
          </ButtonPrimary>
        </Link>
      </div>
    </section>
  );
}

export default OrderProductDetails;
