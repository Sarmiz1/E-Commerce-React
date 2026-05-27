import React from "react";
import { SkeletonStyles, SkBlock } from "./SkeletonBase";

export default function NavbarSkeleton({ dark = false }) {
  return (
    <div className={`w-full py-3 md:py-4 px-5 border-b ${dark ? 'border-gray-800 bg-[#0A0A0A]' : 'border-gray-100 bg-white'} fixed top-0 left-0 right-0 z-[9000]`}>
      <SkeletonStyles />
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <SkBlock dark={dark} w="140px" h="40px" rounded="8px" />
        
        {/* Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <SkBlock dark={dark} w="60px" h="16px" rounded="4px" />
          <SkBlock dark={dark} w="60px" h="16px" rounded="4px" />
          <SkBlock dark={dark} w="60px" h="16px" rounded="4px" />
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-4">
          <SkBlock dark={dark} w="40px" h="40px" rounded="full" className="hidden sm:block" />
          <SkBlock dark={dark} w="40px" h="40px" rounded="full" />
          <SkBlock dark={dark} w="100px" h="40px" rounded="99px" className="hidden md:block" />
          <SkBlock dark={dark} w="40px" h="40px" rounded="8px" className="md:hidden" />
        </div>
      </div>
    </div>
  );
}
