import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Users, Star } from 'lucide-react';
import WS_IMG from '../../../../assets/marketing/mktimg3.png';


gsap.registerPlugin(ScrollTrigger);

// ─── Image: public/1000174262.png ─────────────────────────────────────────────
// Panel 6: bottom-right → background-position: 100% 100%
const PANEL_6 = {
  backgroundImage: `url(${WS_IMG})`,
  backgroundSize: '209% 315%',
  backgroundPosition: '100% 100%',
  backgroundRepeat: 'no-repeat',
};

const FinalCtaSection = () => {
  const sectionRef  = useRef(null);
  const contentRef  = useRef(null);
  const headlineRef = useRef(null);
  const buttonsRef  = useRef(null);
  const statsRef    = useRef(null);
  const imgRef      = useRef(null);
  const [imgHov, setImgHov] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 62%' };

      gsap.fromTo(contentRef.current,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: trigger });

      gsap.fromTo(headlineRef.current,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 58%' } });

      gsap.fromTo(Array.from(buttonsRef.current?.children || []),
        { y: 18, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 55%' } });

      gsap.fromTo(statsRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 52%' } });

      gsap.fromTo(imgRef.current,
        { x: 48, opacity: 0, scale: 0.97 },
        { x: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power4.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' } });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ background: '#050508' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%', left: '30%',
          transform: 'translate(-50%,-50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-0">
        <div
          className="grid grid-cols-1 lg:grid-cols-2 items-stretch"
          style={{ minHeight: 600 }}
        >

          {/* ── Left: CTA Content ──────────────────────────────── */}
          <div
            ref={contentRef}
            className="flex flex-col justify-center py-20 pr-0 lg:pr-16"
          >
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest self-start mb-8"
              style={{
                background: 'rgba(99,102,241,0.12)',
                color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.22)',
              }}
            >
              <Users size={10} />
              Join thousands of happy shoppers
            </div>

            {/* Headline */}
            <h2
              ref={headlineRef}
              className="font-black text-white leading-[1.06] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
            >
              Stop Scrolling.{' '}
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg,#3b82f6 0%,#06b6d4 50%,#10b981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Start Smart <br /> Shopping.
              </span>
            </h2>

            <p className="text-neutral-400 text-lg leading-relaxed mb-10 max-w-sm">
              Join WooSho today — AI finds exactly what you want, from verified
              sellers, delivered fast across Nigeria.
            </p>

            {/* Buttons */}
            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                className="flex items-center justify-center gap-2.5 text-white px-9 py-4.5 rounded-full font-semibold text-base transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg,#2563eb,#0891b2)',
                  boxShadow: '0 6px 28px rgba(37,99,235,0.42)',
                  paddingTop: 17, paddingBottom: 17,
                }}
              >
                Try WooSho Now
                <ArrowRight size={17} />
              </button>
              <button
                className="flex items-center justify-center text-white px-9 rounded-full font-semibold text-base transition-all duration-200 hover:bg-white/10"
                style={{
                  border: '1px solid rgba(255,255,255,0.16)',
                  paddingTop: 17, paddingBottom: 17,
                }}
              >
                Create Free Account
              </button>
            </div>

            {/* Micro stats */}
            <div ref={statsRef} className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_,i) => (
                    <Star key={i} size={13} style={{ fill: '#fbbf24', color: '#fbbf24' }} />
                  ))}
                </div>
                <span className="text-sm font-bold text-white">4.9</span>
                <span className="text-sm text-neutral-500">rating</span>
              </div>
              <div
                className="w-px h-4"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              />
              <span className="text-sm text-neutral-400">
                <strong className="text-white">2.4M+</strong> shoppers trust WooSho
              </span>
              <div
                className="w-px h-4"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              />
              <span className="text-sm text-neutral-400">
                Free to start
              </span>
            </div>
          </div>

          {/* ── Right: Brand Photo ─────────────────────────────── */}
          <div
            ref={imgRef}
            className="relative overflow-hidden"
            style={{
              borderLeft: '1px solid rgba(255,255,255,0.05)',
            }}
            onMouseEnter={() => setImgHov(true)}
            onMouseLeave={() => setImgHov(false)}
          >
            {/* Image */}
            <div
              className="absolute inset-0"
              style={{
                ...PANEL_6,
                transform: imgHov ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.7s cubic-bezier(.4,0,.2,1)',
              }}
            />

            {/* Left edge fade — blends with dark background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, rgba(5,5,8,0.85) 0%, transparent 35%), ' +
                  'linear-gradient(to top, rgba(5,5,8,0.5) 0%, transparent 40%)',
              }}
            />

            {/* Floating "Join today" chip — echoes image message */}
            <div
              className="absolute top-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl flex items-center gap-3 whitespace-nowrap"
              style={{
                background: 'rgba(255,255,255,0.11)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}
              >
                <span className="text-sm">🛍</span>
              </div>
              <div>
                <p className="text-white text-xs font-black leading-none">
                  Join WooSho today!
                </p>
                <p className="text-white/60 text-[10px] mt-0.5 font-medium">
                  Thousands already shopping smarter
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCtaSection;
