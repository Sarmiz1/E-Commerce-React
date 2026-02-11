import OrdersHeader from "./components/components/OrdersHeader";
import OrderProductDetails from "./components/components/OrderProductDetails";
import { useFetchData } from "../../Hooks/useFetch";

function OrdersPage() {
  const ordersApiUrl = "/api/orders?expand=products";

  const { fetchedData: orders } = useFetchData(ordersApiUrl);

  return (
    <>
      <title>Orders</title>

      <div
        className="orders-page max-w-[850px] mt-[90px] mb-[100px] px-5
        mx-auto"
      >
        <div className="page-title mb-6 font-bold text-[26px]">
          <h1>Your Orders</h1>
        </div>

        {orders.map((order) => {
          return (
            <section
              className="orders-grid grid grid-cols-1 gap-12"
              key={order.id}
            >
              <div className="order-container">
                <OrdersHeader
                  orderDate={order.orderTimeMs}
                  orderTotal={order.totalCostCents}
                  orderId={order.id}
                />

                <main
                  className="order-details-grid py-11 px-6 border-t-0 rounded-b-md 
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
