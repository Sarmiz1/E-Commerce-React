import { priceCents } from "../../../../utils/priceCents"
function ProductPrice({productPrice}) {

  return (
    <div className="product-price font-bold mb-[10px]">
        ${priceCents(productPrice)}
    </div>
  )
}

export default ProductPrice