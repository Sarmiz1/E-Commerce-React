import ProductImageContainer from "./ContainerComponents/ProductImageContainer";
import ProductName from "./ContainerComponents/ProductName";
import ProductRating from "./ContainerComponents/ProductRating";
import ProductPrice from "./ContainerComponents/ProductPrice";
import AddToCart from "./ContainerComponents/AddToCart";
import { useFetchData } from "../../../Hooks/useFetch";
import { useSessionStorage } from "../../../Hooks/useSessionStorage";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

function ProductContainer() {
  const [searchParams] = useSearchParams();

  console.log(searchParams.size);

  const search = searchParams.get("search");

  console.log(search);

  const productUrl = "/api/products";
  const searchUrlPath = `/api/products?search=${search}`;

  const { fetchedData: fetchedProduct } = useFetchData(productUrl);

  const products = useSessionStorage("products", fetchedProduct);

  // let fetchedProduct  = []

  // useEffect(()=> {

  //   if(search) {
  //     const { fetchedData } = useFetchData(searchUrlPath);

  //     fetchedProduct = fetchedData
  //   } else {
  //     const { fetchedData } = useFetchData(productUrl);
  //     fetchedProduct = fetchedData
  //   }

  // }, [search])

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
            <ProductImageContainer productImage={image} />
            <ProductName productName={name} />
            <ProductRating productRating={rating} />
            <ProductPrice productPrice={priceCents} />

            <AddToCart productId={id} />
          </div>
        );
      })}
    </>
  );
}

export default ProductContainer;
