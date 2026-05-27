import React from "react";
import { SkeletonStyles, SkBlock } from "./SkeletonBase";
import NavbarSkeleton from "./NavbarSkeleton";

export default function BuyerSkeleton() {
  return (
    <div className="w-full bg-white font-sans antialiased selection:bg-blue-200 selection:text-blue-900 overflow-hidden min-h-screen">
      <SkeletonStyles />
      <NavbarSkeleton />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <SkBlock h="48px" w="80%" rounded="12px" />
          <SkBlock h="48px" w="60%" rounded="12px" />
          <SkBlock h="20px" w="90%" rounded="8px" className="mt-4" />
          <SkBlock h="20px" w="70%" rounded="8px" />
          <SkBlock h="56px" w="180px" rounded="28px" className="mt-8" />
        </div>
        <div className="w-full md:w-1/2">
          <SkBlock h="450px" w="100%" rounded="24px" />
        </div>
      </div>
    </div>
  );
}
