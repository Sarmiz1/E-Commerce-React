function ProductRating({productRating}) {

  return(
    <div className="product-rating-container flex items-center mb-[10px]">
      <img className="product-rating-stars w-24 mr-[6px]"
        src="images/ratings/rating-45.png" />
      <div className="product-rating-count link-primary text-greenPry cursor-auto mt-[3px] hover:opacity-75 active:opacity-50">
        {productRating}
      </div>
    </div>
  )
}

export default ProductRating