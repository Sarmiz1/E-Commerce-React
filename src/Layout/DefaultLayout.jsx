import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import { Suspense } from "react";
import Footer from "../Components/Footer";
import { TiShoppingCart } from "react-icons/ti";


export default function RootLayout() {
  return (
    <>
      <NavBar />
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