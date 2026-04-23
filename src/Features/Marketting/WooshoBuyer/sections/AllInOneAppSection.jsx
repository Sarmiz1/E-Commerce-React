import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Smartphone, Zap, ShieldCheck, Heart, Star } from 'lucide-react';
import WS_IMG from '../../../../assets/marketing/mktimg3.png';


gsap.registerPlugin(ScrollTrigger);

// ─── Image: public/1000174262.png ─────────────────────────────────────────────
// Panel 2: top-right → background-position: 100% 0%
const PANEL_2 = {
  backgroundImage: `url(${WS_IMG})`,
  backgroundSize: '210% 300%',
  backgroundPosition: '100% 0%',
  backgroundRepeat: 'no-repeat',
};

const steps = [
  {
    icon: <Zap size={20} />,
    title: 'Fast',
    desc: 'Find what you are looking for in seconds. Our smart search gets you straight to the best products without the hassle.',
    color: '#2563eb',
  },
  {
    icon: <Heart size={20} />,
    title: 'Easy',
    desc: 'An intuitive, clean interface designed so everyone in the family can browse and shop effortlessly.',
    color: '#0891b2',
  },
  {
    icon: <ShieldCheck size={20} />,
    title: 'Reliable',
    desc: 'Count on us for verified sellers, genuine products, and consistent delivery you can trust.',
    color: '#059669',
  },
];

const AllInOneAppSection = () => {
  const sectionRef  = useRef(null);
  const stepsRef    = useRef([]);
  const imgFrameRef = useRef(null);
  const chipRef     = useRef(null);
  const [imgHovered, setImgHovered] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 62%' };

      gsap.fromTo(chipRef.current,
        { y: 10, opacity: 0, scale: 0.9 },
        { y: 0,  opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)', scrollTrigger: trigger });

      gsap.fromTo(stepsRef.current,
        { x: -32, opacity: 0 },
        { x: 0,   opacity: 1, duration: 0.75, stagger: 0.18, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 58%' } });

      gsap.fromTo(imgFrameRef.current,
        { x: 40, opacity: 0, scale: 0.97 },
        { x: 0,  opacity: 1, scale: 1, duration: 0.9, ease: 'power4.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 55%' } });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-28 px-6 md:px-12 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ── Left: Steps ─────────────────────────────────────── */}
        <div>
          {/* Badge */}
          <div
            ref={chipRef}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-8"
            style={{
              background: 'rgba(37,99,235,0.07)',
              color: '#2563eb',
              border: '1px solid rgba(37,99,235,0.16)',
            }}
          >
            <Smartphone size={14} />
            The Ultimate Shopping Hub
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-14 tracking-tight leading-[1.1]">
            Everything you love, <br />
            <span
              style={{
                background: 'linear-gradient(135deg,#2563eb,#06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              in one app.
            </span>
          </h2>

          <div className="relative space-y-0">
            {/* Vertical connector */}
            <div
              className="absolute left-[21px] top-10 bottom-10 w-[2px] pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, #dbeafe, #cffafe, #d1fae5)' }}
            />

            {steps.map((step, i) => (
              <div
                key={i}
                ref={el => (stepsRef.current[i] = el)}
                className="flex gap-5 items-start pb-10 last:pb-0 relative"
              >
                {/* Step icon circle */}
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-black text-base z-10"
                  style={{
                    background: `${step.color}14`,
                    color: step.color,
                    border: `2px solid ${step.color}33`,
                  }}
                >
                  {step.icon}
                </div>

                {/* Content */}
                <div className="pt-1">
                  <h3 className="text-[17px] font-bold text-neutral-900 dark:text-white mb-1.5">{step.title}</h3>
                  <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Brand Photo Frame ────────────────────────── */}
        <div
          ref={imgFrameRef}
          className="relative w-full"
          style={{ height: 520 }}
          onMouseEnter={() => setImgHovered(true)}
          onMouseLeave={() => setImgHovered(false)}
        >
          {/* Main image */}
          <div
            className="w-full h-full rounded-[28px] overflow-hidden"
            style={{
              ...PANEL_2,
              transform: imgHovered ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.65s cubic-bezier(.4,0,.2,1), box-shadow 0.45s ease',
              boxShadow: imgHovered
                ? '0 28px 72px -10px rgba(37,99,235,0.24), 0 8px 24px rgba(0,0,0,0.12)'
                : '0 16px 56px -10px rgba(0,0,0,0.18)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.16) 100%)',
              }}
            />
          </div>

          {/* Floating AI prompt pill — top */}
          <div
            className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              color: '#1e293b',
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}
            >
              <Heart size={10} color="#fff" />
            </div>
            "Matching family outfits, next day delivery..."
          </div>

          {/* Floating result count — bottom-left */}
          <div
            className="absolute bottom-6 left-6 px-4 py-2.5 rounded-xl"
            style={{
              background: 'rgba(37,99,235,0.92)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px rgba(37,99,235,0.36)',
            }}
          >
            <p className="text-white text-xs font-bold leading-none mb-0.5">App Rating</p>
            <p className="text-white text-xl font-black leading-none flex items-center gap-1">
              4.9/5 <Star size={16} className="fill-white" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AllInOneAppSection;
