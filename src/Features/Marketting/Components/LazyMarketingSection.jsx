import { Suspense, useRef } from "react";
import { useInView } from "framer-motion";
import MarketingSkeleton from "./MarketingSkeleton";

export default function LazyMarketingSection({
  children,
  className = "",
  fallback = undefined,
  fallbackSections = 1,
  id,
  margin = "500px",
  minHeight = 520,
}) {
  const ref = useRef(null);
  const isReady = useInView(ref, { once: true, margin });

  return (
    <div
      className={className}
      id={id}
      ref={ref}
      style={{ minHeight: isReady ? undefined : minHeight }}
    >
      {isReady ? (
        <Suspense
          fallback={
            fallback !== undefined ? fallback : <MarketingSkeleton sections={fallbackSections} />
          }
        >
          {children}
        </Suspense>
      ) : fallback !== undefined ? (
        fallback
      ) : (
        <MarketingSkeleton sections={fallbackSections} />
      )}
    </div>
  );
}
