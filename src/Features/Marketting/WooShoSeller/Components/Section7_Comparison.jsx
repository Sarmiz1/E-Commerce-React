import React from 'react';

export default function Section7_Comparison() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0a0a0a] pt-20">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 text-center max-w-3xl">
        Your Current Setup Is Costing You More Than You Think.
      </h2>
      <div className="flex w-full max-w-5xl gap-8">
        <div className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 flex flex-col gap-4">
           <h3 className="text-red-400 font-bold mb-4 uppercase tracking-wider text-sm border-b border-neutral-800 pb-4">What you're doing now</h3>
           <div className="h-12 bg-red-900/20 border border-red-500/20 rounded flex items-center px-4 text-gray-300 line-through">Answering DMs manually</div>
           <div className="h-12 bg-red-900/20 border border-red-500/20 rounded flex items-center px-4 text-gray-300 line-through">Guessing product descriptions</div>
        </div>
        <div className="flex-1 bg-neutral-900/80 border border-neutral-700 rounded-2xl p-8 flex flex-col gap-4 shadow-xl">
           <h3 className="text-teal-400 font-bold mb-4 uppercase tracking-wider text-sm border-b border-neutral-700 pb-4">What Woo Sho gives you</h3>
           <div className="h-12 bg-teal-900/20 border border-teal-500/30 rounded flex items-center px-4 font-bold text-white shadow"><span className="text-teal-400 mr-2">✓</span> AI answers 24/7</div>
           <div className="h-12 bg-teal-900/20 border border-teal-500/30 rounded flex items-center px-4 font-bold text-white shadow"><span className="text-teal-400 mr-2">✓</span> AI writes optimised listings</div>
        </div>
      </div>
    </div>
  );
}
