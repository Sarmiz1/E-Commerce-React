import React, { useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SELLER_OLD_WAY, SELLER_WOOSHO_WAY } from '../Data/sectionsData.jsx';

// FIX: removed gsap.registerPlugin(ScrollTrigger) — registered once in SellerLanding.jsx

export default function Section7_Comparison() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.comp-row',
        { x: -20, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-16 py-28"
      style={{ background: '#07070f' }}
    >
      <div className="text-center mb-16 max-w-3xl">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          ⚡ The Switch
        </div>
        <h2
          className="font-black tracking-tight text-white"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.1 }}
        >
          Your current setup is costing you<br />
          <span style={{ color: '#ef4444' }}>more than you think.</span>
        </h2>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Old way */}
        <div style={{
          borderRadius: 24, padding: '32px',
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.15)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 24, paddingBottom: 16,
            borderBottom: '1px solid rgba(239,68,68,0.15)',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} color="#ef4444" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              What you're doing now
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SELLER_OLD_WAY.map((item) => (
              <div key={item} className="comp-row" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.1)',
              }}>
                <X size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Woosho way */}
        <div style={{
          borderRadius: 24, padding: '32px',
          background: 'rgba(16,185,129,0.04)',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 0 60px rgba(16,185,129,0.05)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 24, paddingBottom: 16,
            borderBottom: '1px solid rgba(16,185,129,0.15)',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={14} color="#10b981" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              What Woosho gives you
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SELLER_WOOSHO_WAY.map((item) => (
              <div key={item} className="comp-row" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.12)',
              }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="#fff" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom callout */}
      <div style={{
        marginTop: 48, padding: '20px 32px', borderRadius: 20,
        background: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(99,102,241,0.2)',
        textAlign: 'center', maxWidth: 500,
      }}>
        <p style={{ fontSize: 15, color: '#c7d2fe', fontWeight: 600, lineHeight: 1.6 }}>
          Sellers who switch to Woosho see{' '}
          <span style={{ color: '#818cf8', fontWeight: 900 }}>3× more sales</span>{' '}
          in the first 30 days.
        </p>
      </div>
    </div>
  );
}
