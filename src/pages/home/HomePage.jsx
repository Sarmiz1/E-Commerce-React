import ProductContainer from "./components/ProuductContainer";

function HomePage() {
  return (
    <>
      <div className="mt-[61px]">
        <div
          className="grid grid-cols-2    
        sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 max-2xl:grid-cols-7"
        >
          <ProductContainer />
        </div>
      </div>
    </>
  );
}

export default HomePage;
