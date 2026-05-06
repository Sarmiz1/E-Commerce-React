import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

import Navbar from "../components/NavBar";

export default function DefaultLayout() {
  return (
    <>
      {/* <Navbar /> */}
      <Outlet /> {/* This renders the route element */}
      <Footer />
    </>
  );
}
