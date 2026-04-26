import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// FIX: removed gsap.registerPlugin(ScrollTrigger) — registered once in SellerLanding.jsx

const CITIES = [
  { name: 'Lagos', cx: 72, cy: 310, sellers: '12,400', r: 10 },
  { name: 'Abuja', cx: 215, cy: 218, sellers: '8,200', r: 8 },
  { name: 'Kano', cx: 220, cy: 100, sellers: '5,600', r: 7 },
  { name: 'Port Harcourt', cx: 175, cy: 340, sellers: '4,900', r: 7 },
  { name: 'Ibadan', cx: 105, cy: 265, sellers: '3,700', r: 6 },
  { name: 'Kaduna', cx: 200, cy: 145, sellers: '2,800', r: 6 },
  { name: 'Enugu', cx: 210, cy: 300, sellers: '2,300', r: 5 },
  { name: 'Warri', cx: 145, cy: 330, sellers: '1,900', r: 5 },
];

const stats = [
  { value: '36', label: 'States covered', color: '#6366f1' },
  { value: '60K+', label: 'Active sellers', color: '#10b981' },
  { value: '2.4M', label: 'Buyers reached', color: '#f59e0b' },
  { value: '48h', label: 'Avg. payout', color: '#ec4899' },
]

export default function Section6_Map() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const anim1 = gsap.fromTo(
        '.map-city',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.7)', paused: true }
      );
      
      const anim2 = gsap.fromTo(
        '.map-stat',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'expo.out', delay: 0.5, paused: true }
      );

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          anim1.play();
          anim2.play();
          observer.disconnect();
        }
      }, { threshold: 0.15 });

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
      
      return () => observer.disconnect();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-16 py-28"
      style={{ background: '#000' }}
    >
      <div className="text-center mb-14 max-w-2xl">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
          style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          🌍 Nationwide
        </div>
        <h2
          className="font-black tracking-tight text-white mb-4"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}
        >
          Nigeria is lighting up
        </h2>
        <p style={{ color: '#6b7280', fontSize: 16 }}>
          From Lagos to Kano — 60,000+ sellers are already growing their businesses on Woosho.
        </p>
      </div>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12">
        {/* SVG Map */}
        <div className="relative flex-shrink-0" style={{ width: 340, height: 420 }}>
          <div style={{
            position: 'absolute', inset: -20,
            background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <svg viewBox="0 0 340 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <path
              d="M60 80 L120 40 L200 35 L270 60 L310 110 L320 180 L300 250 L280 310 L240 370 L200 400 L160 395 L110 370 L70 320 L40 260 L30 190 L45 130 Z"
              fill="rgba(16,185,129,0.04)"
              stroke="rgba(16,185,129,0.2)"
              strokeWidth="1.5"
            />
            <path
              d="M100 120 L260 120 M80 200 L290 200 M60 280 L280 280 M170 40 L170 400"
              stroke="rgba(16,185,129,0.06)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />

            {CITIES.map((city, i) => (
              <g key={city.name} className="map-city" style={{ transformOrigin: `${city.cx}px ${city.cy}px` }}>
                <circle cx={city.cx} cy={city.cy} r={city.r * 2.5} fill="rgba(16,185,129,0.08)">
                  <animate attributeName="r" values={`${city.r * 1.5};${city.r * 3};${city.r * 1.5}`} dur="2.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                </circle>
                <circle cx={city.cx} cy={city.cy} r={city.r} fill="#10b981" opacity="0.9" />
                <circle cx={city.cx} cy={city.cy} r={city.r * 0.5} fill="#fff" opacity="0.8" />
                <text x={city.cx + city.r + 5} y={city.cy + 4} fontSize="9" fill="#9ca3af" fontWeight="600" fontFamily="Inter, sans-serif">
                  {city.name}
                </text>
              </g>
            ))}

            {CITIES.slice(1).map((city) => (
              <line
                key={city.name}
                x1={CITIES[0].cx} y1={CITIES[0].cy}
                x2={city.cx} y2={city.cy}
                stroke="rgba(16,185,129,0.12)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
            ))}
          </svg>
        </div>

        {/* City list + Stats */}
        <div className="flex-1 w-full">
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Top seller cities
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CITIES.slice(0, 5).map((city) => (
                <div
                  key={city.name}
                  className="map-city"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0, boxShadow: '0 0 8px #10b981' }} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#f9fafb' }}>{city.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>{city.sellers}</span>
                  <span style={{ fontSize: 10, color: '#4b5563' }}>sellers</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {stats.map((s) => (
              <div
                key={s.label}
                className="map-stat"
                style={{
                  padding: '16px', borderRadius: 16,
                  background: `${s.color}0c`,
                  border: `1px solid ${s.color}20`,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}