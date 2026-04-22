import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart2, Bot, Zap, Globe, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Bot,
    label: 'AI Sales Assistant',
    color: '#6366f1',
    headline: 'Never miss a sale again',
    desc: 'Your AI handles every buyer question — size, availability, shipping — instantly and accurately, 24/7. Converts more browsers into buyers without you lifting a finger.',
    img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=500&q=80',
    stat: { value: '3×', label: 'More conversions' },
  },
  {
    icon: Zap,
    label: 'AI Listing Writer',
    color: '#f59e0b',
    headline: 'Perfect listings in 10 seconds',
    desc: 'Snap a photo, describe your product briefly, and Woosho AI writes a fully optimised, SEO-rich listing that ranks and sells. No copywriting skills needed.',
    img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&q=80',
    stat: { value: '10s', label: 'To publish' },
  },
  {
    icon: BarChart2,
    label: 'Smart Analytics',
    color: '#10b981',
    headline: 'Know exactly what to stock',
    desc: 'Real-time demand signals, pricing intelligence, and competitor tracking give you the edge. Stop guessing — start growing with data that actually makes sense.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80',
    stat: { value: '40%', label: 'Revenue lift' },
  },
  {
    icon: Globe,
    label: 'Social Commerce Feed',
    color: '#ec4899',
    headline: 'Your products, everywhere',
    desc: 'Your store automatically syncs to the Woosho social feed, reaching 2.4 million active buyers who are scrolling, discovering, and buying right now.',
    img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&q=80',
    stat: { value: '2.4M', label: 'Active buyers' },
  },
];

export default function Section4_Features() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.sf-header', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const feat = FEATURES[active];

  return (
    <div ref={sectionRef} className="w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-16 py-28" style={{ background: '#0c0c14' }}>
      {/* Header */}
      <div className="sf-header text-center mb-16 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
          ✦ Platform Features
        </div>
        <h2 className="font-black tracking-tight text-white mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>
          Features built for outcomes
        </h2>
        <p style={{ color: '#6b7280', fontSize: 16 }}>Every tool designed to make you more money with less effort.</p>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
        {/* Tab list */}
        <div className="flex flex-row lg:flex-col gap-3 lg:w-64 flex-shrink-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  background: active === i ? `${f.color}18` : 'rgba(255,255,255,0.03)',
                  borderLeft: active === i ? `3px solid ${f.color}` : '3px solid transparent',
                  transition: 'all 0.2s',
                  minWidth: 180, flexShrink: 0,
                  textAlign: 'left',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: active === i ? `${f.color}22` : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={active === i ? f.color : '#6b7280'} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: active === i ? '#f9fafb' : '#6b7280', whiteSpace: 'nowrap' }}>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ borderRadius: 28, overflow: 'hidden', border: `1px solid ${feat.color}22`, background: '#111118' }}
            >
              {/* Image */}
              <div style={{ height: 260, position: 'relative', overflow: 'hidden' }}>
                <img src={feat.img} alt={feat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, #111118 0%, rgba(17,17,24,0.3) 60%, transparent 100%)` }} />
                <div style={{ position: 'absolute', inset: 0, background: `${feat.color}18` }} />
                {/* Stat badge */}
                <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: `1px solid ${feat.color}44`, borderRadius: 14, padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: feat.color }}>{feat.stat.value}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{feat.stat.label}</div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '28px 32px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  {React.createElement(feat.icon, { size: 18, color: feat.color })}
                  <span style={{ fontSize: 11, fontWeight: 800, color: feat.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{feat.label}</span>
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>{feat.headline}</h3>
                <p style={{ fontSize: 15, color: '#9ca3af', lineHeight: 1.75, marginBottom: 24 }}>{feat.desc}</p>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: feat.color, color: '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                  Learn more <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
