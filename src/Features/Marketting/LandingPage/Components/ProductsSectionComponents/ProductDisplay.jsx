import { memo } from "react";
import ProductCard from "../../../../../Components/Ui/ProductCard";

const ProductDisplay = memo(({ item }) => {

  return (
    <ProductCard product={item} variant="standard" />
  )
})

export default ProductDisplay
