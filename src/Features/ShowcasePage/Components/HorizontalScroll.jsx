import { useCallback, useEffect, useRef, useState } from "react";

export default function HorizontalScroll({ children }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir * 440, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative" }}>
      {canLeft && (
        <button onClick={() => scroll(-1)} style={{
          position: "absolute", left: -16, top: "38%", zIndex: 10,
          width: 36, height: 36, borderRadius: "50%",
          background: "#fff", border: "1px solid #e8e8e8",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>
          <svg width="14" height="14" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M9 2L3 7l6 5" />
          </svg>
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll(1)} style={{
          position: "absolute", right: -16, top: "38%", zIndex: 10,
          width: 36, height: 36, borderRadius: "50%",
          background: "#fff", border: "1px solid #e8e8e8",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>
          <svg width="14" height="14" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M5 2l6 5-6 5" />
          </svg>
        </button>
      )}
      <div ref={ref} style={{
        display: "flex", gap: 16,
        overflowX: "auto", overflowY: "visible",
        paddingBottom: 8, paddingTop: 4,
        scrollbarWidth: "none",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
      }}>
        {children}
      </div>
    </div>
  );
}
