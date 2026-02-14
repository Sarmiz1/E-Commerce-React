import ProgressLabel from "./Components/ProgressLabel";
import TrackingDetails from "./Components/TrackingDetails";
import ViewAllOrders from "./Components/ViewAllOrders";
import ProgressBar from "./Components/ProgressBar";
import { useFetchData } from "../../Hooks/useFetch";
import { Fragment } from "react";

function TrackingPage() {
  const ordersApiUrl = "/api/orders?expand=products";

  const { fetchedData: orders, isLoading } = useFetchData(ordersApiUrl);

  if (isLoading) {
    return (
      <div className="bg-slate-800 h-screen flex justify-center items-center">
        <img
          src="/public/images/loading/loading_circles_blue_gradient.png"
          alt="/loading_circles_blue_gradient"
          className="animate-spin [animation-duration:2.5s] size-8"
        />
      </div>
    );
  }

  return (
    <main
      className=" m-0 font-roboto text-[rgb(33, 33, 33)] 
    "
    >
      <title>Tracking</title>

      <div
        className="max-w-[850px] mt-24 mb-28 px-8 mx-auto
        "
      >
        <div>
          <ViewAllOrders />
          {orders.map((order) => {
            const progress = Math.floor(Math.random() * 101);
            return (
              <Fragment key={order.id}>
                <TrackingDetails order={order} />
                <ProgressLabel progress={progress} />
                <ProgressBar progress={progress} />
              </Fragment>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default TrackingPage;
