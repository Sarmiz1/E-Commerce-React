  import ProductCard from "../../../Components/Ui/ProductCard";
  import AddToCart from "./AddToCart";


  function ProductsContainer({ products, setViewProduct }) {
    return (
      <>
        {products.map((product) => {
          return (
            <div
              className=" pt-5 pb-4 px-5 border-r border-solid rounded-lg
            border-b border-r-[rgb(240, 240, 240)] border-b-[rgb(240, 240, 240)] flex flex-col
            dark:border-r-black/50 dark:bg-slate-100
            dark:border-b-black/50  hover:shadow-lg transition-shadow duration-300 relative"
              key={product.id}
            >
              <ProductCard 
                product={product} 
                imgHeight="h-32" 
                mdImgHeight="h-46"
                setViewProduct={setViewProduct}
              />
              <div className="mt-auto">
                <AddToCart productId={product.id} />
              </div>
            </div>
          );
        })}
      </>
    );
  }

  export default ProductsContainer;
