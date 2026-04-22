import React from 'react';
import { RefreshCcw, Box, Truck, Check, HelpCircle, AlertTriangle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="bg-white text-gray-900 font-sans pb-24">
      {/* Hero Section */}
      <div className="bg-[#111827] text-white py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <RefreshCcw className="w-12 h-12 mx-auto mb-6 text-gray-400" />
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">Returns & Exchanges</h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Not quite right? No problem. We offer a hassle-free 30-day return policy for all unworn items.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-10">
        
        {/* Action Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-24">
          <div>
            <h2 className="text-3xl font-extrabold mb-2">Start a Return</h2>
            <p className="text-gray-500 text-lg">Have your order number and email ready.</p>
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <input type="text" placeholder="Order #" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 w-full md:w-48 outline-none focus:border-[#5636F3] transition-colors" />
            <button className="bg-[#5636F3] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#4323E0] transition-colors whitespace-nowrap">
              Begin Process
            </button>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-24">
          <h2 className="text-4xl font-extrabold text-center mb-16">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-100 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                <Box className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Pack it up</h3>
              <p className="text-gray-500">Place items securely in their original packaging with tags attached.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#F1EEFE] rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                <Truck className="w-8 h-8 text-[#5636F3]" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Ship it off</h3>
              <p className="text-gray-500">Use the pre-paid shipping label and drop it off at any partner location.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                <Check className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Get refunded</h3>
              <p className="text-gray-500">Receive your refund within 3-5 business days once we inspect the item.</p>
            </div>
          </div>
        </div>

        {/* Policy Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-50 rounded-[2rem] p-8 md:p-16">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <Check className="w-6 h-6 text-[#0DA56E]" /> Accepted Returns
            </h3>
            <ul className="space-y-4 text-gray-600 font-medium">
              <li>• Unworn, unwashed, and unaltered items</li>
              <li>• Items with original tags still attached</li>
              <li>• Initiated within 30 days of delivery</li>
              <li>• Footwear in its original shoebox</li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-[#EE4545]" /> Non-Returnable
            </h3>
            <ul className="space-y-4 text-gray-600 font-medium">
              <li>• Intimates, swimwear, and bodysuits</li>
              <li>• Final sale and clearance items</li>
              <li>• Gift cards</li>
              <li>• Items damaged post-delivery</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
