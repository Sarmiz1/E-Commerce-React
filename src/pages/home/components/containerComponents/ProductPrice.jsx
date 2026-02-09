import { FormatMoneyCents } from "../../../../utils/FormatMoneyCents"
function ProductPrice({productPrice}) {

  return (
    <div className="product-price font-bold mb-[10px]">
        {FormatMoneyCents(productPrice)}
    </div>
  )
}

export default ProductPrice