import { Outlet } from "react-router-dom";
import Footer from "../Components/Footer";


export default function DefaultLayout() {
  return (
    <>
      {/* <Navbar /> */}
      <Outlet /> {/* This renders the route element */}
      <Footer />
    </>
  );
}
