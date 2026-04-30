import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TiltCard from '../../Components/TiltCard';
import { BUYER_SMART_FEATURES } from '../Data/sectionsData.jsx';


// FIX: removed duplicate gsap.registerPlugin(ScrollTrigger)


const SmartFeaturesSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.smart-feat-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 68%" } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-28 px-6 md:px-12" style={{ background: "#050508" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
            style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
            ✦ Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Built for Smart Buyers
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Every feature is designed to make finding and buying things easier, faster, and smarter.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BUYER_SMART_FEATURES.map((feat, i) => (
            <TiltCard
              key={i}
              className="smart-feat-card"
              style={{
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "#111113",
                display: "flex",
                flexDirection: "column",
                cursor: "default",
                position: "relative",
              }}
            >
              {/* Image */}
              <div style={{ height: 160, position: "relative", overflow: "hidden" }}>
                <img
                  src={feat.img}
                  alt={feat.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.08)"}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}
                  onError={e => { e.target.style.display = "none"; }}
                />
                {/* Gradient overlay */}
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, #111113 0%, transparent 60%)` }} />
                {/* Accent overlay */}
                <div style={{ position: "absolute", inset: 0, background: feat.gradient, opacity: 0.35 }} />
                {/* Icon */}
                <div style={{
                  position: "absolute", top: 16, left: 16,
                  width: 44, height: 44, borderRadius: 14,
                  background: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>
                  <span className="text-[11px] font-black tracking-tight text-white">{feat.icon}</span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "20px 20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f9fafb", lineHeight: 1.3 }}>{feat.title}</h3>
                <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7, flex: 1 }}>{feat.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: feat.accent }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: feat.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Always on</span>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartFeaturesSection;
