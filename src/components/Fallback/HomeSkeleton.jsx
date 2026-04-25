import React from "react";
import { SkeletonStyles, SkBlock } from "./SkeletonBase";
import NavbarSkeleton from "./NavbarSkeleton";

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SkeletonStyles />
      <NavbarSkeleton />

      {/* Hero placeholder */}
      <div className="w-full h-[60vh] md:h-[80vh] bg-gray-50 flex items-center justify-center relative overflow-hidden mb-16 pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-white" />
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl text-center px-6 w-full">
           <SkBlock w="60%" h="60px" rounded="16px" />
           <SkBlock w="80%" h="60px" rounded="16px" />
           <SkBlock w="40%" h="20px" rounded="8px" className="mt-4" />
           <SkBlock w="200px" h="56px" rounded="99px" className="mt-8" />
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex flex-col items-center mb-10">
           <SkBlock w="120px" h="14px" className="mb-3" />
           <SkBlock w="280px" h="36px" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
             <SkBlock key={i} w="100%" h="140px" rounded="24px" />
          ))}
        </div>
      </div>

      {/* Trending / Products */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <SkBlock w="120px" h="14px" className="mb-3" />
            <SkBlock w="320px" h="36px" />
          </div>
          <SkBlock w="80px" h="20px" className="hidden md:block" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100">
              <SkBlock w="100%" h="280px" rounded="0" />
              <div className="p-5 space-y-3">
                <SkBlock w="80%" h="16px" />
                <SkBlock w="40%" h="14px" />
                <SkBlock w="30%" h="24px" className="mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
