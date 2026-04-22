import React, { useState } from 'react';
import { Ruler, Shirt, User, Info } from 'lucide-react';

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState('women');

  return (
    <div className="bg-white min-h-screen pt-24 pb-32 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-[#F1EEFE] rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Ruler className="w-8 h-8 text-[#5636F3]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
            Find Your Perfect Fit
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Use our comprehensive size guide to find the perfect measurements. If you're between sizes, we recommend sizing up for a relaxed fit.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl">
            {['women', 'men', 'kids'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Measuring Guide Banner */}
        <div className="bg-[#111827] text-white rounded-3xl p-8 md:p-10 mb-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <Info className="w-6 h-6 text-[#5636F3]" /> How to Measure
            </h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Grab a flexible measuring tape. Measure your bust at the fullest part, waist at the narrowest part, and hips at the widest part. Keep the tape comfortably loose.
            </p>
            <button className="text-white border-b-2 border-[#5636F3] pb-1 font-bold hover:text-[#5636F3] transition-colors">
              Watch Video Guide
            </button>
          </div>
          <div className="w-full md:w-1/3 aspect-square bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
             <User className="w-24 h-24 text-white/20" />
          </div>
        </div>

        {/* Size Table */}
        <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-widest font-bold">
                  <th className="py-5 px-6 border-b border-gray-200">Size</th>
                  <th className="py-5 px-6 border-b border-gray-200">US</th>
                  <th className="py-5 px-6 border-b border-gray-200">UK</th>
                  <th className="py-5 px-6 border-b border-gray-200">EU</th>
                  <th className="py-5 px-6 border-b border-gray-200">Bust (in)</th>
                  <th className="py-5 px-6 border-b border-gray-200">Waist (in)</th>
                  <th className="py-5 px-6 border-b border-gray-200">Hips (in)</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 font-medium">
                {[
                  { size: 'XS', us: '0-2', uk: '4-6', eu: '32-34', bust: '31-32', waist: '24-25', hips: '34-35' },
                  { size: 'S', us: '4-6', uk: '8-10', eu: '36-38', bust: '33-35', waist: '26-28', hips: '36-38' },
                  { size: 'M', us: '8-10', uk: '12-14', eu: '40-42', bust: '36-38', waist: '29-31', hips: '39-41' },
                  { size: 'L', us: '12-14', uk: '16-18', eu: '44-46', bust: '39-41', waist: '32-34', hips: '42-44' },
                  { size: 'XL', us: '16-18', uk: '20-22', eu: '48-50', bust: '42-44', waist: '35-37', hips: '45-47' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-6 border-b border-gray-100 font-bold text-[#5636F3]">{row.size}</td>
                    <td className="py-5 px-6 border-b border-gray-100">{row.us}</td>
                    <td className="py-5 px-6 border-b border-gray-100">{row.uk}</td>
                    <td className="py-5 px-6 border-b border-gray-100">{row.eu}</td>
                    <td className="py-5 px-6 border-b border-gray-100">{row.bust}</td>
                    <td className="py-5 px-6 border-b border-gray-100">{row.waist}</td>
                    <td className="py-5 px-6 border-b border-gray-100">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
