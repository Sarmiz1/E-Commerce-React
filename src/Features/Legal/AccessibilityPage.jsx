import React, { useState } from 'react';
import { Eye, Type, Contrast, Monitor } from 'lucide-react';

export default function AccessibilityPage() {
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div className={`min-h-screen pt-24 pb-32 px-6 font-sans transition-colors duration-500 ${highContrast ? 'bg-black text-yellow-400' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight mb-4 ${highContrast ? 'text-white' : 'text-gray-900'}`}>
              Accessibility <br/>Statement
            </h1>
            <p className={`text-xl ${highContrast ? 'text-yellow-200' : 'text-gray-500'}`}>
              Woosho is committed to digital inclusion for all.
            </p>
          </div>
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className={`p-4 rounded-full border-2 font-bold flex items-center gap-2 ${highContrast ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'} transition-colors`}
          >
            <Contrast className="w-6 h-6" /> <span className="hidden md:inline">Toggle Contrast</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          <div className={`p-8 rounded-2xl border-4 ${highContrast ? 'border-yellow-400 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
            <Type className={`w-10 h-10 mb-6 ${highContrast ? 'text-white' : 'text-[#5636F3]'}`} />
            <h3 className={`text-2xl font-bold mb-3 ${highContrast ? 'text-white' : 'text-gray-900'}`}>Legible Typography</h3>
            <p className={highContrast ? 'text-yellow-200' : 'text-gray-600'}>
              Our interface uses high-contrast typography scaling to ensure readability across all devices.
            </p>
          </div>

          <div className={`p-8 rounded-2xl border-4 ${highContrast ? 'border-yellow-400 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
            <Monitor className={`w-10 h-10 mb-6 ${highContrast ? 'text-white' : 'text-[#5636F3]'}`} />
            <h3 className={`text-2xl font-bold mb-3 ${highContrast ? 'text-white' : 'text-gray-900'}`}>Screen Readers</h3>
            <p className={highContrast ? 'text-yellow-200' : 'text-gray-600'}>
              ARIA landmarks and semantic HTML ensure seamless navigation for screen reader users.
            </p>
          </div>

        </div>

        <div className="space-y-6">
          <h2 className={`text-3xl font-extrabold ${highContrast ? 'text-white' : 'text-gray-900'}`}>Conformance Status</h2>
          <p className={`text-lg leading-relaxed ${highContrast ? 'text-yellow-200' : 'text-gray-600'}`}>
            The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. Woosho is partially conformant with WCAG 2.1 level AA.
          </p>
          
          <h2 className={`text-3xl font-extrabold pt-8 ${highContrast ? 'text-white' : 'text-gray-900'}`}>Feedback</h2>
          <p className={`text-lg leading-relaxed ${highContrast ? 'text-yellow-200' : 'text-gray-600'}`}>
            We welcome your feedback on the accessibility of Woosho. Please let us know if you encounter accessibility barriers:
          </p>
          <ul className={`text-lg list-disc pl-6 font-bold ${highContrast ? 'text-yellow-400' : 'text-[#5636F3]'}`}>
            <li>Email: accessibility@woosho.com</li>
            <li>Phone: +234 (0) 800 WOOSHO</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
