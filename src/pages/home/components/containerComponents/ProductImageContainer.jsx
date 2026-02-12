function ProductImageContainer({ productImage }) {
  return (
    <div
      className=" flex items-center justify-center
      h-44 mb-5"
    >
      <img className=" w-full h-full rounded-md" src={productImage} />
    </div>
  );
}

export default ProductImageContainer;
