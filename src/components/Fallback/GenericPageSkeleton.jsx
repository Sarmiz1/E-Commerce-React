import React from "react";
import { SkeletonStyles, SkBlock } from "./SkeletonBase";
import NavbarSkeleton from "./NavbarSkeleton";

export default function GenericPageSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0E0E10] min-h-screen w-full">
      <SkeletonStyles />
      <NavbarSkeleton />
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col gap-6">
        <SkBlock h="48px" w="40%" rounded="12px" className="mb-6" />
        <SkBlock h="20px" w="100%" rounded="8px" />
        <SkBlock h="20px" w="100%" rounded="8px" />
        <SkBlock h="20px" w="90%" rounded="8px" />
        <SkBlock h="20px" w="95%" rounded="8px" />
        <SkBlock h="20px" w="70%" rounded="8px" className="mb-8" />
        
        <SkBlock h="300px" w="100%" rounded="16px" className="mb-6" />
        
        <SkBlock h="20px" w="100%" rounded="8px" />
        <SkBlock h="20px" w="85%" rounded="8px" />
      </div>
    </div>
  );
}
