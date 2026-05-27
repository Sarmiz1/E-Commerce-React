import React from "react";
import { SkeletonStyles, SkBlock } from "./SkeletonBase";
import NavbarSkeleton from "./NavbarSkeleton";

export default function LandingSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0E0E10] min-h-screen w-full selection:bg-blue-600/30">
      <SkeletonStyles />
      <NavbarSkeleton />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center gap-8">
        <SkBlock h="60px" w="70%" rounded="16px" className="mb-2" />
        <SkBlock h="60px" w="50%" rounded="16px" className="mb-6" />
        <SkBlock h="24px" w="80%" rounded="8px" />
        <SkBlock h="24px" w="60%" rounded="8px" className="mb-10" />
        <div className="flex gap-4">
          <SkBlock h="50px" w="160px" rounded="30px" />
          <SkBlock h="50px" w="160px" rounded="30px" />
        </div>
        <SkBlock h="400px" w="100%" rounded="24px" className="mt-12" />
      </div>
    </div>
  );
}
