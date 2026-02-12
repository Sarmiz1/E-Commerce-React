import { ratingCount } from "../../../../Utils/ratingsCount";
function ProductRating({ productRating }) {
  const { stars, count } = productRating;
  return (
    <div className=" flex items-center mb-[10px]">
      <img
        className=" w-24 mr-[6px]"
        src={`images/ratings/rating-${ratingCount(stars)}.png`}
      />
      <div className=" link-primary text-greenPry cursor-auto mt-[3px] hover:opacity-75 active:opacity-50">
        {count}
      </div>
    </div>
  );
}

export default ProductRating;
