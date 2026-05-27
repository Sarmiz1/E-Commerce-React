import { TiShoppingCart } from "react-icons/ti";

export default function LoadingFallback() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col justify-center items-center gap-4">
      <div className="animate-bounce">
        <TiShoppingCart size={80} color="#2563eb" />
      </div>
      <p className="text-gray-600 font-medium text-lg animate-pulse">Loading amazing products...</p>
    </div>
  );
}
