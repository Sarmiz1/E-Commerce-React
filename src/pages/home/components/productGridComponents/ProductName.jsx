function ProductName({productName}) {

  return (
    <div className="product-name limit-text-to-2-lines h-10 mb-[5px]
      [display: -webkit-box] overflow-hidden  [-webkit-line-clamp: 2]
      [-webkit-box-orient: vertical]">
        {productName}
    </div>
  )
}

export default ProductName