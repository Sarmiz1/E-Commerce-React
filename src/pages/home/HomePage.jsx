import Header from "./components/Header"
import ProductsGrid from "./components/ProductsGrid"
function HomePage() {

  return (
    <>
      <Header />
      <div className="home-page mt-[61px]">
        <ProductsGrid />
      </div>
    </>
  )
}

export default HomePage