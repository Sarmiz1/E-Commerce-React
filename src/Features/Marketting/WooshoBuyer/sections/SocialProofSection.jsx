// // import WS_IMG from '../../../../assets/marketing/mktimg3.png';

// // // ─── Image: public/1000174262.png ─────────────────────────────────────────────
// // // Panel 4: middle-right → background-position: 100% 50%
// // const PANEL_4 = {
// //   backgroundImage: `url(${WS_IMG})`,
// //   backgroundSize: '200% 300%',
// //   backgroundPosition: '100% 50%',
// //   backgroundRepeat: 'no-repeat',
// // };

// {/* Panel 4 image — spans 2 cols */ }
// <div
//   ref={imgCardRef}
//   className="lg:col-span-2 relative rounded-[24px] overflow-hidden"
//   style={{ minHeight: 420 }}
//   onMouseEnter={() => setImgHov(true)}
//   onMouseLeave={() => setImgHov(false)}
// >
//   {/* Brand image */}
//   <div
//     className="absolute inset-0"
//     style={{
//       ...PANEL_4,
//       transform: imgHov ? 'scale(1.04)' : 'scale(1)',
//       transition: 'transform 0.65s cubic-bezier(.4,0,.2,1)',
//     }}
//   />

//   {/* Bottom gradient */}
//   <div
//     className="absolute inset-0 pointer-events-none"
//     style={{
//       background:
//         'linear-gradient(to top, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.15) 55%, transparent 100%)',
//     }}
//   />

//   {/* Bottom label */}
//   <div className="absolute bottom-0 left-0 right-0 p-6">
//     <div
//       className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3"
//       style={{
//         background: 'rgba(99,102,241,0.25)',
//         border: '1px solid rgba(99,102,241,0.4)',
//         color: '#a5b4fc',
//       }}
//     >
//       ✓ Real WooSho Families
//     </div>
//     <h3 className="text-white text-xl font-black leading-tight">
//       Quality products.<br />Great prices.<br />Happy family.
//     </h3>
//     <p className="text-neutral-400 text-xs font-semibold mt-1.5">That's WooSho.</p>
//   </div>
// </div>

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";
import { BUYER_REVIEWS, BUYER_SOCIAL_STATS } from "../Data/sectionsData.jsx";

// FIX: removed duplicate gsap.registerPlugin(ScrollTrigger)

const SocialProofSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.18,
          ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-28 px-6 md:px-12"
      style={{ background: "#0a0a0a" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
            style={{
              background: "rgba(99,102,241,0.12)",
              color: "#818cf8",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            ⭐ Verified Reviews
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Why Buyers Love Woosho
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Real shoppers. Real results. Every day.
          </p>
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BUYER_REVIEWS.map((rev, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              style={{
                background: "linear-gradient(145deg, #141414, #1a1a1a)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 24,
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                transition: "border-color 0.3s, transform 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.transform = "none";
              }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: rev.rating }).map((_, s) => (
                  <Star
                    key={s}
                    size={14}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p
                style={{
                  fontSize: 15,
                  color: "#e5e7eb",
                  lineHeight: 1.75,
                  fontWeight: 500,
                  flex: 1,
                }}
              >
                "{rev.quote}"
              </p>

              {/* Author */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid rgba(99,102,241,0.4)",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                    display: "none",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: "#fff",
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {rev.author[0]}
                </div>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 800, color: "#f9fafb" }}
                  >
                    {rev.author}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    {rev.role} · {rev.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-8 mt-20 pt-12"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {BUYER_SOCIAL_STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
