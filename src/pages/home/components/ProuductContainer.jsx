import ProductImageContainer from "./ContainerComponents/ProductImageContainer";
import ProductName from "./ContainerComponents/ProductName";
import ProductRating from "./ContainerComponents/ProductRating";
import ProductPrice from "./ContainerComponents/ProductPrice";
import AddToCart from "./ContainerComponents/AddToCart";
import { NavLink } from "react-router-dom";


function ProductContainer({ products }) {
  return (
    <>
      {products.map(({ id, image, name, rating, priceCents }) => {
        return (
          <div
            className=" pt-10 pb-6 px-6 border-r border-solid
          border-b border-r-[rgb(240, 240, 240)] border-b-[rgb(240, 240, 240)] flex flex-col
          dark:border-r-black/50 dark:bg-slate-100
          dark:border-b-black/50"
            key={id}
          >
            <NavLink to={'/'}>
              <ProductImageContainer productImage={image} />
              <ProductName productName={name} />
              <ProductRating productRating={rating} />
              <ProductPrice productPrice={priceCents} />
            </NavLink>

            <AddToCart productId={id} />
          </div>
        );
      })}
    </>
  );
}

export default ProductContainer;
