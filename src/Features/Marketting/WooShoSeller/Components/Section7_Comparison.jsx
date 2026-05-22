import React, { useRef, useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { SELLER_OLD_WAY, SELLER_WOOSHO_WAY } from '../Data/sectionsData.jsx';

/**
 * Section7_Comparison
 * ──────────────────────────────────────────────────────────────
 * Chrome Android GPU fix:
 *   - `isolation: isolate` creates a fresh stacking context so
 *     this section's compositing is isolated from adjacent heavy
 *     sections (SectionB_Delivery's scale animation, gradient
 *     overlays, etc.).
 *   - `contain: layout style paint` limits Chrome's compositor
 *     to only this subtree.
 *   - ALL rgba() backgrounds replaced with pre-computed solid
 *     colors against #07070f, eliminating alpha-blend passes.
 *   - No GSAP, no framer-motion, no GPU layer hints.
 *   - Simple CSS opacity transitions for reveal.
 * ──────────────────────────────────────────────────────────────
 */
export default function Section7_Comparison() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-16 py-28"
      style={{
        background: '#07070f',
        isolation: 'isolate',
        contain: 'layout style paint',
      }}
    >
      <div className="text-center mb-16 max-w-3xl">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
          style={{ background: '#1a0a0e', color: '#f87171', border: '1px solid #2d1018' }}
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
          background: '#0d0710',
          border: '1px solid #2a101a',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 24, paddingBottom: 16,
            borderBottom: '1px solid #2a101a',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2a101a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} color="#ef4444" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              What you're doing now
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SELLER_OLD_WAY.map((item, i) => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                background: '#130a12',
                border: '1px solid #1f0d15',
                opacity: visible ? 1 : 0,
                transition: `opacity 0.45s ease ${i * 0.07}s`,
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
          background: '#080f0e',
          border: '1px solid #0e2a22',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 24, paddingBottom: 16,
            borderBottom: '1px solid #0c2219',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0c2219', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={14} color="#10b981" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              What Woosho gives you
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SELLER_WOOSHO_WAY.map((item, i) => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                background: '#091410',
                border: '1px solid #0d1f18',
                opacity: visible ? 1 : 0,
                transition: `opacity 0.45s ease ${(SELLER_OLD_WAY.length + i) * 0.07}s`,
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
        background: '#0d0d18',
        border: '1px solid #191740',
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
