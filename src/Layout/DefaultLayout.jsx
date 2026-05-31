import { Outlet, useLocation } from "react-router-dom";
import Footer from "../Components/Footer";


export default function DefaultLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* <Navbar /> */}
      <Outlet /> {/* This renders the route element */}
      {!isAdminRoute && <Footer />}
    </>
  );
}
