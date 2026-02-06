import Header from "./components/Header"
import ProductsGrid from "./components/ProductsGrid"
function HomePage() {

  return (
    <>
      <Header />
      <div className="mt-[61px]">
        <ProductsGrid />
      </div>
    </>
  )
}

export default HomePage