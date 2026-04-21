import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Footer from "../Components/Footer";

import Navbar from "../Components/Navbar";

export default function DefaultLayout() {

  
  return (
    <>
      <Navbar />
      {/* <Suspense fallback={
        <div className="bg-slate-300 h-screen flex justify-center items-center overflow-hidden">
        </div>
      }> */}
        <Outlet />  {/* This renders the route element */}
      {/* </Suspense > */}
      <Footer />
    </>
  );
}