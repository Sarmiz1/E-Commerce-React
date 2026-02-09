import ProductImageContainer from "./containerComponents/ProductImageContainer"
import ProductName from "./containerComponents/ProductName"
import ProductRating from "./containerComponents/ProductRating"
import ProductPrice from "./containerComponents/ProductPrice"
import AddToCart from "./containerComponents/AddToCart"
import { useContext } from "react"
import dataContext from "../../../context/dataContext"


function ProductContainer() {


  const {products} = useContext(dataContext)
  


  return (
    
    <>
      {products.map(({
        id,
        image,
        name,
        rating,
        priceCents,
      }) => {
        return(
          <div className="product-container pt-10 pb-6 px-6 border-r border-solid
          border-b border-r-[rgb(240, 240, 240)] border-b-[rgb(240, 240, 240)] flex flex-col
          dark:border-r-black/50 dark:bg-slate-100
          dark:border-b-black/50"
          key={id}
          >

            <ProductImageContainer productImage={image}/>
            <ProductName productName={name}/>
            <ProductRating productRating={rating} />
            <ProductPrice productPrice={priceCents} />

            <AddToCart productId={id}/>

          </div>
        )
      })}
    </>

  )
}

export default ProductContainer