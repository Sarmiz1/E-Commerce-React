import { formatMoneyCents } from "../../../../utils/formatMoneyCents"
function ProductPrice({productPrice}) {

  return (
    <div className="product-price font-bold mb-[10px]">
        {formatMoneyCents(productPrice)}
    </div>
  )
}

export default ProductPrice