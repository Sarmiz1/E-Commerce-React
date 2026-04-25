import React from "react";
import { STYLES } from "../../Styles/styles";
import MarqueeStrip from "../MarqueeStrip";
import Skeleton from "./Skeleton";

export default function HomePageLoadingState() {
  return (
    <div className="overflow-x-hidden">
      <style>{STYLES}</style>
      <MarqueeStrip />
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 min-h-[90vh] flex items-center justify-center animate-pulse">
        <div className="text-center space-y-6 px-6">
          <div className="h-20 bg-white/20 rounded-2xl w-96 mx-auto" />
          <div className="h-6  bg-white/10 rounded-xl w-64 mx-auto" />
          <div className="flex gap-4 justify-center mt-6">
            <div className="h-14 bg-white/20 rounded-2xl w-40" />
            <div className="h-14 bg-white/10 rounded-2xl w-40" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
