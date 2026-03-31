import { Outlet, useNavigation } from "react-router-dom";
import { Suspense } from "react";
import Footer from "../Components/Footer";
import { TiShoppingCart } from "react-icons/ti";



export default function RootLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  return (
    <>
      {/* <Suspense fallback={
        <div className="bg-slate-300 h-screen flex justify-center items-center overflow-hidden">
          <TiShoppingCart className="animate-slide-x" />
        </div>
      }> */}
      <Outlet />  {/* This renders the route element */}
      {/* </Suspense > */}
      <Footer />
    </>
  );
}