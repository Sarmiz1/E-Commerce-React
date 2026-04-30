import React, { useRef, useEffect, useState } from 'react';
import { Check, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { SELLER_PRICING_PLANS } from '../Data/sectionsData.jsx';

// FIX: removed gsap.registerPlugin(ScrollTrigger) — registered once in SellerLanding.jsx
// FIX: removed imperative style.opacity mutations in onMouseEnter/onMouseLeave handlers.
//      Those wrote directly to the DOM node bypassing React, which means React's
//      next render pass would silently overwrite the value, causing inconsistent
//      hover states. Replaced with a CSS class + :hover rule — the browser handles
//      it natively with no React involvement needed.

export default function Section8_Pricing() {
  const sectionRef = useRef(null);
  const [hovered, setHovered] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pricing-card',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'expo.out',
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
      style={{ background: '#0c0c14' }}
    >
      {/* FIX: pricing button hover rule — CSS :hover instead of JS DOM mutation */}
      <style>{`
        .pricing-btn { transition: opacity 0.2s ease; }
        .pricing-btn:hover { opacity: 0.82; }
      `}</style>

      <div className="text-center mb-16 max-w-2xl">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
          style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          💎 Pricing
        </div>
        <h2
          className="font-black tracking-tight text-white mb-4"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}
        >
          Start free. Grow when ready.
        </h2>
        <p style={{ color: '#6b7280', fontSize: 16 }}>No hidden fees. Cancel anytime. Payouts in 48 hours.</p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {SELLER_PRICING_PLANS.map((plan, i) => (
          <div
            key={plan.name}
            className="pricing-card"
            onMouseEnter={() => setHovered(i)}
            style={{
              borderRadius: 28, padding: '32px',
              background: plan.featured
                ? 'linear-gradient(160deg, rgba(99,102,241,0.12) 0%, rgba(17,17,24,1) 60%)'
                : 'rgba(255,255,255,0.02)',
              border: `1px solid ${hovered === i ? plan.color + '60' : (plan.featured ? plan.color + '40' : 'rgba(255,255,255,0.07)')}`,
              boxShadow: plan.featured ? `0 0 60px ${plan.color}18` : 'none',
              transform: plan.featured ? 'scale(1.03)' : 'scale(1)',
              transition: 'all 0.3s',
              display: 'flex', flexDirection: 'column',
              position: 'relative',
            }}
          >
            {plan.badge && (
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: plan.color,
                color: plan.featured ? '#fff' : '#000',
                fontSize: 10, fontWeight: 900,
                padding: '5px 16px', borderRadius: 99,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}>
                {plan.badge}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                {plan.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{plan.priceNote}</span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {plan.perks.map((perk) => (
                <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 6,
                    background: `${plan.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Check size={10} color={plan.color} />
                  </div>
                  <span style={{ fontSize: 13, color: '#d1d5db' }}>{perk}</span>
                </div>
              ))}
            </div>

            {/* FIX: removed onMouseEnter/onMouseLeave style.opacity mutation — CSS handles it */}
            <button
              className="pricing-btn"
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                border: plan.ctaBorder || 'none',
                background: plan.ctaBg, color: plan.ctaColor,
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              onClick={() => navigate(plan.regLink)}
            >
              {plan.featured && <Zap size={14} />}
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 32, fontSize: 12, color: '#4b5563', textAlign: 'center' }}>
        All plans include bank-grade payment security · Powered by Paystack &amp; Stripe
      </p>
    </div>
  );
}
