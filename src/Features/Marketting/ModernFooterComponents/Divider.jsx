import { forwardRef } from "react";

const Divider = forwardRef(function Divider(props, ref) {
  return (
    <div
      ref={ref}
      className="w-full h-px bg-gray-100 dark:bg-white/[0.07]"
      style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
    />
  );
});

export default Divider;
