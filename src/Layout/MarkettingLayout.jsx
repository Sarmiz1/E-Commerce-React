import React, { lazy } from "react";
import { Outlet } from "react-router-dom";
const ModernFooter = lazy(() =>
  import("../Features/Marketting/ModernFooter").then(
    (module) => ({ default: module.ModernFooter }),
  ),
);

const MarkettingLayout = () => {
  return (
    <div>
      <Outlet />
      <ModernFooter />
    </div>
  );
};

export default MarkettingLayout;
