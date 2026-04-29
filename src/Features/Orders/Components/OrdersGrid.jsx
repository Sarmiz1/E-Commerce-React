import OrderCard from "./OrderCard";
import OrderSkeleton from "./OrderSkeleton";

export default function OrdersGrid({ isLoading, orders, onOpen }) {
  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <OrderSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {orders.map((order, index) => (
        <OrderCard key={order.id || index} order={order} index={index} onOpen={onOpen} />
      ))}
    </div>
  );
}
