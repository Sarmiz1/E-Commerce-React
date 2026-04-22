import React from 'react';
import { Map, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SitemapPage() {
  const map = [
    {
      category: "Shop",
      links: [
        { name: "All Products", path: "/products" },
        { name: "New Arrivals", path: "/new" },
        { name: "Bestsellers", path: "/bestsellers" },
        { name: "Gift Cards", path: "/gift-cards" }
      ]
    },
    {
      category: "Customer Support",
      links: [
        { name: "Contact Us", path: "/contact" },
        { name: "Track Your Order", path: "/track-order" },
        { name: "Returns & Exchanges", path: "/returns" },
        { name: "Size Guide", path: "/size-guide" },
        { name: "AI Shopping", path: "/ai-shop" }
      ]
    },
    {
      category: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Careers", path: "/careers" },
        { name: "Admin Dashboard", path: "/admin" }
      ]
    },
    {
      category: "Legal & Privacy",
      links: [
        { name: "Privacy Policy", path: "/privacy-policy" },
        { name: "Terms of Service", path: "/terms-of-service" },
        { name: "Cookie Settings", path: "/cookie-settings" },
        { name: "Accessibility", path: "/accessibility" }
      ]
    }
  ];

  return (
    <div className="bg-[#F8F9FB] min-h-screen pt-24 pb-32 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-20">
          <Map className="w-12 h-12 text-[#5636F3] mx-auto mb-6" />
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Site Map</h1>
          <p className="text-gray-500 text-lg">Navigate the Woosho ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {map.map((section, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                {section.category}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      to={link.path}
                      className="group flex items-center justify-between text-gray-500 hover:text-[#5636F3] font-medium transition-colors"
                    >
                      {link.name}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
