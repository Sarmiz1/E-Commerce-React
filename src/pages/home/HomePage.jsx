import ProductContainer from "./Components/ProuductContainer";
import { useFetchData } from "../../Hooks/useFetch";
import { useSearchParams } from "react-router-dom";
import { TiShoppingCart } from "react-icons/ti";


function HomePage() {
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search");

  const url = search ? `/api/products?search=${search}` : "/api/products";

  const { fetchedData: products, isLoading } = useFetchData(url);

  if (isLoading) {
    return (
      <div className="bg-slate-300 h-screen flex justify-center items-center overflow-hidden">
        <TiShoppingCart className="animate-slide-x"/>
      </div>
    );
  }
  

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
