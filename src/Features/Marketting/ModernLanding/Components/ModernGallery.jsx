import { useRef, useEffect, useState, memo } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

import img1 from '../../../../assets/marketing/shoe-stealth.png';
import img2 from '../../../../assets/marketing/cat-sneakers.png';
import img3 from '../../../../assets/marketing/neural-preview.png';
import img4 from '../../../../assets/marketing/hero-blur.png';
import img5 from '../../../../assets/marketing/cat-fashion.png';

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  { id: 1, title: 'Stealth Runner',  subtitle: 'Built for the streets, engineered for the track.',       label: 'NEW DROP',   tag: 'FOOTWEAR',   img: img1 },
  { id: 2, title: 'Classic Kicks',   subtitle: 'Timeless silhouette. Contemporary comfort.',               label: 'BESTSELLER', tag: 'SNEAKERS',   img: img2 },
  { id: 3, title: 'Neural Vision',   subtitle: 'AI-curated fashion that adapts to your style DNA.',       label: 'AI POWERED', tag: 'TECHNOLOGY', img: img3 },
  { id: 4, title: 'Blur Edit',       subtitle: 'Limited edition pieces that define culture.',              label: 'LIMITED',    tag: 'EDITORIAL',  img: img4 },
  { id: 5, title: 'Mode Sauvage',    subtitle: 'Unapologetic. Raw. Born from chaos and precision.',       label: 'EXCLUSIVE',  tag: 'FASHION',    img: img5 },
];

const ModernGallery = memo(function ModernGallery() {
  const sectionRef = useRef(null);
  const trackRef   = useRef(null);

  const navigate = useNavigate();

  // ── Drag-to-scroll ────────────────────────────────────────────────────
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const onDragStart = (e) => {
    drag.current = { active: true, startX: e.pageX - trackRef.current.offsetLeft, scrollLeft: trackRef.current.scrollLeft };
    trackRef.current.style.cursor = 'grabbing';
  };
  const onDragMove = (e) => {
    if (!drag.current.active) return;
    e.preventDefault();
    const x    = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - drag.current.startX) * 1.4;
    trackRef.current.scrollLeft = drag.current.scrollLeft - walk;
  };
  const onDragEnd = () => {
    drag.current.active = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  // ── GSAP: stagger cards in when section enters view ───────────────────
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.g-card',
        { opacity: 0, y: 48, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.65,
          ease: 'power4.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-white dark:bg-[#0E0E10] transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">Featured Drops</span>
            <h2 className="text-4xl md:text-6xl font-bold mt-3 text-gray-900 dark:text-white leading-tight">
              Trending Now.
            </h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-blue-600 font-bold text-sm group">
            View all <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Drag-scroll track */}
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory cursor-grab select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
        >
          {ITEMS.map((item) => (
            <div
              key={item.id}
              className="g-card snap-start flex-shrink-0 relative rounded-2xl overflow-hidden group"
              style={{ width: 'clamp(260px, 30vw, 380px)', height: 'clamp(360px, 55vh, 520px)' }}
            >
              {/* Image */}
              <img
                src={item.img}
                alt={item.title}
                draggable={false}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] pointer-events-none"
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Label badge */}
              <div className="absolute top-5 left-5 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                {item.label}
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="text-[9px] uppercase tracking-[0.3em] text-white/45 mb-1.5 font-bold">{item.tag}</div>
                <h3 className="text-xl font-bold text-white leading-tight">{item.title}</h3>

                {/* Subtitle — slides in on hover */}
                <div className="overflow-hidden">
                  <p className="text-white/60 text-sm mt-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 mt-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out cursor-pointer"
                  onClick={()=> navigate('/trending')}
                >
                  <span 
                    className="text-xs font-bold text-white uppercase tracking-wider"
                  >
                    Shop Now
                  </span>
                  <ArrowUpRight size={14} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Drag hint */}
        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-600 select-none">
          Drag or scroll to explore
        </p>
      </div>
    </section>
  );
});

export default ModernGallery;
