import React from "react";
import { SkeletonStyles, SkBlock } from "./SkeletonBase";

export default function DashboardSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen w-full flex">
      <SkeletonStyles />
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 gap-6 shrink-0">
        <SkBlock h="32px" w="70%" rounded="8px" className="mb-8" />
        {Array(6).fill(0).map((_, i) => (
          <SkBlock key={i} h="24px" w="100%" rounded="6px" />
        ))}
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 flex items-center justify-between shrink-0">
          <SkBlock h="24px" w="150px" rounded="6px" />
          <div className="flex gap-4">
            <SkBlock h="36px" w="36px" rounded="full" />
            <SkBlock h="36px" w="36px" rounded="full" />
          </div>
        </div>
        {/* Content area */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkBlock h="120px" w="100%" rounded="16px" />
            <SkBlock h="120px" w="100%" rounded="16px" />
            <SkBlock h="120px" w="100%" rounded="16px" />
          </div>
          <SkBlock h="400px" w="100%" rounded="16px" />
        </div>
      </div>
    </div>
  );
}
