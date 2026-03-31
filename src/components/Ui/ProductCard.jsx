// src/components/product?Card.jsx
import { Link } from "react-router-dom";
import { ratingCount } from "../../Utils/ratingsCount";
import { formatMoneyCents } from "../../Utils/formatMoneyCents";
import { useParams } from "react-router-dom";



export default function ProductCard(
  {
    product,
    imgHeight = "h-40",
    mdImgHeight = "h-56",
  }) {

  const productId = useParams();


  return (
    <Link
      to={`/products/${product?.id}`}
      className="block bg-white rounded-2xl shadow-md hover:shadow-2xl transition transform hover:scale-105 overflow-hidden" 
    >

      {/* product Image */}
      <img
        src={product?.image}
        alt={product?.name}
        className={`w-full ${imgHeight} md:${mdImgHeight} object-cover`}
      />

      {/* product Name */}
      <div className="p-6">
        <h4 className="font-semibold">{product?.name}</h4>

        {/* product Ratings */}
        {product?.rating &&
          <div className=" flex items-center mb-[10px]">
            <img
              className=" w-24 mr-[6px]"
              data-testid='product?-stars-image'
              src={`images/ratings/rating-${ratingCount(product?.rating?.stars)}.png`}
            />
            <div className=" link-primary text-greenPry cursor-auto mt-[3px] hover:opacity-75 active:opacity-50">
              {product?.rating?.count}
            </div>
          </div>
        }

        {/* product? Price */}
        <p className="mt-4 font-bold text-lg">{formatMoneyCents(product?.priceCents)}</p>
      </div>
    </Link>
  );
}