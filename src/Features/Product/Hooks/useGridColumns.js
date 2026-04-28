import { useState, useEffect } from "react";

/**
 * Tracks the active CSS grid column count based on Tailwind breakpoints.
 *
 * Breakpoints (must match ProductsPage grid classes):
 *   default  → 2 cols   (< 640px)
 *   sm       → 3 cols   (≥ 640px)
 *   xl       → 4 cols   (≥ 1280px)
 *
 * Also returns the ad column span for slot-counting:
 *   2 cols → ad spans 2 (full row)
 *   3 cols → ad spans 3 (full row, avoids 1-slot gap)
 *   4 cols → ad spans 2 (half row)
 */
export function useGridColumns() {
  const [cols, setCols] = useState(() => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 640) return 3;
    return 2;
  });

  useEffect(() => {
    const xlQuery = window.matchMedia("(min-width: 1280px)");
    const smQuery = window.matchMedia("(min-width: 640px)");

    const update = () => {
      if (xlQuery.matches) setCols(4);
      else if (smQuery.matches) setCols(3);
      else setCols(2);
    };

    update();
    xlQuery.addEventListener("change", update);
    smQuery.addEventListener("change", update);

    return () => {
      xlQuery.removeEventListener("change", update);
      smQuery.removeEventListener("change", update);
    };
  }, []);

  // Ad col span: full row on 2-col and 3-col, half row on 4-col
  const adColSpan = cols <= 3 ? cols : 2;

  return { cols, adColSpan };
}
