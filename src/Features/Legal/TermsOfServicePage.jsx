import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-32 px-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-32">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Contents</h3>
            <nav className="space-y-4 text-sm font-semibold text-gray-500">
              <a href="#agreement" className="block text-[#5636F3]">1. Agreement to Terms</a>
              <a href="#intellectual" className="block hover:text-gray-900 transition-colors">2. Intellectual Property Rights</a>
              <a href="#userrep" className="block hover:text-gray-900 transition-colors">3. User Representations</a>
              <a href="#products" className="block hover:text-gray-900 transition-colors">4. Products and Pricing</a>
              <a href="#dispute" className="block hover:text-gray-900 transition-colors">5. Dispute Resolution</a>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <div className="mb-16 border-b border-gray-100 pb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-bold text-gray-600 mb-6">
              <FileText className="w-4 h-4" /> Legal Document
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-500 text-lg">Last updated: October 2026</p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-12">
            
            <section id="agreement">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p>
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Woosho (“Company,” “we,” “us,” or “our”), concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
              </p>
            </section>

            <section id="intellectual">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">2. Intellectual Property Rights</h2>
              <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us.
              </p>
            </section>

            <section id="userrep">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">3. User Representations</h2>
              <p>
                By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
              </p>
            </section>

            <div className="bg-[#F8F9FB] rounded-2xl p-8 border border-gray-200 mt-12">
              <h3 className="font-bold text-gray-900 mb-2">Need Clarification?</h3>
              <p className="text-sm mb-4">Our support team is available 24/7 to help you understand our terms.</p>
              <button className="text-[#5636F3] font-bold text-sm hover:underline flex items-center gap-1">
                Contact Support <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
