import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart2, Bot, Zap, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    id: 'analytics',
    icon: BarChart2,
    label: 'Smart Analytics',
    color: '#10b981',
    headline: 'Know exactly what to stock',
    desc: 'Real-time demand signals and competitor tracking give you the edge. Stop guessing — start growing.',
    stat: { value: '40%', label: 'Revenue lift' },
    url: '/sell/smart-analytics',
    colSpan: 'lg:col-span-2',
    rowSpan: 'lg:row-span-1'
  },
  {
    id: 'writer',
    icon: Zap,
    label: 'AI Listing Writer',
    color: '#f59e0b',
    headline: 'Perfect listings in 10s',
    desc: 'Snap a photo, describe it briefly, and Woosho AI writes a fully optimised, SEO-rich listing that ranks and sells.',
    stat: { value: '10s', label: 'To publish' },
    url: '/sell/ai-listing-writer',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-2'
  },
  {
    id: 'assistant',
    icon: Bot,
    label: 'AI Sales Assistant',
    color: '#6366f1',
    headline: 'Never miss a sale',
    desc: 'Handles every buyer question — size, availability, shipping — instantly and accurately, 24/7.',
    stat: { value: '3×', label: 'More conversions' },
    url: '/sell/sales-assistant',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1'
  },
  {
    id: 'social',
    icon: Globe,
    label: 'Social Commerce',
    color: '#ec4899',
    headline: 'Your products, everywhere',
    desc: 'Automatically syncs to the Woosho social feed, reaching 2.4 million active buyers globally.',
    stat: { value: '2.4M', label: 'Active buyers' },
    url: '/sell/social-commerce-feed',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1'
  },
];

export default function Section4_Features() {
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.sf-header',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-16 py-32 bg-[#0c0c14] overflow-hidden"
    >
      {/* Header */}
      <div className="sf-header text-center mb-20 max-w-2xl relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          ✦ Platform Features
        </div>
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
          Features built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">outcomes</span>
        </h2>
        <p className="text-gray-400 text-lg">Every tool designed to make you more money with less effort.</p>
      </div>

      {/* Bento Box Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-1 lg:grid-rows-2 gap-6 relative z-10">
        {FEATURES.map((feat, idx) => (
          <motion.div
            key={feat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-50px" }}
            className={`group relative rounded-[32px] p-8 overflow-hidden bg-[#111118] border border-white/5 hover:border-${feat.color}/30 transition-all duration-500 flex flex-col justify-between ${feat.colSpan} ${feat.rowSpan}`}
          >
            {/* Background Hover Glow */}
            <div 
              className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
              style={{ backgroundColor: feat.color }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${feat.color}15` }}
                >
                  <feat.icon size={24} color={feat.color} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ color: feat.color }}>{feat.stat.value}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{feat.stat.label}</div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{feat.headline}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">{feat.desc}</p>
            </div>

            <div className="relative z-10 mt-auto">
              <button 
                onClick={() => navigate(feat.url)}
                className="flex items-center gap-2 text-sm font-bold text-white/70 group-hover:text-white transition-colors"
              >
                Explore feature 
                <motion.div 
                  className="inline-block"
                  whileHover={{ x: 5 }}
                >
                  <ArrowRight size={16} style={{ color: feat.color }} />
                </motion.div>
              </button>
            </div>

            {/* Micro Animations based on Card Type */}
            {feat.id === 'analytics' && (
              <div className="absolute right-0 bottom-0 w-1/2 h-1/2 opacity-20 pointer-events-none flex items-end justify-around p-6 gap-2">
                {[40, 70, 45, 90, 60, 100].map((h, i) => (
                  <motion.div 
                    key={i} 
                    className="w-full bg-[#10b981] rounded-t-sm"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    viewport={{ once: true }}
                  />
                ))}
              </div>
            )}

            {feat.id === 'writer' && (
              <div className="absolute inset-x-0 bottom-0 h-1/3 opacity-10 pointer-events-none p-6">
                <motion.div 
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1 bg-[#f59e0b] mb-3"
                />
                <motion.div 
                  animate={{ width: ["0%", "80%", "0%"] }}
                  transition={{ duration: 3, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1 bg-[#f59e0b] mb-3"
                />
                <motion.div 
                  animate={{ width: ["0%", "60%", "0%"] }}
                  transition={{ duration: 3, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1 bg-[#f59e0b]"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}