import React from 'react';

export default function Section8_Pricing() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0E0E10] pt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Start Free. Grow When You're Ready.</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl">
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-gray-500 transition-colors">
          <h3 className="text-2xl font-bold mb-2">Starter</h3>
          <p className="text-3xl font-black mb-6">Free</p>
          <ul className="space-y-3 text-gray-400 font-medium mb-8">
            <li>✓ 20 listings</li>
            <li>✓ 50 AI credits/mo</li>
            <li>✓ 4% fee</li>
          </ul>
          <button className="w-full py-3 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-700 transition">Get Started</button>
        </div>
        
        <div className="flex-[1.2] bg-gradient-to-b from-blue-900/40 to-neutral-900 border border-blue-500/50 rounded-3xl p-8 relative shadow-2xl scale-105">
          <div className="absolute -top-4 inset-x-0 w-max mx-auto bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
          <h3 className="text-2xl font-bold mb-2">Growth</h3>
          <p className="text-3xl font-black mb-6">₦5,000<span className="text-sm text-gray-400 font-normal">/mo</span></p>
          <ul className="space-y-3 text-gray-300 font-medium mb-8">
            <li>✓ Unlimited listings</li>
            <li>✓ 500 AI credits/mo</li>
            <li>✓ 3.5% fee</li>
            <li>✓ AI pricing & API access</li>
          </ul>
          <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_0_20px_rgba(37,99,235,0.4)]">Start 14-Day Trial</button>
        </div>

        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-gray-500 transition-colors">
          <h3 className="text-2xl font-bold mb-2">Pro</h3>
          <p className="text-3xl font-black mb-6">₦12,000<span className="text-sm text-gray-400 font-normal">/mo</span></p>
          <ul className="space-y-3 text-gray-400 font-medium mb-8">
            <li>✓ Everything in Growth</li>
            <li>✓ Unlimited AI</li>
            <li>✓ 3% fee</li>
          </ul>
          <button className="w-full py-3 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-700 transition">Upgrade to Pro</button>
        </div>
      </div>
    </div>
  );
}
