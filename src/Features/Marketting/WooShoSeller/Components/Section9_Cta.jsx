import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Section9_Cta() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-t from-blue-900/20 to-[#0a0a0a] pt-20">
       <div className="max-w-3xl text-center">
         <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-8">Your Business Is Waiting for This.</h2>
         <p className="text-xl text-gray-400 leading-relaxed mb-12">
            Right now, 60,000 buyers are scrolling the Woo Sho feed. Some of them are looking for exactly what you sell. They just can't find you yet.
         </p>
         
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button className="px-10 py-5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:scale-105 transition-all text-xl flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(37,99,235,0.5)]">
              Create My Store — It's Free <ArrowRight size={24} />
            </button>
         </div>

         <div className="inline-flex gap-6 text-sm font-semibold text-gray-500 uppercase tracking-widest mt-8 flex-wrap justify-center">
            <span>✓ No credit card needed</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Payout in 48hrs</span>
         </div>
       </div>
    </div>
  );
}
