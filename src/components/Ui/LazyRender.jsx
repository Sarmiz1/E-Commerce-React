import React, { useRef } from "react";
import { useInView } from "framer-motion";

export default function LazyRender({ children, minHeight = "400px", margin = "400px" }) {
  const ref = useRef(null);
  // Trigger rendering when the section is within `margin` distance from the viewport
  const isInView = useInView(ref, { once: true, margin });

  return (
    <div ref={ref} style={{ minHeight: isInView ? "auto" : minHeight }}>
      {isInView && children}
    </div>
  );
}
