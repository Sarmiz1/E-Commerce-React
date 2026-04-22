import { Outlet } from "react-router-dom";

import Navbar from "../Components/Navbar";

export default function TradeLayout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* This renders the route element */}
    </>
  );
}
