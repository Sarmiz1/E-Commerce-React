import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Package } from 'lucide-react';
import WS_IMG from '../../../../assets/marketing/mktimg3.png';
import { useNavigate } from 'react-router-dom';
import { formatLink } from '../../../../utils/formatLink'
import { BUYER_CATEGORIES, BUYER_DELIVERY_PROMISE } from '../Data/sectionsData.jsx';

// FIX: removed duplicate gsap.registerPlugin(ScrollTrigger)

// ─── Image: public/1000174262.png ─────────────────────────────────────────────
// Panel 3: middle-left → background-position: 0% 50%
const PANEL_3 = {
  backgroundImage: `url(${WS_IMG})`,
  backgroundSize: '195% 440%',
  backgroundPosition: '0% 57%',
  backgroundRepeat: 'no-repeat',
};

const CategoriesSection = () => {
  const sectionRef    = useRef(null);
  const headlineRef   = useRef(null);
  const featuredRef   = useRef(null);
  const cardsRef      = useRef([]);

  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const t60 = { trigger: sectionRef.current, start: 'top 68%' };
      const t50 = { trigger: sectionRef.current, start: 'top 58%' };

      gsap.fromTo(headlineRef.current,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: t60 });

      gsap.fromTo(featuredRef.current,
        { y: 32, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power4.out', scrollTrigger: t60 });

      gsap.fromTo(cardsRef.current,
        { opacity: 0, scale: 0.95, y: 16 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 0.6, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: t50,
        });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleHover = (e, isEnter) => {
    const img     = e.currentTarget.querySelector('.cat-img');
    const overlay = e.currentTarget.querySelector('.cat-overlay');
    const label   = e.currentTarget.querySelector('.cat-label');
    if (img)     gsap.to(img,     { scale: isEnter ? 1.07 : 1, duration: 0.55, ease: 'power2.out' });
    if (overlay) gsap.to(overlay, { opacity: isEnter ? 0.5 : 0.22, duration: 0.3 });
    if (label)   gsap.to(label,   { y: isEnter ? -3 : 0, duration: 0.3, ease: 'power2.out' });
  };

  return (
    <section ref={sectionRef} className="w-full py-24 px-6 md:px-12 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ─────────────────────────────────────────── */}
        <div ref={headlineRef} className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-[1.1]">
            Everything You Need.{' '}
            <span className="text-neutral-400">One Platform.</span>
          </h2>
          <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
            From fashion to electronics — AI finds exactly what you want.
          </p>
        </div>

        {/* ── Featured Delivery Visual ─────────────────────── */}
        <div
          ref={featuredRef}
          className="relative w-full rounded-[28px] overflow-hidden mb-6"
          style={{ height: 500 }}
          onMouseEnter={e => {
            gsap.to(e.currentTarget.querySelector('.feat-inner'), { scale: 1.03, duration: 0.6, ease: 'power2.out' });
          }}
          onMouseLeave={e => {
            gsap.to(e.currentTarget.querySelector('.feat-inner'), { scale: 1, duration: 0.6, ease: 'power2.out' });
          }}
        >
          {/* Brand image panel */}
          <div
            className="feat-inner absolute inset-0"
            style={{ ...PANEL_3, transformOrigin: 'center' }}
          />

          {/* Bottom gradient for text legibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.12) 50%, transparent 100%)',
            }}
          />

          {/* Label */}
          <div className="absolute inset-x-0 bottom-0 p-8 flex items-end justify-between">
            <div>
              <p className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1">
                Delivered with care
              </p>
              <h3 className="text-white text-2xl md:text-3xl font-black tracking-tight">
                Fast. Safe. Right to Your Door.
              </h3>
            </div>
            {/* Delivery chip */}
            <div
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.28)',
              }}
            >
              <Package size={14} color="#fff" />
              <span className="text-white text-xs font-bold">{BUYER_DELIVERY_PROMISE} Nationwide</span>
            </div>
          </div>
        </div>

        {/* ── Category Grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[230px]">
          {BUYER_CATEGORIES.map((cat, i) => (
            <div
              key={i}
              ref={el => (cardsRef.current[i] = el)}
              onMouseEnter={e => handleHover(e, true)}
              onMouseLeave={e => handleHover(e, false)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer ${cat.colSpan}`}
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
              onClick={() => navigate(`/products/categories/${formatLink(cat.title)}`)}
            >
              <img
                src={cat.img}
                alt={cat.title}
                className="cat-img w-full h-full object-cover origin-center"
                style={{ transition: 'none' }}
              />
              <div className="cat-overlay absolute inset-0 bg-black opacity-[0.22] transition-none" />
              <div className="absolute inset-0 p-6 flex items-end">
                <h3 className="cat-label text-xl font-bold text-white drop-shadow-md">
                  {cat.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
