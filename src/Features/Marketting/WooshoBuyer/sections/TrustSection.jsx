import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, CreditCard, Truck, MessageCircle } from 'lucide-react';
import WS_IMG from '../../../../assets/marketing/mktimg3.png';

// FIX: removed duplicate gsap.registerPlugin(ScrollTrigger)

// ─── Image: public/1000174262.png ─────────────────────────────────────────────
// Panel 5: bottom-left → background-position: 0% 100%
const PANEL_5 = {
  backgroundImage: `url(${WS_IMG})`,
  backgroundSize: '200% 315%',
  backgroundPosition: '0% 100%',
  backgroundRepeat: 'no-repeat',
};

const ITEMS = [
  {
    icon: Shield,
    text: 'Secure Payments',
    sub: 'Paystack & Stripe — bank-grade encryption',
    color: '#6366f1',
  },
  {
    icon: CreditCard,
    text: '₦ & $ Pricing',
    sub: 'Naira and Dollar checkout supported',
    color: '#10b981',
  },
  {
    icon: Truck,
    text: 'Fast Delivery',
    sub: 'Same-day Lagos · 48h nationwide',
    color: '#f59e0b',
  },
  {
    icon: MessageCircle,
    text: '24/7 Support',
    sub: 'WhatsApp & live chat, always on',
    color: '#ec4899',
  },
];

const steps = [
  { icon: Shield, label: 'Secure Payments' },
  { icon: Truck, label: 'Fast Delivery' },
  { icon: Shield, label: 'Trusted Service' },
]

const TrustSection = () => {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const contentRef = useRef(null);
  const itemsRef = useRef([]);
  const [imgHov, setImgHov] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 78%' };

      gsap.fromTo(imgRef.current,
        { x: -36, opacity: 0, scale: 0.97 },
        { x: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power4.out', scrollTrigger: trigger });

      gsap.fromTo(contentRef.current,
        { x: 30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.75, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 74%' }
        });

      gsap.fromTo(itemsRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.11, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 68%' },
        });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden"
      style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch" style={{ minHeight: 380 }}>

          {/* ── Left: Brand Photo ──────────────────────────────── */}
          <div
            ref={imgRef}
            className="relative overflow-hidden"
            style={{
              borderRadius: '0 0 0 0',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={() => setImgHov(true)}
            onMouseLeave={() => setImgHov(false)}
          >
            {/* Image */}
            <div
              className="absolute inset-0"
              style={{
                ...PANEL_5,
                transform: imgHov ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.7s cubic-bezier(.4,0,.2,1)',
              }}
            />

            {/* Overlay gradient — right edge fade into dark section */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, transparent 55%, rgba(10,10,10,0.85) 100%), ' +
                  'linear-gradient(to top, rgba(10,10,10,0.5) 0%, transparent 55%)',
              }}
            />

            {/* Trust badge strip — floats at bottom, mirrors image baked-in badges */}
            <div
              className="absolute bottom-0 left-0 right-0 px-6 py-5"
              style={{
                background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 100%)',
              }}
            >
              <div className="flex items-center gap-5 flex-wrap">
                {steps.map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Icon size={13} color="rgba(255,255,255,0.7)" />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'rgba(255,255,255,0.65)' }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Trust Items ────────────────────────────── */}
          <div
            ref={contentRef}
            className="flex flex-col justify-center px-8 md:px-12 py-14 gap-8"
          >
            <div>
              <p
                className="text-xs font-black uppercase tracking-widest mb-3"
                style={{ color: '#4b5563' }}
              >
                Why you can trust us
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                Your Safety Is <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Our Priority
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {ITEMS.map(({ icon: Icon, text, sub, color }, i) => (
                <div
                  key={i}
                  ref={el => (itemsRef.current[i] = el)}
                  className="group flex items-start gap-3.5 p-4 rounded-2xl transition-all duration-300"
                  style={{
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${color}44`;
                    e.currentTarget.style.background = `${color}0B`;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 8px 28px ${color}18`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}30`,
                      boxShadow: `0 0 12px ${color}18`,
                    }}
                  >
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{text}</div>
                    <div className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
