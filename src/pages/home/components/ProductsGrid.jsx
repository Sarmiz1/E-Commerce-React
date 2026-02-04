function ProductsGrid() {

  return (
    <>
      <div className="products-grid grid grid-cols-1 max-2xl:grid-cols-7 
        2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3s
        sm:grid-cols-2">
        <div className="product-container pt-10 pb-6 px-6 border-r border-solid
          border-b border-r-[rgb(240, 240, 240)] border-b-[rgb(240, 240, 240)]
          flex flex-col">
          <div className="product-image-container flex items-center justify-center
            h-44 mb-5">
            <img className="product-image w-full h-full rounded-md"
              src="images/products/athletic-cotton-socks-6-pairs.jpg" />
          </div>

          <div className="product-name limit-text-to-2-lines h-10 mb-[5px]
            [display: -webkit-box] overflow-hidden  [-webkit-line-clamp: 2]
            [-webkit-box-orient: vertical]">
            Black and Gray Athletic Cotton Socks - 6 Pairs
          </div>

          <div className="product-rating-container flex items-center mb-[10px]">
            <img className="product-rating-stars w-24 mr-[6px]"
              src="images/ratings/rating-45.png" />
            <div className="product-rating-count link-primary text-greenPry cursor-auto mt-[3px] hover:opacity-75 active:opacity-50">
              87
            </div>
          </div>

          <div className="product-price font-bold mb-[10px]">
            $10.90
          </div>

          <div className="product-quantity-container mb-4">
            <select className="text-[rgb(33, 33, 33)] bg-white border border-solid
              border-[rgb(200, 200, 200)] rounded-md py-[3px] px-[5px] text-base
              cursor-pointer [box-shadow: 0 1px 3px rgba(200, 200, 200, 0.2)]
              focus:outline-2 focus:outline focus:outline-greenPry ">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>

          <div className="product-spacer flex-1"></div>

          <div className="added-to-cart text-greenPry text-base flex items-center mb-2 opacity-0">
            <img 
              className="h-5 mr-[6px]"
              src="images/icons/checkmark.png"/>
            Added
          </div>

          <button className="add-to-cart-button button-primary w-full h-8 p-2 mt-[1px] cursor-pointer text-[14px] text-white bg-greenPry border border-solid
          border-transparent rounded-md [box-shadow: 0 2px 5px rgba(220, 220, 220, 0.5)] hover:bg-greenPy/75 hover:border hover:border-solid
          hover:border-transparent active:bg-greenPy/50 active:border-transparent
          active:shadow-none">
            Add to Cart
          </button>
        </div>

        <div className="product-container pt-10 pb-6 px-6 border-r border-solid
          border-b border-r-[rgb(240, 240, 240)] border-b-[rgb(240, 240, 240)]
          flex flex-col">          
          <div className="product-image-container flex items-center justify-center
            h-44 mb-5">
            <img className="product-image w-full h-full rounded-md"
              src="images/products/intermediate-composite-basketball.jpg" />
          </div>

          <div className="product-name limit-text-to-2-lines h-10 mb-[5px]
            [display: -webkit-box] overflow-hidden  [-webkit-line-clamp: 2]
            [-webkit-box-orient: vertical]">
            Intermediate Size Basketball
          </div>

          <div className="product-rating-container flex items-center mb-[10px]">
            <img className="product-rating-stars w-24 mr-[6px]"
              src="images/ratings/rating-40.png" />
            <div className="product-rating-count link-primary text-greenPry cursor-auto mt-[3px] hover:opacity-75 active:opacity-50">
              127
            </div>
          </div>

          <div className="product-price font-bold mb-[10px]">
            $20.95
          </div>

          <div className="product-quantity-container mb-4">
            <select className="text-[rgb(33, 33, 33)] bg-white border border-solid
              border-[rgb(200, 200, 200)] rounded-md py-[3px] px-[5px] text-base
              cursor-pointer [box-shadow: 0 1px 3px rgba(200, 200, 200, 0.2)]
              focus:outline-2 focus:outline focus:outline-greenPry ">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>

          <div className="product-spacer flex-1"></div>

          <div className="added-to-cart text-greenPry text-base flex items-center mb-2 opacity-0">
            <img 
              className="h-5 mr-[6px]" 
              src="images/icons/checkmark.png" />
            Added
          </div>

          <button className="add-to-cart-button button-primary w-full h-8 p-2 mt-[1px] cursor-pointer text-[14px] text-white bg-greenPry border border-solid
          border-transparent rounded-md [box-shadow: 0 2px 5px rgba(220, 220, 220, 0.5)] hover:bg-greenPy/75 hover:border hover:border-solid
          hover:border-transparent active:bg-greenPy/50 active:border-transparent
          active:shadow-none">
            Add to Cart
          </button>
        </div>

        <div className="product-container pt-10 pb-6 px-6 border-r border-solid
          border-b border-r-[rgb(240, 240, 240)] border-b-[rgb(240, 240, 240)]
          flex flex-col">          
          <div className="product-image-container flex items-center justify-center
            h-44 mb-5">
            <img className="product-image w-full h-full rounded-md"
              src="images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg" />
          </div>

          <div className="product-name limit-text-to-2-lines h-10 mb-[5px]
            [display: -webkit-box] overflow-hidden  [-webkit-line-clamp: 2]
            [-webkit-box-orient: vertical]">
            Adults Plain Cotton T-Shirt - 2 Pack
          </div>

          <div className="product-rating-container flex items-center mb-[10px]">
            <img className="product-rating-stars w-24 mr-[6px]"
              src="images/ratings/rating-45.png" />
            <div className="product-rating-count link-primary text-greenPry cursor-auto mt-[3px] hover:opacity-75 active:opacity-50">
              56
            </div>
          </div>

          <div className="product-price font-bold mb-[10px]">
            $7.99
          </div>

          <div className="product-quantity-container mb-4">
            <select className="text-[rgb(33, 33, 33)] bg-white border border-solid
              border-[rgb(200, 200, 200)] rounded-md py-[3px] px-[5px] text-base
              cursor-pointer [box-shadow: 0 1px 3px rgba(200, 200, 200, 0.2)]
              focus:outline-2 focus:outline focus:outline-greenPry ">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>

          <div className="product-spacer flex-1"></div>

          <div className="added-to-cart text-greenPry text-base flex items-center mb-2 opacity-0">
            <img 
              className="h-5 mr-[6px]" 
              src="images/icons/checkmark.png" />
            Added
          </div>

          <button className="add-to-cart-button button-primary w-full h-8 p-2 mt-[1px] cursor-pointer text-[14px] text-white bg-greenPry border border-solid
          border-transparent rounded-md [box-shadow: 0 2px 5px rgba(220, 220, 220, 0.5)] hover:bg-greenPy/75 hover:border hover:border-solid
          hover:border-transparent active:bg-greenPy/50 active:border-transparent
          active:shadow-none">
            Add to Cart
          </button>
        </div>
      </div>
    </>
  )
}

export default ProductsGrid