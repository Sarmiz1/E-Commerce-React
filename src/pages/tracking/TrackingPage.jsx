import ProgressLabel from "./components/ProgressLabel"
import TrackingDetails from "./components/TrackingDetails"
import ViewAllOrders from "./components/ViewAllOrders"
import ProgressBar from "./components/ProgressBar"

function TrackingPage() {
  const progress = 40

  return(
    <main className=" m-0 font-roboto text-[rgb(33, 33, 33)]">
      <title>Tracking</title>
      
      <div className="tracking-page max-w-[850px] mt-24 mb-28 px-8 mx-auto 
        ">
        <div className="order-tracking ">
          <ViewAllOrders />
          <TrackingDetails />
          <ProgressLabel progress={progress}/>
          <ProgressBar progress={progress}/>
        </div>
      </div>
    </main>
  )
}

export default TrackingPage