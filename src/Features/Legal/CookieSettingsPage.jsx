import React, { useState } from 'react';
import { Cookie, Settings, Check, X } from 'lucide-react';

export default function CookieSettingsPage() {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: true,
    marketing: false,
    personalization: true
  });

  const togglePref = (key) => {
    if (key === 'essential') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-[#111827] min-h-screen pt-24 pb-32 px-6 font-sans text-gray-300">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-12">
          <Cookie className="w-12 h-12 text-[#5636F3] mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Cookie Preferences
          </h1>
          <p className="text-lg text-gray-400">
            We use cookies to ensure you get the best experience on our website. Control your data below.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Essential */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex items-start justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                Strictly Necessary <span className="bg-[#5636F3] text-white text-[10px] uppercase px-2 py-0.5 rounded font-bold tracking-widest">Required</span>
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you.
              </p>
            </div>
            <div className="w-12 h-6 bg-[#5636F3] rounded-full relative opacity-50 cursor-not-allowed shrink-0">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex items-start justify-between gap-6 hover:bg-white/10 transition-colors">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Analytics Cookies</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.
              </p>
            </div>
            <button onClick={() => togglePref('analytics')} className={`w-12 h-6 rounded-full relative shrink-0 transition-colors duration-300 ${preferences.analytics ? 'bg-[#5636F3]' : 'bg-gray-600'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${preferences.analytics ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>

          {/* Marketing */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex items-start justify-between gap-6 hover:bg-white/10 transition-colors">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Marketing Cookies</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests.
              </p>
            </div>
            <button onClick={() => togglePref('marketing')} className={`w-12 h-6 rounded-full relative shrink-0 transition-colors duration-300 ${preferences.marketing ? 'bg-[#5636F3]' : 'bg-gray-600'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${preferences.marketing ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>

        </div>

        <div className="mt-12 flex justify-end">
          <button className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
