import { ratingCount } from "../../../../utils/ratingsCount"
function ProductRating({productRating}) {

  const {stars, count} = productRating
  return(
    <div className="product-rating-container flex items-center mb-[10px]">
      <img className="product-rating-stars w-24 mr-[6px]"
        src={`images/ratings/rating-${ratingCount(stars)}.png`}/>
      <div className="product-rating-count link-primary text-greenPry cursor-auto mt-[3px] hover:opacity-75 active:opacity-50">
        {count}
      </div>
    </div>
  )
}

export default ProductRating

