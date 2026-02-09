function ProductImageContainer({productImage}) {

  return (
    <div className="product-image-container flex items-center justify-center
      h-44 mb-5">
      <img className="product-image w-full h-full rounded-md"
      src={productImage} />
    </div>
  )
}

export default ProductImageContainer