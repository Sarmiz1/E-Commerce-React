import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function OrdersSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 rounded-full text-white font-semibold hover:bg-gray-700 transition"
      >
        Orders
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg p-4 animate-fadeInFeature z-50">
          <p className="text-sm mb-2">Recent Orders</p>
          <NavLink
            to="/orders"
            className="block mt-2 text-center bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
          >
            View All Orders
          </NavLink>
          <NavLink
            to="/profile"
            className="block mt-2 text-center bg-gray-100 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-200 transition"
          >
            Profile / Login
          </NavLink>
        </div>
      )}
    </div>
  );
}