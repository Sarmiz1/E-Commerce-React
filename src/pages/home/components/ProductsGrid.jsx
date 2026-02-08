import ProductContainer from "./productGridComponents/ProuductContainer"
import { products } from "../../../data/products"
function ProductsGrid() {

  return (
    <>
      <div className="grid grid-cols-2    
        sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 max-2xl:grid-cols-7">
        
        {products?.map(product => {
          return(
            <ProductContainer
            key={product.id}
            product={product}
            />
          )
        })}

      </div>
    </>
  )
}

export default ProductsGrid