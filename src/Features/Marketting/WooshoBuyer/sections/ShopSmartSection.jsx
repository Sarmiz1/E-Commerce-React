import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { MessageSquare, ShoppingBag, Star } from 'lucide-react';
import WS_IMG from '../../../../assets/marketing/mktimg3.png';
import { useNavigate } from 'react-router-dom';


// ─── Image: public/1000174262.png ─────────────────────────────────────────────
// Panel 1: top-left → background-position: 0% 0%
const PANEL_1 = {
  backgroundImage: `url(${WS_IMG})`,
  backgroundSize: '200% 300%',
  backgroundPosition: '0% 0%',
  backgroundRepeat: 'no-repeat',
};


// Todays Orders card data

const ordersToday = [
  { label: 'Orders today', value: '12,847', change: '18', color: '#059669' },
]

const shoppersCount = '2.4M'

const ShopSmartSection = () => {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const buttonsRef = useRef(null);
  const badgeRef = useRef(null);
  const imgFrameRef = useRef(null);
  const glassCardRef = useRef(null);
  const [imgHovered, setImgHovered] = useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(badgeRef.current,
        { y: 12, opacity: 0, scale: 0.92 },
        { y: 0, opacity: 1, scale: 1, duration: 0.55 })
        .fromTo(headlineRef.current,
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75 }, '-=0.2')
        .fromTo(subtextRef.current,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
        .fromTo(Array.from(buttonsRef.current.children),
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, '-=0.3')
        .fromTo(imgFrameRef.current,
          { x: 48, opacity: 0, scale: 0.96 },
          { x: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power4.out' }, '-=0.55')
        .fromTo(glassCardRef.current,
          { y: 16, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, '-=0.25');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="w-full min-h-screen flex items-center justify-center pt-24 pb-12 px-6 md:px-12 bg-white dark:bg-[#0a0a0a] overflow-hidden"
    >
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* ── Left: Text ─────────────────────────────────────── */}
        <div className="flex flex-col items-start space-y-6">
          {/* Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide"
            style={{ background: 'rgba(37,99,235,0.08)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.18)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#2563eb', boxShadow: '0 0 6px #2563ebAA' }}
            />
            Family Shopping Made Easy
          </div>

          <h1
            ref={headlineRef}
            className="text-5xl md:text-7xl font-extrabold text-neutral-900 dark:text-white leading-[1.06] tracking-tight"
          >
            Shop Smart. <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Live Better.
            </span>
          </h1>

          <p
            ref={subtextRef}
            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed"
          >
            Everything you need, delivered straight to your door. Experience the joy of seamless, stress-free shopping with WooSho.
          </p>

          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <button
              className="flex items-center justify-center gap-2.5 text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 "
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#0284c7)', boxShadow: '0 4px 20px rgba(37,99,235,0.32)' }}
              onClick ={() => navigate('/auth')} 
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              Start Shopping
            </button>
            <button 
              className="flex items-center justify-center gap-2.5 bg-neutral-100 dark:bg-white/5 text-neutral-900 dark:text-white px-8 py-4 rounded-full font-semibold hover:bg-neutral-600 transition-colors duration-200"
              onClick={() => navigate('/products/categories')}
            >
              Browse Categories
            </button>
          </div>

          {/* Micro social proof */}
          <div className="flex items-center gap-3 pt-2">
            {/* Avatars */}
            <div className="flex -space-x-2">
              {['🧑🏾', '👩🏽', '👨🏿', '👩🏾'].map((e, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white"
                  style={{ background: `hsl(${200 + i * 30},60%,70%)`, zIndex: 4 - i }}
                >
                  {e}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Loved by <strong className="text-neutral-700 dark:text-neutral-300">{shoppersCount}+</strong> shoppers
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Brand Photo Frame ────────────────────────── */}
        <div
          ref={imgFrameRef}
          className="relative w-full"
          style={{ height: 560 }}
        >
          {/* Main photo */}
          <div
            className="w-full h-full rounded-3xl overflow-hidden relative"
            style={{
              ...PANEL_1,
              transform: imgHovered ? 'scale(1.015)' : 'scale(1)',
              transition: 'transform 0.65s cubic-bezier(.4,0,.2,1)',
              boxShadow: imgHovered
                ? '0 32px 80px -12px rgba(37,99,235,0.28), 0 8px 32px rgba(0,0,0,0.14)'
                : '0 20px 60px -10px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
              cursor: 'default',
            }}
            onMouseEnter={() => setImgHovered(true)}
            onMouseLeave={() => setImgHovered(false)}
          >
            {/* Subtle inner vignette — preserves image as-is */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.18) 100%)',
              }}
            />
          </div>

          {/* Glass stat card — bottom-right */}
          <div
            ref={glassCardRef}
            className="absolute bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              minWidth: 200,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#06b6d4)' }}
            >
              <ShoppingBag size={18} color="#fff" />
            </div>
            {/* Orders Stats */}
            <div>
              {
                ordersToday.map((stat, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 leading-none mb-1">
                      {stat.label}
                    </p>
                    <p
                      className="text-xl font-black text-neutral-900 leading-none"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {stat.value}
                      <span
                        className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}
                      >
                        +{stat.change}%
                      </span>
                    </p>
                  </div>
                ))
              }

            </div>
          </div>

          {/* Trust pill — top-left */}
          <div
            className="absolute top-5 left-5 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              color: '#059669',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }}
            />
            Verified Sellers · Secure Checkout
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopSmartSection;
