import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { TiShoppingCart } from "react-icons/ti";
import Navbar from "../Components/Navbar";

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="bg-slate-300 h-screen flex justify-center items-center overflow-hidden">
          <TiShoppingCart className="animate-slide-x" />
        </div>
      }>
        <Outlet />  {/* This renders the route element */}
      </Suspense >
    </>
  );
}