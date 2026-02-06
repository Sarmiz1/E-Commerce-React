import ProductContainer from "./productGridComponents/ProuductContainer"
function ProductsGrid() {

  return (
    <>
      <div className="products-grid grid grid-cols-1 max-2xl:grid-cols-7 
        2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3s
        sm:grid-cols-2">

        <ProductContainer
          product={{
            name: 'Black and Gray Athletic Cotton Socks - 6 Pairs',
            rating: '87',
            price: '$10.90',
            image: "images/products/athletic-cotton-socks-6-pairs.jpg"
          }}
        />
        <ProductContainer
          product={{
            name: 'Intermediate Size Basketball',
            rating: '127',
            price: '$20.95',
            image: "images/products/intermediate-composite-basketball.jpg"
          }}
        />
        <ProductContainer
          product={{
            name: 'Adults Plain Cotton T-Shirt - 2 Pack',
            rating: '56',
            price: '$7.99',
            image: "images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg"
          }}
        />
      </div>
    </>
  )
}

export default ProductsGrid