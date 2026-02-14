import ProductContainer from "./Components/ProuductContainer";
import { useFetchData } from "../../Hooks/useFetch";
import { useSessionStorage } from "../../Hooks/useSessionStorage";
import { useSearchParams } from "react-router-dom";

function HomePage() {
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search");

  const url = search ? `/api/products?search=${search}` : "/api/products";

  const { fetchedData: fetchedProduct, isLoading } = useFetchData(url);

  const products = useSessionStorage("products", fetchedProduct);

  if (isLoading) {
    return (
      <div className="bg-slate-800 h-screen flex justify-center items-center overflow-hidden">
        <img
          src="/public/images/loading/loading-shopping-cart.png"
          alt="shopping-cart.png"
          className="animate-slide-x size-36"
        />
      </div>
    );
  }

  console.log(search);
  

  if(products.length === 0) {
    return (
    <h1>no avilable products</h1>
    )
  } 
  

  return (
    <>
      <div className="mt-[61px]">
        <div
          className="grid grid-cols-2    
        sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 max-2xl:grid-cols-7"
        >
          <ProductContainer products={products} />
          {products.length === 0 && <h1>no products</h1>}
        </div>
      </div>
    </>
  );
}

export default HomePage;
