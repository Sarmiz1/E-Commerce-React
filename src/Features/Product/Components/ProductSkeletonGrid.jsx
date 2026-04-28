import React from "react";

export default function ProductSkeletonGrid({ isDark, colors }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden"
          style={{
            background: colors.surface.secondary,
            border: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div
            className={`pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"}`}
            style={{ paddingTop: "133%" }}
          />
          <div className="p-3.5 space-y-2.5">
            <div
              className={`pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"} h-3.5 rounded-full w-3/4`}
            />
            <div
              className={`pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"} h-3 rounded-full w-1/2`}
            />
            <div
              className={`pg-skeleton ${isDark ? "pg-skeleton-dark" : "pg-skeleton-light"} h-4 rounded-full w-1/3 mt-2`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
