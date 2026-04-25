import React from "react";
import { SkeletonStyles, SkBlock } from "./SkeletonBase";
import NavbarSkeleton from "./NavbarSkeleton";

export default function SellerSkeleton() {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden selection:bg-violet-600/30 bg-[#0A0A0A] text-white">
      <SkeletonStyles />
      <NavbarSkeleton dark={true} />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
        <SkBlock dark h="56px" w="60%" rounded="12px" />
        <SkBlock dark h="56px" w="80%" rounded="12px" />
        <SkBlock dark h="24px" w="50%" rounded="8px" className="mt-6" />
        <SkBlock dark h="56px" w="200px" rounded="30px" className="mt-10" />
        <SkBlock dark h="500px" w="100%" rounded="24px" className="mt-12" />
      </div>
    </div>
  );
}
