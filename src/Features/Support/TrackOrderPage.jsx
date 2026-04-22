import React, { useState } from 'react';
import { Package, Truck, Search, MapPin, CheckCircle2, ChevronRight, Box } from 'lucide-react';

export default function TrackOrderPage() {
  const [tracking, setTracking] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!tracking) return;
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center pt-24 pb-12 px-6 font-sans">
      
      {/* Header Area */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-[#5636F3]">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Track Your Delivery
        </h1>
        <p className="text-gray-500 text-lg">
          Enter your order number or tracking ID to get real-time updates on your package.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="w-full max-w-3xl relative mb-24">
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-[#5636F3] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-16 pr-40 py-6 text-lg border-2 border-transparent bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] outline-none focus:border-[#5636F3] transition-all"
            placeholder="e.g. WOO-89302-XYZ"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="absolute right-3 top-3 bottom-3 bg-[#111827] hover:bg-[#374151] text-white px-8 rounded-2xl font-bold transition-all flex items-center gap-2"
          >
            {isSearching ? <span className="animate-pulse">Locating...</span> : 'Track'}
          </button>
        </div>
      </form>

      {/* Demo Timeline / Results Area */}
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-8 mb-10">
           <div>
             <h3 className="text-gray-500 text-sm font-bold tracking-widest uppercase mb-1">Order #WOO-89302-XYZ</h3>
             <h2 className="text-2xl font-extrabold text-gray-900">Arriving Tomorrow</h2>
           </div>
           <div className="mt-4 md:mt-0 text-right">
             <div className="text-sm font-semibold text-gray-500">Shipped via</div>
             <div className="text-lg font-bold text-gray-900 flex items-center justify-end gap-2">
                Woosho Express <MapPin className="w-5 h-5 text-[#5636F3]" />
             </div>
           </div>
        </div>

        {/* Stepper */}
        <div className="relative">
           {/* Line */}
           <div className="absolute left-[21px] top-4 bottom-4 w-1 bg-gray-100 rounded-full hidden md:block"></div>
           <div className="absolute left-[21px] top-4 h-1/2 w-1 bg-[#0DA56E] rounded-full hidden md:block"></div>

           <div className="space-y-12">
             {/* Step 1 */}
             <div className="flex items-start gap-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#0DA56E] flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Order Placed</h4>
                  <p className="text-gray-500 mt-1">We have received your order.</p>
                  <span className="text-xs font-bold text-gray-400 mt-2 block">OCT 12, 10:45 AM</span>
                </div>
             </div>

             {/* Step 2 */}
             <div className="flex items-start gap-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#0DA56E] flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Packed</h4>
                  <p className="text-gray-500 mt-1">Your items are securely packaged and ready.</p>
                  <span className="text-xs font-bold text-gray-400 mt-2 block">OCT 13, 09:12 AM</span>
                </div>
             </div>

             {/* Step 3 (Current) */}
             <div className="flex items-start gap-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white border-4 border-[#5636F3] flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                  <div className="w-3 h-3 bg-[#5636F3] rounded-full"></div>
                </div>
                <div className="bg-[#F1EEFE] p-5 rounded-2xl flex-1 border border-[#EAE5FE]">
                  <h4 className="text-lg font-bold text-[#5636F3]">Out for Delivery</h4>
                  <p className="text-[#5636F3]/80 mt-1 font-medium">Driver is currently in your neighborhood. Expected within 2 hours.</p>
                  <span className="text-xs font-bold text-[#5636F3]/60 mt-2 block">TODAY, 08:30 AM</span>
                </div>
             </div>

             {/* Step 4 */}
             <div className="flex items-start gap-6 relative z-10 opacity-50">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-400">Delivered</h4>
                  <p className="text-gray-400 mt-1">Package handed to resident.</p>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
