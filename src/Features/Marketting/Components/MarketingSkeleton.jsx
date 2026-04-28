import React from "react";

export default function MarketingSkeleton({ sections = 3 }) {
  return (
    <div className="w-full space-y-20 py-20 px-6">
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i} className="max-w-7xl mx-auto">
          {/* Section Label Skeleton */}
          <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded-full mb-4 animate-pulse" />
          
          {/* Title Skeleton */}
          <div className="h-10 w-2/3 bg-gray-200 dark:bg-white/10 rounded-2xl mb-8 animate-pulse" />
          
          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="aspect-video bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
