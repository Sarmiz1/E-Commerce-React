import OrdersHeader from "./Components/OrdersHeader";
import OrderProductDetails from "./Components/OrderProductDetails";
import { useFetchData } from "../../Hooks/useFetch";
import { TiShoppingCart } from "react-icons/ti";

function OrdersPage() {
  const ordersApiUrl = "/api/orders?expand=products";

  const { fetchedData: orders, isLoading } = useFetchData(ordersApiUrl);

  if (isLoading) {
    return (
      <div className="bg-slate-300 h-screen flex justify-center items-center overflow-hidden">
        <TiShoppingCart className="animate-slide-x"/>
      </div>
    );
  }

  return (
    <>
      <title>Orders</title>

      <div
        className=" max-w-[850px] mt-[90px] mb-[100px] px-5
        mx-auto"
      >
        <div className=" mb-6 font-bold text-[26px]">
          <h1>Your Orders</h1>
        </div>

        {orders.map((order) => {
          return (
            <section className="grid grid-cols-1 gap-12" key={order.id}>
              <div>
                <OrdersHeader
                  orderDate={order.orderTimeMs}
                  orderTotal={order.totalCostCents}
                  orderId={order.id}
                />

                <main
                  className="py-11 px-6 border-t-0 rounded-b-md 
                    border border-solid border-borderColor flex flex-col gap-8"
                >
                  {order.products.map((product) => {
                    return (
                      <OrderProductDetails
                        key={product.productId}
                        orderedProduct={product}
                        quantity={order.quantity}
                      />
                    );
                  })}
                </main>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default OrdersPage;
