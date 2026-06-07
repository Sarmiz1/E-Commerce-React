import React from "react";

export default function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 shadow-sm"
          style={{
            boxShadow: "0 18px 40px rgba(2,6,23,0.18)",
          }}
        >
          <div
            className="product-skeleton-wave"
            style={{ paddingTop: "133%" }}
          />
          <div className="p-3.5 space-y-2.5">
            <div
              className="product-skeleton-wave h-3.5 rounded-full w-3/4"
            />
            <div
              className="product-skeleton-wave h-3 rounded-full w-1/2"
            />
            <div
              className="product-skeleton-wave h-4 rounded-full w-1/3 mt-2"
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes productSkeletonWave {
          0% { background-position: 140% 0; opacity: 0.72; }
          50% { background-position: -40% 0; opacity: 1; }
          100% { background-position: 140% 0; opacity: 0.72; }
        }
        .product-skeleton-wave {
          background-image: linear-gradient(
            105deg,
            #050816 8%,
            #0f172a 34%,
            #26364f 50%,
            #0f172a 66%,
            #050816 92%
          );
          background-size: 260% 100%;
          animation: productSkeletonWave 2.15s ease-in-out infinite;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }
      `}</style>
    </div>
  );
}
