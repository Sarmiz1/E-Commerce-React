import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-24 pb-32 px-6 font-serif">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-16">
          <h4 className="text-[#5636F3] font-sans font-bold uppercase tracking-widest text-sm mb-4">Legal</h4>
          <h1 className="text-5xl md:text-6xl font-normal text-gray-900 tracking-tight leading-tight mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-500 font-sans">
            Effective Date: October 24, 2026
          </p>
        </div>

        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 prose prose-lg prose-indigo max-w-none font-sans text-gray-600">
          
          <p className="text-xl leading-relaxed mb-10 text-gray-900">
            At Woosho, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our marketplace services.
          </p>

          <div className="flex items-start gap-4 mb-8 p-6 bg-[#F8F9FB] rounded-2xl">
            <Shield className="w-8 h-8 text-[#5636F3] shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 mt-0">Our Core Promise</h3>
              <p className="m-0 text-sm">We will never sell your personal data to third parties. Your trust is our most valuable asset.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Information We Collect</h2>
          <p>We collect information that you provide directly to us when you register for an account, make a purchase, or communicate with us.</p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>Account Data:</strong> Name, email address, password, phone number.</li>
            <li><strong>Transaction Data:</strong> Payment details, shipping address, billing address.</li>
            <li><strong>Interaction Data:</strong> Customer support logs, chat transcripts with Woosho AI.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect primarily to provide, maintain, and improve our services.</p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li>To process your transactions and send related information.</li>
            <li>To personalize your AI shopping experience and recommend products.</li>
            <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Data Security</h2>
          <p>We implement robust, industry-standard security measures including end-to-end encryption to protect your personal information from unauthorized access, alteration, or disclosure.</p>

          <hr className="my-12 border-gray-100" />

          <p className="text-sm text-gray-400">
            If you have questions or comments about this Privacy Policy, please contact our Data Protection Officer at privacy@woosho.com.
          </p>
        </div>

      </div>
    </div>
  );
}
