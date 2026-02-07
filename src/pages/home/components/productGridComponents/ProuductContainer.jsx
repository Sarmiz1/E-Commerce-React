import ProductImageContainer from "./ProductImageContainer"
import ProductName from "./ProductName"
import ProductRating from "./ProductRating"
import ProductPrice from "./ProductPrice"
import ProductQuantity from "./ProductQuantity"
import AddToCart from "./AddToCart"
function ProductContainer({product}) {

  return (
    <div className="product-container pt-10 pb-6 px-6 border-r border-solid
      border-b border-r-[rgb(240, 240, 240)] border-b-[rgb(240, 240, 240)] flex flex-col
      dark:border-r-black dark:bg-slate-200
      dark:border-b-black">
      
      <ProductImageContainer productImage={product.image}/>
      <ProductName productName={product.name}/>
      <ProductRating productRating={product.rating} />
      <ProductPrice productPrice={product.price} />
      <ProductQuantity />

      <div className="product-spacer flex-1"></div>

      <AddToCart />

    </div>
  )
}

export default ProductContainer